import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  csrf: vi.fn(),
  limit: vi.fn(),
  read: vi.fn(),
  save: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock("@/features/catalog/server/access", () => ({ catalogAccess: mocks.access }));
vi.mock("@/features/site/server", () => ({ readSettings: mocks.read, saveSettings: mocks.save }));
vi.mock("next/cache", () => ({ revalidateTag: mocks.invalidate }));
vi.mock("@/features/admin/server/security", () => ({
  csrfGuard: mocks.csrf,
  limitAdmin: mocks.limit,
  bodyJson: (req: Request) => req.json(),
  AdminError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
  adminFailure: (error: { status?: number; message: string }) =>
    Response.json({ error: error.message }, { status: error.status || 500 }),
}));
import { GET, POST } from "@/app/api/admin/settings/route";
import { defaultSettings } from "@/features/site/model";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.access.mockResolvedValue({ user: { uid: "admin" }, role: "admin" });
  mocks.csrf.mockResolvedValue(undefined);
  mocks.limit.mockResolvedValue(undefined);
});
const request = (body: unknown) =>
  new Request("http://localhost/api/admin/settings", {
    method: "POST",
    body: JSON.stringify(body),
  });
describe("contact settings API boundary", () => {
  it("requires administrator permission before reading settings", async () => {
    mocks.access.mockRejectedValueOnce({ status: 403, message: "Administrator required" });
    expect((await GET()).status).toBe(403);
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.access).toHaveBeenCalledWith("publish");
  });
  it("rejects forged requests before writes", async () => {
    mocks.csrf.mockRejectedValueOnce({ status: 403, message: "CSRF rejected" });
    expect((await POST(request({}))).status).toBe(403);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("rejects editor and unauthenticated writes", async () => {
    for (const status of [401, 403]) {
      mocks.access.mockRejectedValueOnce({ status, message: "Denied" });
      expect((await POST(request({ settings: defaultSettings(), revision: 0 }))).status).toBe(
        status,
      );
    }
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("validates before saving and immediately invalidates only the shared site cache", async () => {
    expect((await POST(request({ settings: defaultSettings(), revision: -1 }))).status).toBe(422);
    expect(mocks.save).not.toHaveBeenCalled();
    const record = { settings: defaultSettings(), revision: 2, updatedAt: "2026-11-11T00:00:00Z" };
    mocks.save.mockResolvedValue(record);
    const response = await POST(request({ settings: record.settings, revision: 1 }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(record);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.save).toHaveBeenCalledExactlyOnceWith(record.settings, 1, "admin");
    expect(mocks.invalidate).toHaveBeenCalledExactlyOnceWith("cms:site", { expire: 0 });
  });
  it("does not invalidate public data if a concurrency check fails", async () => {
    mocks.save.mockRejectedValueOnce({ status: 409, message: "Reload before saving" });
    expect((await POST(request({ settings: defaultSettings(), revision: 1 }))).status).toBe(409);
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });
});
