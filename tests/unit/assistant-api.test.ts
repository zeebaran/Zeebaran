import { beforeEach, describe, expect, it, vi } from "vitest";
const source = vi.hoisted(() => vi.fn());
vi.mock("@/features/assistant/server", () => ({ assistantKnowledge: source }));
import { GET } from "@/app/api/assistant/route";
beforeEach(() => {
  source.mockReset();
});
describe("assistant published-only boundary", () => {
  it("returns only the published snapshot service output and does not depend on admin cookies", async () => {
    const data = { items: [], pages: [], retrievedAt: "2026-11-11", partial: false };
    source.mockResolvedValue(data);
    const r = await GET(
      new Request("http://localhost/api/assistant", {
        headers: { cookie: "zeebaran-admin=untrusted; __prerender_bypass=untrusted" },
      }),
    );
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual(data);
    expect(source).toHaveBeenCalledWith();
    expect(r.headers.get("cache-control")).toBe("no-store");
  });
  it("rejects query variations before data access", async () => {
    expect((await GET(new Request("http://localhost/api/assistant?page=admin"))).status).toBe(400);
    expect(source).not.toHaveBeenCalled();
  });
  it("rejects a browser cross-site request", async () => {
    expect(
      (
        await GET(
          new Request("http://localhost/api/assistant", {
            headers: { "sec-fetch-site": "cross-site" },
          }),
        )
      ).status,
    ).toBe(400);
    expect(source).not.toHaveBeenCalled();
  });
  it("fails closed with a safe error instead of returning invented fallback products", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    source.mockRejectedValue(Error("PRIVATE KEY must never be exposed"));
    const r = await GET(new Request("http://localhost/api/assistant"));
    expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("PRIVATE KEY");
    log.mockRestore();
  });
});
