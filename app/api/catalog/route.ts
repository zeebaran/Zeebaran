import { publishedSummaries } from "@/features/catalog/server/public";
import { adminFailure, AdminError } from "@/features/admin/server/security";
export async function GET(req: Request) {
  try {
    const url = new URL(req.url),
      kind = url.searchParams.get("kind") || "variety";
    if (kind !== "variety" && kind !== "rootstock")
      throw new AdminError(422, "Choose a catalog type.");
    const q = url.searchParams.get("q") || "";
    if (q.length > 80) throw new AdminError(422, "Search is too long.");
    return Response.json(await publishedSummaries(kind, url.searchParams.get("cursor"), q), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return adminFailure(e);
  }
}
