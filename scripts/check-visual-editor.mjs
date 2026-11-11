// Real local app/API/Firestore integration, isolated from production and external uploads.
import { chromium, expect } from "@playwright/test";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import fs from "node:fs/promises";
if (
  process.env.FIREBASE_PROJECT_ID !== "demo-zeebaran-admin" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395" ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098"
)
  throw Error("Explicit disposable demo emulators required.");
const origin = "http://127.0.0.1:3388",
  db = getFirestore(initializeApp({ projectId: "demo-zeebaran-admin" })),
  browser = await chromium.launch(),
  results = [],
  originals = new Map(),
  catalog = JSON.parse(await fs.readFile("features/cms/catalog.generated.json", "utf8")),
  homeKey = catalog.home.fields.find((f) => f.value.includes("Rooted in the valley")).key;
const check = (value, label) => {
  if (!value) throw Error(label);
  results.push(label);
};
const publicDraft = "A PRIVATE visual draft. {Rooted in care.}";
const fixtureId = "zeebaran/isolated-visual-image-check",
  fixtureSrc = "https://res.cloudinary.com/jfiuaflr/image/upload/isolated-visual-image-check.webp",
  fixtureRef = db.collection("cmsMedia").doc(Buffer.from(fixtureId).toString("base64url"));
let originalMedia;
try {
  originalMedia = (await fixtureRef.get()).data();
  await fixtureRef.set({
    publicId: fixtureId,
    src: fixtureSrc,
    resourceType: "image",
    width: 1600,
    height: 900,
    bytes: 100,
    alt: "Isolated visual orchard",
    name: "Isolated visual image check",
    createdAt: Timestamp.now(),
  });
  for (const name of ["home", "mission", "site"]) {
    const ref = db.collection("cmsPages").doc(name);
    originals.set(name, (await ref.get()).data());
    await ref.set({
      revision: 0,
      draft: { text: name === "home" ? { [homeKey]: publicDraft } : {}, images: {} },
      published: { text: {}, images: {} },
      updatedAt: Timestamp.now(),
      publishedAt: Timestamp.now(),
    });
  }
  const anon = await browser.newContext(),
    anonymous = await anon.request.get(origin + "/admin/canvas/home");
  check(
    new URL(anonymous.url()).pathname === "/admin/login",
    "Canvas requires an authorized server session",
  );
  const ctx = await browser.newContext({
      viewport: { width: 1540, height: 1100 },
      reducedMotion: "reduce",
    }),
    page = await ctx.newPage(),
    errors = [];
  // Synthetic fixture pixels only; no external image upload or provider request.
  await ctx.route("**/*isolated-visual-image-check*", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8kQAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  page.setDefaultTimeout(15000);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/admin/login");
  await page.locator("input[type=email]").fill("zeebaran00@gmail.com");
  await page.locator("input[type=password]").fill("Local-fixture-Only-786!");
  await page.getByRole("button", { name: "Open the editorial desk" }).click();
  await page.waitForURL(origin + "/admin");
  await page.goto(origin + "/admin/pages/home");
  const preview = () => page.frameLocator('iframe[title*="editable website preview"]');
  async function loaded() {
    await expect(page.locator(".admin-visual-loading")).toHaveCount(0, { timeout: 30000 });
    await expect(preview().locator(".visual-canvas-public")).toBeVisible();
  }
  await loaded();
  let canvas = preview();
  await expect(canvas.locator("h1")).toContainText("A PRIVATE visual draft.");
  await page.getByText("Find content", { exact: true }).click();
  await page.getByRole("textbox", { name: "Find page content" }).fill("PRIVATE visual draft");
  await page.locator(".admin-visual-find li button").click();
  await expect(page.getByRole("dialog", { name: "Edit page text" })).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  results.push("Search provides keyboard-accessible selection of current page content");
  check(
    (await canvas.locator(".admin-root").count()) === 0,
    "Canvas uses public typography and layout without admin CSS overrides",
  );
  const publicPage = await anon.newPage();
  await publicPage.goto(origin, { waitUntil: "networkidle" });
  check(
    !(await publicPage.locator("h1").innerText()).includes("PRIVATE"),
    "Private canvas content is absent from the public page",
  );
  await canvas.locator("h1").click();
  let dialog = page.getByRole("dialog", { name: "Edit page text" });
  await expect(dialog).toBeVisible();
  await dialog
    .getByLabel("Text", { exact: true })
    .fill("A visual orchard story. Rooted with purpose.");
  await dialog.getByLabel("Highlighted words").fill("Rooted with purpose.");
  await expect(canvas.locator("h1")).toContainText("Rooted with purpose.");
  const unchanged = await db.collection("cmsPages").doc("home").get();
  check(
    unchanged.get("revision") === 0 && unchanged.get("draft.text")[homeKey] === publicDraft,
    "Typing updates the actual preview without Firestore writes",
  );
  await dialog.getByRole("button", { name: "Done", exact: true }).click();
  const frame = await page.locator('iframe[title*="editable website preview"]').elementHandle(),
    framePage = await frame.contentFrame();
  await framePage.evaluate(() => scrollTo(0, 600));
  const beforeScroll = await framePage.evaluate(() => scrollY);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved." }).waitFor();
  check(
    (await db.collection("cmsPages").doc("home").get()).get("draft.text")[homeKey] ===
      "A visual orchard story. {Rooted with purpose.}",
    "Save draft persists inline text with accent styling",
  );
  check(
    Math.abs((await framePage.evaluate(() => scrollY)) - beforeScroll) < 2,
    "Saving preserves the page position instead of reloading the canvas",
  );
  await publicPage.reload({ waitUntil: "networkidle" });
  check(
    !(await publicPage.locator("h1").innerText()).includes("visual orchard story"),
    "Saving inline changes does not publish",
  );
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Published. The website now uses this revision." })
    .waitFor();
  await publicPage.reload({ waitUntil: "networkidle" });
  await expect(publicPage.locator("h1")).toContainText("A visual orchard story.");
  results.push("Publishing updates the public page through the existing protected API");
  await page.getByRole("button", { name: "Mobile", exact: true }).click();
  await expect.poll(() => framePage.evaluate(() => innerWidth)).toBe(390);
  await page.getByRole("button", { name: "Interact", exact: true }).click();
  await canvas.getByRole("button", { name: "Open menu" }).click();
  await expect(canvas.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  check(
    !(await framePage.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
    "Mobile preview uses real responsive navigation without horizontal page overflow",
  );
  await canvas.getByRole("button", { name: "Close menu" }).click();
  await page.getByRole("button", { name: "Tablet", exact: true }).click();
  await expect.poll(() => framePage.evaluate(() => innerWidth)).toBe(820);
  check(
    !(await framePage.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
    "Tablet preview renders at its actual viewport width without horizontal overflow",
  );
  await page.getByRole("button", { name: "Edit page", exact: true }).click();
  await expect(canvas.locator(".visual-canvas-public")).toHaveAttribute("data-editor-mode", "edit");
  await page.getByRole("button", { name: "Full width", exact: true }).click();
  await framePage.evaluate(() => scrollTo(0, 0));
  // Events from another source or origin cannot change the editor's selection.
  await page.evaluate(() =>
    window.postMessage(
      {
        channel: "zeebaran.visual.v1",
        page: "home",
        type: "select",
        selection: { kind: "text", page: "home", key: "injected" },
      },
      location.origin,
    ),
  );
  check(
    (await page.getByRole("dialog").count()) === 0,
    "Unrelated same-origin windows cannot inject editor selection messages",
  );
  // Direct image marker selection: this runs the same capture listener without changing layout.
  const imageKey = catalog.home.images[0].key;
  await framePage
    .locator('[data-cms-image="' + imageKey + '"]')
    .first()
    .dispatchEvent("click");
  dialog = page.getByRole("dialog", { name: "Edit page image" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Image description").fill("A carefully tended Himalayan orchard");
  await dialog.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved." }).waitFor();
  check(
    (await db.collection("cmsPages").doc("home").get()).get("draft.images")[imageKey].alt ===
      "A carefully tended Himalayan orchard",
    "Original image descriptions can be edited and saved without invalid metadata",
  );
  await page.screenshot({ path: "/private/tmp/zeebaran-visual-home-verified.png" });
  await framePage
    .locator('[data-cms-image="' + imageKey + '"]')
    .first()
    .dispatchEvent("click");
  dialog = page.getByRole("dialog", { name: "Edit page image" });
  await dialog.getByRole("button", { name: "Choose or upload image", exact: true }).click();
  const library = page.getByRole("dialog", { name: "Choose a photograph", exact: true });
  await library.getByRole("button", { name: "Isolated visual image check" }).click();
  await expect(library).toHaveCount(0);
  await expect(dialog.getByLabel("Image description")).toHaveValue("Isolated visual orchard");
  await dialog.getByRole("button", { name: "Done", exact: true }).click();
  await expect(framePage.locator('[data-cms-image="' + imageKey + '"]').first()).toHaveAttribute(
    "src",
    /isolated-visual-image-check/,
  );
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved." }).waitFor();
  check(
    (await db.collection("cmsPages").doc("home").get()).get("draft.images")[imageKey].src ===
      fixtureSrc,
    "Library image selection updates the canvas and passes trusted server media validation",
  );
  for (const name of [
    "platform",
    "mission",
    "products",
    "zeebaran-hub",
    "innovation",
    "impact",
    "partnerships",
    "governance",
    "about",
    "contact",
    "contact-simple",
    "site",
  ]) {
    await page.goto(origin + "/admin/pages/" + name);
    await loaded();
    canvas = preview();
    check(
      (await canvas.locator("[data-cms-field],[data-cms-image],[data-video-card]").count()) > 0,
      "Actual website canvas renders: " + name,
    );
    if (name === "mission") {
      await canvas.locator("[data-video-card]").first().locator("h3").click();
      dialog = page.getByRole("dialog", { name: "Edit Mission section" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Add video", exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Close content editor" }).click();
      results.push("Mission cards open their section editor directly from the real page");
      const field = catalog.mission.fields.find((f) => f.value === "Our Mission · In The Field");
      await canvas
        .locator('[data-cms-field="' + field.key + '"]')
        .first()
        .click();
      dialog = page.getByRole("dialog", { name: "Edit page text" });
      await expect(dialog).toBeVisible();
      results.push("Mission business copy is editable directly on the page");
      await dialog.getByRole("button", { name: "Done", exact: true }).click();
    }
    if (name === "contact-simple") {
      const inner = await (
        await page.locator('iframe[title*="editable website preview"]').elementHandle()
      ).contentFrame();
      let sent = false;
      const listener = (request) => {
        if (request.method() === "POST" && request.url().includes("/api/enquiries")) sent = true;
      };
      ctx.on("request", listener);
      await page.getByRole("button", { name: "Interact", exact: true }).click();
      await inner.locator("form").first().dispatchEvent("submit");
      ctx.off("request", listener);
      check(!sent, "Preview forms cannot create real enquiries");
      await page.getByRole("button", { name: "Edit page", exact: true }).click();
      await expect(canvas.locator(".visual-canvas-public")).toHaveAttribute(
        "data-editor-mode",
        "edit",
      );
      const nameField = canvas.getByPlaceholder("Your name");
      await nameField.click();
      dialog = page.getByRole("dialog", { name: "Edit page text" });
      await expect(dialog).toBeVisible();
      await dialog.getByLabel("Text", { exact: true }).fill("Your full name");
      await dialog.getByRole("button", { name: "Done", exact: true }).click();
      await expect(canvas.getByPlaceholder("Your full name")).toBeVisible();
      results.push("Form placeholder copy updates without changing form data or validation");
      // Discard this unsaved preview-only change when moving to the next workspace.
      page.once("dialog", (event) => event.accept());
    }
    if (name === "site") {
      await canvas
        .getByRole("navigation", { name: "Primary", exact: true })
        .getByRole("link", { name: "The Platform", exact: true })
        .click();
      dialog = page.getByRole("dialog", { name: "Edit page text" });
      await expect(dialog).toBeVisible();
      await dialog.getByLabel("Text", { exact: true }).fill("The Horticulture Platform");
      await dialog.getByRole("button", { name: "Done", exact: true }).click();
      await page.getByRole("button", { name: "Save draft", exact: true }).click();
      await page.getByRole("status").filter({ hasText: "Draft saved." }).waitFor();
      check(
        Object.values(
          (await db.collection("cmsPages").doc("site").get()).get("draft.text"),
        ).includes("The Horticulture Platform"),
        "Shared navigation text saves in Site settings rather than a page-specific record",
      );
      const email = canvas.locator("footer a[href^='mailto:']");
      await email.click();
      dialog = page.getByRole("dialog", { name: "Edit page text" });
      await dialog.getByLabel("Text", { exact: true }).fill("editor@example.com");
      await dialog.getByRole("button", { name: "Done", exact: true }).click();
      await expect(canvas.locator("footer a[href='mailto:editor@example.com']")).toBeVisible();
      results.push("Editing the contact email also updates its actual mail destination");
    }
  }
  check(errors.length === 0, "No JavaScript errors across the website canvases");
  console.log(results);
  await fs.writeFile("/private/tmp/zeebaran-visual-results.json", JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  for (const [name, data] of originals) {
    const ref = db.collection("cmsPages").doc(name);
    if (data) await ref.set(data);
    else await ref.delete();
  }
  if (originalMedia) await fixtureRef.set(originalMedia);
  else await fixtureRef.delete();
}
