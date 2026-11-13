import { beforeEach, expect, it, vi } from "vitest";
import { emptyCatalog } from "../../features/catalog/model";
vi.mock("server-only", () => ({}));
vi.mock("../../lib/firebase-admin", () => ({ firebase: () => ({}) }));
vi.mock("../../features/media/server/registration", () => ({ verifyMediaReferences: vi.fn() }));
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock("firebase-admin/firestore", async (original) => {
  const actual = await original<typeof import("firebase-admin/firestore")>();
  return {
    ...actual,
    getFirestore: () => ({
      collection: (name: string) => ({
        doc: (id: string) => ({ path: name + "/" + id, get: () => mocks.get(name + "/" + id) }),
      }),
      runTransaction: mocks.transaction,
    }),
  };
});
import { writeEntry } from "../../features/catalog/server/store";
const draft = { ...emptyCatalog("variety"), slug: "restore-probe", name: "Restore probe" };
const row = (deleted: boolean) => ({
  exists: true,
  data: () => ({ revision: 3, kind: "variety", draft, deleted, published: !deleted }),
  get: () => undefined,
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockResolvedValue(row(false));
  mocks.transaction.mockImplementation(async (callback) =>
    callback({
      get: (ref: { path: string }) => mocks.get(ref.path),
      set: mocks.set,
      create: mocks.create,
      delete: mocks.delete,
    }),
  );
});
it.each([false, undefined])(
  "rejects restore on active/legacy entries (deleted=%s) before any writes",
  async (deleted) => {
    mocks.get.mockResolvedValue({
      exists: true,
      data: () => ({ ...row(false).data(), deleted }),
      get: () => undefined,
    });
    await expect(
      writeEntry(draft.slug, "restore", 3, undefined, { uid: "editor" }),
    ).rejects.toMatchObject({ status: 409 });
    expect(mocks.set).not.toHaveBeenCalled();
    expect(mocks.delete).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  },
);
it("continues allowing a trashed entry to be restored as an unpublished draft", async () => {
  mocks.get.mockResolvedValue(row(true));
  await writeEntry(draft.slug, "restore", 3, undefined, { uid: "editor" });
  expect(mocks.set).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ deleted: false, published: false, revision: 4 }),
  );
  expect(mocks.create).toHaveBeenCalledTimes(1);
});
