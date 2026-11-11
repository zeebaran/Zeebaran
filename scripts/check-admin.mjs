import { chromium } from "playwright";
import fs from "node:fs/promises";
import { editorDefinition } from "../features/cms/editor-fields.ts";
import AxeBuilder from "@axe-core/playwright";
if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098")
  throw Error("Run only with the disposable admin emulators.");
const origin = "http://127.0.0.1:3370";
const browser = await chromium.launch();
const results = [];
const assert = (condition, message) => {
  if (!condition) throw Error(message);
  results.push(message);
};
async function audit(page, label) {
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  if (audit.violations.length)
    console.log(
      label,
      JSON.stringify(
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
        null,
        2,
      ),
    );
  assert(audit.violations.length === 0, "Automated accessibility: " + label);
}
try {
  const ctx = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      reducedMotion: "reduce",
    }),
    page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/admin");
  assert(page.url().endsWith("/admin/login"), "Unauthenticated admin redirect");
  await audit(page, "sign-in");
  const response = await ctx.request.get(origin + "/api/admin/content/home");
  assert(response.status() === 401, "Private API rejects anonymous requests");
  await page.locator("input[type=email]").fill("zeebaran00@gmail.com");
  await page.locator("input[type=password]").fill("Local-fixture-Only-786!");
  await page.getByRole("button", { name: "Open the editorial desk" }).click();
  await page.waitForURL(origin + "/admin", { timeout: 30000 });
  await audit(page, "overview");
  await page.screenshot({ path: "/private/tmp/zeebaran-admin-dashboard.png" });
  await page.getByRole("link", { name: "Start with Home" }).click();
  await page.waitForURL("**/admin/pages/home");
  await page.getByRole("tab", { name: "Words & story" }).click();
  await audit(page, "Home text editor");
  await page.screenshot({ path: "/private/tmp/zeebaran-admin-home.png" });
  const csrf = async () => {
    const response = await ctx.request.get(origin + "/api/admin/csrf");
    return (await response.json()).token;
  };
  await page.getByLabel("Find editable text").fill("Rooted in the valley");
  const originalHeading = await page.locator(".admin-copy-field textarea").inputValue();
  await page
    .locator(".admin-copy-field textarea")
    .fill("Rooted in the valley. {An editorial check.}");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved." }).waitFor();
  assert(
    Object.values(
      (await (await ctx.request.get(origin + "/api/admin/content/home")).json()).record.draft.text,
    ).includes("Rooted in the valley. {An editorial check.}"),
    "The actual Save draft control persists edits",
  );
  await page.locator(".admin-copy-field textarea").fill(originalHeading);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved." }).waitFor();
  await page.getByLabel("Find editable text").fill("");
  const data = (await (await ctx.request.get(origin + "/api/admin/content/home")).json()).record;
  const catalog = JSON.parse(await fs.readFile("features/cms/catalog.generated.json", "utf8"));
  const heading = catalog.home.fields.find((f) => f.value.includes("Rooted in the valley"));
  assert(!!heading, "Home heading appears in the editing catalog");
  assert(
    (await page.locator(".admin-copy-field textarea").count()) >=
      editorDefinition("home", catalog.home).fields.length,
    "Home has all captured text fields",
  );
  const content = {
    text: { [heading.key]: "Rooted in the valley. {A tested draft.}" },
    images: {},
  };
  let token = await csrf();
  let r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: { action: "save", revision: data.revision, content },
  });
  assert(r.status() === 200, "Save draft succeeds");
  let updated = await r.json();
  const publicPage = await browser.newPage();
  await publicPage.goto(origin);
  assert(
    !(await publicPage.locator("h1").textContent()).includes("tested draft"),
    "Saving a draft does not publish",
  );
  await page.goto(origin + "/api/admin/preview?page=home");
  assert(page.url().startsWith(origin + "/"), "Preview preserves the hostname");
  assert(
    (await page.locator("h1").textContent()).includes("tested draft"),
    "Authenticated preview resolves draft",
  );
  await page.goto(origin + "/api/admin/preview?page=home&exit=1");
  await page.goto(origin + "/admin/pages/home");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("dialog", { name: "Publish this page" }).waitFor();
  await audit(page, "publish confirmation");
  await page.getByRole("button", { name: "Keep editing" }).click();
  token = await csrf();
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: { action: "publish", revision: updated.record.revision, content },
  });
  assert(r.status() === 200, "Publish succeeds");
  updated = await r.json();
  await publicPage.reload();
  assert(
    (await publicPage.locator("h1").textContent()).includes("tested draft"),
    "Published text reaches the public page",
  );
  token = await csrf();
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: { action: "save", revision: 0, content },
  });
  assert(r.status() === 409, "Stale revision cannot overwrite content");
  token = await csrf();
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: {
      action: "save",
      revision: updated.record.revision,
      content: { text: { "made-up-key": "bad" }, images: {} },
    },
  });
  assert(r.status() === 422, "Unknown field rejected");
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin },
    data: { action: "save", revision: updated.record.revision, content },
  });
  assert(r.status() === 403, "CSRF token enforced");
  token = await csrf();
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: {
      action: "publish",
      revision: updated.record.revision,
      content: { text: {}, images: {} },
    },
  });
  assert(r.status() === 200, "Restore original public content");
  await publicPage.reload();
  assert(
    !(await publicPage.locator("h1").textContent()).includes("tested draft"),
    "Original appearance restored",
  );
  // A partial map reset must remove the deleted field, not merge it back in.
  let current = (await (await ctx.request.get(origin + "/api/admin/content/home")).json()).record;
  const second = catalog.home.fields.find((f) => f.key !== heading.key && !f.numeric);
  const multi = { text: { ...content.text, [second.key]: "A second fixture field" }, images: {} };
  token = await csrf();
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: { action: "save", revision: current.revision, content: multi },
  });
  let versioned = await r.json();
  const restoreId = versioned.history[0].id;
  token = await csrf();
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: { action: "save", revision: versioned.record.revision, content },
  });
  versioned = await r.json();
  assert(
    r.ok() && versioned.record.draft.text[second.key] === undefined,
    "Removing one override does not leave a merged stale value",
  );
  token = await csrf();
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: { action: "restore", revision: versioned.record.revision, version: restoreId },
  });
  versioned = await r.json();
  assert(
    r.ok() &&
      versioned.record.draft.text[second.key] === "A second fixture field" &&
      Object.keys(versioned.record.published.text).length === 0,
    "History restore changes only the draft",
  );
  token = await csrf();
  r = await ctx.request.post(origin + "/api/admin/content/home", {
    headers: { origin, "x-csrf-token": token },
    data: {
      action: "save",
      revision: versioned.record.revision,
      content: { text: {}, images: {} },
    },
  });
  assert(r.ok(), "Restore test draft defaults");
  await page.goto(origin + "/admin/pages/home");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await page.getByRole("status").filter({ hasText: "Published." }).waitFor();
  assert(
    !(await page.getByRole("dialog").count()),
    "Actual Publish changes control completes and closes its dialog",
  );
  await page.screenshot({ path: "/private/tmp/zeebaran-admin-home.png" });
  await page.goto(origin + "/admin/pages/home");
  for (const name of ["Images", "Revision history"]) {
    await page.getByRole("tab", { name: new RegExp(name) }).click();
    await audit(page, "Home " + name);
  }
  await page.getByRole("tab", { name: /Images/ }).click();
  await page.getByRole("button", { name: "Choose or upload", exact: true }).first().click();
  await page.getByRole("dialog").waitFor();
  await audit(page, "media picker");
  await page.keyboard.press("Escape");
  await page.screenshot({ path: "/private/tmp/zeebaran-admin-images.png" });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "Editor fits " + width + "px",
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/private/tmp/zeebaran-admin-mobile.png" });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "Mobile editor fits viewport",
  );
  await page.getByRole("button", { name: "Open administration menu" }).click();
  assert(await page.locator(".admin-sidebar").isVisible(), "Mobile menu opens");
  await page.locator(".admin-sidebar a").first().focus();
  await page.keyboard.press("Escape");
  assert(!(await page.locator(".admin-sidebar").isVisible()), "Escape closes mobile menu");
  await page.setViewportSize({ width: 1440, height: 960 });
  for (const entry of Object.keys(catalog).filter((id) => !id.startsWith("product-"))) {
    await page.goto(origin + "/admin/pages/" + entry);
    assert((await page.locator("h1").innerText()).includes("workspace"), "Editor renders " + entry);
  }
  await page.goto(origin + "/admin/pages/site");
  await page.getByRole("tab").first().focus();
  await page.keyboard.press("End");
  assert(
    (await page.getByRole("tab", { name: "Revision history" }).getAttribute("aria-selected")) ===
      "true",
    "Site tabs support keyboard End",
  );
  await page.goto(origin + "/admin/media");
  await audit(page, "media library");
  await publicPage.close();
  assert(errors.length === 0, "No browser exceptions");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/admin/login");
  assert(
    (await ctx.request.get(origin + "/api/admin/content/home")).status() === 401,
    "Sign-out removes API access",
  );
  await ctx.close();
  const denied = await browser.newContext();
  const p = await denied.newPage();
  await p.goto(origin + "/admin/login");
  await p.locator("input[type=email]").fill("outsider@example.test");
  await p.locator("input[type=password]").fill("Local-fixture-Only-786!");
  await p.getByRole("button", { name: "Open the editorial desk" }).click();
  await p.getByRole("alert").waitFor();
  assert(p.url().endsWith("/login"), "Signed-in outsider remains unauthorized");
  await denied.close();
} finally {
  await browser.close();
  await fs.writeFile("/private/tmp/zeebaran-admin-checks.json", JSON.stringify(results, null, 2));
}
console.log(results);
