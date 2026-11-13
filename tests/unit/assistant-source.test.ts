import { describe, it, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({ page: vi.fn(), content: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/catalog/server/public", () => ({ publishedPage: mocks.page }));
vi.mock("@/features/cms/server/public", () => ({ publishedContent: mocks.content }));
import { assistantKnowledge } from "@/features/assistant/server";
import { emptyCatalog } from "@/features/catalog/model";
import { catalog } from "@/features/cms/catalog";
beforeEach(() => {
  mocks.page.mockReset();
  mocks.content.mockReset();
  mocks.content.mockResolvedValue({ text: {}, images: {} });
});
describe("assistant source assembly", () => {
  it("reuses bounded published pages, coalesces requests and explicitly projects public fields", async () => {
    mocks.page.mockImplementation(async (kind: string, cursor: string | null) => ({
      items: [
        {
          ...emptyCatalog(kind === "rootstock" ? "rootstock" : "variety"),
          id: kind + (cursor || ""),
          slug: kind,
          name: "A dynamic entry",
          publishedAt: "2026-11-11",
          updatedBy: "PRIVATE",
          draft: { name: "SECRET" },
          rootstocks: [],
        },
      ],
      nextCursor: kind === "rootstock" && !cursor ? "next" : null,
    }));
    const key = catalog.about.fields.find((f) => f.value.includes("Business is"))!.key;
    mocks.content.mockImplementation(async (id: string) => ({
      text:
        id === "about"
          ? { [key]: "A newly published statement of more than forty-five characters." }
          : {},
      images: {},
    }));
    const [a, b] = await Promise.all([assistantKnowledge(), assistantKnowledge()]);
    expect(a).toBe(b);
    expect(mocks.page).toHaveBeenCalledTimes(3);
    expect(a.items).toHaveLength(3);
    expect(JSON.stringify(a)).not.toContain("PRIVATE");
    expect(JSON.stringify(a)).not.toContain("SECRET");
    expect(a.pages.find((p) => p.page === "about")!.passages).toContain(
      "A newly published statement of more than forty-five characters.",
    );
    expect(a.partial).toBe(false);
  });
  it("does not convert an unavailable catalog into invented fallback products", async () => {
    mocks.page.mockRejectedValue(Error("offline"));
    await expect(assistantKnowledge()).rejects.toThrow("offline");
    mocks.page.mockResolvedValue({ items: [], nextCursor: null });
    expect((await assistantKnowledge()).items).toEqual([]);
  });
  it("bounds oversized collections and marks the snapshot incomplete", async () => {
    mocks.page.mockResolvedValue({ items: [], nextCursor: "more" });
    const data = await assistantKnowledge();
    expect(mocks.page).toHaveBeenCalledTimes(20);
    expect(data.partial).toBe(true);
  });
});

it("includes current published team and shared contact settings without additional page reads", async () => {
  const { defaultTeam } = await import("../../features/team/model");
  const { defaultSettings } = await import("../../features/site/model");
  const settings = {
    ...defaultSettings(),
    email: "current@example.test",
    phone: "+91 98765 43210",
  };
  mocks.page.mockResolvedValue({ items: [], nextCursor: null });
  mocks.content.mockImplementation(async (id: string) => ({
    text: {},
    images: {},
    ...(id === "site" ? { publicSettings: settings } : {}),
    ...(id === "about"
      ? {
          team: [
            { ...defaultTeam[0], name: "Published leader", role: "Chief Executive Officer" },
            { ...defaultTeam[1], name: "Hidden leader", enabled: false },
          ],
        }
      : {}),
  }));
  const data = await assistantKnowledge();
  expect(data.pages.find((p) => p.page === "about")?.passages.join(" ")).toContain(
    "Published leader",
  );
  expect(JSON.stringify(data)).not.toContain("Hidden leader");
  expect(data.pages.find((p) => p.page === "contact")?.passages.join(" ")).toContain(
    "current@example.test",
  );
  expect(mocks.content.mock.calls.filter(([id]) => id === "site")).toHaveLength(1);
});

it("includes managed published partner profiles without extra reads or removed partners", async () => {
  const { strategicPartners } = await import("../../features/cms/partner-profiles");
  const partner = {
    ...strategicPartners[0],
    profile: {
      ...strategicPartners[0].profile!,
      description: "Published irrigation fixture managed from the partner editor.",
    },
  };
  mocks.page.mockResolvedValue({ items: [], nextCursor: null });
  mocks.content.mockImplementation(async (id: string) => ({
    text: {},
    images: {},
    ...(id === "partnerships"
      ? { partners: [partner], draft: { secret: "PRIVATE-PARTNER-DRAFT" } }
      : {}),
  }));
  let data = await assistantKnowledge();
  expect(data.pages.find((p) => p.page === "partnerships")?.passages.join(" ")).toContain(
    "Published irrigation fixture",
  );
  expect(JSON.stringify(data)).not.toContain("PRIVATE-PARTNER-DRAFT");
  expect(mocks.content.mock.calls.filter(([id]) => id === "partnerships")).toHaveLength(1);
  mocks.content.mockImplementation(async (id: string) => ({
    text: {},
    images: {},
    ...(id === "partnerships" ? { partners: [] } : {}),
  }));
  data = await assistantKnowledge();
  expect(data.pages.find((p) => p.page === "partnerships")?.passages.join(" ")).not.toContain(
    "Balson",
  );
});
