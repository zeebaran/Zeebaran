import { z } from "zod";
import { catalogAccess } from "@/features/catalog/server/access";
import { adminEntries, writeEntry } from "@/features/catalog/server/store";
import {
  adminFailure,
  AdminError,
  csrfGuard,
  bodyJson,
  limitAdmin,
} from "@/features/admin/server/security";
export async function GET(req: Request) {
  try {
    await catalogAccess();
    const url = new URL(req.url),
      kind = url.searchParams.get("kind") || "variety";
    if (kind !== "variety" && kind !== "rootstock")
      throw new AdminError(422, "Choose a catalog type.");
    return Response.json(
      await adminEntries(
        kind,
        url.searchParams.get("deleted") === "1",
        url.searchParams.get("cursor"),
        url.searchParams.get("q") || "",
      ),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return adminFailure(e);
  }
}
export async function POST(req: Request) {
  try {
    await csrfGuard(req);
    const { user } = await catalogAccess("edit");
    await limitAdmin("catalog-edit-" + user.uid, 240);
    const body = z
      .object({ content: z.unknown() })
      .strict()
      .parse(await bodyJson(req));
    const data = body.content as { slug?: unknown };
    if (typeof data?.slug !== "string") throw new AdminError(422, "Add a catalog URL.");
    const record = await writeEntry(data.slug, "save", 0, body.content, user);
    return Response.json({ record }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof z.ZodError) return adminFailure(new AdminError(422, "Invalid catalog entry."));
    return adminFailure(e);
  }
}
