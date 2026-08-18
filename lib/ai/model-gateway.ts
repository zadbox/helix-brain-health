export interface ModelMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateTextRequest {
  system: string;
  messages: ModelMessage[];
  maxTokens: number;
  temperature?: number;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface ModelGatewayErrorOptions {
  code: string;
  status: number;
  cause?: unknown;
}

export class ModelGatewayError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, options: ModelGatewayErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "ModelGatewayError";
    this.code = options.code;
    this.status = options.status;
  }
}

export interface ModelRouteError {
  code: string;
  message: string;
  status: number;
}

const DEFAULT_ENDPOINT = "http://127.0.0.1:8000/v1/chat/completions";
const DEFAULT_MODEL = "helix-medical";
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_RETRIES = 1;

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getRuntimeConfig() {
  return {
    endpoint: process.env.MEDICAL_MODEL_ENDPOINT?.trim() || DEFAULT_ENDPOINT,
    model: process.env.MEDICAL_MODEL_NAME?.trim() || DEFAULT_MODEL,
    apiKey: process.env.MEDICAL_MODEL_API_KEY?.trim(),
    timeoutMs: positiveInteger(process.env.MEDICAL_MODEL_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxRetries: positiveInteger(
      process.env.MEDICAL_MODEL_MAX_RETRIES,
      DEFAULT_MAX_RETRIES
    ),
  };
}

function normalizeGatewayError(error: unknown): ModelGatewayError {
  if (error instanceof ModelGatewayError) return error;

  if (error instanceof Error && error.name === "TimeoutError") {
    return new ModelGatewayError("Le moteur d’inférence n’a pas répondu dans le délai imparti.", {
      code: "model_timeout",
      status: 504,
      cause: error,
    });
  }

  return new ModelGatewayError("Le moteur d’inférence est indisponible.", {
    code: "model_unavailable",
    status: 503,
    cause: error,
  });
}

function shouldRetry(error: ModelGatewayError): boolean {
  return error.status === 429 || error.status >= 500;
}

async function requestCompletion(request: GenerateTextRequest): Promise<string> {
  const config = getRuntimeConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  let lastError: ModelGatewayError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(config.timeoutMs),
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: request.system },
            ...request.messages,
          ],
          max_tokens: request.maxTokens,
          temperature: request.temperature ?? 0.1,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const code =
          status === 401 || status === 403
            ? "model_unauthorized"
            : status === 429
              ? "model_overloaded"
              : "model_request_failed";
        throw new ModelGatewayError("Le moteur d’inférence a rejeté la requête.", {
          code,
          status: status === 429 ? 503 : status,
        });
      }

      const payload = (await response.json()) as ChatCompletionResponse;
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new ModelGatewayError("Le moteur d’inférence a retourné une réponse vide.", {
          code: "model_empty_response",
          status: 502,
        });
      }

      return content;
    } catch (error) {
      lastError = normalizeGatewayError(error);
      if (attempt >= config.maxRetries || !shouldRetry(lastError)) break;
    }
  }

  throw lastError ?? normalizeGatewayError(new Error("Unknown model error"));
}

export async function generateMedicalText(request: GenerateTextRequest): Promise<string> {
  if (!request.system.trim() || !request.messages.length) {
    throw new ModelGatewayError("La requête d’inférence est incomplète.", {
      code: "model_invalid_request",
      status: 500,
    });
  }

  return requestCompletion(request);
}

export function getModelRouteError(error: unknown): ModelRouteError {
  const normalized = normalizeGatewayError(error);

  const messages: Record<string, string> = {
    model_timeout: "Le moteur médical met trop de temps à répondre. Réessayez dans quelques instants.",
    model_unauthorized: "La passerelle du moteur médical n’est pas correctement authentifiée.",
    model_overloaded: "Le moteur médical est momentanément saturé. Réessayez dans quelques instants.",
    model_empty_response: "Le moteur médical a retourné une réponse vide.",
    model_request_failed: "Le moteur médical n’a pas pu traiter la demande.",
    model_unavailable: "Le moteur médical est indisponible. Vérifiez le service d’inférence local.",
  };

  return {
    code: normalized.code,
    message: messages[normalized.code] || "Le moteur médical est indisponible.",
    status: normalized.status >= 400 ? normalized.status : 500,
  };
}
