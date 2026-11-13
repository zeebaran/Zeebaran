import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  csrf: vi.fn(),
  limit: vi.fn(),
  access: vi.fn(),
  mutate: vi.fn(),
  read: vi.fn(),
  history: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/features/admin/server/security", () => ({
  adminSession: mocks.session,
  csrfGuard: mocks.csrf,
  limitAdmin: mocks.limit,
  bodyJson: (req: Request) => req.json(),
  adminFailure: (error: { status?: number; message: string }) =>
    Response.json({ error: error.message }, { status: error.status || 503 }),
}));
vi.mock("@/features/catalog/server/access", () => ({ catalogAccess: mocks.access }));
vi.mock("@/features/cms/server/store", () => ({
  mutatePage: mocks.mutate,
  readPage: mocks.read,
  pageHistory: mocks.history,
}));
vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidate }));
import { GET, POST } from "@/app/api/admin/content/[page]/route";
const params = () => ({ params: Promise.resolve({ page: "mission" }) });
const request = (action: string) =>
  new Request("http://localhost/api/admin/content/mission", {
    method: "POST",
    body: JSON.stringify({ action, revision: 1, content: { text: {}, images: {} } }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.session.mockResolvedValue({ uid: "fixture" });
  mocks.mutate.mockResolvedValue({ revision: 2 });
  mocks.history.mockResolvedValue([]);
  mocks.csrf.mockResolvedValue(undefined);
});
it("returns the page without reading history after save, publish or restore", async () => {
  for (const action of ["save", "publish", "restore"]) {
    const response = await POST(request(action), params());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ record: { revision: 2 } });
    expect(response.headers.get("cache-control")).toBe("no-store");
  }
  expect(mocks.history).not.toHaveBeenCalled();
  expect(mocks.access).toHaveBeenCalledTimes(1);
  expect(mocks.revalidate).toHaveBeenCalledWith("cms:mission", { expire: 0 });
});
it("only reads history for a history request, keeping authentication", async () => {
  await GET(new Request("http://localhost/api/admin/content/mission?view=record"), params());
  expect(mocks.history).not.toHaveBeenCalled();
  await GET(new Request("http://localhost/api/admin/content/mission?view=history"), params());
  expect(mocks.history).toHaveBeenCalledTimes(1);
  expect(mocks.session).toHaveBeenCalledTimes(2);
});
it("rejects failed CSRF before mutation and does not invalidate failed publications", async () => {
  mocks.csrf.mockRejectedValueOnce({ status: 403, message: "Blocked" });
  expect((await POST(request("publish"), params())).status).toBe(403);
  expect(mocks.mutate).not.toHaveBeenCalled();
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
