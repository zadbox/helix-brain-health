import { afterEach, describe, expect, it, vi } from "vitest";
import { generateMedicalText, getModelRouteError } from "@/lib/ai/model-gateway";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.MEDICAL_MODEL_ENDPOINT;
  delete process.env.MEDICAL_MODEL_NAME;
  delete process.env.MEDICAL_MODEL_API_KEY;
  delete process.env.MEDICAL_MODEL_MAX_RETRIES;
});

describe("model gateway", () => {
  it("envoie le contrat de chat attendu au moteur privé", async () => {
    process.env.MEDICAL_MODEL_ENDPOINT = "http://127.0.0.1:9000/v1/chat/completions";
    process.env.MEDICAL_MODEL_NAME = "helix-test";
    process.env.MEDICAL_MODEL_MAX_RETRIES = "1";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: "réponse structurée" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateMedicalText({
      system: "Instructions système",
      messages: [{ role: "user", content: "Données cliniques" }],
      maxTokens: 512,
    });

    expect(result).toBe("réponse structurée");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(options.body));
    expect(payload).toMatchObject({
      model: "helix-test",
      max_tokens: 512,
      messages: [
        { role: "system", content: "Instructions système" },
        { role: "user", content: "Données cliniques" },
      ],
    });
  });

  it("normalise une indisponibilité du moteur sans exposer le détail technique", async () => {
    process.env.MEDICAL_MODEL_MAX_RETRIES = "1";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));

    let captured: unknown;
    try {
      await generateMedicalText({
        system: "Instructions système",
        messages: [{ role: "user", content: "Données cliniques" }],
        maxTokens: 128,
      });
    } catch (error) {
      captured = error;
    }

    const routeError = getModelRouteError(captured);
    expect(routeError).toMatchObject({
      code: "model_unavailable",
      status: 503,
    });
    expect(routeError.message).not.toContain("connection refused");
  });
});
