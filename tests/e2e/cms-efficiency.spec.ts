import { test, expect, type APIRequestContext } from "@playwright/test";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import catalog from "../../features/cms/catalog.generated.json";

const origin = process.env.E2E_ADMIN_EMULATOR_BASE_URL;
const isolated = Boolean(
  origin &&
  /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) &&
  process.env.FIREBASE_PROJECT_ID === "demo-zeebaran-admin" &&
  process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:8395" &&
  process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:9098",
);
const key = catalog.mission.fields.find((field) =>
  field.value.includes("Every claim Zeebaran"),
)!.key;
const content = (number: number) => ({
  text: { [key]: `Isolated CMS copy ${number}.` },
  images: {},
});

async function update(request: APIRequestContext, body: unknown) {
  const { token } = await (await request.get(origin + "/api/admin/csrf")).json();
  return request.post(origin + "/api/admin/content/mission", {
    headers: { origin: origin!, "x-csrf-token": token },
    data: body,
  });
}
test.beforeEach(async ({ context }) => {
  test.skip(
    !isolated,
    "Requires an explicit demo project, local application and disposable emulators.",
  );
  const signed = await context.request.post(
    "http://127.0.0.1:9098/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key",
    {
      data: {
        email: "zeebaran00@gmail.com",
        password: "Local-fixture-Only-786!",
        returnSecureToken: true,
      },
    },
  );
  const { token } = await (await context.request.get(origin + "/api/admin/csrf")).json();
  const response = await context.request.post(origin + "/api/admin/session", {
    headers: { origin: origin!, "x-csrf-token": token },
    data: { idToken: (await signed.json()).idToken },
  });
  expect(response.status()).toBe(200);
});

test("history is lazy; unchanged actions and double clicks do not create redundant revisions", async ({
  page,
  context,
}) => {
  const app = initializeApp({ projectId: "demo-zeebaran-admin" }, "cms-ui-" + randomUUID());
  const db = getFirestore(app),
    ref = db.collection("cmsPages").doc("mission");
  await db.recursiveDelete(ref);
  const stamp = Timestamp.now(),
    id = randomUUID();
  await ref.set({
    revision: 1,
    draft: content(1),
    published: content(1),
    publishedAt: stamp,
    updatedAt: stamp,
    publishedHistoryId: id,
  });
  await ref
    .collection("history")
    .doc(id)
    .set({
      revision: 1,
      action: "publish",
      actor: "fixture",
      createdAt: stamp,
      content: content(1),
    });
  try {
    const errors: string[] = [],
      historyRequests: string[] = [],
      writes: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname === "/api/admin/content/mission") {
        if (request.method() === "POST") writes.push(request.postData() || "");
        if (url.searchParams.get("view") === "history") historyRequests.push(url.href);
      }
    });
    await page.goto(origin + "/admin/pages/mission");
    const save = page.getByRole("button", { name: "Save draft", exact: true });
    const publish = page.getByRole("button", { name: "Publish", exact: true });
    await expect(save).toBeDisabled();
    await expect(publish).toBeDisabled();
    await page.getByRole("tab", { name: "Words & story", exact: true }).click();
    await page
      .getByRole("textbox", { name: "Introduction", exact: true })
      .fill("Isolated CMS copy 2.");
    const response = page.waitForResponse(
      (r) => r.url().endsWith("/api/admin/content/mission") && r.request().method() === "POST",
    );
    await save.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    const saved = await (await response).json();
    expect(saved).not.toHaveProperty("history");
    await expect(save).toBeDisabled();
    await expect(publish).toBeEnabled();
    expect(writes).toHaveLength(1);
    expect(historyRequests).toHaveLength(0);
    expect((await ref.get()).get("published.text")[key]).toBe("Isolated CMS copy 1.");
    await publish.click();
    const confirm = page.getByRole("dialog", { name: "Publish this page" });
    await confirm.getByRole("button", { name: "Publish changes", exact: true }).click();
    await expect(confirm).toHaveCount(0);
    await expect(publish).toBeDisabled();
    expect(writes).toHaveLength(2);
    expect(historyRequests).toHaveLength(0);
    const revision = (await ref.get()).get("revision");
    expect(revision).toBe(3);
    // A direct unchanged request is also a no-op at the trusted server boundary.
    for (const action of ["save", "publish"]) {
      const unchanged = await update(context.request, { action, revision, content: content(2) });
      expect(unchanged.status()).toBe(200);
      expect((await unchanged.json()).record.revision).toBe(revision);
    }
    expect((await ref.collection("history").get()).size).toBe(3);
    await page.getByRole("tab", { name: "Revision history", exact: true }).click();
    await expect(page.locator(".admin-history article")).toHaveCount(3);
    expect(historyRequests).toHaveLength(1);
    await page.getByRole("tab", { name: "Words & story", exact: true }).click();
    await page.getByRole("tab", { name: "Revision history", exact: true }).click();
    expect(historyRequests).toHaveLength(1);
    expect(errors).toEqual([]);
  } finally {
    await db.recursiveDelete(ref);
    await deleteApp(app);
  }
});

test("bounded cleanup keeps the latest 20 and legacy publication; restore, conflicts and republish remain safe", async ({
  context,
}) => {
  const app = initializeApp({ projectId: "demo-zeebaran-admin" }, "cms-retention-" + randomUUID());
  const db = getFirestore(app),
    ref = db.collection("cmsPages").doc("mission");
  await db.recursiveDelete(ref);
  const ids = new Map<number, string>(),
    base = Date.now() - 100000;
  const batch = db.batch();
  for (let revision = 1; revision <= 61; revision++) {
    const id = randomUUID();
    ids.set(revision, id);
    batch.set(ref.collection("history").doc(id), {
      revision,
      action: revision === 1 ? "publish" : "save",
      createdAt: Timestamp.fromMillis(base + revision),
      actor: "fixture",
      content: content(revision),
    });
  }
  // Legacy data intentionally has no publishedHistoryId.
  batch.set(ref, {
    revision: 61,
    draft: content(61),
    published: content(1),
    publishedAt: Timestamp.fromMillis(base + 1),
  });
  const other = db.collection("cmsPages").doc("impact");
  batch.set(other.collection("history").doc("unrelated-fixture"), {
    content: { marker: "untouched" },
    revision: 1,
  });
  const media = db.collection("cmsMedia").doc("retention-sentinel");
  batch.set(media, { marker: "do-not-delete" });
  await batch.commit();
  try {
    let result = await update(context.request, {
      action: "save",
      revision: 61,
      content: content(62),
    });
    expect(result.status()).toBe(200);
    await expect.poll(async () => (await ref.collection("history").get()).size).toBe(37);
    expect((await ref.collection("history").doc(ids.get(1)!).get()).exists).toBe(true);
    result = await update(context.request, { action: "save", revision: 62, content: content(63) });
    expect(result.status()).toBe(200);
    await expect.poll(async () => (await ref.collection("history").get()).size).toBe(21);
    const retained = (await ref.collection("history").get()).docs
      .map((row) => row.get("revision"))
      .sort((a, b) => a - b);
    expect(retained).toEqual([1, ...Array.from({ length: 20 }, (_, i) => i + 44)]);
    const history = await (
      await context.request.get(origin + "/api/admin/content/mission?view=history")
    ).json();
    expect(history.history).toHaveLength(21);
    expect(history.history.some((row: { revision: number }) => row.revision === 1)).toBe(true);
    expect(history.history.every((row: object) => !("content" in row))).toBe(true);
    // Two simultaneous writers cannot both win at revision 63.
    const results = await Promise.all(
      [64, 65].map((number) =>
        update(context.request, { action: "save", revision: 63, content: content(number) }),
      ),
    );
    expect(results.map((r) => r.status()).sort()).toEqual([200, 409]);
    await expect.poll(async () => (await ref.collection("history").get()).size).toBe(21);
    // The protected older publication is still a valid restore source.
    result = await update(context.request, {
      action: "restore",
      revision: 64,
      version: ids.get(1),
    });
    expect(result.status()).toBe(200);
    expect((await ref.get()).get("draft")).toEqual(content(1));
    expect((await ref.get()).get("published")).toEqual(content(1));
    result = await update(context.request, {
      action: "restore",
      revision: 65,
      version: ids.get(60),
    });
    expect(result.status()).toBe(200);
    expect((await ref.get()).get("published")).toEqual(content(1));
    result = await update(context.request, {
      action: "publish",
      revision: 66,
      content: content(60),
    });
    expect(result.status()).toBe(200);
    await expect.poll(async () => (await ref.collection("history").get()).size).toBe(21);
    const published = await ref.get();
    expect(published.get("published")).toEqual(content(60));
    expect(
      (await ref.collection("history").doc(published.get("publishedHistoryId")).get()).exists,
    ).toBe(true);
    expect((await ref.collection("history").doc(ids.get(1)!).get()).exists).toBe(true);
    const rollback = await (
      await context.request.get(origin + "/api/admin/content/mission?view=history")
    ).json();
    expect(rollback.history.some((row: { revision: number }) => row.revision === 1)).toBe(true);
    // Once another publication succeeds, only its immediate predecessor needs the extra pin.
    result = await update(context.request, {
      action: "publish",
      revision: 67,
      content: content(68),
    });
    expect(result.status()).toBe(200);
    await expect.poll(async () => (await ref.collection("history").get()).size).toBe(20);
    expect((await ref.collection("history").doc(ids.get(1)!).get()).exists).toBe(false);
    expect(
      (await ref.collection("history").doc(published.get("publishedHistoryId")).get()).exists,
    ).toBe(true);
    expect(
      (await other.collection("history").doc("unrelated-fixture").get()).get("content.marker"),
    ).toBe("untouched");
    expect((await media.get()).get("marker")).toBe("do-not-delete");
  } finally {
    await db.recursiveDelete(ref);
    await other.collection("history").doc("unrelated-fixture").delete();
    await media.delete();
    await deleteApp(app);
  }
});
