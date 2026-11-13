import { createHash } from "node:crypto";
import { assistantKnowledge } from "@/features/assistant/server";
import { createBurstLimiter } from "@/features/assistant/limiter";
export const runtime = "nodejs";
const allow = createBurstLimiter();
export async function GET(req: Request) {
  if (new URL(req.url).search || req.headers.get("sec-fetch-site") === "cross-site")
    return Response.json(
      { error: "Use the website assistant to explore the published collection." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  // Forwarded headers are only a best-effort signal; the global process bound also applies.
  const key = createHash("sha256")
    .update((req.headers.get("x-forwarded-for")?.split(",")[0] || "shared").slice(0, 100))
    .digest("hex");
  if (!allow(key))
    return Response.json(
      { error: "Please wait a minute before refreshing the collection." },
      { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } },
    );
  try {
    return Response.json(await assistantKnowledge(), {
      headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    console.error(JSON.stringify({ event: "assistant.catalog_unavailable" }));
    return Response.json(
      {
        error:
          "The published collection could not be loaded. Please try again, or contact the Zeebaran team.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
