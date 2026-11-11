import { test, expect } from "@playwright/test";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
const origin = process.env.E2E_ADMIN_EMULATOR_BASE_URL;
const enabled = Boolean(
  origin &&
  /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) &&
  process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:8395" &&
  process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:9098",
);
test.beforeEach(async ({ context }, info) => {
  test.skip(
    !enabled || info.project.name !== "chromium",
    "Dedicated demo-emulator admin server required; never runs against production.",
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
  expect(response.ok()).toBeTruthy();
});
test("preview survives tab changes, stops hidden media and never prefetches public routes", async ({
  page,
}) => {
  const publicRequests: string[] = [],
    historyRequests: string[] = [],
    errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.origin === origin && url.searchParams.has("_rsc") && !url.pathname.startsWith("/admin"))
      publicRequests.push(url.pathname);
    if (url.pathname === "/api/admin/content/home" && url.searchParams.get("view") === "history")
      historyRequests.push(url.pathname);
  });
  await page.goto(origin + "/admin/pages/home");
  await page.locator(".admin-visual-loading").waitFor({ state: "hidden" });
  const frame = page.frameLocator("iframe");
  await frame.locator(".visual-canvas-public").evaluate((root) => {
    (window as unknown as Record<string, unknown>).__previewRetained = true;
    const video = document.createElement("video");
    video.pause = () => {
      video.dataset.wasPaused = "true";
    };
    root.append(video);
  });
  expect(historyRequests).toHaveLength(0);
  let documents = 0;
  page.on("request", (r) => {
    if (r.resourceType() === "document" && r.url().includes("/admin/canvas/")) documents++;
  });
  for (let i = 0; i < 3; i++) {
    await page.getByRole("tab", { name: "Words & story", exact: true }).click();
    await expect(frame.locator(".visual-canvas-public")).toHaveAttribute(
      "data-editor-active",
      "false",
    );
    await expect(frame.locator("video").last()).toHaveAttribute("data-was-paused", "true");
    await page.getByRole("tab", { name: "Page preview", exact: true }).click();
    expect(
      await frame
        .locator("body")
        .evaluate(() => (window as unknown as Record<string, unknown>).__previewRetained),
    ).toBe(true);
  }
  await page.getByRole("tab", { name: "Revision history", exact: true }).click();
  await expect(page.getByText("Opening revision history…")).toHaveCount(0);
  await expect.poll(() => historyRequests.length).toBe(1);
  await page.getByRole("tab", { name: "Page preview", exact: true }).click();
  await page.getByRole("tab", { name: "Revision history", exact: true }).click();
  expect(historyRequests).toHaveLength(1);
  expect(documents).toBe(0);
  expect(publicRequests).toEqual([]);
  expect(errors).toEqual([]);
});
test("cached workspace snapshots refresh and late responses preserve unsaved edits", async ({
  page,
  context,
}) => {
  const app = initializeApp({ projectId: "demo-zeebaran-admin" }, "admin-freshness-" + Date.now());
  const ref = getFirestore(app).collection("cmsPages").doc("about"),
    original = (await ref.get()).data();
  const value = { text: {}, images: {} };
  try {
    await ref.set({ revision: 100, draft: value, published: value });
    await page.goto(origin + "/admin/pages/home");
    await page.locator(".admin-visual-loading").waitFor({ state: "hidden" });
    const about = page.locator('.admin-sidebar a[href="/admin/pages/about"]');
    const prefetched = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === "/admin/pages/about" &&
        new URL(r.url()).searchParams.has("_rsc"),
    );
    await about.hover();
    await prefetched;
    await page.waitForTimeout(1100);
    await ref.update({ revision: 101 });
    await about.click();
    await expect(page.locator(".admin-editor-status")).toContainText("Revision 101");
    await page.locator(".admin-visual-loading").waitFor({ state: "hidden" });
    await page.locator('.admin-sidebar a[href="/admin/pages/home"]').click();
    await page.locator(".admin-visual-loading").waitFor({ state: "hidden" });
    await ref.update({ revision: 102 });
    let release!: () => void, started!: () => void;
    const began = new Promise<void>((resolve) => {
      started = resolve;
    });
    await page.route("**/api/admin/content/about?view=record", async (route) => {
      const response = await route.fetch();
      started();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({ response });
    });
    await about.hover();
    await page.waitForTimeout(1100);
    await about.click();
    await began;
    await page.getByRole("tab", { name: "Words & story", exact: true }).click();
    const text = page.locator(".admin-copy-field textarea").first();
    await text.fill("Unsaved local wording");
    release();
    await expect(page.locator(".admin-notice-error[role=alert]")).toContainText(
      "unsaved edits are preserved",
    );
    await expect(text).toHaveValue("Unsaved local wording");
    const anonymous = await context.browser()!.newContext();
    expect(
      (await anonymous.request.get(origin + "/api/admin/content/about?view=record")).status(),
    ).toBe(401);
    await anonymous.close();
  } finally {
    if (original) await ref.set(original);
    else await ref.delete();
    await deleteApp(app);
  }
});

test("revoked sessions cannot retrieve or mutate drafts; the canvas contains only public markup", async ({
  browser,
}) => {
  const app = initializeApp({ projectId: "demo-zeebaran-admin" }, "admin-revocation-" + Date.now());
  const auth = getAuth(app),
    db = getFirestore(app),
    ref = db.collection("cmsPages").doc("about");
  const original = (await ref.get()).data(),
    marker = "PRIVATE-DRAFT-NEVER-IN-CANVAS-" + Date.now();
  const user = await auth.createUser({
    email: "perf-" + Date.now() + "@example.test",
    password: "Local-fixture-Only-786!",
    emailVerified: true,
  });
  const context = await browser.newContext();
  try {
    await auth.setCustomUserClaims(user.uid, { zeebaranRole: "admin" });
    await ref.set({
      ...(original || {}),
      revision: 900,
      draft: { text: { fixture: marker }, images: {} },
      published: original?.published || { text: {}, images: {} },
    });
    const signed = await context.request.post(
      "http://127.0.0.1:9098/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key",
      { data: { email: user.email, password: "Local-fixture-Only-786!", returnSecureToken: true } },
    );
    const { token } = await (await context.request.get(origin + "/api/admin/csrf")).json();
    const session = await context.request.post(origin + "/api/admin/session", {
      headers: { origin: origin!, "x-csrf-token": token },
      data: { idToken: (await signed.json()).idToken },
    });
    expect(session.ok()).toBe(true);
    expect(
      (await context.request.get(origin + "/api/admin/content/about?view=record")).status(),
    ).toBe(200);
    await context.request.get(origin + "/api/admin/preview?page=about", { maxRedirects: 0 });
    expect(await (await context.request.get(origin + "/admin/canvas/about")).text()).not.toContain(
      marker,
    );
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await auth.revokeRefreshTokens(user.uid);
    expect(
      (await context.request.get(origin + "/api/admin/content/about?view=record")).status(),
    ).toBe(401);
    const mutation = await context.request.post(origin + "/api/admin/content/about", {
      headers: { origin: origin!, "x-csrf-token": token },
      data: { action: "save", revision: 900, content: { text: {}, images: {} } },
    });
    expect(mutation.status()).toBe(401);
    const canvas = await context.request.get(origin + "/admin/canvas/about");
    expect(canvas.status()).toBe(200);
    expect(await canvas.text()).not.toContain(marker);
    const anonymous = await browser.newContext();
    expect(
      (await anonymous.request.get(origin + "/admin/canvas/about", { maxRedirects: 0 })).status(),
    ).toBe(307);
    await anonymous.close();
  } finally {
    if (original) await ref.set(original);
    else await ref.delete();
    await auth.deleteUser(user.uid);
    await context.close();
    await deleteApp(app);
  }
});

test("history summaries omit saved bodies while restoration retains the complete draft", async ({
  page,
  context,
}) => {
  const app = initializeApp({ projectId: "demo-zeebaran-admin" }, "history-" + Date.now()),
    db = getFirestore(app),
    ref = db.collection("cmsPages").doc("about");
  const original = (await ref.get()).data(),
    before = new Set((await ref.collection("history").get()).docs.map((d) => d.id));
  const { readFile } = await import("node:fs/promises");
  const definitions = JSON.parse(await readFile("features/cms/catalog.generated.json", "utf8"));
  const key = definitions.about.fields.find((field: { value: string }) =>
    field.value.includes("Business is"),
  ).key;
  try {
    await ref.set({
      revision: 0,
      draft: { text: {}, images: {} },
      published: { text: {}, images: {} },
    });
    const { token } = await (await context.request.get(origin + "/api/admin/csrf")).json();
    let revision = 0;
    for (const text of ["A first history fixture.", "A second history fixture."]) {
      const response = await context.request.post(origin + "/api/admin/content/about", {
        headers: { origin: origin!, "x-csrf-token": token },
        data: { action: "save", revision, content: { text: { [key]: text }, images: {} } },
      });
      expect(response.status()).toBe(200);
      revision = (await response.json()).record.revision;
    }
    const summary = await (
      await context.request.get(origin + "/api/admin/content/about?view=history")
    ).json();
    expect(summary.history.every((entry: Record<string, unknown>) => !("content" in entry))).toBe(
      true,
    );
    await page.goto(origin + "/admin/pages/about");
    await page.getByRole("tab", { name: "Revision history", exact: true }).click();
    await expect(page.locator(".admin-history")).toContainText("revision 1", { timeout: 5000 });
    const first = page
      .locator(".admin-history article")
      .filter({ has: page.getByText("Draft saved · revision 1", { exact: true }) })
      .first();
    await first.getByRole("button", { name: "Restore as draft", exact: true }).click();
    await expect(page.locator(".admin-editor-status")).toContainText("Revision 3");
    const saved = (
      await (await context.request.get(origin + "/api/admin/content/about?view=record")).json()
    ).record;
    expect(saved.draft.text[key]).toBe("A first history fixture.");
    expect(saved.published.text).toEqual({});
  } finally {
    if (original) await ref.set(original);
    else await ref.delete();
    const batch = db.batch();
    for (const doc of (await ref.collection("history").get()).docs)
      if (!before.has(doc.id)) {
        batch.delete(doc.ref);
        batch.delete(db.collection("cmsAudit").doc(doc.id));
      }
    await batch.commit();
    await deleteApp(app);
  }
});
