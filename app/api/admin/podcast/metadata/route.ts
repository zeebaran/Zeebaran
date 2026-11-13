import { z } from "zod";
import {
  adminSession,
  adminFailure,
  csrfGuard,
  limitAdmin,
  bodyJson,
  AdminError,
} from "@/features/admin/server/security";
import { fetchYoutubeMetadata } from "@/features/podcast/metadata";
export async function POST(req: Request) {
  try {
    await csrfGuard(req);
    const user = await adminSession();
    const parsed = z
      .object({ url: z.string().max(2000) })
      .strict()
      .safeParse(await bodyJson(req));
    if (!parsed.success) throw new AdminError(422, "Paste a YouTube video link.");
    await limitAdmin("podcast-metadata-" + user.uid, 60);
    return Response.json(await fetchYoutubeMetadata(parsed.data.url), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return adminFailure(e);
  }
}
