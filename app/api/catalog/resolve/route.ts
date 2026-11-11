import { resolvePublished } from "@/features/catalog/server/public";
import { adminFailure, AdminError } from "@/features/admin/server/security";
export async function GET(req: Request) {
  try {
    const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").filter(Boolean);
    if (ids.length > 2) throw new AdminError(422, "Compare up to two selections.");
    return Response.json(
      { items: await resolvePublished(ids) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return adminFailure(e);
  }
}
