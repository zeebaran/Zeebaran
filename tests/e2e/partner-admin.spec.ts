import { test, expect } from "@playwright/test";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const origin = process.env.E2E_ADMIN_EMULATOR_BASE_URL;
test("partner profile edits persist, preview, publish and reject invalid content", async ({
  page,
  context,
}, info) => {
  test.skip(
    !origin ||
      !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
      process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395" ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098" ||
      info.project.name !== "chromium",
    "Disposable demo emulator only",
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
  const headers = { origin: origin!, "x-csrf-token": token };
  expect(
    (
      await context.request.post(origin + "/api/admin/session", {
        headers,
        data: { idToken: (await signed.json()).idToken },
      })
    ).status(),
  ).toBe(200);
  const app = initializeApp({ projectId: "demo-zeebaran-admin" }, "partner-admin-" + Date.now()),
    db = getFirestore(app),
    ref = db.collection("cmsPages").doc("partnerships"),
    before = (await ref.get()).data()!;
  const historyBefore = new Set((await ref.collection("history").get()).docs.map((d) => d.id));
  try {
    await page.goto(origin + "/admin/pages/partnerships");
    await page.getByRole("tab", { name: "Partners", exact: true }).click();
    const card = page.locator('[data-partner-editor="balson"]');
    await card.locator("summary").click();
    const description = "A revised partnership description from the isolated admin regression.";
    await card.getByRole("textbox", { name: "Description", exact: true }).fill(description);
    await card
      .getByRole("textbox", { name: "Category", exact: true })
      .fill("Irrigation test category");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
    let record = (await ref.get()).data()!;
    expect(
      record.draft.partners.find((p: { id: string }) => p.id === "balson").profile.description,
    ).toBe(description);
    expect(record.published).toEqual(before.published);
    await page.getByRole("tab", { name: "Page preview", exact: true }).click();
    await page.locator(".admin-visual-loading").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "Interact", exact: true }).click();
    const frame = page.frameLocator("iframe");
    await frame
      .getByRole("button", { name: "View partnership with Balson", exact: true })
      .first()
      .click();
    await expect(frame.getByRole("dialog")).toContainText(description);
    await frame.getByRole("button", { name: "Close partner profile" }).click();
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Publish this page" })
      .getByRole("button", { name: "Publish changes", exact: true })
      .click();
    await expect(page.getByRole("status").filter({ hasText: "Published." })).toBeVisible();
    record = (await ref.get()).data()!;
    expect(record.published.partners).toEqual(record.draft.partners);
    expect(record.published.partners.filter((p: { id: string }) => p.id !== "balson")).toEqual(
      before.published.partners.filter((p: { id: string }) => p.id !== "balson"),
    );
    await page.goto(origin + "/partnerships");
    await page
      .getByRole("button", { name: "View partnership with Balson", exact: true })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toContainText(description);
    const invalid = structuredClone(record.draft);
    invalid.partners[0].profile = { unknown: true };
    expect(
      (
        await context.request.post(origin + "/api/admin/content/partnerships", {
          headers,
          data: { action: "publish", revision: record.revision, content: invalid },
        })
      ).status(),
    ).toBe(422);
    expect((await ref.get()).data()!.revision).toBe(record.revision);
  } finally {
    // Restore through the application so the published cache is invalidated too.
    const record = (await ref.get()).data()!;
    await context.request.post(origin + "/api/admin/content/partnerships", {
      headers,
      data: { action: "publish", revision: record.revision, content: before.published },
    });
    await ref.set(before);
    const batch = db.batch();
    for (const d of (await ref.collection("history").get()).docs)
      if (!historyBefore.has(d.id)) {
        batch.delete(d.ref);
        batch.delete(db.collection("cmsAudit").doc(d.id));
      }
    await batch.commit();
    await deleteApp(app);
  }
});
