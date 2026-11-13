import { z } from "zod";
import { revalidateTag } from "next/cache";
import { catalogAccess } from "@/features/catalog/server/access";
import {
  adminFailure,
  bodyJson,
  csrfGuard,
  limitAdmin,
  AdminError,
} from "@/features/admin/server/security";
import { readSettings, saveSettings } from "@/features/site/server";
import { siteSettingsSchema } from "@/features/site/schema";
export async function GET() {
  try {
    await catalogAccess("publish");
    return Response.json(await readSettings(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminFailure(error);
  }
}
export async function POST(req: Request) {
  try {
    await csrfGuard(req);
    const { user } = await catalogAccess("publish");
    await limitAdmin("contact-settings-" + user.uid, 30);
    const input = z
      .object({ revision: z.number().int().nonnegative(), settings: siteSettingsSchema })
      .strict()
      .safeParse(await bodyJson(req));
    if (!input.success)
      throw new AdminError(422, input.error.issues[0]?.message || "Check the settings.");
    const record = await saveSettings(input.data.settings, input.data.revision, user.uid);
    revalidateTag("cms:site", { expire: 0 });
    return Response.json(record, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminFailure(error);
  }
}
