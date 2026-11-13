import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { emptyCatalog } from "../../features/catalog/model";

test("contact submission blocks synchronous duplicates and unlocks after validation and delivery errors", async ({
  page,
}) => {
  let calls = 0;
  let fail = true;
  const intercept = async (route: import("@playwright/test").Route) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: fail ? 503 : 201,
      json: fail
        ? { success: false, error: "Fixture delivery unavailable" }
        : { success: true, delivery: "local" },
    });
  };
  await page.route("https://api.web3forms.com/**", intercept);
  await page.route("**/api/enquiries", intercept);
  await page.goto("/contact/simple");
  const send = page.getByRole("button", { name: "Send message" });
  await expect(send).toBeEnabled();
  const twice = () =>
    send.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await send.click();
  await expect(page.locator("#full-name")).toBeFocused();
  expect(calls).toBe(0);
  await page.locator("#full-name").fill("Audit grower");
  await page.locator("#email").fill("audit@example.test");
  await page.locator("#phone").fill("+91 9876543210");
  await page.locator("#place").fill("Srinagar");
  await page
    .locator("#message")
    .fill("This delivery is intercepted for an isolated regression test.");
  await twice();
  await expect(page.locator(".delivery-error")).toBeVisible();
  await expect(send).toBeEnabled();
  expect(calls).toBe(1);
  await expect(page.locator("#message")).toHaveValue(/intercepted/);
  fail = false;
  await twice();
  await expect(page.getByRole("heading", { name: "Thank you." })).toBeVisible();
  expect(calls).toBe(2);
});

test("editors cannot use restore to unpublish an active entry; genuine Trash restoration still works", async ({
  playwright,
}, info) => {
  const origin = process.env.E2E_ADMIN_EMULATOR_BASE_URL;
  test.skip(
    !origin ||
      !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
      process.env.FIREBASE_PROJECT_ID !== "demo-zeebaran-admin" ||
      process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395" ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098" ||
      info.project.name !== "chromium",
    "Disposable local Firebase demo only",
  );
  const app = initializeApp({ projectId: "demo-zeebaran-admin" }, "restore-test-" + randomUUID());
  const db = getFirestore(app),
    auth = getAuth(app),
    id = "qa-restore-" + randomUUID();
  const ref = db.collection("catalogEntries").doc(id),
    published = db.collection("catalogPublished").doc(id);
  const ctx = await playwright.request.newContext({ baseURL: origin });
  let uid: string | undefined;
  try {
    const password = "Local-fixture-Only-786!";
    const user = await auth.createUser({
      email: `${id}@example.test`,
      emailVerified: true,
      password,
    });
    uid = user.uid;
    await auth.setCustomUserClaims(uid, { zeebaranRole: "editor" });
    const signed = await ctx.post(
      "http://127.0.0.1:9098/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key",
      { data: { email: user.email, password, returnSecureToken: true } },
    );
    const { token } = await (await ctx.get("/api/admin/csrf")).json();
    const headers = { origin: origin!, "x-csrf-token": token };
    expect(
      (
        await ctx.post("/api/admin/session", {
          headers,
          data: { idToken: (await signed.json()).idToken },
        })
      ).status(),
    ).toBe(200);
    const draft = { ...emptyCatalog("variety"), slug: id, name: "Restore boundary fixture" };
    await ref.set({
      revision: 3,
      kind: "variety",
      draft,
      published: true,
      deleted: false,
      rootstockRefs: [],
    });
    await published.set({ ...draft, publishedAt: Timestamp.now(), revision: 3 });
    for (const action of ["publish", "unpublish", "delete"])
      expect(
        (
          await ctx.post("/api/admin/catalog/" + id, {
            headers,
            data: { action, revision: 3, confirmation: draft.name, content: draft },
          })
        ).status(),
      ).toBe(403);
    expect(
      (
        await ctx.post("/api/admin/catalog/" + id, {
          headers,
          data: { action: "restore", revision: 3 },
        })
      ).status(),
    ).toBe(409);
    expect((await published.get()).exists).toBe(true);
    expect((await ref.get()).get("revision")).toBe(3);
    expect((await db.collection("catalogAudit").where("entry", "==", id).get()).empty).toBe(true);
    await ref.update({ deleted: true, published: false });
    await published.delete();
    expect(
      (
        await ctx.post("/api/admin/catalog/" + id, {
          headers,
          data: { action: "restore", revision: 3 },
        })
      ).status(),
    ).toBe(200);
    expect((await ref.get()).data()).toMatchObject({
      revision: 4,
      deleted: false,
      published: false,
    });
    expect((await published.get()).exists).toBe(false);
  } finally {
    await ref.delete();
    await published.delete();
    for (const row of (await db.collection("catalogAudit").where("entry", "==", id).get()).docs)
      await row.ref.delete();
    if (uid) await auth.deleteUser(uid);
    await ctx.dispose();
    await deleteApp(app);
  }
});
