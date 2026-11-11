import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { emptyCatalog } from "../features/catalog/model.ts";
if (
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395"
)
  throw Error("Disposable catalog emulators only.");
const origin = "http://127.0.0.1:3370",
  app = initializeApp({ projectId: "demo-zeebaran-admin" }),
  db = getFirestore(app),
  auth = getAuth(app),
  browser = await chromium.launch(),
  results = [];
const cloudUploads = new Set();
const suffix = Date.now().toString(36),
  rootId = "qa-root-" + suffix,
  varietyId = "qa-variety-" + suffix,
  created = [];
const assert = (ok, label) => {
  if (!ok) throw Error(label);
  results.push(label);
};
async function login(context, email, password) {
  const r = await context.request.post(
    "http://127.0.0.1:9098/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key",
    { data: { email, password, returnSecureToken: true } },
  );
  const d = await r.json();
  if (!r.ok()) throw Error("Emulator sign-in failed");
  const token = (await (await context.request.get(origin + "/api/admin/csrf")).json()).token;
  const session = await context.request.post(origin + "/api/admin/session", {
    headers: { origin, "x-csrf-token": token },
    data: { idToken: d.idToken },
  });
  assert(session.ok(), "Server session accepted " + email);
}
async function mutate(context, id, action, record, extra = {}) {
  const token = (await (await context.request.get(origin + "/api/admin/csrf")).json()).token;
  const response = await context.request.post(
    origin + "/api/admin/catalog" + (id ? "/" + id : ""),
    {
      headers: { origin, "x-csrf-token": token },
      data: id ? { action, revision: record.revision, ...extra } : { content: record },
    },
  );
  return { response, data: await response.json() };
}
async function audit(page, label, selector) {
  const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]);
  if (selector) builder.include(selector);
  const r = await builder.analyze();
  if (r.violations.length)
    console.log(
      label,
      JSON.stringify(
        r.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
        null,
        2,
      ),
    );
  assert(!r.violations.length, "Automated accessibility: " + label);
}
try {
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", async (response) => {
    if (
      response.request().method() === "POST" &&
      response.url().includes("/api/admin/catalog") &&
      !response.ok()
    )
      console.log(
        "Catalog request rejected",
        response.status(),
        await response.json().catch(() => ({ error: "Unreadable response" })),
      );
  });
  page.on("response", async (r) => {
    if (r.url().endsWith("/api/admin/media") && r.request().method() === "POST" && r.ok()) {
      const d = await r.json();
      if (d.media?.publicId) cloudUploads.add(d.media.publicId);
    }
  });
  assert(
    (await context.request.get(origin + "/api/admin/catalog")).status() === 401,
    "Anonymous catalog administration denied",
  );
  await login(context, "zeebaran00@gmail.com", "Local-fixture-Only-786!");
  await page.goto(origin + "/admin/catalog?kind=rootstock");
  await audit(page, "catalog index");
  await page.goto(origin + "/admin/catalog/new?kind=rootstock");
  await page.getByLabel("Name", { exact: true }).fill("QA Rootstock " + suffix);
  await page.getByLabel("Permanent URL").fill(rootId);
  await page.getByLabel("Headline", { exact: false }).fill("A {tested} foundation.");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A disposable emulator entry for verifying the complete rootstock workflow.");
  await page.getByLabel("Rootstock code").fill("QA");
  await page.getByLabel("Recommended spacing").fill("Test spacing");
  await page.getByRole("button", { name: "Choose or upload a photograph", exact: true }).click();
  await page.locator(".catalog-originals button").first().waitFor();
  await audit(page, "original image picker");
  await page.locator(".catalog-originals button").first().click();
  await page.getByRole("button", { name: "Choose or upload a photograph", exact: true }).click();
  await page
    .locator(".admin-upload")
    .getByLabel("Alternative text")
    .fill("Kashmir orchard photograph uploaded during verification");
  await page
    .locator(".admin-upload input[type=file]")
    .setInputFiles(".local/media-originals/images/Varrients/Apples/Royal Gala.webp");
  await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 90000 });
  assert(
    (await page.locator(".catalog-image-list article").count()) === 2,
    "Actual signed Cloudinary upload is verified and selected",
  );
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.waitForURL("**/admin/catalog/" + rootId);
  created.push(rootId);
  assert(
    (await (await context.request.get(origin + "/api/catalog/resolve?ids=" + rootId)).json()).items
      .length === 0,
    "New rootstock draft is absent from public reads",
  );
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish entry", exact: true }).click();
  await page.getByRole("status").waitFor();
  let record = (await (await context.request.get(origin + "/api/admin/catalog/" + rootId)).json())
    .record;
  assert(
    record.published,
    "Actual admin create, image selection and publish controls persist a rootstock",
  );
  await audit(page, "rootstock editor");
  await page.screenshot({ path: "/private/tmp/zeebaran-catalog-admin.png" });
  const asset = record.draft.images[0],
    data = {
      ...emptyCatalog("variety"),
      slug: varietyId,
      name: "QA Variety " + suffix,
      headline: "A {tested} variety.",
      intro: "A disposable emulator entry used to verify secure publication and comparison.",
      rootstockIds: [rootId, "m9"],
      images: [asset],
      brix: "Test Brix",
      specifications: [
        { group: "Growing requirements", label: "Water requirement", value: "Managed irrigation" },
      ],
    };
  let r = await mutate(context, null, "save", data);
  assert(r.response.status() === 201, "Create variety through authenticated API");
  created.push(varietyId);
  let variety = r.data.record;
  r = await mutate(context, varietyId, "publish", variety, { content: data });
  assert(r.response.ok(), "Publish variety with validated rootstock relationships");
  variety = r.data.record;
  let pub = await (
    await context.request.get(origin + "/api/catalog/resolve?ids=" + varietyId)
  ).json();
  assert(
    pub.items[0]?.specifications[0]?.value === "Managed irrigation",
    "Arbitrary specifications are retrieved from Firestore",
  );
  r = await mutate(context, rootId, "delete", record, { confirmation: record.draft.name });
  assert(r.response.status() === 409, "Referenced rootstock deletion is blocked");
  r = await mutate(context, rootId, "unpublish", record);
  assert(r.response.status() === 409, "Referenced rootstock unpublication is blocked");
  const changed = { ...data, intro: "Updated description for the emulator regression workflow." };
  r = await mutate(context, varietyId, "save", variety, { content: changed });
  assert(r.response.ok(), "Save an existing variety draft");
  variety = r.data.record;
  pub = await (await context.request.get(origin + "/api/catalog/resolve?ids=" + varietyId)).json();
  assert(pub.items[0].intro === data.intro, "Draft updates do not overwrite publication");
  r = await mutate(context, varietyId, "save", { revision: 0 }, { content: changed });
  assert(r.response.status() === 409, "Conflicting revisions reject lost updates");
  r = await mutate(context, varietyId, "save", variety, {
    content: {
      ...changed,
      images: [{ src: "https://evil.example/unverified.jpg", alt: "Invalid image" }],
    },
  });
  assert(r.response.status() === 422, "Unverified remote images are rejected");
  r = await mutate(context, varietyId, "save", variety, {
    content: {
      ...changed,
      images: [{ src: "/images/../../private.key", alt: "Invalid local file" }],
    },
  });
  assert(r.response.status() === 422, "Unregistered local images are rejected");
  r = await mutate(context, varietyId, "save", variety, {
    content: { ...changed, rootstockIds: [varietyId] },
  });
  assert(r.response.status() === 422, "A variety cannot masquerade as a rootstock relationship");
  const noCsrf = await context.request.post(origin + "/api/admin/catalog/" + varietyId, {
    headers: { origin },
    data: { action: "delete", revision: variety.revision, confirmation: variety.draft.name },
  });
  assert(noCsrf.status() === 403, "CSRF guards catalog mutations");
  r = await mutate(context, varietyId, "publish", variety, { content: changed });
  assert(r.response.ok(), "Publish an updated variety");
  variety = r.data.record;
  pub = await (await context.request.get(origin + "/api/catalog/resolve?ids=" + varietyId)).json();
  assert(pub.items[0].intro === changed.intro, "Publish invalidates cached public data");
  await page.goto(origin + "/products/" + varietyId);
  assert(
    (await page.locator("h1").textContent()).includes("tested"),
    "New variety detail route works without code changes",
  );
  assert(
    (await page.locator("body").textContent()).includes("Water requirement"),
    "Dynamic specification appears on detail profile",
  );
  await page.goto(origin + "/products");
  const rootCards = page.locator("#rootstock-selection article");
  await rootCards
    .filter({ has: page.getByRole("heading", { name: "M9 — High Density", exact: true }) })
    .getByRole("button", { name: /Compare/ })
    .click();
  await rootCards
    .filter({ has: page.getByRole("heading", { name: "M26 — Medium-High Density", exact: true }) })
    .getByRole("button", { name: /Compare/ })
    .click();
  await page
    .locator(".compare-dock")
    .getByRole("link", { name: /Compare/ })
    .click();
  await page.waitForURL("**/products/compare?**");
  await page.locator(".catalog-comparison-table").waitFor();
  assert(
    (await page.locator(".catalog-comparison-table").textContent()).includes("M26"),
    "Comparison uses selected Firestore rootstocks",
  );
  await page.locator(".catalog-picker summary").nth(1).click();
  const picker = page.locator(".catalog-picker").nth(1);
  await picker.getByRole("button", { name: "Rootstocks", exact: true }).click();
  await picker.locator('option[value="m7"]').waitFor({ state: "attached" });
  await picker.locator("select").selectOption("m7");
  await page.waitForURL("**right=m7");
  await page.getByRole("heading", { name: "M7 — Semi-Dwarfing", exact: true }).waitFor();
  assert(true, "Dropdown seamlessly replaces M26 with M7");
  await page.reload();
  await page.getByRole("heading", { name: "M7 — Semi-Dwarfing", exact: true }).waitFor();
  await page.locator(".compare-dock").waitFor({ state: "visible" });
  assert(true, "Comparison persists after reload");
  await audit(page, "side-by-side comparison", ".catalog-comparison");
  await audit(page, "comparison dock", ".compare-dock");
  await page.screenshot({ path: "/private/tmp/zeebaran-catalog-compare.png", fullPage: true });
  await page.getByLabel("Show differences only").check();
  assert(
    (await page.locator(".catalog-comparison-table tr.is-different").count()) > 0,
    "Differences filter retains meaningful differences",
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "Comparison fits " + width + "px",
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/private/tmp/zeebaran-catalog-compare-mobile.png" });
  await page.goto(origin + "/about");
  await page.locator(".compare-dock").waitFor();
  assert(
    await page.locator(".compare-dock").isVisible(),
    "Bottom comparison bar persists across navigation",
  );
  const freshData = { ...changed, rootstockIds: [] };
  r = await mutate(context, varietyId, "save", variety, { content: freshData });
  variety = r.data.record;
  r = await mutate(context, rootId, "delete", record, { confirmation: record.draft.name });
  assert(
    r.response.status() === 409,
    "Published references protect roots even after draft unlinking",
  );
  r = await mutate(context, varietyId, "publish", variety, { content: freshData });
  variety = r.data.record;
  r = await mutate(context, rootId, "delete", record, { confirmation: "wrong name" });
  assert(r.response.status() === 422, "Deletion requires the exact entry name");
  r = await mutate(context, rootId, "delete", record, { confirmation: record.draft.name });
  assert(r.response.ok(), "Unlinked rootstock deletion succeeds");
  record = r.data.record;
  assert(
    (await (await context.request.get(origin + "/api/catalog/resolve?ids=" + rootId)).json()).items
      .length === 0,
    "Deleted rootstocks leave public comparison results",
  );
  r = await mutate(context, rootId, "restore", record);
  assert(
    r.response.ok() && !r.data.record.published,
    "Restore returns a deleted rootstock as a private draft",
  );
  record = r.data.record;
  r = await mutate(context, varietyId, "unpublish", variety);
  assert(r.response.ok(), "Unpublish variety");
  variety = r.data.record;
  assert(
    (await (await context.request.get(origin + "/api/catalog/resolve?ids=" + varietyId)).json())
      .items.length === 0,
    "Unpublished varieties are not publicly retrievable",
  );
  const editorEmail = "catalog-editor@example.test";
  let editor;
  try {
    editor = await auth.getUserByEmail(editorEmail);
  } catch {
    editor = await auth.createUser({
      email: editorEmail,
      emailVerified: true,
      password: "Local-fixture-Only-786!",
    });
  }
  await auth.setCustomUserClaims(editor.uid, { zeebaranRole: "editor" });
  const editorContext = await browser.newContext();
  await login(editorContext, editorEmail, "Local-fixture-Only-786!");
  r = await mutate(editorContext, varietyId, "publish", variety, { content: freshData });
  assert(r.response.status() === 403, "Editor role cannot publish");
  r = await mutate(editorContext, varietyId, "delete", variety, {
    confirmation: variety.draft.name,
  });
  assert(r.response.status() === 403, "Editor role cannot delete");
  r = await mutate(editorContext, varietyId, "save", variety, { content: freshData });
  assert(r.response.ok(), "Editor role can save drafts");
  variety = r.data.record;
  await editorContext.close();
  r = await mutate(context, varietyId, "delete", variety, { confirmation: variety.draft.name });
  assert(r.response.ok(), "Delete variety safely");
  r = await mutate(context, rootId, "delete", record, { confirmation: record.draft.name });
  assert(r.response.ok(), "Remove restored QA draft");
  const raceRootId = "qa-race-root-" + suffix,
    raceVarietyId = "qa-race-variety-" + suffix;
  const raceRoot = {
    ...record.draft,
    slug: raceRootId,
    name: "QA race root " + suffix,
    images: [asset],
  };
  r = await mutate(context, null, "save", raceRoot);
  assert(r.response.ok(), "Prepare race rootstock");
  const raceRootRecord = r.data.record;
  created.push(raceRootId);
  const raceVariety = {
    ...freshData,
    slug: raceVarietyId,
    name: "QA race variety " + suffix,
    rootstockIds: [],
  };
  r = await mutate(context, null, "save", raceVariety);
  assert(r.response.ok(), "Prepare race variety");
  const raceVarietyRecord = r.data.record;
  created.push(raceVarietyId);
  const raceToken = (await (await context.request.get(origin + "/api/admin/csrf")).json()).token,
    headers = { origin, "x-csrf-token": raceToken };
  const race = await Promise.all([
    context.request.post(origin + "/api/admin/catalog/" + raceRootId, {
      headers,
      data: { action: "delete", revision: raceRootRecord.revision, confirmation: raceRoot.name },
    }),
    context.request.post(origin + "/api/admin/catalog/" + raceVarietyId, {
      headers,
      data: {
        action: "save",
        revision: raceVarietyRecord.revision,
        content: { ...raceVariety, rootstockIds: [raceRootId] },
      },
    }),
  ]);
  assert(
    race.filter((r) => r.ok()).length === 1 && race.some((r) => [409, 422].includes(r.status())),
    "Concurrent root deletion and relationship creation cannot both commit",
  );
  const pageIds = [];
  const batch = db.batch();
  for (let i = 0; i < 28; i++) {
    const id = "qa-page-" + suffix + "-" + String(i).padStart(2, "0");
    pageIds.push(id);
    batch.set(db.collection("catalogPublished").doc(id), {
      ...raceRoot,
      slug: id,
      name: "QA page " + i,
      sortOrder: 100 + i,
      nameSort: "qa page " + i,
      revision: 1,
      publishedAt: Timestamp.now(),
    });
  }
  await batch.commit();
  let cursor = null;
  const ids = [];
  do {
    const response = await context.request.get(
      origin +
        "/api/catalog?" +
        new URLSearchParams({ kind: "rootstock", ...(cursor ? { cursor } : {}) }),
    );
    const d = await response.json();
    assert(response.ok() && d.items.length <= 24, "Public catalog pagination is bounded");
    ids.push(...d.items.map((i) => i.id));
    cursor = d.nextCursor;
  } while (cursor);
  assert(
    pageIds.every((id) => ids.includes(id)) && new Set(ids).size === ids.length,
    "Cursor pagination retrieves new entries without duplicates or omissions",
  );
  for (const id of pageIds) await db.collection("catalogPublished").doc(id).delete();
  assert(errors.length === 0, "No browser exceptions during catalog workflows");
  await context.close();
} finally {
  // QA records exist only in the guarded disposable emulator project. Never touch live data.
  for (const id of created) {
    await db.collection("catalogPublished").doc(id).delete();
    await db.collection("catalogEntries").doc(id).delete();
  }
  for (const id of cloudUploads) {
    if (!id.startsWith("zeebaran/") || !process.env.CLOUDINARY_API_SECRET) continue;
    const url =
      "https://api.cloudinary.com/v1_1/" +
      process.env.CLOUDINARY_CLOUD_NAME +
      "/resources/image/upload?" +
      new URLSearchParams({ "public_ids[]": id });
    const removed = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.CLOUDINARY_API_KEY + ":" + process.env.CLOUDINARY_API_SECRET,
          ).toString("base64"),
      },
    });
    if (!removed.ok) console.log("QA upload cleanup requires retry");
    await db.collection("cmsMedia").doc(Buffer.from(id).toString("base64url")).delete();
  }
  await browser.close();
  await fs.writeFile("/private/tmp/zeebaran-catalog-checks.json", JSON.stringify(results, null, 2));
}
console.log(results);
