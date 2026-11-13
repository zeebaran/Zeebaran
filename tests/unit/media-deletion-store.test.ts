import { beforeEach, afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  destroy: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  listDocuments: vi.fn(),
  record: {} as Record<string, unknown>,
  rows: [] as unknown[],
  exists: true,
}));
vi.mock("../../features/admin/server/cloudinary", () => ({ destroyResource: mocks.destroy }));
vi.mock("../../lib/firebase-admin", () => ({ firebase: () => ({}) }));
vi.mock("firebase-admin/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase-admin/firestore")>();
  const collection = (name: string): unknown => ({
    name,
    limit: () => ({ name }),
    listDocuments: mocks.listDocuments,
    where: () => ({ limit: () => ({ get: async () => ({ empty: true }) }) }),
    doc: () => ({ name, update: mocks.update, delete: mocks.delete }),
  });
  return {
    ...actual,
    getFirestore: () => ({
      collection,
      runTransaction: async (callback: (tx: unknown) => unknown) =>
        callback({ get: mocks.get, update: mocks.update }),
    }),
  };
});
import { deleteMedia, inspectMedia } from "../../features/media/server/deletion";
const media = {
  publicId: "zeebaran/fixture/delete-me",
  src: "https://res.cloudinary.com/fixture-cloud/image/upload/v1/zeebaran/fixture/delete-me.webp",
  resourceType: "image",
  name: "delete-me.webp",
};
beforeEach(() => {
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "fixture-cloud");
  mocks.record = { ...media };
  mocks.rows = [];
  mocks.exists = true;
  mocks.get.mockImplementation(async (query: { name: string; limit?: unknown }) =>
    query.name === "cmsMedia"
      ? { exists: mocks.exists, data: () => mocks.record, get: (key: string) => mocks.record[key] }
      : { docs: mocks.rows, size: mocks.rows.length },
  );
  mocks.update.mockImplementation(async (...args: unknown[]) =>
    Object.assign(mocks.record, args.at(-1)),
  );
  mocks.listDocuments.mockResolvedValue([]);
  mocks.destroy.mockResolvedValue(undefined);
  mocks.delete.mockResolvedValue(undefined);
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
it("keeps registration and a retryable deleting state if Cloudinary fails", async () => {
  mocks.destroy.mockRejectedValueOnce(new Error("Provider timeout"));
  await expect(deleteMedia(media.publicId, media.name, "admin")).rejects.toMatchObject({
    status: 503,
  });
  expect(mocks.delete).not.toHaveBeenCalled();
  expect(mocks.record.state).toBe("deleting");
  expect((mocks.record.deletionStartedAt as { toMillis: () => number }).toMillis()).toBe(0);
  await deleteMedia(media.publicId, media.name, "admin");
  expect(mocks.destroy).toHaveBeenCalledTimes(2);
  expect(mocks.delete).toHaveBeenCalledTimes(1);
});
it("keeps registration if Firebase cleanup fails after provider deletion, then completes on retry", async () => {
  mocks.listDocuments.mockRejectedValueOnce(new Error("Firestore temporarily unavailable"));
  await expect(deleteMedia(media.publicId, media.name, "admin")).rejects.toMatchObject({
    status: 503,
  });
  expect(mocks.delete).not.toHaveBeenCalled();
  await deleteMedia(media.publicId, media.name, "admin");
  expect(mocks.delete).toHaveBeenCalledTimes(1);
});
it("blocks deletion of media used by active content or catalog Trash", async () => {
  mocks.rows = [{ id: "about", data: () => ({ draft: { images: [media] }, deleted: true }) }];
  await expect(deleteMedia(media.publicId, media.name, "admin")).rejects.toMatchObject({
    status: 409,
  });
  expect(mocks.destroy).not.toHaveBeenCalled();
  expect(mocks.delete).not.toHaveBeenCalled();
  expect((await inspectMedia(media.publicId)).usage.length).toBeGreaterThan(0);
});
it("requires the exact name and prevents duplicate in-progress deletions", async () => {
  await expect(deleteMedia(media.publicId, "wrong", "admin")).rejects.toMatchObject({
    status: 422,
  });
  mocks.record.deletionStartedAt = { toMillis: () => Date.now() };
  await expect(deleteMedia(media.publicId, media.name, "admin")).rejects.toMatchObject({
    status: 409,
  });
  expect(mocks.destroy).not.toHaveBeenCalled();
});
it("a completed deletion is idempotent without another provider operation", async () => {
  mocks.exists = false;
  await deleteMedia(media.publicId, media.name, "admin");
  expect(mocks.destroy).not.toHaveBeenCalled();
  expect(mocks.delete).not.toHaveBeenCalled();
});
