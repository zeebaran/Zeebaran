import { chromium, expect } from "@playwright/test";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import assert from "node:assert/strict";
if (
  process.env.FIREBASE_PROJECT_ID !== "demo-zeebaran-admin" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395" ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098"
)
  throw Error("Disposable emulators required");
const origin =
    process.argv.find((value) => value.startsWith("--origin="))?.slice(9) ||
    "http://127.0.0.1:3388",
  db = getFirestore(initializeApp({ projectId: "demo-zeebaran-admin" })),
  ref = db.collection("cmsPages").doc("contact"),
  original = (await ref.get()).data(),
  beforeHistory = new Set((await ref.collection("history").get()).docs.map((d) => d.id)),
  browser = await chromium.launch();
if (!/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin))
  throw Error("Use an explicit local QA server.");
const tile = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8kQAAAAASUVORK5CYII=",
  "base64",
);
try {
  await ref.set({
    revision: 0,
    draft: { text: {}, images: {} },
    published: { text: {}, images: {} },
  });
  const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      reducedMotion: "reduce",
    }),
    page = await ctx.newPage(),
    publicPage = await ctx.newPage(),
    errors = [];
  await ctx.route("https://tile.openstreetmap.org/**", (r) =>
    r.fulfill({ contentType: "image/png", body: tile }),
  );
  page.on("pageerror", (e) => errors.push(e.message));
  publicPage.on("pageerror", (e) => errors.push(e.message));
  page.setDefaultTimeout(25000);
  await page.goto(origin + "/admin/login");
  await page.locator("input[type=email]").fill("zeebaran00@gmail.com");
  await page.locator("input[type=password]").fill("Local-fixture-Only-786!");
  await page.getByRole("button", { name: "Open the editorial desk" }).click();
  await page.waitForURL(origin + "/admin");
  const bootstrapCsrf = await ctx.request.get(origin + "/api/admin/csrf");
  const bootstrapToken = (await bootstrapCsrf.json()).token;
  const reset = await ctx.request.post(origin + "/api/admin/content/contact", {
    headers: { origin, "x-csrf-token": bootstrapToken },
    data: { action: "publish", revision: 0, content: { text: {}, images: {} } },
  });
  assert.equal(reset.status(), 200);
  await page.goto(origin + "/admin/pages/contact");
  await page.getByRole("tab", { name: "Regional hubs", exact: true }).click();
  const cards = page.locator("[data-hub-editor]");
  await expect(cards).toHaveCount(4);
  await page.getByRole("button", { name: "Add hub", exact: true }).click();
  let card = cards.last();
  await card.getByLabel("Hub name", { exact: true }).fill("Bandipora Field Hub");
  await card.getByLabel("Area or address").fill("Bandipora");
  await card.getByLabel("Hub description").fill("Regional advisory and orchard support.");
  await card.getByLabel("Key detail").fill("Elevation: 1,700 m");
  await card.getByLabel("Service status").fill("Appointments available");
  // Incomplete coordinates produce an actionable error without writing anything.
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.locator(".admin-notice-error")).toContainText("latitude");
  assert.equal((await ref.get()).get("revision"), 1);
  await card.getByLabel("Latitude", { exact: true }).fill("34.4167");
  await card.getByLabel("Longitude", { exact: true }).fill("74.65");
  await card.getByLabel("Map details", { exact: true }).fill("Bandipora orchard advisory point.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved.", { exact: true }).first()).toBeAttached();
  let record = (await ref.get()).data();
  assert.equal(record.draft.regionalHubs.length, 5);
  assert.equal(record.published.regionalHubs, undefined);
  await publicPage.goto(origin + "/contact");
  await expect(publicPage.locator("[data-regional-hub]")).toHaveCount(4);
  await expect(
    publicPage.locator('[data-geographic-map] button[aria-label^="Locate "]'),
  ).toHaveCount(5);
  await page.getByRole("tab", { name: "Page preview", exact: true }).click();
  await expect(page.locator(".admin-visual-loading")).toHaveCount(0, { timeout: 40000 });
  const preview = page.frameLocator('iframe[title*="editable website preview"]');
  await expect(preview.locator("[data-regional-hub]")).toHaveCount(5);
  const geo = preview.locator("[data-geographic-map]");
  await geo.scrollIntoViewIfNeeded();
  await expect(geo).toHaveAttribute("data-map-state", "ready", { timeout: 20000 });
  await expect(geo.locator(".geographic-pin")).toHaveCount(6);
  await geo.click();
  await expect(page.getByRole("dialog", { name: "Edit website content" })).toBeVisible();
  await expect(page.getByRole("dialog").locator("[data-hub-editor]")).toHaveCount(5);
  const instanceBefore = await geo.locator(".leaflet-container").evaluate((el) => el._leaflet_id);
  const dialogHub = page
    .getByRole("dialog")
    .locator("[data-hub-editor]")
    .filter({ has: page.getByText("Bandipora Field Hub", { exact: true }) });
  await dialogHub.getByRole("button", { name: "Edit", exact: true }).click();
  await dialogHub.getByLabel("Map label", { exact: true }).fill("Bandipora Draft Label");
  await dialogHub.getByLabel("Latitude", { exact: true }).fill("34.42");
  await expect(
    geo.getByRole("button", { name: "Locate Bandipora Draft Label", exact: true }),
  ).toBeAttached();
  assert.equal(
    await geo.locator(".leaflet-container").evaluate((el) => el._leaflet_id),
    instanceBefore,
  );
  await dialogHub.getByLabel("Map label", { exact: true }).fill("Bandipora Field Hub");
  await dialogHub.getByLabel("Latitude", { exact: true }).fill("34.4167");
  const dialogHq = page
    .getByRole("dialog")
    .locator("[data-hub-editor]")
    .filter({ has: page.getByText("Srinagar Central HQ", { exact: true }) });
  await dialogHq.getByRole("button", { name: "Disable", exact: true }).click();
  await expect(geo.getByRole("button", { name: "Locate Srinagar HQ", exact: true })).toHaveCount(0);
  await expect(geo.locator(".geographic-map-details strong")).toHaveText("Baramulla");
  await dialogHq.getByRole("button", { name: "Enable", exact: true }).click();
  await expect(geo.getByRole("button", { name: "Locate Srinagar HQ", exact: true })).toBeAttached();
  assert.equal(
    await geo.locator(".leaflet-container").evaluate((el) => el._leaflet_id),
    instanceBefore,
  );
  await page.getByRole("button", { name: "Close content editor" }).click();
  console.log(
    "PASS: in-place preview edits update pins without recreating the map; disabling the selected HQ safely chooses an active location",
  );
  console.log(
    "PASS: add and edit hub, actionable coordinate error, save draft, live page remains private, preview cards and map pins synchronize, click-to-edit",
  );
  async function publish() {
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await page.getByRole("button", { name: "Publish changes", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Publish this page" })).toHaveCount(0);
  }
  await publish();
  await publicPage.reload();
  await expect(publicPage.locator("[data-regional-hub]")).toHaveCount(5);
  const live = publicPage.locator("[data-geographic-map]");
  await live.scrollIntoViewIfNeeded();
  await expect(live).toHaveAttribute("data-map-state", "ready");
  await expect(live.locator(".geographic-pin")).toHaveCount(6);
  await live.getByRole("button", { name: "Locate Bandipora Field Hub", exact: true }).click();
  await expect(live.locator(".geographic-map-details")).toContainText(
    "Bandipora orchard advisory point.",
  );
  await expect(
    live.getByRole("link", { name: "Open Bandipora Field Hub on OpenStreetMap" }),
  ).toHaveAttribute("href", /mlat=34.4167&mlon=74.65/);
  console.log(
    "PASS: published hub appears on live cards and real map; selecting it uses the saved coordinates",
  );
  await page.getByRole("tab", { name: "Regional hubs", exact: true }).click();
  const selected = cards.filter({ has: page.getByText("Bandipora Field Hub", { exact: true }) });
  await selected.getByRole("button", { name: "Edit", exact: true }).click();
  await selected.getByLabel("Latitude", { exact: true }).fill("34.45");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved.", { exact: true }).first()).toBeAttached();
  // Disable a grouped card: both Baramulla and Achabal pins disappear together.
  const field = cards.filter({
    has: page.getByText("Baramulla & Achabal Field Stations", { exact: true }),
  });
  await field.getByRole("button", { name: "Disable", exact: true }).click();
  const lassipora = cards.filter({
    has: page.getByText("Lassipora Agri-Industrial Hub", { exact: true }),
  });
  await lassipora
    .getByRole("button", { name: "Remove Lassipora Agri-Industrial Hub", exact: true })
    .click();
  await expect(cards).toHaveCount(4);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(cards).toHaveCount(5);
  await publish();
  await publicPage.reload();
  await expect(publicPage.locator("[data-regional-hub]")).toHaveCount(4);
  await live.scrollIntoViewIfNeeded();
  await expect(live).toHaveAttribute("data-map-state", "ready");
  await expect(live.locator(".geographic-pin")).toHaveCount(4);
  await expect(live.getByRole("button", { name: "Locate Baramulla", exact: true })).toHaveCount(0);
  await expect(live.getByRole("button", { name: "Locate Achabal", exact: true })).toHaveCount(0);
  await live.getByRole("button", { name: "Locate Bandipora Field Hub", exact: true }).click();
  await expect(
    live.getByRole("link", { name: "Open Bandipora Field Hub on OpenStreetMap" }),
  ).toHaveAttribute("href", /mlat=34.45&mlon=74.65/);
  await expect(publicPage.getByRole("button", { name: "Show Baramulla", exact: true })).toHaveCount(
    0,
  );
  await expect(publicPage.getByRole("button", { name: "Show Achabal", exact: true })).toHaveCount(
    0,
  );
  console.log(
    "PASS: disable grouped hub removes both pins and its card on both maps; coordinate edits publish; removal undo works",
  );
  // Re-enable restores every location.
  await field.getByRole("button", { name: "Enable", exact: true }).click();
  await publish();
  await publicPage.reload();
  await live.scrollIntoViewIfNeeded();
  await expect(live).toHaveAttribute("data-map-state", "ready");
  await expect(live.locator(".geographic-pin")).toHaveCount(6);
  // A deleted selected hub safely falls back to another active location in the private canvas.
  await page.getByRole("tab", { name: "Page preview", exact: true }).click();
  await expect(page.locator(".admin-visual-loading")).toHaveCount(0);
  await geo.scrollIntoViewIfNeeded();
  await expect(geo).toHaveAttribute("data-map-state", "ready");
  await page.getByRole("button", { name: "Interact", exact: true }).click();
  await geo.getByRole("button", { name: "Locate Bandipora Field Hub", exact: true }).click();
  await page.getByRole("tab", { name: "Regional hubs", exact: true }).click();
  await cards
    .filter({ has: page.getByText("Bandipora Field Hub", { exact: true }) })
    .getByRole("button", { name: "Remove Bandipora Field Hub", exact: true })
    .click();
  await publish();
  await publicPage.reload();
  await live.scrollIntoViewIfNeeded();
  await expect(live).toHaveAttribute("data-map-state", "ready");
  await expect(live.locator(".geographic-pin")).toHaveCount(5);
  await expect(publicPage.locator("[data-regional-hub]")).toHaveCount(4);
  console.log(
    "PASS: re-enable restores pins; delete removes card/pin with safe selection fallback",
  );
  // Trusted validation and page ownership, independent of the browser controls.
  record = (await ref.get()).data();
  const csrf = await ctx.request.get(origin + "/api/admin/csrf"),
    { token } = await csrf.json();
  const invalid = structuredClone(record.draft);
  invalid.regionalHubs[0].locations[0].lat = 100;
  for (const [route, content] of [
    ["contact", invalid],
    ["partnerships", { text: {}, images: {}, regionalHubs: record.draft.regionalHubs }],
  ]) {
    const response = await ctx.request.post(origin + "/api/admin/content/" + route, {
      headers: { origin, "x-csrf-token": token },
      data: { action: "save", revision: record.revision, content },
    });
    assert.equal(response.status(), 422);
  }
  for (const width of [320, 390, 768, 1024, 1440]) {
    await publicPage.setViewportSize({ width, height: 1100 });
    await publicPage.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    assert.equal(
      await publicPage.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  }
  // Disabling or removing everything leaves deliberate, non-crashing empty states.
  for (const row of await cards.all())
    await row.getByRole("button", { name: "Disable", exact: true }).click();
  await publish();
  await publicPage.reload();
  await expect(publicPage.locator("[data-regional-hub]")).toHaveCount(0);
  await expect(live).toHaveAttribute("data-map-state", "empty");
  while (await cards.count())
    await cards
      .first()
      .getByRole("button", { name: /^Remove / })
      .click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved.", { exact: true }).first()).toBeAttached();
  assert.deepEqual((await ref.get()).get("draft.regionalHubs"), []);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: coordinate/page validation, responsive layouts, all-disabled and empty states, no browser errors",
  );
} finally {
  await browser.close();
  for (const doc of (await ref.collection("history").get()).docs.filter(
    (d) => !beforeHistory.has(d.id),
  )) {
    await doc.ref.delete();
    await db.collection("cmsAudit").doc(doc.id).delete();
  }
  if (original) await ref.set(original);
  else await ref.delete();
  console.log("Disposable Contact fixture restored");
}
