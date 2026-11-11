import { isMediaCategory, type MediaCategory } from "@/features/media/categories";
import { z } from "zod";
import {
  adminSession,
  adminFailure,
  AdminError,
  bodyJson,
  csrfGuard,
  limitAdmin,
} from "@/features/admin/server/security";
import { signUpload } from "@/features/admin/server/cloudinary";
export async function POST(req: Request) {
  try {
    await csrfGuard(req);
    const user = await adminSession();
    await limitAdmin("upload-" + user.uid, 60);
    const d = z
      .object({
        kind: z.enum(["image", "video"]),
        category: z.custom<MediaCategory>(isMediaCategory).optional(),
        name: z.string().max(160).optional(),
      })
      .safeParse(await bodyJson(req));
    if (!d.success) throw new AdminError(422, "Choose image or video.");
    return Response.json(signUpload(d.data.kind, user.uid, d.data.category, d.data.name), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return adminFailure(e);
  }
}
