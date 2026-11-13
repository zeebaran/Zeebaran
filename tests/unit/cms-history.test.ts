import { beforeEach, expect, it, vi } from "vitest";
import { sameContent } from "@/features/cms/equal-content";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ get: vi.fn(), remove: vi.fn(), where: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/firebase-admin", () => ({ firebase: () => ({}) }));
vi.mock("firebase-admin/firestore", async (original) => {
  const actual = await original<typeof import("firebase-admin/firestore")>();
  const query = {
    where: (...args: unknown[]) => {
      mocks.where(...args);
      return query;
    },
    orderBy: () => query,
    limit: (value: number) => {
      mocks.limit(value);
      return query;
    },
    select: () => query,
  };
  const ref = { collection: () => query };
  return {
    ...actual,
    getFirestore: () => ({
      collection: () => ({ doc: () => ref }),
      runTransaction: (callback: (tx: unknown) => unknown) =>
        callback({ get: mocks.get, delete: mocks.remove }),
    }),
  };
});
import { Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import { isPublishedHistory, prunePageHistory } from "@/features/cms/server/history";
const publishedId = "b15098bc-c7ed-4d17-a875-915ff0c05e45";
const row = (id: string, action = "save", createdAt = Timestamp.fromMillis(1000)) =>
  ({
    id,
    ref: { id },
    get: (field: string) => ({ action, createdAt })[field as "action"],
  }) as unknown as DocumentSnapshot;
beforeEach(() => vi.clearAllMocks());
it("ignores map order, but distinguishes removed images and ordered cards", () => {
  expect(
    sameContent({ text: { b: "B", a: "A" }, images: {} }, { images: {}, text: { a: "A", b: "B" } }),
  ).toBe(true);
  expect(sameContent({ images: {} }, { images: { a: null } })).toBe(false);
  expect(sameContent(["A", "B"], ["B", "A"])).toBe(false);
});
it("protects pinned and legacy publications, failing closed on missing timestamp metadata", () => {
  expect(isPublishedHistory({ publishedHistoryId: publishedId }, row(publishedId, "publish"))).toBe(
    true,
  );
  expect(
    isPublishedHistory({ publishedAt: Timestamp.fromMillis(1000) }, row("legacy", "publish")),
  ).toBe(true);
  expect(
    isPublishedHistory({ publishedAt: Timestamp.fromMillis(2000) }, row("older", "publish")),
  ).toBe(false);
  expect(isPublishedHistory({}, row("legacy", "publish"))).toBe(true);
  expect(
    isPublishedHistory(
      {
        publishedHistoryId: publishedId,
        publishedAt: Timestamp.fromMillis(2000),
        previousPublishedAt: Timestamp.fromMillis(1000),
      },
      row("previous", "publish"),
    ),
  ).toBe(true);
});
it("deletes at most 25 older snapshots while protecting the last publication", async () => {
  mocks.get
    .mockResolvedValueOnce({ data: () => ({ revision: 100, publishedHistoryId: publishedId }) })
    .mockResolvedValueOnce({
      docs: [row(publishedId, "publish"), ...Array.from({ length: 25 }, (_, i) => row(String(i)))],
    });
  expect(await prunePageHistory("mission")).toBe(25);
  expect(mocks.remove).toHaveBeenCalledTimes(25);
  expect(mocks.remove).not.toHaveBeenCalledWith({ id: publishedId });
  expect(mocks.where).toHaveBeenCalledWith("revision", "<=", 80);
  expect(mocks.limit).toHaveBeenCalledWith(26);
});
it("does no history scan before retention is exceeded, and rejects unknown scopes", async () => {
  mocks.get.mockResolvedValueOnce({ data: () => ({ revision: 20 }) });
  expect(await prunePageHistory("mission")).toBe(0);
  expect(mocks.where).not.toHaveBeenCalled();
  await expect(prunePageHistory("not-a-page")).rejects.toThrow("Invalid page history scope");
});
