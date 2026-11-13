import { z } from "zod";
import { catalogAccess } from "@/features/catalog/server/access";
import { readEntry, writeEntry } from "@/features/catalog/server/store";
import { invalidateCatalog } from "@/features/catalog/server/public";
import {
  adminFailure,
  AdminError,
  csrfGuard,
  bodyJson,
  limitAdmin,
} from "@/features/admin/server/security";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await catalogAccess();
    return Response.json(
      { record: await readEntry((await params).id) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return adminFailure(e);
  }
}
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await csrfGuard(req);
    const parsed = z
      .object({
        action: z.enum(["save", "publish", "unpublish", "delete", "restore"]),
        revision: z.number().int().nonnegative(),
        content: z.unknown().optional(),
        confirmation: z.string().max(120).optional(),
      })
      .strict()
      .safeParse(await bodyJson(req));
    if (!parsed.success) throw new AdminError(422, "Invalid catalog update.");
    const { action, revision, content, confirmation } = parsed.data;
    const { user } = await catalogAccess(
      action === "save" || action === "restore"
        ? "edit"
        : action === "delete"
          ? "delete"
          : "publish",
    );
    await limitAdmin("catalog-edit-" + user.uid, 240);
    const record = await writeEntry(
      (await params).id,
      action,
      revision,
      content,
      user,
      confirmation,
    );
    if (action === "publish" || action === "unpublish" || action === "delete")
      invalidateCatalog(record.id, record.draft.kind);
    return Response.json({ record }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return adminFailure(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await csrfGuard(req);
    const { user } = await catalogAccess("delete");
    const parsed = z
      .object({
        revision: z.number().int().nonnegative(),
        confirmation: z.string().min(1).max(120),
      })
      .strict()
      .safeParse(await bodyJson(req));
    if (!parsed.success) throw new AdminError(422, "Confirm the entry name before deletion.");
    await limitAdmin("catalog-purge-" + user.uid, 60);
    const id = (await params).id;
    const { purgeEntry } = await import("@/features/catalog/server/purge");
    const removed = await purgeEntry(id, parsed.data.revision, parsed.data.confirmation);
    invalidateCatalog(id, removed.kind);
    return Response.json(
      { deleted: true, media: removed.media },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return adminFailure(error);
  }
}
