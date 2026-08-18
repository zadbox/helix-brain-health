import { NextRequest, NextResponse } from "next/server";

const DEFAULT_MAX_BODY_BYTES = 128 * 1024;

type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; code: "invalid_json" | "payload_too_large" };

export async function parseJsonBody(
  request: NextRequest,
  maxBytes = DEFAULT_MAX_BODY_BYTES
): Promise<JsonBodyResult> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, code: "payload_too_large" };
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
      return { ok: false, code: "payload_too_large" };
    }
    return { ok: true, value: JSON.parse(rawBody) };
  } catch {
    return { ok: false, code: "invalid_json" };
  }
}

export function apiJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      Pragma: "no-cache",
    },
  });
}
