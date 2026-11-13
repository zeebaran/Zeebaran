import { test, expect } from "@playwright/test";
const origin = process.env.E2E_ADMIN_EMULATOR_BASE_URL;
const isolated = Boolean(
  origin &&
  /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) &&
  process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:8395" &&
  process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:9098",
);
test.beforeEach(async ({ context }) => {
  test.skip(!isolated, "Disposable Firebase emulator only");
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
  expect(
    (
      await context.request.post(origin + "/api/admin/session", {
        headers: { origin: origin!, "x-csrf-token": token },
        data: { idToken: (await signed.json()).idToken },
      })
    ).ok(),
  ).toBe(true);
});
test("page saves, failed publishing and successful publishing show visible feedback", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("InvalidStateError"))
      errors.push(message.text());
  });
  await page.goto(origin + "/admin/pages/podcast");
  await page.getByRole("tab", { name: "Podcast episodes", exact: true }).click();
  await page.locator("[data-podcast-editor] summary").first().click();
  const title = page.getByRole("textbox", { name: "Episode title", exact: true });
  await title.fill("Snackbar fixture " + Date.now());
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  const snack = page.locator("[data-admin-snackbar]");
  await expect(snack.getByRole("status")).toHaveText("Draft saved.");
  await page.screenshot({ path: ".local/deep-review/snackbar-desktop.png" });
  await expect(snack).toBeInViewport();
  await expect(snack).toHaveJSProperty("popover", "manual");
  await snack.getByRole("button", { name: "Dismiss notification" }).click();
  await page.route("**/api/admin/content/podcast", async (route) => {
    const data = route.request().postDataJSON();
    if (data?.action === "publish") {
      await route.fulfill({
        status: 503,
        json: { error: "Publishing failed. Your draft is safe." },
      });
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Publish this page" });
  await dialog.getByRole("button", { name: "Publish changes", exact: true }).click();
  await expect(snack.locator('[role="alert"]')).toHaveText(
    "Publishing failed. Your draft is safe.",
  );
  await expect(snack).toBeInViewport();
  expect(await snack.evaluate((element) => element.matches(":popover-open"))).toBe(true);
  // Error feedback remains readable and dismissible above a native modal.
  await snack.getByRole("button", { name: "Dismiss notification" }).click();
  await dialog.getByRole("button", { name: "Keep editing", exact: true }).click();
  await page.unroute("**/api/admin/content/podcast");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await dialog.getByRole("button", { name: "Publish changes", exact: true }).click();
  await expect(snack.getByRole("status")).toContainText("Published.");
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("uploads and deletions notify only after completion; validation and mobile feedback work", async ({
  page,
}) => {
  const media = {
    publicId: "fixture/snackbar",
    src: "https://res.cloudinary.com/fixture/image/upload/sample.png",
    resourceType: "image",
    width: 1,
    height: 1,
    bytes: 70,
    alt: "Test image",
    name: "fixture.png",
  };
  await page.route("**/api/admin/media", (route) =>
    route.fulfill({
      json: route.request().method() === "POST" ? { media } : { media: [], nextCursor: null },
    }),
  );
  await page.route("**/api/admin/media/sign", (route) =>
    route.fulfill({
      json: { url: "https://api.cloudinary.com/v1_1/fixture/image/upload", signature: "fixture" },
    }),
  );
  await page.route("https://api.cloudinary.com/**", (route) =>
    route.fulfill({ json: { public_id: media.publicId } }),
  );
  await page.route("**/api/admin/media/delete*", (route) =>
    route.fulfill({ json: route.request().method() === "GET" ? { usage: [] } : { deleted: true } }),
  );
  await page.goto(origin + "/admin/media");
  const file = page.getByLabel("Upload image", { exact: true });
  const snack = page.locator("[data-admin-snackbar]");
  await file.setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("invalid"),
  });
  await expect(snack.getByRole("alert")).toContainText("format is not supported");
  await snack.getByRole("button", { name: "Dismiss notification" }).click();
  await page.getByPlaceholder("Describe what the photograph shows").fill("Test image");
  await file.setInputFiles({
    name: "fixture.png",
    mimeType: "image/png",
    buffer: Buffer.from("fixture"),
  });
  await expect(snack.getByRole("status")).toHaveText("Image uploaded to the media library.");
  await snack.getByRole("button", { name: "Dismiss notification" }).click();
  await page.getByRole("button", { name: "Delete fixture.png", exact: true }).click();
  await page.getByLabel("Type the file name to confirm").fill("fixture.png");
  await page.getByRole("button", { name: "Delete permanently", exact: true }).click();
  await expect(snack.getByRole("status")).toContainText("File deleted from Cloudinary");
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(snack).toBeInViewport();
  await page.screenshot({ path: ".local/deep-review/snackbar-mobile.png" });
  const bounds = await snack.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(8);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(312);
  const dismiss = snack.getByRole("button", { name: "Dismiss notification" });
  const closeBounds = await dismiss.boundingBox();
  expect(closeBounds!.x + closeBounds!.width).toBeLessThanOrEqual(312);
  await dismiss.click();
});
test("snackbar repeat suppression, dismissal, pause and automatic expiry", async ({ page }) => {
  await page.goto(origin + "/admin/media");
  await page.clock.install();
  await page.evaluate(() => {
    for (const [id, message] of [
      [10001, "First completed action"],
      [10002, "First completed action"],
    ] as const)
      window.dispatchEvent(
        new CustomEvent("zeebaran:admin-notification", {
          detail: { id, message, tone: "success" },
        }),
      );
  });
  const snack = page.locator("[data-admin-snackbar]");
  await expect(snack.getByRole("status")).toHaveText("First completed action");
  await snack.hover();
  await page.clock.runFor(8000);
  await expect(snack.getByRole("status")).toHaveText("First completed action");
  await snack.getByRole("button", { name: "Dismiss notification" }).click();
  await page.evaluate(() =>
    window.dispatchEvent(
      new CustomEvent("zeebaran:admin-notification", {
        detail: { id: 10003, message: "Second completed action", tone: "success" },
      }),
    ),
  );
  await expect(snack.getByRole("status")).toHaveText("Second completed action");
  await page.mouse.move(1, 1);
  await page.clock.runFor(6500);
  await expect(snack.getByRole("status")).toHaveCount(0);
});

test("contact settings save and reload show feedback across admin navigation", async ({ page }) => {
  await page.goto(origin + "/admin/settings");
  await page.getByRole("switch", { name: "Show phone in footer", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  const snack = page.locator("[data-admin-snackbar]");
  await expect(snack.getByRole("status")).toHaveText("Contact & social settings saved.");
  await snack.getByRole("button", { name: "Dismiss notification" }).click();
  await page.getByRole("button", { name: "Reload", exact: true }).click();
  await expect(snack.getByRole("status")).toHaveText("Contact & social settings reloaded.");
  await page.getByRole("link", { name: "Media library", exact: true }).click();
  await expect(snack.getByRole("status")).toHaveText("Contact & social settings reloaded.");
});
