// Run only against disposable local emulators and the dedicated QA server. Never loads .env.local.
import { chromium, expect } from "@playwright/test";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { missionVideoCards } from "../features/cms/mission-videos.ts";
import fs from "node:fs/promises";
if (
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395" ||
  process.env.FIREBASE_PROJECT_ID !== "demo-zeebaran-admin"
)
  throw Error("Use only the explicit isolated demo emulators.");
const origin =
    process.argv.find((value) => value.startsWith("--origin="))?.slice(9) ||
    "http://127.0.0.1:3388",
  db = getFirestore(initializeApp({ projectId: "demo-zeebaran-admin" })),
  browser = await chromium.launch(),
  results = [],
  originals = new Map(),
  card = missionVideoCards[0],
  movie = "https://www.youtube-nocookie.com/embed/abcdefghijk";
if (!/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin))
  throw Error("Use an explicit local QA server.");
const check = (ok, message) => {
  if (!ok) throw Error(message);
  results.push(message);
};
const fixtureId = "zeebaran/isolated-mission-card-check",
  fixtureSrc = "https://res.cloudinary.com/jfiuaflr/video/upload/isolated-mission-card-check.mp4",
  fixtureRef = db.collection("cmsMedia").doc(Buffer.from(fixtureId).toString("base64url"));
let originalMedia;

try {
  originalMedia = (await fixtureRef.get()).data();
  await fixtureRef.set({
    publicId: fixtureId,
    src: fixtureSrc,
    resourceType: "video",
    width: 1280,
    height: 720,
    bytes: 100,
    alt: "Isolated video fixture",
    name: "Isolated mission clip",
    createdAt: Timestamp.now(),
  });
  for (const page of ["home", "mission"]) {
    const ref = db.collection("cmsPages").doc(page);
    originals.set(page, (await ref.get()).data());
    await ref.set({
      revision: 0,
      draft: { text: {}, images: {} },
      published: {
        text: {},
        images: {},
        video: { kind: "youtube", src: movie, title: "Obsolete generic film" },
      },
      updatedAt: Timestamp.now(),
      publishedAt: Timestamp.now(),
    });
  }
  const ctx = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      reducedMotion: "reduce",
    }),
    page = await ctx.newPage(),
    errors = [];
  page.setDefaultTimeout(15000);
  await ctx.route("https://res.cloudinary.com/**", (route) => route.abort());
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/admin/login");
  await page.locator("input[type=email]").fill("zeebaran00@gmail.com");
  await page.locator("input[type=password]").fill("Local-fixture-Only-786!");
  await page.getByRole("button", { name: "Open the editorial desk" }).click();
  await page.waitForURL(origin + "/admin");
  await page.goto(origin + "/admin/pages/home");
  check(
    (await page.getByRole("tab", { name: "Film & video" }).count()) === 0,
    "Home has no generic video tab",
  );
  check((await page.locator("[data-video-editor]").count()) === 0, "Home has no video placements");
  check(
    (await page.getByRole("tab", { name: "Video upload", exact: true }).count()) === 0,
    "Video upload is absent from pages without video cards",
  );
  const publicContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    }),
    publicPage = await publicContext.newPage();
  await publicContext.addInitScript(() => {
    window.YT = {
      Player: class {
        constructor(frame, options) {
          this.state = 1;
          this.options = options;
          this.frame = frame;
          window.__missionPlayers ||= [];
          window.__missionPlayers.push(this);
          setTimeout(() => options.events.onReady({ target: this }), 0);
        }
        getPlayerState() {
          return this.state;
        }
        playVideo() {
          this.state = 1;
          this.options.events.onStateChange({ data: 1 });
        }
        pauseVideo() {
          this.state = 2;
          this.options.events.onStateChange({ data: 2 });
        }
        destroy() {}
      },
    };
  });
  let embedsRequested = 0;
  await publicContext.route("https://www.youtube-nocookie.com/**", async (route) => {
    embedsRequested++;
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Isolated player response</title><p>Embed requested after Watch.</p>",
    });
  });
  await publicPage.goto(origin, { waitUntil: "networkidle" });
  check(
    (await publicPage.locator('iframe[src*="youtube"],video,.cms-film').count()) === 0,
    "A previously published Home film is not rendered",
  );
  await page.goto(origin + "/admin/pages/mission");
  await page.getByRole("tab", { name: "Words & story" }).click();
  check(
    (await page.getByRole("tab", { name: "Film & video" }).count()) === 0,
    "Mission has no generic video tab",
  );
  check(
    (await page.locator("[data-video-editor]").count()) === 0,
    "Words & story stays focused on text without video cards",
  );
  check(
    (await page.getByRole("region", { name: "Mission page text" }).locator("textarea").count()) ===
      2,
    "Mission has exactly two general copy fields",
  );
  check(
    (await page.getByText("Other page text", { exact: true }).count()) === 0,
    "Mission has no extra generic text list",
  );
  await page
    .getByLabel("Hero heading", { exact: true })
    .fill("Work that speaks\nWith a clear purpose.");
  await page
    .getByLabel("Introduction", { exact: true })
    .fill("A deliberately edited introduction for our field work.");
  await page.getByRole("tab", { name: "Video upload", exact: true }).click();
  await expect(page.getByRole("tabpanel", { name: "Video upload" })).toBeVisible();
  check(
    (await page.locator("[data-video-editor]").count()) === 2,
    "Video upload opens the section's video cards directly",
  );
  check(
    (await page
      .locator('[data-video-editor="' + card.id + '"]')
      .getByText(card.id, { exact: true })
      .count()) === 1,
    "Card references appear inside their own card editor",
  );
  const editor = page.locator('[data-video-editor="' + card.id + '"]');
  await editor
    .getByLabel("Video title", { exact: true })
    .fill("An orchard installation, explained");
  await editor
    .getByLabel("Description", { exact: true })
    .fill("How the team prepares rootstock and builds the planting structure.");
  await editor.getByLabel("YouTube video link").fill("https://youtu.be/abcdefghijk");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved." }).waitFor();
  let record = (await (await ctx.request.get(origin + "/api/admin/content/mission")).json()).record;
  check(
    record.draft.missionSections.orchard[0].video.src === movie,
    "Saving a card normalizes its source in Firestore",
  );
  check(
    record.draft.missionSections.orchard[0].title === "An orchard installation, explained",
    "Card title persists with its section",
  );
  await publicPage.goto(origin + "/mission", { waitUntil: "networkidle" });
  check(
    !(await publicPage.locator('[data-video-card="' + card.id + '"]').innerText()).includes(
      "An orchard installation, explained",
    ),
    "Saving a draft does not change the public Mission card",
  );
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Published. The website now uses this revision." })
    .waitFor();
  await publicPage.reload({ waitUntil: "networkidle" });
  let publicCard = publicPage.locator('[data-video-card="' + card.id + '"]');
  await expect(publicPage.getByRole("heading", { level: 1 })).toContainText(
    "With a clear purpose.",
  );
  await expect(
    publicPage.getByText("A deliberately edited introduction for our field work.", { exact: true }),
  ).toBeVisible();
  results.push("The two hero fields save and publish with the existing heading accent");

  async function filledRows(section) {
    return publicPage.locator('[data-video-section="' + section + '"]').evaluateAll((cards) => {
      const outer = cards[0].parentElement.parentElement.getBoundingClientRect(),
        rows = [];
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        let row = rows.find((r) => Math.abs(r.top - rect.top) < 2);
        if (!row) {
          row = { top: rect.top, left: rect.left, right: rect.right };
          rows.push(row);
        } else {
          row.left = Math.min(row.left, rect.left);
          row.right = Math.max(row.right, rect.right);
        }
      }
      return rows.every(
        (row) => Math.abs(row.left - outer.left) < 2 && Math.abs(row.right - outer.right) < 2,
      );
    });
  }
  for (const section of ["orchard", "process", "demos"])
    check(await filledRows(section), "Two-card rows fill the " + section + " section");

  await expect(
    publicCard.getByRole("heading", { name: "An orchard installation, explained" }),
  ).toBeVisible();
  await expect(
    publicCard.getByText("How the team prepares rootstock and builds the planting structure.", {
      exact: true,
    }),
  ).toBeVisible();
  check(
    (await publicPage.locator("iframe,video").count()) === 0 && embedsRequested === 0,
    "Configured videos make no player requests before Watch",
  );
  await publicCard
    .getByRole("button", { name: "Play An orchard installation, explained", exact: true })
    .click();
  await expect(publicCard.locator("iframe")).toHaveAttribute(
    "src",
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/abcdefghijk\?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=/,
  );
  check(
    (await publicPage.locator("iframe").count()) === 1,
    "Watch opens the player inside the selected card only",
  );
  await publicCard
    .getByRole("button", { name: "Pause An orchard installation, explained" })
    .click();
  await expect(
    publicCard.getByRole("button", { name: "Resume An orchard installation, explained" }),
  ).toBeVisible();
  check(
    (await publicPage.locator("iframe").count()) === 1,
    "Pause preserves the video and playback position",
  );
  check(
    await publicPage.evaluate(() => window.__missionPlayers[0].getPlayerState() === 2),
    "Pause calls the provider pause command",
  );
  await publicCard
    .getByRole("button", { name: "Resume An orchard installation, explained" })
    .click();
  await expect(publicCard.locator('[data-video-action="pause"]')).toBeVisible();
  check(
    await publicPage.evaluate(() => window.__missionPlayers[0].getPlayerState() === 1),
    "Resume calls the provider play command",
  );
  await publicPage.evaluate(() => window.__missionPlayers[0].pauseVideo());
  await expect(
    publicCard.getByRole("button", { name: "Resume An orchard installation, explained" }),
  ).toBeVisible();
  results.push("Provider-native pause events update the card control");
  const token = async () =>
    (await (await ctx.request.get(origin + "/api/admin/csrf")).json()).token;
  const post = async (content, target = "mission") => {
    const r = await ctx.request.get(origin + "/api/admin/content/" + target),
      record = (await r.json()).record;
    return ctx.request.post(origin + "/api/admin/content/" + target, {
      headers: { origin, "x-csrf-token": await token() },
      data: { action: "save", revision: record.revision, content },
    });
  };
  record = (await (await ctx.request.get(origin + "/api/admin/content/mission")).json()).record;
  const editFirst = (patch) => ({
    ...record.draft,
    missionSections: {
      ...record.draft.missionSections,
      orchard: record.draft.missionSections.orchard.map((entry, index) =>
        index === 0 ? { ...entry, ...patch } : entry,
      ),
    },
  });
  const duplicate = structuredClone(record.draft);
  duplicate.missionSections.demos[0].id = duplicate.missionSections.orchard[0].id;
  const captured = JSON.parse(await fs.readFile("features/cms/catalog.generated.json", "utf8"));
  const lockedKey = captured.mission.fields.find((field) => field.value === "ZB-OI-01").key;
  const lockedMission = {
    ...record.draft,
    text: { ...record.draft.text, [lockedKey]: "Injected" },
  };
  for (const [name, content, target] of [
    ["Non-video pages reject Mission sections", record.draft, "home"],
    ["Structural card references cannot be edited through the API", lockedMission],
    ["Duplicate card IDs are rejected", duplicate],
    [
      "Invalid video links are rejected",
      editFirst({ video: { kind: "youtube", src: "javascript:alert(1)" } }),
    ],
    [
      "Unverified Cloudinary videos are rejected",
      editFirst({
        video: {
          kind: "cloudinary",
          src: "https://res.cloudinary.com/jfiuaflr/video/upload/not-registered.mp4",
        },
      }),
    ],
    ["Configured videos require meaningful titles", editFirst({ title: "" })],
    [
      "Sections cannot be empty",
      { ...record.draft, missionSections: { ...record.draft.missionSections, orchard: [] } },
    ],
  ]) {
    const r = await post(content, target);
    check(r.status() === 422, name);
  }
  const additions = [];
  for (const [section, label] of [
    ["orchard", "Orchard Installations"],
    ["process", "Installation Process"],
    ["demos", "Demonstrations & Proof"],
  ]) {
    await page.getByRole("button", { name: new RegExp("^" + label) }).click();
    await page.getByRole("button", { name: "Add video", exact: true }).click();
    const added = page.locator("[data-video-editor]").last();
    const id = await added.getAttribute("data-video-editor");
    await added.getByLabel("Video title", { exact: true }).fill("New " + section + " film");
    await added
      .getByLabel("Description", { exact: true })
      .fill("An independently authored story for " + section + ".");
    await added.getByLabel("YouTube video link").fill(movie);
    additions.push({ section, label, id });
  }
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved." }).waitFor();
  await publicPage.reload({ waitUntil: "networkidle" });
  check(
    (await publicPage.locator("[data-video-card]").count()) === 6,
    "New draft cards remain private",
  );
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Published. The website now uses this revision." })
    .waitFor();
  await publicPage.reload({ waitUntil: "networkidle" });
  for (const { section, id } of additions) {
    check(
      (await publicPage.locator('[data-video-section="' + section + '"]').count()) === 3,
      "New cards publish in the " + section + " section",
    );
    check(
      await filledRows(section),
      "Three-card rows fill the " + section + " section without gaps",
    );
    await expect(publicPage.locator('[data-video-card="' + id + '"]')).toContainText(
      "New " + section + " film",
    );
  }
  for (const { section, label, id } of additions) {
    await page.getByRole("button", { name: new RegExp("^" + label) }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .locator('[data-video-editor="' + id + '"]')
      .getByRole("button", { name: /Remove card/ })
      .click();
    check(
      (await page.locator("[data-video-editor]").count()) === 2,
      "Removing a draft card preserves two defaults in " + section,
    );
  }
  await page.getByRole("button", { name: /^Orchard Installations/ }).click();
  const secondEditor = page.locator('[data-video-editor="' + missionVideoCards[1].id + '"]');
  await secondEditor.getByRole("button", { name: "Choose or upload video" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Isolated mission clip/ })
    .click();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Published. The website now uses this revision." })
    .waitFor();
  const libraryRecord = (
    await (await ctx.request.get(origin + "/api/admin/content/mission")).json()
  ).record;
  check(
    libraryRecord.published.missionSections.orchard[1].video.src === fixtureSrc,
    "Library selection is saved to its own Mission card",
  );
  let releaseVideo;
  await publicContext.route(
    fixtureSrc,
    (route) =>
      new Promise((resolve) => {
        releaseVideo = () => route.abort().then(resolve);
      }),
  );
  await publicPage.reload({ waitUntil: "networkidle" });
  const secondPublic = publicPage.locator('[data-video-card="' + missionVideoCards[1].id + '"]');
  check(
    (await publicPage.locator("video").count()) === 0,
    "Cloudinary video is not created before Watch",
  );
  await secondPublic
    .getByRole("button", { name: "Play " + missionVideoCards[1].title, exact: true })
    .click();
  await expect(secondPublic.locator("video")).toBeVisible();
  check(
    (await secondPublic.locator("video").getAttribute("preload")) === "none",
    "Cloudinary player uses preload none inside its card",
  );
  await expect.poll(() => !!releaseVideo).toBe(true);
  await releaseVideo();
  await expect(secondPublic.getByRole("alert")).toHaveText(
    "The video could not load. Please try again.",
  );
  results.push("Failed Cloudinary delivery leaves a readable retry state");
  await page.setViewportSize({ width: 390, height: 844 });
  await editor.scrollIntoViewIfNeeded();
  check(
    !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
    "Mission card editor fits a narrow screen",
  );
  await page.screenshot({ path: "/private/tmp/zeebaran-mission-card-editor-mobile.png" });
  await publicPage.setViewportSize({ width: 390, height: 844 });
  await publicCard.scrollIntoViewIfNeeded();
  check(
    !(await publicPage.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
    "Public Mission cards fit a narrow screen",
  );
  await publicPage.screenshot({ path: "/private/tmp/zeebaran-mission-card-mobile.png" });
  await editor.getByRole("button", { name: "Remove video", exact: true }).click();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Published. The website now uses this revision." })
    .waitFor();
  await publicPage.reload({ waitUntil: "networkidle" });
  publicCard = publicPage.locator('[data-video-card="' + card.id + '"]');
  await expect(
    publicCard.getByRole("button", { name: "Watch An orchard installation, explained" }),
  ).toBeDisabled();
  check(
    (await publicCard.locator("iframe,video").count()) === 0,
    "Removing a video restores the original placeholder and preserves its copy",
  );
  await page.getByRole("button", { name: /^Demonstrations & Proof/ }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .locator("[data-video-editor]")
    .last()
    .getByRole("button", { name: /Remove card/ })
    .click();
  check(
    (await page.locator("[data-video-editor]").count()) === 1,
    "A section can be reduced to one card",
  );
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Published. The website now uses this revision." })
    .waitFor();
  await publicPage.setViewportSize({ width: 1280, height: 900 });
  await publicPage.reload({ waitUntil: "networkidle" });
  check(
    (await publicPage.locator('[data-video-section="demos"]').count()) === 1 &&
      (await filledRows("demos")),
    "A single published demonstration fills the entire row",
  );
  await publicPage
    .locator('[data-video-section="demos"]')
    .screenshot({ path: "/private/tmp/zeebaran-single-demonstration.png" });
  check(errors.length === 0, "No admin JavaScript errors");
  console.log(results);
  await fs.writeFile(
    "/private/tmp/zeebaran-mission-video-results.json",
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
  if (originalMedia) await fixtureRef.set(originalMedia);
  else await fixtureRef.delete();
  for (const [page, data] of originals) {
    const ref = db.collection("cmsPages").doc(page);
    if (data) await ref.set(data);
    else await ref.delete();
  }
}
