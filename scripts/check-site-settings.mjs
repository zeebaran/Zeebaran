import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { emptyCatalog } from "../features/catalog/model.ts";
import { textKey } from "../features/cms/model.ts";
if (
  process.env.FIREBASE_PROJECT_ID !== "demo-zeebaran-settings" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395" ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098"
)
  throw Error("Explicit disposable settings emulators required.");
const origin = "http://localhost:3370",
  password = "Isolated-Settings-Only-786!";
const app = initializeApp({ projectId: "demo-zeebaran-settings" }),
  auth = getAuth(app),
  db = getFirestore(app);
for (const [uid, email, role] of [
  ["settings-owner", "zeebaran00@gmail.com", "admin"],
  ["settings-editor", "editor@example.test", "editor"],
]) {
  let user;
  try {
    user = await auth.getUser(uid);
    await auth.updateUser(uid, { password, emailVerified: true });
  } catch {
    user = await auth.createUser({ uid, email, password, emailVerified: true });
  }
  await auth.setCustomUserClaims(user.uid, { zeebaranRole: role });
}
const draft = { text: { manual: "Private footer draft must remain unpublished" }, images: {} };
const published = {
  text: { [textKey("contact@zeebaran.com")]: "old-office@example.test" },
  images: {},
};
await db.collection("cmsPages").doc("site").set({ revision: 19, draft, published });
await db
  .collection("cmsPages")
  .doc("contact")
  .set({
    published: {
      text: { [textKey("research@zeebaran.com")]: "old-research@example.test" },
      images: {},
    },
  });
for (const [id, kind, name] of [
  ["gala", "variety", "Gala"],
  ["m9", "rootstock", "M9"],
]) {
  await db
    .collection("catalogPublished")
    .doc(id)
    .set({
      ...emptyCatalog(kind),
      slug: id,
      name,
      nameSort: name.toLowerCase(),
      intro: "An isolated public catalog fixture for verifying shared enquiry settings.",
      origin: "Fixture orchard",
      code: kind === "rootstock" ? name : "",
      rootstockIds: kind === "variety" ? ["m9"] : [],
      publishedAt: Timestamp.now(),
    });
}
const browser = await chromium.launch(),
  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
const page = await context.newPage(),
  errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
async function login(email) {
  await page.goto(origin + "/admin/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: "Open the editorial desk" }).click();
  await page.waitForURL(origin + "/admin");
}
async function post(body, includeToken = true) {
  const token = (await (await context.request.get(origin + "/api/admin/csrf")).json()).token;
  return context.request.post(origin + "/api/admin/settings", {
    headers: { origin, ...(includeToken ? { "x-csrf-token": token } : {}) },
    data: body,
  });
}
try {
  assert.equal((await context.request.get(origin + "/api/admin/settings")).status(), 401);
  await login("zeebaran00@gmail.com");
  const navigationStart = performance.now();
  await page.getByRole("link", { name: "Contact & social", exact: true }).click();
  await page.getByRole("heading", { name: "Contact & social." }).waitFor();
  const navigationMs = Math.round(performance.now() - navigationStart);
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("old-office@example.test");
  await expect(page.getByLabel("Research & institutions", { exact: true })).toHaveValue(
    "old-research@example.test",
  );
  checks.push("First setup preserves published legacy contact edits");
  const apiCalls = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/admin/settings") apiCalls.push(request.method());
  });
  await page.getByLabel("Email", { exact: true }).fill("office@fixture.example");
  await page.getByLabel("Phone number", { exact: true }).fill("+91 98765 43210");
  await page.getByLabel("WhatsApp number", { exact: true }).fill("+91 91234 56789");
  await page
    .getByLabel("facebook", { exact: true })
    .fill("https://www.facebook.com/zeebaran-fixture");
  await page.getByLabel("YouTube", { exact: true }).fill("");
  await page.getByRole("button", { name: "Add office", exact: true }).click();
  await page.getByLabel("Office name", { exact: true }).last().fill("Fixture field office");
  await page.getByLabel("Address", { exact: true }).last().fill("Fixture road, Srinagar");
  assert.deepEqual(apiCalls, []);
  const saveStart = performance.now();
  await page.getByRole("button", { name: "Save changes", exact: true }).evaluate((button) => {
    button.click();
    button.click();
  });
  await expect(page.getByRole("status")).toContainText("Saved.");
  const saveMs = Math.round(performance.now() - saveStart);
  assert.deepEqual(apiCalls, ["POST"]);
  let stored = (await db.collection("cmsPages").doc("site").get()).data();
  assert.deepEqual(stored.draft, draft);
  assert.deepEqual(stored.published, published);
  assert.equal(stored.revision, 19);
  assert.equal(stored.settingsRevision, 1);
  checks.push(
    "One explicit save, no per-keystroke calls, double-submit guard, page drafts and publications preserved",
  );
  assert.equal((await post({ revision: 0, settings: stored.publicSettings })).status(), 409);
  assert.equal((await post({ revision: 1, settings: stored.publicSettings }, false)).status(), 403);
  assert.equal(
    (
      await post({
        revision: 1,
        settings: {
          ...stored.publicSettings,
          socials: { ...stored.publicSettings.socials, facebook: "javascript:alert(1)" },
        },
      })
    ).status(),
    422,
  );
  checks.push("Stale revisions, forged CSRF requests and unsafe URLs rejected");
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  }
  const accessibility = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    accessibility.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
  );
  await page.screenshot({
    path: "/private/tmp/zeebaran-contact-settings-admin.png",
    fullPage: true,
  });
  const publicContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    }),
    publicPage = await publicContext.newPage();
  const publicSettingsCalls = [];
  publicPage.on("pageerror", (error) => errors.push(error.message));
  publicPage.on("request", (request) => {
    if (request.url().includes("/api/admin/settings")) publicSettingsCalls.push(request.url());
  });
  await publicPage.goto(origin + "/contact");
  await expect(publicPage.locator('#footer a[href="mailto:office@fixture.example"]')).toBeVisible();
  await expect(publicPage.locator('#footer a[href="tel:+919876543210"]')).toBeVisible();
  await expect(publicPage.locator('#footer a[aria-label="Zeebaran on WhatsApp"]')).toHaveAttribute(
    "href",
    "https://wa.me/919123456789",
  );
  await expect(publicPage.locator('#footer a[aria-label="Zeebaran on Facebook"]')).toHaveAttribute(
    "href",
    "https://www.facebook.com/zeebaran-fixture",
  );
  assert.equal(await publicPage.getByRole("link", { name: "Zeebaran on YouTube" }).count(), 0);
  await expect(publicPage.locator("#footer")).toContainText("Fixture road, Srinagar");
  assert.ok(await publicPage.locator('a[href="mailto:old-research@example.test"]').count());
  const metadata = JSON.parse(
    await publicPage.locator('script[type="application/ld+json"]').first().textContent(),
  );
  assert.equal(metadata["@graph"][0].email, "office@fixture.example");
  assert.ok(metadata["@graph"][0].sameAs.includes("https://www.facebook.com/zeebaran-fixture"));
  checks.push(
    "Footer, Contact page, institutional desks and organization metadata use the same published settings",
  );
  await publicPage
    .locator("#footer")
    .screenshot({ path: "/private/tmp/zeebaran-social-footer-desktop.png" });
  await publicPage.setViewportSize({ width: 390, height: 1000 });
  await publicPage
    .locator("#footer")
    .screenshot({ path: "/private/tmp/zeebaran-social-footer-mobile.png" });
  for (const path of ["/products", "/products/gala", "/products/rootstocks/m9"]) {
    await publicPage.goto(origin + path);
    await expect(
      publicPage.locator('a[href^="https://wa.me/919123456789?text="]').first(),
    ).toBeAttached();
  }
  assert.deepEqual(publicSettingsCalls, []);
  checks.push(
    "Variety cards, product profiles and rootstock profiles share WhatsApp without client settings fetches",
  );
  await publicPage.goto(origin + "/contact/simple");
  await publicPage.route("**/api/enquiries", (route) =>
    route.fulfill({ status: 503, json: { error: "Isolated test delivery failure" } }),
  );
  await publicPage.route("https://api.web3forms.com/submit", (route) =>
    route.fulfill({ status: 503, json: { success: false } }),
  );
  await publicPage.getByLabel("Name", { exact: true }).fill("Isolated fixture");
  await publicPage.getByLabel("Email", { exact: true }).fill("fixture@example.test");
  await publicPage.getByLabel("Contact number", { exact: true }).fill("+91 99999 99999");
  await publicPage.getByLabel("Place", { exact: true }).fill("Fixture place");
  await publicPage
    .locator('textarea[name="message"]')
    .fill("An isolated test of the shared email fallback; no message is delivered.");
  await publicPage.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    publicPage.getByRole("link", { name: "Open email draft", exact: true }),
  ).toHaveAttribute("href", /^mailto:office@fixture\.example\?/);
  checks.push("Failed form delivery uses the updated email fallback without sending a real email");
  assert.equal(
    (
      await post({ revision: 1, settings: { ...stored.publicSettings, phone: "+91 88888 77777" } })
    ).status(),
    200,
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByLabel("Phone number", { exact: true })).toHaveValue("+91 88888 77777");
  await page.getByLabel("Phone number", { exact: true }).fill("+91 11111 11111");
  assert.equal(
    (
      await post({ revision: 2, settings: { ...stored.publicSettings, phone: "+91 22222 22222" } })
    ).status(),
    200,
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("status")).toContainText("Another administrator");
  await expect(page.getByLabel("Phone number", { exact: true })).toHaveValue("+91 11111 11111");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("another session");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reload", exact: true }).click();
  await expect(page.getByLabel("Phone number", { exact: true })).toHaveValue("+91 22222 22222");
  checks.push(
    "Fresh server snapshots update clean forms, preserve unsaved edits, and reject conflicting saves",
  );
  await page.getByLabel("WhatsApp number", { exact: true }).fill("");
  await page.getByLabel("facebook", { exact: true }).fill("");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Remove Fixture field office", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  await publicPage.goto(origin + "/products");
  assert.equal(await publicPage.getByRole("link", { name: "Zeebaran on WhatsApp" }).count(), 0);
  assert.equal(await publicPage.getByRole("link", { name: "Zeebaran on Facebook" }).count(), 0);
  await expect(
    publicPage.getByRole("link", { name: "Enquire about Gala", exact: true }),
  ).toHaveAttribute("href", /^\/contact\?/);
  stored = (await db.collection("cmsPages").doc("site").get()).data();
  assert.equal(stored.publicSettings.addresses.length, 2);
  assert.equal(stored.settingsRevision, 4);
  assert.deepEqual(stored.draft, draft);
  checks.push(
    "Disabling social/WhatsApp links and removing an office updates the website and restores enquiry fallback",
  );
  // Footer visibility is presentation-only: keep the source details and other journeys intact.
  await page.getByLabel("WhatsApp number", { exact: true }).fill("+91 91234 56789");
  await page
    .getByLabel("facebook", { exact: true })
    .fill("https://www.facebook.com/zeebaran-fixture");
  await page.getByLabel("YouTube", { exact: true }).fill("https://www.youtube.com/@zeebaran");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  const beforeToggles = apiCalls.length;
  for (const label of [
    "Show email in footer",
    "Show phone in footer",
    "Show addresses in footer",
    "Show social media in footer",
  ])
    await page.getByRole("switch", { name: label, exact: true }).uncheck();
  assert.equal(apiCalls.length, beforeToggles);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  await publicPage.goto(origin + "/contact");
  const footer = publicPage.locator("#footer");
  assert.equal(
    await footer
      .locator('a[href^="mailto:"],a[href^="tel:"],nav[aria-label="Zeebaran social media"]')
      .count(),
    0,
  );
  assert.equal(await footer.getByRole("heading", { name: "Contact", exact: true }).count(), 0);
  const kept = (await db.collection("cmsPages").doc("site").get()).data().publicSettings;
  await expect(publicPage.locator("main")).toContainText(kept.addresses[0].address);
  await expect(
    publicPage.locator('main a[href="mailto:office@fixture.example"]').first(),
  ).toBeAttached();
  assert.equal(kept.whatsapp, "+91 91234 56789");
  assert.equal(kept.socials.facebook, "https://www.facebook.com/zeebaran-fixture");
  await publicPage.goto(origin + "/products");
  await expect(
    publicPage.getByRole("link", { name: "Enquire about Gala", exact: true }),
  ).toHaveAttribute("href", /^https:\/\/wa.me\/919123456789\?/);
  checks.push(
    "Footer switches issue no editing requests, retain source details and keep Contact/product enquiries working; empty groups disappear",
  );
  for (const label of [
    "Show email in footer",
    "Show phone in footer",
    "Show addresses in footer",
    "Show social media in footer",
  ])
    await page.getByRole("switch", { name: label, exact: true }).check();
  for (const label of [
    "Show office 1 in footer",
    "Show Facebook in footer",
    "Show WhatsApp in footer",
  ])
    await page.getByRole("switch", { name: label, exact: true }).uncheck();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  await publicPage.goto(origin + "/contact");
  await expect(footer.locator('a[href="mailto:office@fixture.example"]')).toBeVisible();
  await expect(footer.locator('a[href="tel:+912222222222"]')).toBeVisible();
  assert.equal(await footer.getByRole("link", { name: "Zeebaran on Facebook" }).count(), 0);
  assert.equal(await footer.getByRole("link", { name: "Zeebaran on WhatsApp" }).count(), 0);
  assert.equal(await footer.getByText(kept.addresses[0].address, { exact: true }).count(), 0);
  await expect(footer.getByText(kept.addresses[1].address, { exact: true })).toBeVisible();
  await expect(publicPage.locator("main")).toContainText(kept.addresses[0].address);
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Show office 1 in footer", exact: true }),
  ).not.toBeChecked();
  for (const label of [
    "Show office 1 in footer",
    "Show Facebook in footer",
    "Show WhatsApp in footer",
  ])
    await page.getByRole("switch", { name: label, exact: true }).check();
  const keyboard = page.getByRole("switch", { name: "Show phone in footer", exact: true });
  await keyboard.focus();
  await keyboard.press("Space");
  await expect(keyboard).not.toBeChecked();
  await keyboard.press("Space");
  await expect(keyboard).toBeChecked();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  await publicPage.goto(origin + "/contact");
  assert.equal(
    await footer
      .getByRole("navigation", { name: "Zeebaran social media" })
      .getByRole("link")
      .count(),
    4,
  );
  await expect(footer).toContainText(kept.addresses[0].address);
  for (const width of [390, 768, 1440]) {
    await publicPage.setViewportSize({ width, height: 1000 });
    assert.equal(
      await publicPage.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await footer.screenshot({ path: `/private/tmp/zeebaran-brand-footer-${width}.png` });
  }
  await page.screenshot({
    path: "/private/tmp/zeebaran-footer-switches-admin.png",
    fullPage: true,
  });
  stored = (await db.collection("cmsPages").doc("site").get()).data();
  assert.deepEqual(stored.draft, draft);
  assert.equal(
    (
      await post({
        revision: stored.settingsRevision,
        settings: {
          ...stored.publicSettings,
          footer: { ...stored.publicSettings.footer, email: "false" },
        },
      })
    ).status(),
    422,
  );
  checks.push(
    "Per-office and per-platform hiding persists after reload; re-enabling restores all four colored icons and saved contacts; keyboard switches and responsive layouts verified",
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(origin + "/admin/login");
  await login("editor@example.test");
  assert.equal(await page.getByRole("link", { name: "Contact & social", exact: true }).count(), 0);
  assert.equal((await context.request.get(origin + "/api/admin/settings")).status(), 403);
  assert.equal((await post({ revision: 4, settings: stored.publicSettings })).status(), 403);
  checks.push("Editors cannot access or update global contact settings");
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        checks,
        navigationMs,
        saveMs,
        settingsRequestsIncludingConflictAndExplicitReload: apiCalls,
        browserErrors: errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
