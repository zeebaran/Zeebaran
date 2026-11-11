import { afterEach, describe, expect, it, vi } from "vitest";
import { adminRequest, AdminRequestError } from "../../features/admin/client";
afterEach(() => vi.unstubAllGlobals());
describe("private admin request coalescing", () => {
  it("shares only overlapping GETs, then reads fresh data on the next visit", async () => {
    let finish!: (response: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValueOnce(Response.json({ revision: 2 }));
    vi.stubGlobal("fetch", fetch);
    const first = adminRequest("/api/admin/content/home?view=record");
    const second = adminRequest("/api/admin/content/home?view=record");
    expect(fetch).toHaveBeenCalledTimes(1);
    finish(Response.json({ revision: 1 }));
    expect(await first).toEqual({ revision: 1 });
    expect(await second).toEqual({ revision: 1 });
    expect(await adminRequest("/api/admin/content/home?view=record")).toEqual({ revision: 2 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("evicts rejected reads so retry works and retains authorization status", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ error: "Expired" }, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ revision: 3 }));
    vi.stubGlobal("fetch", fetch);
    await expect(adminRequest("/api/admin/content/mission")).rejects.toMatchObject({
      status: 401,
      message: "Expired",
    });
    expect(await adminRequest("/api/admin/content/mission")).toEqual({ revision: 3 });
    expect(new AdminRequestError(403, "Denied")).toBeInstanceOf(Error);
  });
  it("never coalesces mutations", async () => {
    const fetch = vi
      .fn()
      .mockImplementation((url: string) =>
        Promise.resolve(Response.json(url.endsWith("csrf") ? { token: "token" } : { saved: true })),
      );
    vi.stubGlobal("fetch", fetch);
    await Promise.all([
      adminRequest("/api/admin/content/home", { action: "save" }),
      adminRequest("/api/admin/content/home", { action: "save" }),
    ]);
    expect(fetch.mock.calls.filter(([url]) => url === "/api/admin/content/home")).toHaveLength(2);
  });
  it("never shares an old account's in-flight read after a session change", async () => {
    let finish!: (response: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValueOnce(Response.json({ token: "token" }))
      .mockResolvedValueOnce(Response.json({ ok: true }))
      .mockResolvedValueOnce(Response.json({ account: "new" }));
    vi.stubGlobal("fetch", fetch);
    const previous = adminRequest("/api/admin/content/site");
    await adminRequest("/api/admin/session", { idToken: "new-session" });
    expect(await adminRequest("/api/admin/content/site")).toEqual({ account: "new" });
    finish(Response.json({ account: "old" }));
    await previous;
  });
});
