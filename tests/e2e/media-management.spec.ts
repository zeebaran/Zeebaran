import { readFile } from "node:fs/promises";
import { test, expect, type APIRequestContext } from "@playwright/test";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { catalog } from "../../features/cms/catalog";
import { emptyCatalog } from "../../features/catalog/model";
import type { LibraryMedia } from "../../features/admin/MediaUpload";
const origin = process.env.E2E_ADMIN_EMULATOR_BASE_URL;
const enabled = Boolean(
  origin &&
  /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) &&
  process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:8395" &&
  process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:9098",
);
const prefix = "media-qa-" + Date.now();
let app: ReturnType<typeof initializeApp>;
let api: APIRequestContext;
let csrf: string;
const assets: LibraryMedia[] = [],
  entries: string[] = [],
  pages: string[] = [];
const headers = () => ({ origin: origin!, "x-csrf-token": csrf });
const refId = (id: string) => Buffer.from(id).toString("base64url");
async function signIn(request: APIRequestContext, email = "zeebaran00@gmail.com") {
  const signed = await request.post(
    "http://127.0.0.1:9098/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key",
    { data: { email, password: "Local-fixture-Only-786!", returnSecureToken: true } },
  );
  const { token } = await (await request.get(origin + "/api/admin/csrf")).json();
  const session = await request.post(origin + "/api/admin/session", {
    headers: { origin: origin!, "x-csrf-token": token },
    data: { idToken: (await signed.json()).idToken },
  });
  expect(session.ok()).toBe(true);
  return token as string;
}
async function upload(name: string, kind: "image" | "video" = "image") {
  const extension = kind === "image" ? "png" : "mp4";
  test.skip(
    process.env.E2E_CLOUDINARY_DELETE !== "1",
    "Explicit disposable Cloudinary upload/delete opt-in required.",
  );
  const signed = await (
    await api.post(origin + "/api/admin/media/sign", {
      headers: headers(),
      data: {
        kind,
        category: kind === "image" ? "galleries/field-work" : "videos",
        name: prefix + "-" + name + "." + extension,
      },
    })
  ).json();
  expect(signed.url).toBe("https://api.cloudinary.com/v1_1/jfiuaflr/" + kind + "/upload");
  const multipart: Record<string, string | { name: string; mimeType: string; buffer: Buffer }> = {};
  for (const [key, value] of Object.entries(signed))
    if (!["url", "kind"].includes(key)) multipart[key] = String(value);
  multipart.file = {
    name: prefix + "-" + name + "." + extension,
    mimeType: kind === "image" ? "image/png" : "video/mp4",
    buffer:
      kind === "video"
        ? await readFile(process.env.E2E_VIDEO_FIXTURE!)
        : Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=",
            "base64",
          ),
  };
  const uploaded = await api.post(signed.url, { multipart });
  expect(uploaded.ok(), await uploaded.text()).toBe(true);
  const resource = await uploaded.json();
  // Track before registration, so failures cannot hide the new provider asset.
  const media: LibraryMedia = {
    publicId: resource.public_id,
    src: resource.secure_url,
    resourceType: kind,
    width: resource.width,
    height: resource.height,
    bytes: resource.bytes,
    name: prefix + "-" + name + "." + extension,
    alt: "Disposable media deletion QA fixture",
  };
  assets.push(media);
  const registered = await api.post(origin + "/api/admin/media", {
    headers: headers(),
    data: { publicId: media.publicId, kind, name: media.name, alt: media.alt },
  });
  expect(registered.ok(), await registered.text()).toBe(true);
  return media;
}
async function remove(media: LibraryMedia) {
  return api.delete(origin + "/api/admin/media/delete", {
    headers: headers(),
    data: { publicId: media.publicId, confirmation: media.name },
  });
}
async function createEntry(media: LibraryMedia, suffix: string) {
  const id = prefix + "-" + suffix;
  entries.push(id);
  const content = {
    ...emptyCatalog("variety"),
    slug: id,
    name: "Media QA " + suffix,
    images: [
      {
        src: media.src,
        publicId: media.publicId,
        width: media.width,
        height: media.height,
        alt: media.alt,
      },
    ],
  };
  const response = await api.post(origin + "/api/admin/catalog/" + id, {
    headers: headers(),
    data: { action: "save", revision: 0, content },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return { id, content, record: (await response.json()).record };
}
test.beforeAll(async ({ playwright }, info) => {
  test.skip(
    !enabled || info.project.name !== "chromium",
    "Explicit demo Firebase admin server required.",
  );
  app = initializeApp({ projectId: "demo-zeebaran-admin" }, prefix);
  api = await playwright.request.newContext();
  csrf = await signIn(api);
});
test.afterAll(async () => {
  if (!app) return;
  const db = getFirestore(app);
  for (const id of pages) await db.recursiveDelete(db.collection("cmsPages").doc(id));
  for (const id of entries) {
    await db.recursiveDelete(db.collection("catalogEntries").doc(id));
    await db.collection("catalogPublished").doc(id).delete();
    const audit = await db.collection("catalogAudit").where("entry", "==", id).get();
    for (const row of audit.docs) await row.ref.delete();
  }
  for (const media of assets) {
    const response = await remove(media);
    expect(
      response.ok(),
      "QA asset cleanup failed for " + media.publicId + ": " + (await response.text()),
    ).toBe(true);
  }
  await api.dispose();
  await deleteApp(app);
});
test("deletion requires verified administrator access and CSRF", async ({ playwright }) => {
  const anonymous = await playwright.request.newContext();
  expect((await anonymous.get(origin + "/api/admin/media/delete?publicId=fixture")).status()).toBe(
    401,
  );
  expect(
    (
      await api.delete(origin + "/api/admin/media/delete", {
        data: { publicId: "fixture", confirmation: "fixture" },
      })
    ).status(),
  ).toBe(403);
  const auth = getAuth(app),
    email = prefix + "-editor@example.test";
  const editor = await auth.createUser({
    email,
    password: "Local-fixture-Only-786!",
    emailVerified: true,
  });
  try {
    await auth.setCustomUserClaims(editor.uid, { zeebaranRole: "editor" });
    const token = await signIn(anonymous, email);
    expect(
      (await anonymous.get(origin + "/api/admin/media/delete?publicId=fixture")).status(),
    ).toBe(403);
    expect(
      (
        await anonymous.delete(origin + "/api/admin/media/delete", {
          headers: { origin: origin!, "x-csrf-token": token },
          data: { publicId: "fixture", confirmation: "fixture" },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await anonymous.delete(origin + "/api/admin/catalog/fixture", {
          headers: { origin: origin!, "x-csrf-token": token },
          data: { revision: 1, confirmation: "fixture" },
        })
      ).status(),
    ).toBe(403);
  } finally {
    await auth.deleteUser(editor.uid);
    await anonymous.dispose();
  }
});
test("management cards retain normal opacity and select focus clears its label on mobile and desktop", async ({
  page,
  context,
}) => {
  const media = await upload("ui");
  await signIn(context.request);
  let checks = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/admin/media/delete")) checks++;
  });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin + "/admin/media");
    const card = page.locator(".admin-media-card").filter({ hasText: media.name });
    await expect(card).toBeVisible();
    expect(await card.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
    await expect(card.locator("button:disabled")).toHaveCount(0);
    const select = page.getByLabel("Save in");
    await select.focus();
    const geometry = await select.evaluate((element) => {
      const select = element as HTMLElement,
        label = element.parentElement!;
      const text = document.createRange();
      text.selectNodeContents(label.firstChild!);
      const style = getComputedStyle(select);
      return {
        gap: select.getBoundingClientRect().top - text.getBoundingClientRect().bottom,
        ring: parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset),
        focused: select.matches(":focus-visible"),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    expect(geometry.focused).toBe(true);
    expect(geometry.gap).toBeGreaterThanOrEqual(geometry.ring);
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `.local/deep-review/media-${width}.png` });
  }
  expect(checks).toBe(0); // Usage audits are not performed while navigating/listing.
  await page.getByRole("button", { name: "Delete " + media.name, exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Type the file name to confirm").fill(media.name);
  await page.getByRole("button", { name: "Delete permanently", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".admin-library")).toContainText("File deleted from Cloudinary");
  expect(
    (await getFirestore(app).collection("cmsMedia").doc(refId(media.publicId)).get()).exists,
  ).toBe(false);
  expect((await remove(media)).ok()).toBe(true); // repeat is idempotent
  const verification = await api.post(origin + "/api/admin/media", {
    headers: headers(),
    data: { publicId: media.publicId, kind: "image", name: media.name, alt: media.alt },
  });
  expect(verification.status(), await verification.text()).toBe(422); // Provider verification can no longer find the destroyed original.
});
test("protects active pages, then removes provider file, metadata and historical media while preserving copy", async () => {
  const media = await upload("history"),
    db = getFirestore(app),
    pageId = prefix + "-history";
  pages.push(pageId);
  const ref = db.collection("cmsPages").doc(pageId);
  await ref.set({
    revision: 1,
    draft: { text: { title: "Keep this copy" }, images: { photo: media } },
    published: { text: {}, images: {} },
  });
  const result = await (
    await api.get(
      origin + "/api/admin/media/delete?" + new URLSearchParams({ publicId: media.publicId }),
    )
  ).json();
  expect(result.usage[0].label).toContain(pageId);
  expect((await remove(media)).status()).toBe(409);
  await ref
    .collection("history")
    .doc("fixture")
    .set({ content: { text: { title: "Keep this copy" }, images: { photo: media } } });
  await ref.update({ draft: { text: { title: "Keep this copy" }, images: {} } });
  await db
    .collection("catalogAssets")
    .doc(prefix + "-history")
    .set({ ...media });
  const removed = await remove(media);
  expect(removed.ok(), await removed.text()).toBe(true);
  expect((await ref.collection("history").doc("fixture").get()).get("content")).toEqual({
    text: { title: "Keep this copy" },
    images: {},
  });
  expect(
    (
      await db
        .collection("catalogAssets")
        .doc(prefix + "-history")
        .get()
    ).exists,
  ).toBe(false);
  expect((await db.collection("cmsMedia").doc(refId(media.publicId)).get()).exists).toBe(false);
});
test("a pending deletion cannot be attached to a draft", async () => {
  // Pending metadata is a disposable emulator fixture; no provider file is touched.
  const db = getFirestore(app),
    id = prefix + "-pending",
    publicId = "zeebaran/" + id;
  const src = "https://res.cloudinary.com/jfiuaflr/image/upload/v1/" + publicId + ".png";
  const ref = db.collection("cmsMedia").doc(refId(publicId));
  await ref.set({
    publicId,
    src,
    name: id,
    resourceType: "image",
    state: "deleting",
    createdAt: Timestamp.now(),
  });
  const entryId = prefix + "-pending-entry";
  entries.push(entryId);
  try {
    const response = await api.post(origin + "/api/admin/catalog/" + entryId, {
      headers: headers(),
      data: {
        action: "save",
        revision: 0,
        content: {
          ...emptyCatalog("variety"),
          slug: entryId,
          name: "Pending media",
          images: [{ src, publicId, alt: "Fixture" }],
        },
      },
    });
    expect(response.status(), await response.text()).toBe(422);
    expect((await db.collection("catalogEntries").doc(entryId).get()).exists).toBe(false);
  } finally {
    await ref.delete();
  }
});
test("concurrent attach and deletion cannot leave a saved draft referencing a removed file", async () => {
  const media = await upload("race"),
    id = prefix + "-race";
  entries.push(id);
  const [saved, removed] = await Promise.all([
    api.post(origin + "/api/admin/catalog/" + id, {
      headers: headers(),
      data: {
        action: "save",
        revision: 0,
        content: {
          ...emptyCatalog("variety"),
          slug: id,
          name: "Concurrent media",
          images: [{ src: media.src, publicId: media.publicId, alt: media.alt }],
        },
      },
    }),
    remove(media),
  ]);
  const exists = (await getFirestore(app).collection("catalogEntries").doc(id).get()).exists;
  if (exists) {
    expect(saved.ok(), await saved.text()).toBe(true);
    expect(removed.status(), await removed.text()).toBe(409);
  } else {
    expect(saved.status(), await saved.text()).toBe(422);
    expect(removed.ok(), await removed.text()).toBe(true);
  }
});
test("permanent catalog deletion cleans Firebase children and its unused Cloudinary photograph", async ({
  page,
  context,
}) => {
  const media = await upload("catalog"),
    { id, content, record } = await createEntry(media, "catalog"),
    db = getFirestore(app);
  const trashed = await api.post(origin + "/api/admin/catalog/" + id, {
    headers: headers(),
    data: { action: "delete", revision: record.revision, confirmation: content.name },
  });
  expect(trashed.ok(), await trashed.text()).toBe(true);
  await db
    .collection("catalogEntries")
    .doc(id)
    .collection("fixture-child")
    .doc("nested")
    .set({ cleanMe: true });
  expect((await remove(media)).status()).toBe(409); // Trash is still restorable.
  await signIn(context.request);
  await page.goto(origin + "/admin/catalog?kind=variety&deleted=1");
  await page
    .locator(".catalog-admin-list article")
    .filter({ hasText: content.name })
    .getByRole("button", { name: "Delete permanently" })
    .click();
  await page.getByLabel("Type the entry name to confirm").fill(content.name);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("1 unused file(s) deleted from Cloudinary");
  expect((await db.collection("catalogEntries").doc(id).get()).exists).toBe(false);
  expect(
    (await db.collection("catalogEntries").doc(id).collection("fixture-child").get()).empty,
  ).toBe(true);
  expect((await db.collection("catalogAudit").where("entry", "==", id).get()).empty).toBe(true);
  expect((await db.collection("cmsMedia").doc(refId(media.publicId)).get()).exists).toBe(false);
});
test("pagination continues after the last displayed metadata record is removed", async () => {
  const db = getFirestore(app),
    batch = db.batch(),
    ids: string[] = [];
  for (let i = 0; i < 50; i++) {
    const id = "cursor-" + prefix + "-" + String(i).padStart(2, "0");
    ids.push(id);
    batch.create(db.collection("cmsMedia").doc(id), {
      name: id,
      alt: "Cursor fixture",
      publicId: id,
      resourceType: "image",
      createdAt: Timestamp.fromMillis(Date.now() + 100000 + i),
      src: "",
      width: 1,
      height: 1,
      bytes: 1,
    });
  }
  await batch.commit();
  try {
    const first = await (await api.get(origin + "/api/admin/media")).json();
    expect(first.nextCursor).toBeTruthy();
    const last = first.media.at(-1);
    const row = ids.find((id) => id === last.publicId)!;
    await db.collection("cmsMedia").doc(row).delete();
    const response = await api.get(
      origin + "/api/admin/media?" + new URLSearchParams({ cursor: first.nextCursor }),
    );
    expect(response.ok(), await response.text()).toBe(true);
    expect((await response.json()).media.length).toBeGreaterThan(0);
  } finally {
    const cleanup = db.batch();
    ids.forEach((id) => cleanup.delete(db.collection("cmsMedia").doc(id)));
    await cleanup.commit();
  }
});

test("videos use the same protected deletion workflow and are removed from Cloudinary", async () => {
  test.skip(!process.env.E2E_VIDEO_FIXTURE, "Disposable video fixture path required.");
  const media = await upload("video", "video"),
    db = getFirestore(app),
    pageId = prefix + "-video";
  pages.push(pageId);
  const ref = db.collection("cmsPages").doc(pageId);
  await ref.set({
    draft: { text: {}, images: {}, videos: { card: { kind: "cloudinary", src: media.src } } },
  });
  expect((await remove(media)).status()).toBe(409);
  await ref.delete();
  const response = await remove(media);
  expect(response.ok(), await response.text()).toBe(true);
  const verification = await api.post(origin + "/api/admin/media", {
    headers: headers(),
    data: { publicId: media.publicId, kind: "video", name: media.name, alt: media.alt },
  });
  expect(verification.status(), await verification.text()).toBe(422);
  expect((await db.collection("cmsMedia").doc(refId(media.publicId)).get()).exists).toBe(false);
});
test("rootstocks cannot be purged while a variety in Trash still needs the relationship", async () => {
  const rootId = prefix + "-linked-root",
    varietyId = prefix + "-linked-variety";
  entries.push(rootId, varietyId);
  for (const [id, kind] of [
    [rootId, "rootstock"],
    [varietyId, "variety"],
  ] as const) {
    const content = {
      ...emptyCatalog(kind),
      slug: id,
      name: id,
      rootstockIds: kind === "variety" ? [rootId] : [],
    };
    const response = await api.post(origin + "/api/admin/catalog/" + id, {
      headers: headers(),
      data: { action: "save", revision: 0, content },
    });
    expect(response.ok(), await response.text()).toBe(true);
  }
  for (const id of [varietyId, rootId]) {
    const response = await api.post(origin + "/api/admin/catalog/" + id, {
      headers: headers(),
      data: { action: "delete", revision: 1, confirmation: id },
    });
    expect(response.ok(), await response.text()).toBe(true);
  }
  expect(
    (
      await api.delete(origin + "/api/admin/catalog/" + rootId, {
        headers: headers(),
        data: { revision: 2, confirmation: rootId },
      })
    ).status(),
  ).toBe(409);
  for (const id of [varietyId, rootId]) {
    const response = await api.delete(origin + "/api/admin/catalog/" + id, {
      headers: headers(),
      data: { revision: 2, confirmation: id },
    });
    expect(response.ok(), await response.text()).toBe(true);
  }
});

test("page image saves and publishes remain consistent with permanent media deletion", async () => {
  const media = await upload("page-image"),
    db = getFirestore(app);
  pages.push("about");
  const initial = await (await api.get(origin + "/api/admin/content/about")).json();
  const image = {
    src: media.src,
    publicId: media.publicId,
    resourceType: "image",
    alt: media.alt,
    width: media.width,
    height: media.height,
  };
  const content = { text: {}, images: { [catalog.about.images[0].key]: image } };
  let revision = initial.record.revision;
  for (const action of ["save", "publish"]) {
    const response = await api.post(origin + "/api/admin/content/about", {
      headers: headers(),
      data: { action, revision, content },
    });
    expect(response.ok(), await response.text()).toBe(true);
    revision = (await response.json()).record.revision;
  }
  expect((await remove(media)).status()).toBe(409);
  const clear = await api.post(origin + "/api/admin/content/about", {
    headers: headers(),
    data: { action: "publish", revision, content: { text: {}, images: {} } },
  });
  expect(clear.ok(), await clear.text()).toBe(true);
  const removed = await remove(media);
  expect(removed.ok(), await removed.text()).toBe(true);
  const history = await db.collection("cmsPages").doc("about").collection("history").get();
  expect(
    history.docs.every((row) => !JSON.stringify(row.get("content")).includes(media.publicId)),
  ).toBe(true);
});
