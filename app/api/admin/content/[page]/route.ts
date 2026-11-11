import { catalogAccess } from "@/features/catalog/server/access";
import { revalidateTag } from "next/cache";
import {
  adminSession,
  adminFailure,
  bodyJson,
  csrfGuard,
  limitAdmin,
} from "@/features/admin/server/security";
import { mutatePage, readPage, pageHistory } from "@/features/cms/server/store";
export async function GET(req: Request, { params }: { params: Promise<{ page: string }> }) {
  try {
    await adminSession();
    const { page } = await params;
    const view = new URL(req.url).searchParams.get("view");
    const data =
      view === "history"
        ? { history: await pageHistory(page) }
        : view === "record"
          ? { record: await readPage(page) }
          : await Promise.all([readPage(page), pageHistory(page)]).then(([record, history]) => ({
              record,
              history,
            }));
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return adminFailure(e);
  }
}
export async function POST(req: Request, { params }: { params: Promise<{ page: string }> }) {
  try {
    await csrfGuard(req);
    const user = await adminSession();
    await limitAdmin("edit-" + user.uid, 300);
    const { page } = await params,
      body = await bodyJson(req);
    if (body?.action === "publish") await catalogAccess("publish");
    const record = await mutatePage(page, body, user);
    if (body?.action === "publish") revalidateTag("cms:" + page, { expire: 0 });
    return Response.json(
      { record, history: await pageHistory(page) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return adminFailure(e);
  }
}
