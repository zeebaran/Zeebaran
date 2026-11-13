import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { catalog } from "../../features/cms/catalog";
import { defaultTeam } from "../../features/team/model";
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("../../features/media/server-posters", () => ({ prepareYoutubePoster: mocks.poster }));
vi.mock("../../lib/firebase-admin", () => ({ firebase: () => ({}) }));
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  getAll: vi.fn(),
  transaction: vi.fn(),
  set: vi.fn(),
  create: vi.fn(),
  poster: vi.fn(),
  after: vi.fn(),
}));
vi.mock("firebase-admin/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase-admin/firestore")>();
  const collection = (path: string): unknown => ({
    doc: (id: string) => ({
      path: path + "/" + id,
      get: () => mocks.get(path + "/" + id),
      collection: (name: string) => collection(path + "/" + id + "/" + name),
    }),
  });
  return {
    ...actual,
    getFirestore: () => ({ collection, getAll: mocks.getAll, runTransaction: mocks.transaction }),
  };
});
import { mutatePage } from "../../features/cms/server/store";
const publicId = "zeebaran/fixture/shared-portrait";
const image = {
  publicId,
  src: "https://res.cloudinary.com/fixture-cloud/image/upload/v1/" + publicId + ".webp",
  resourceType: "image" as const,
  alt: "Fixture portrait",
};
const content = () => ({
  text: {},
  images: Object.fromEntries(
    catalog.about.images.slice(0, 3).map((field) => [field.key, { ...image }]),
  ),
  team: [{ ...defaultTeam[0], image: { ...image } }],
});
beforeEach(() => {
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "fixture-cloud");
  mocks.poster.mockReset();
  mocks.poster.mockResolvedValue(undefined);
  const media = { exists: true, get: (key: string) => image[key as keyof typeof image] };
  mocks.get.mockImplementation(async (path: string) =>
    path.startsWith("cmsMedia/") ? media : { data: () => ({ revision: 0 }) },
  );
  mocks.getAll.mockImplementation(async (...refs: unknown[]) => refs.map(() => media));
  mocks.transaction.mockImplementation(async (callback) =>
    callback({
      get: async () => ({ data: () => ({ revision: 0, draft: { text: {} } }) }),
      getAll: mocks.getAll,
      set: mocks.set,
      create: mocks.create,
    }),
  );
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
it("verifies a reused page/team portrait once in one bounded batch", async () => {
  await mutatePage(
    "about",
    { action: "save", revision: 0, content: content() },
    { uid: "fixture" },
  );
  expect(mocks.get.mock.calls.filter(([path]) => path.startsWith("cmsMedia/"))).toHaveLength(0);
  expect(mocks.getAll).toHaveBeenCalledTimes(1);
  expect(mocks.getAll.mock.calls[0]).toHaveLength(1);
});
it("rejects missing registrations inside the write transaction", async () => {
  mocks.getAll.mockResolvedValueOnce([{ exists: false }]);
  await expect(
    mutatePage("about", { action: "save", revision: 0, content: content() }, { uid: "fixture" }),
  ).rejects.toMatchObject({ status: 422 });
  expect(mocks.transaction).toHaveBeenCalledTimes(1);
});
it("rejects conflicting sources for a shared public ID", async () => {
  const value = content();
  value.team[0].image.src = image.src.replace("v1/", "v2/");
  await expect(
    mutatePage("about", { action: "save", revision: 0, content: value }, { uid: "fixture" }),
  ).rejects.toMatchObject({ status: 422 });
  expect(mocks.transaction).not.toHaveBeenCalled();
});

it("persists intentional image removal in both draft and publication without asset reads", async () => {
  const key = catalog.mission.images[0].key;
  const value = { text: {}, images: { [key]: null } };
  await mutatePage(
    "mission",
    { action: "publish", revision: 0, content: value },
    { uid: "fixture" },
  );
  expect(mocks.set).toHaveBeenCalledWith(
    expect.objectContaining({ path: "cmsPages/mission" }),
    expect.objectContaining({ draft: value, published: value, revision: 1 }),
    expect.anything(),
  );
  expect(mocks.getAll).not.toHaveBeenCalled();
  expect(mocks.get.mock.calls.some(([path]) => path.startsWith("cmsMedia/"))).toBe(false);
});

it("rejects removing a placement that does not belong to the page", async () => {
  await expect(
    mutatePage(
      "mission",
      {
        action: "save",
        revision: 0,
        content: { text: {}, images: { unknown: null } },
      },
      { uid: "fixture" },
    ),
  ).rejects.toMatchObject({ status: 422 });
  expect(mocks.transaction).not.toHaveBeenCalled();
});

it("does not create another revision or audit entry for unchanged saves and publications", async () => {
  const value = { text: {}, images: {} };
  mocks.transaction.mockImplementation(async (callback) =>
    callback({
      get: async () => ({
        data: () => ({ revision: 5, draft: value, published: value, publishedAt: new Date() }),
      }),
      getAll: mocks.getAll,
      set: mocks.set,
      create: mocks.create,
    }),
  );
  for (const action of ["save", "publish"])
    await mutatePage("mission", { action, revision: 5, content: value }, { uid: "fixture" });
  expect(mocks.set).not.toHaveBeenCalled();
  expect(mocks.create).not.toHaveBeenCalled();
  expect(mocks.after).not.toHaveBeenCalled();
  await expect(
    mutatePage("mission", { action: "save", revision: 4, content: value }, { uid: "fixture" }),
  ).rejects.toMatchObject({ status: 409 });
});

it("publishes a saved draft even when it has no unsaved edits, and permits the first empty publication", async () => {
  const value = { text: {}, images: {} };
  await mutatePage(
    "mission",
    { action: "publish", revision: 0, content: value },
    { uid: "fixture" },
  );
  expect(mocks.set).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ published: value }),
    expect.anything(),
  );
  expect(mocks.create).toHaveBeenCalledTimes(2);
});

it("saves Mission copy without waiting for optional YouTube poster delivery", async () => {
  let release!: () => void;
  mocks.poster.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const section = (id: string) => [
    {
      id,
      title: "Fixture film",
      description: "A field demonstration",
      video: { kind: "youtube" as const, src: "https://youtu.be/abcdefghijk" },
    },
  ];
  let saved = false;
  const saving = mutatePage(
    "mission",
    {
      action: "save",
      revision: 0,
      content: {
        text: {},
        images: {},
        missionSections: {
          orchard: section("orchard"),
          process: section("process"),
          demos: section("demos"),
        },
      },
    },
    { uid: "fixture" },
  ).then(() => {
    saved = true;
  });
  try {
    for (let i = 0; i < 12; i++) await new Promise<void>((resolve) => setImmediate(resolve));
    expect(saved).toBe(true);
    expect(mocks.poster).not.toHaveBeenCalled();
    expect(mocks.after).toHaveBeenCalledTimes(1);
  } finally {
    release?.();
    await saving;
  }
  const task = mocks.after.mock.calls[0][0];
  const background = task();
  await Promise.resolve();
  release?.();
  await background;
  expect(mocks.poster).toHaveBeenCalledTimes(1);
});

it("does not schedule poster work for unchanged draft films or a failed revision", async () => {
  const value = {
    text: {},
    images: {},
    videos: {
      "ZB-OI-01": { kind: "youtube", src: "https://www.youtube-nocookie.com/embed/abcdefghijk" },
    },
  };
  mocks.transaction.mockImplementation(async (callback) =>
    callback({
      get: async () => ({ data: () => ({ revision: 0, draft: value }) }),
      getAll: mocks.getAll,
      set: vi.fn(),
      create: vi.fn(),
    }),
  );
  await mutatePage("mission", { action: "save", revision: 0, content: value }, { uid: "fixture" });
  expect(mocks.after).not.toHaveBeenCalled();
  await expect(
    mutatePage("mission", { action: "save", revision: 1, content: value }, { uid: "fixture" }),
  ).rejects.toMatchObject({ status: 409 });
  expect(mocks.after).not.toHaveBeenCalled();
});
it("saves podcast episodes through the existing transaction and rejects cross-page data", async () => {
  const podcast = {
    channelUrl: "https://www.youtube.com/@Bazm-e-Khayal",
    episodes: [
      {
        id: "episode-one",
        url: "https://youtu.be/M7lc1UVf-VE",
        title: "An orchard conversation",
        description: "",
        guest: "",
        topic: "",
        enabled: true,
      },
    ],
  };
  await mutatePage(
    "podcast",
    { action: "save", revision: 0, content: { text: {}, images: {}, podcast } },
    { uid: "fixture" },
  );
  expect(mocks.transaction).toHaveBeenCalledTimes(1);
  expect(mocks.getAll).not.toHaveBeenCalled();
  await expect(
    mutatePage(
      "home",
      { action: "save", revision: 0, content: { text: {}, images: {}, podcast } },
      { uid: "fixture" },
    ),
  ).rejects.toMatchObject({ status: 422 });
});
