import { beforeEach, afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mock = vi.hoisted(() => ({
  cache: new Map<string, unknown>(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  get: vi.fn(),
}));
vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<unknown>, keys: string[]) => async () => {
    const key = JSON.stringify(keys);
    if (mock.cache.has(key)) return mock.cache.get(key);
    const result = await fn();
    mock.cache.set(key, result);
    return result;
  },
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("../../features/catalog/server/store", () => ({
  catalogDb: () => ({ collection: () => mock }),
  encodeCursor: (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url"),
}));
import { publishedPage } from "../../features/catalog/server/public";
import { emptyCatalog } from "../../features/catalog/model";
beforeEach(() => {
  mock.cache.clear();
  vi.clearAllMocks();
  vi.stubEnv("FIREBASE_PROJECT_ID", "fixture-harvest");
  for (const method of [mock.where, mock.orderBy, mock.limit, mock.startAfter])
    method.mockReturnValue(mock);
  mock.get.mockResolvedValue({ docs: [] });
});
afterEach(() => vi.unstubAllEnvs());
it("queries the published season with a bounded page and caches repeat requests independently", async () => {
  await publishedPage("variety", null, "", 24, "Very Late");
  expect(mock.where).toHaveBeenCalledWith("kind", "==", "variety");
  expect(mock.where).toHaveBeenCalledWith("season", "==", "Very Late");
  expect(mock.limit).toHaveBeenCalledWith(25);
  expect(mock.orderBy).toHaveBeenCalledWith("sortOrder");
  await publishedPage("variety", null, "", 24, "Very Late");
  expect(mock.get).toHaveBeenCalledTimes(1);
  await publishedPage("variety", null, "", 24, "Late");
  expect(mock.get).toHaveBeenCalledTimes(2);
});
it("combines season/search and advances a cursor in sorted order without reading drafts", async () => {
  const docs = Array.from({ length: 3 }, (_, i) => ({
    id: "fixture-" + i,
    get: () => i,
    data: () => ({
      ...emptyCatalog("variety"),
      slug: "fixture-" + i,
      name: "Fixture",
      season: "Early",
      publishedAt: { toDate: () => new Date(0) },
    }),
  }));
  mock.get.mockResolvedValue({ docs });
  const first = await publishedPage("variety", null, "", 2, "Early");
  expect(first.items).toHaveLength(2);
  expect(first.nextCursor).toBeTruthy();
  mock.get.mockResolvedValue({ docs: [] });
  await publishedPage("variety", first.nextCursor, "", 2, "Early");
  expect(mock.startAfter).toHaveBeenCalledWith(1, "fixture-1");
  await publishedPage("variety", null, " Ga ", 24, "Early");
  expect(mock.where).toHaveBeenCalledWith("nameSort", ">=", "ga");
  expect(mock.orderBy).toHaveBeenCalledWith("nameSort");
});
