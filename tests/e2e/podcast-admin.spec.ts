import { test, expect } from "@playwright/test";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const origin = process.env.E2E_PODCAST_BASE_URL;
test("podcast admin import, edits, preview, publish, hide, remove and concurrency are consistent", async ({
  page,
  context,
}, info) => {
  test.skip(
    !origin ||
      process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395" ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098" ||
      info.project.name !== "chromium",
    "Disposable emulator only",
  );
  const login = await context.request.post(
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
        data: { idToken: (await login.json()).idToken },
      })
    ).status(),
  ).toBe(200);
  const app = initializeApp({ projectId: "demo-zeebaran-admin" }, "podcast-admin-" + Date.now()),
    db = getFirestore(app),
    ref = db.collection("cmsPages").doc("podcast"),
    before = (await ref.get()).data()!;
  try {
    await page.route("**/api/admin/podcast/metadata", (r) =>
      r.fulfill({
        json: {
          url: "https://www.youtube-nocookie.com/embed/ScMzIvxBSi4",
          title: "Imported fixture conversation",
          channel: "Bazm-e-Khayal",
        },
      }),
    );
    await page.goto(origin + "/admin/pages/podcast");
    await page.getByRole("tab", { name: "Podcast episodes", exact: true }).click();
    await page.getByRole("button", { name: "Add episode", exact: true }).click();
    const card = page.locator("[data-podcast-editor][open]");
    await card
      .getByRole("textbox", { name: "YouTube video link", exact: true })
      .fill("https://youtu.be/ScMzIvxBSi4");
    await card.getByRole("button", { name: "Use YouTube title", exact: true }).click();
    await expect(card.getByRole("textbox", { name: "Episode title", exact: true })).toHaveValue(
      "Imported fixture conversation",
    );
    await card
      .getByRole("textbox", { name: "Episode title", exact: true })
      .fill("Revised fixture conversation");
    await card.getByRole("textbox", { name: /Guest \/ expertise/ }).fill("Fixture guest");
    await card.getByRole("textbox", { name: /Topic/ }).fill("Water management");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
    let record = (await ref.get()).data()!;
    expect(record.draft.podcast.episodes.at(-1).title).toBe("Revised fixture conversation");
    expect(record.published).toEqual(before.published);
    await page.getByRole("tab", { name: "Page preview", exact: true }).click();
    await page.locator(".admin-visual-loading").waitFor({ state: "hidden" });
    await expect(
      page
        .frameLocator("iframe")
        .getByRole("button", { name: "Select Revised fixture conversation", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Publish this page" })
      .getByRole("button", { name: "Publish changes", exact: true })
      .click();
    await expect(page.getByRole("status").filter({ hasText: "Published." })).toBeVisible();
    await page.goto(origin + "/podcast");
    await expect(
      page.getByRole("button", { name: "Select Revised fixture conversation", exact: true }),
    ).toBeVisible();
    record = (await ref.get()).data()!;
    const id = record.draft.podcast.episodes.at(-1).id;
    await page.goto(origin + "/admin/pages/podcast");
    await page.getByRole("tab", { name: "Podcast episodes", exact: true }).click();
    const saved = page.locator('[data-podcast-editor="' + id + '"]');
    await saved.locator("summary").click();
    await saved.getByRole("checkbox", { name: "Show episode", exact: true }).uncheck();
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Publish this page" })
      .getByRole("button", { name: "Publish changes", exact: true })
      .click();
    await expect(page.getByRole("status").filter({ hasText: "Published." })).toBeVisible();
    await page.goto(origin + "/podcast");
    await expect(
      page.getByRole("button", { name: "Select Revised fixture conversation", exact: true }),
    ).toHaveCount(0);
    expect(await page.content()).not.toContain("Revised fixture conversation");
    await page.goto(origin + "/admin/pages/podcast");
    await page.getByRole("tab", { name: "Podcast episodes", exact: true }).click();
    await saved.locator("summary").click();
    page.once("dialog", (dialog) => dialog.accept());
    await saved.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(page.locator("[data-admin-snackbar]").getByRole("status")).toHaveText(
      "Episode removed from the draft. Publish to update the website.",
    );
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
    record = (await ref.get()).data()!;
    expect(record.draft.podcast.episodes.some((e: { id: string }) => e.id === id)).toBe(false);
    expect(
      (
        await context.request.post(origin + "/api/admin/content/podcast", {
          headers,
          data: { action: "save", revision: 0, content: record.draft },
        })
      ).status(),
    ).toBe(409);
    const invalid = structuredClone(record.draft);
    invalid.podcast.episodes[0].url = "https://evil.test/video";
    expect(
      (
        await context.request.post(origin + "/api/admin/content/podcast", {
          headers,
          data: { action: "publish", revision: record.revision, content: invalid },
        })
      ).status(),
    ).toBe(422);
    const empty = structuredClone(record.draft);
    empty.podcast.episodes = [];
    expect(
      (
        await context.request.post(origin + "/api/admin/content/podcast", {
          headers,
          data: { action: "publish", revision: record.revision, content: empty },
        })
      ).status(),
    ).toBe(200);
    await page.goto(origin + "/podcast");
    await expect(page.getByText("Our first episode is on its way.", { exact: true })).toBeVisible();
    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Select Fixture:/ })).toHaveCount(0);
  } finally {
    const current = (await ref.get()).data()!;
    await context.request.post(origin + "/api/admin/content/podcast", {
      headers,
      data: { action: "publish", revision: current.revision, content: before.published },
    });
    await ref.set(before);
    await deleteApp(app);
  }
});
test("a slow automatic title import preserves an administrator's newer wording", async ({
  page,
  context,
}, info) => {
  test.skip(
    !origin ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098" ||
      info.project.name !== "chromium",
    "Disposable emulator only",
  );
  const login = await context.request.post(
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
  await context.request.post(origin + "/api/admin/session", {
    headers: { origin: origin!, "x-csrf-token": token },
    data: { idToken: (await login.json()).idToken },
  });
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/admin/podcast/metadata", async (r) => {
    await waiting;
    await r.fulfill({
      json: {
        title: "Older fetched title",
        url: "https://www.youtube-nocookie.com/embed/ScMzIvxBSi4",
        channel: "Fixture",
      },
    });
  });
  await page.goto(origin + "/admin/pages/podcast");
  await page.getByRole("tab", { name: "Podcast episodes", exact: true }).click();
  await page.getByRole("button", { name: "Add episode", exact: true }).click();
  const card = page.locator("[data-podcast-editor][open]"),
    url = card.getByRole("textbox", { name: "YouTube video link", exact: true });
  await url.evaluate((e) => {
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "https://youtu.be/ScMzIvxBSi4" },
    });
    e.dispatchEvent(event);
  });
  await expect(card.getByRole("button", { name: "Reading title…", exact: true })).toBeVisible();
  await card
    .getByRole("textbox", { name: "Episode title", exact: true })
    .fill("My newer editorial title");
  release();
  await expect(card.getByRole("status")).toContainText("Your title is preserved");
  await expect(card.getByRole("textbox", { name: "Episode title", exact: true })).toHaveValue(
    "My newer editorial title",
  );
});
