import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mock = vi.hoisted(() => ({ get: vi.fn(), entries: new Map<string, unknown>() }));
vi.mock("next/cache", () => ({
  unstable_cache: (callback: () => Promise<unknown>, keys: string[]) => async () => {
    const key = keys.join(":");
    if (mock.entries.has(key)) return mock.entries.get(key);
    const result = await callback();
    mock.entries.set(key, result);
    return result;
  },
}));
vi.mock("next/headers", () => ({ draftMode: vi.fn() }));
vi.mock("../../lib/firebase-admin", () => ({ firebase: () => ({}) }));
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({ collection: () => ({ doc: () => ({ get: mock.get }) }) }),
}));
vi.mock("../../features/cms/server/store", () => ({ readPage: vi.fn() }));
vi.mock("../../features/admin/server/security", () => ({ adminSession: vi.fn() }));
import { publishedContent } from "../../features/cms/server/public";
beforeEach(() => {
  mock.entries.clear();
  mock.get.mockReset();
  vi.stubEnv("FIREBASE_PROJECT_ID", "fixture-cache");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
describe("published CMS failure recovery", () => {
  it("does not cache defaults as a successful publication after a transient database failure", async () => {
    mock.get.mockRejectedValueOnce(new Error("temporary outage"));
    const published = { text: { "fixture-heading": "Manually published copy" }, images: {} };
    mock.get.mockResolvedValueOnce({ data: () => ({ published }) });
    expect(await publishedContent("home")).toEqual({ text: {}, images: {} });
    expect(await publishedContent("home")).toEqual(published);
    expect(mock.get).toHaveBeenCalledTimes(2);
    expect(await publishedContent("home")).toEqual(published);
    expect(mock.get).toHaveBeenCalledTimes(2);
  });
});
