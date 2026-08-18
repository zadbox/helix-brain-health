import { apiJson } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return apiJson({
    status: "ok",
    service: "brain-health",
    timestamp: new Date().toISOString(),
  });
}
