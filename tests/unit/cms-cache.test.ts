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
import { defaultTeam } from "../../features/team/model";
import { defaultSettings } from "../../features/site/model";
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
  it("reuses the shared site snapshot and exposes only validated public settings", async () => {
    const settings = defaultSettings();
    mock.get.mockResolvedValueOnce({
      data: () => ({
        published: { text: {}, images: {} },
        publicSettings: settings,
        settingsUpdatedBy: "PRIVATE-ACTOR",
        draft: { text: { private: "UNPUBLISHED" } },
      }),
    });
    const first = await publishedContent("site");
    expect(first.publicSettings).toEqual(settings);
    expect(await publishedContent("site")).toEqual(first);
    expect(mock.get).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(first)).not.toMatch(/PRIVATE-ACTOR|UNPUBLISHED/);
  });
  it("omits hidden team profiles from public snapshots without fetching individual members", async () => {
    mock.get.mockResolvedValueOnce({
      data: () => ({
        published: {
          text: {},
          images: {},
          team: [
            {
              ...defaultTeam[0],
              enabled: false,
              biography: "HIDDEN-PROFILE-MARKER",
              phone: "+91 98765 43210",
            },
            defaultTeam[1],
          ],
        },
      }),
    });
    const snapshot = await publishedContent("about");
    expect(snapshot.team?.map((member) => member.id)).toEqual(["hilal-sheikh"]);
    expect(JSON.stringify(snapshot)).not.toContain("HIDDEN-PROFILE-MARKER");
    expect(mock.get).toHaveBeenCalledTimes(1);
  });
  it("does not attach site settings to ordinary page snapshots", async () => {
    mock.get.mockResolvedValueOnce({
      data: () => ({ published: { text: {}, images: {} }, publicSettings: defaultSettings() }),
    });
    expect((await publishedContent("about")).publicSettings).toBeUndefined();
  });
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
