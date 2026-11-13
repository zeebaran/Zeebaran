import { z } from "zod";
import { catalogAccess } from "@/features/catalog/server/access";
import {
  adminFailure,
  AdminError,
  bodyJson,
  csrfGuard,
  limitAdmin,
} from "@/features/admin/server/security";
import { deleteMedia, inspectMedia } from "@/features/media/server/deletion";
export const runtime = "nodejs";
export const maxDuration = 60;
const id = z.string().min(1).max(300);
export async function GET(req: Request) {
  try {
    await catalogAccess("delete");
    const parsed = id.safeParse(new URL(req.url).searchParams.get("publicId"));
    if (!parsed.success) throw new AdminError(422, "Choose a library file.");
    return Response.json(await inspectMedia(parsed.data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return adminFailure(error);
  }
}
export async function DELETE(req: Request) {
  try {
    await csrfGuard(req);
    const { user } = await catalogAccess("delete");
    const parsed = z
      .object({ publicId: id, confirmation: z.string().min(1).max(160) })
      .strict()
      .safeParse(await bodyJson(req));
    if (!parsed.success) throw new AdminError(422, "Confirm the file name before deletion.");
    await limitAdmin("media-delete-" + user.uid, 60);
    await deleteMedia(parsed.data.publicId, parsed.data.confirmation, user.uid);
    return Response.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminFailure(error);
  }
}
