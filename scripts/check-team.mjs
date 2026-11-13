import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
if (
  process.env.FIREBASE_PROJECT_ID !== "demo-zeebaran-team" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395" ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9098"
)
  throw Error("Guarded disposable team emulators required.");
const origin = "http://127.0.0.1:3370",
  app = initializeApp({ projectId: "demo-zeebaran-team" }),
  auth = getAuth(app),
  db = getFirestore(app);
const authored = JSON.parse(await fs.readFile("features/team/members.json", "utf8"));
for (const [uid, email, role] of [
  ["team-owner", "zeebaran00@gmail.com", "admin"],
  ["team-editor", "team-editor@example.test", "editor"],
]) {
  let u;
  try {
    u = await auth.getUser(uid);
  } catch {
    u = await auth.createUser({
      uid,
      email,
      password: "Team-fixture-Only-786!",
      emailVerified: true,
    });
  }
  await auth.setCustomUserClaims(u.uid, { zeebaranRole: role });
}
const portrait = authored[0].image;
await db
  .collection("cmsMedia")
  .doc(Buffer.from(portrait.publicId).toString("base64url"))
  .set({ ...portrait, name: "aadil-sheikh.webp", category: "team", createdAt: Timestamp.now() });
const original = { text: {}, images: {} };
await db
  .collection("cmsPages")
  .doc("about")
  .set({ revision: 0, draft: original, published: original });
const b = await chromium.launch(),
  c = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" }),
  p = await c.newPage(),
  errors = [],
  checks = [];
p.on("pageerror", (e) => errors.push(e.message));
async function login(context, email) {
  const signed = await context.request.post(
    "http://127.0.0.1:9098/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fixture-api-key",
    { data: { email, password: "Team-fixture-Only-786!", returnSecureToken: true } },
  );
  const { token } = await (await context.request.get(origin + "/api/admin/csrf")).json();
  const session = await context.request.post(origin + "/api/admin/session", {
    headers: { origin, "x-csrf-token": token },
    data: { idToken: (await signed.json()).idToken },
  });
  assert.equal(session.status(), 200);
}
async function post(page, body, context = c) {
  const { token } = await (await context.request.get(origin + "/api/admin/csrf")).json();
  return context.request.post(origin + "/api/admin/content/" + page, {
    headers: { origin, "x-csrf-token": token },
    data: body,
  });
}
async function published() {
  const r = await c.request.get(origin + "/api/admin/content/about?view=record");
  return (await r.json()).record;
}
try {
  assert.equal((await c.request.get(origin + "/api/admin/content/about")).status(), 401);
  await login(c, "zeebaran00@gmail.com");
  await p.goto(origin + "/admin/pages/about");
  await p.getByRole("tab", { name: "Team", exact: true }).click();
  await expect(p.locator("[data-team-editor]")).toHaveCount(6);
  const first = p.locator('[data-team-editor="aadil-sheikh"]');
  await first.locator("summary").click();
  await first
    .getByLabel("Short introduction", { exact: true })
    .fill("A carefully edited leadership introduction for the team regression test.");
  const writes = [];
  p.on("request", (r) => {
    if (r.method() === "POST" && new URL(r.url()).pathname === "/api/admin/content/about")
      writes.push(r.url());
  });
  await p.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(p.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
  assert.equal(writes.length, 1);
  let record = await published();
  assert.equal(
    record.draft.team[0].summary,
    "A carefully edited leadership introduction for the team regression test.",
  );
  assert.equal(record.published.team, undefined);
  checks.push(
    "Six defaults in supplied order; a real UI draft save persists the team without publishing it",
  );
  const publicPage = await c.newPage();
  publicPage.on("pageerror", (e) => errors.push(e.message));
  await publicPage.goto(origin + "/about");
  await expect(publicPage.locator('[data-team-member="aadil-sheikh"]')).not.toContainText(
    "carefully edited",
  );
  await p.getByRole("tab", { name: "Page preview", exact: true }).click();
  const frame = p.frameLocator('iframe[title*="editable website preview"]');
  await expect(frame.locator('[data-team-member="aadil-sheikh"]')).toContainText(
    "carefully edited",
  );
  await frame.locator('[data-team-member="aadil-sheikh"] button').click();
  await expect(p.getByRole("dialog", { name: "Edit website content", exact: true })).toBeVisible();
  await expect(p.getByRole("dialog").locator("[data-team-editor]")).toHaveCount(6);
  await p.getByRole("button", { name: "Close content editor", exact: true }).click();
  checks.push(
    "Visual preview receives the draft immediately and opens the section-wise team editor on click",
  );
  await p.getByRole("button", { name: "Publish", exact: true }).click();
  await p.getByRole("dialog").getByRole("button", { name: "Publish changes", exact: true }).click();
  await expect(p.getByRole("status").filter({ hasText: "Published." })).toBeVisible();
  await publicPage.goto(origin + "/about");
  await expect(publicPage.locator('[data-team-member="aadil-sheikh"]')).toContainText(
    "carefully edited",
  );
  await publicPage
    .getByRole("button", { name: "View profile of Mr. Aadil Sheikh", exact: true })
    .click();
  const profile = publicPage.getByRole("dialog", {
    name: "Profile of Mr. Aadil Sheikh",
    exact: true,
  });
  await expect(profile).toContainText(authored[0].biography.split("\n\n")[3]);
  await expect(profile).toContainText(authored[0].philosophy);
  await expect(profile).toContainText(authored[0].vision);
  const accessibility = await new AxeBuilder({ page: publicPage })
    .include("dialog[open]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    accessibility.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
  );
  await publicPage.keyboard.press("Escape");
  await expect(profile).toHaveCount(0);
  await expect(
    publicPage.getByRole("button", { name: "View profile of Mr. Aadil Sheikh", exact: true }),
  ).toBeFocused();
  checks.push(
    "Publishing updates the website; full biography, philosophy and vision open accessibly and Escape returns focus",
  );
  await p.getByRole("tab", { name: "Team", exact: true }).click();
  const hilal = p.locator('[data-team-editor="hilal-sheikh"]');
  await hilal.locator("summary").click();
  await hilal.getByRole("button", { name: "Move Mr. Hilal Sheikh up", exact: true }).click();
  await expect(p.locator("[data-team-editor]").first()).toHaveAttribute(
    "data-team-editor",
    "hilal-sheikh",
  );
  await hilal.getByLabel("Show this member", { exact: true }).uncheck();
  await p.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(p.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
  record = await published();
  assert.equal(record.draft.team[0].id, "hilal-sheikh");
  assert.equal(record.draft.team[0].enabled, false);
  assert.equal(record.published.team[0].id, "aadil-sheikh");
  await p.getByRole("button", { name: "Publish", exact: true }).click();
  await p.getByRole("dialog").getByRole("button", { name: "Publish changes", exact: true }).click();
  await expect(p.getByRole("status").filter({ hasText: "Published." })).toBeVisible();
  await publicPage.goto(origin + "/about");
  await expect(publicPage.locator("[data-team-member]")).toHaveCount(5);
  await expect(publicPage.locator('[data-team-member="hilal-sheikh"]')).toHaveCount(0);
  checks.push(
    "Reordering and hide controls persist privately, then update public cards only after publishing",
  );
  await p.getByRole("button", { name: "Add member", exact: true }).click();
  const added = p.locator("[data-team-editor]").last();
  await added.getByLabel("Name", { exact: true }).fill("Newly added team member");
  await added.getByLabel("Designation", { exact: true }).fill("Orchard specialist");
  await added
    .getByLabel("Short introduction", { exact: true })
    .fill("A newly added specialist in the managed team.");
  await added
    .getByLabel("Full biography", { exact: true })
    .fill("A full biography supplied through the real team editor.");
  await added.getByRole("button", { name: "Choose or upload portrait", exact: true }).click();
  await expect(
    p.getByRole("dialog", { name: "Choose a team portrait", exact: true }),
  ).toBeVisible();
  await expect(p.getByRole("combobox")).toHaveValue("team");
  await p
    .getByRole("button", { name: /aadil-sheikh.webp/ })
    .first()
    .click();
  await expect(added.locator("img")).toHaveCount(1);
  await p.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(p.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
  record = await published();
  assert.equal(record.draft.team.at(-1).image.publicId, portrait.publicId);
  await added.getByRole("button", { name: "Use placeholder", exact: true }).click();
  await added.getByRole("button", { name: "Remove Newly added team member", exact: true }).click();
  await expect(p.locator("[data-team-editor]")).toHaveCount(6);
  await p.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(p.locator("[data-team-editor]")).toHaveCount(7);
  await p.locator("[data-team-editor]").last().locator("summary").click();
  await p
    .locator("[data-team-editor]")
    .last()
    .getByRole("button", { name: "Remove Newly added team member", exact: true })
    .click();
  await p.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(p.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
  assert.equal(
    (
      await db
        .collection("cmsMedia")
        .doc(Buffer.from(portrait.publicId).toString("base64url"))
        .get()
    ).exists,
    true,
  );
  checks.push(
    "Add member, verified-library portrait selection, placeholder, remove and undo work; media is never deleted with a profile",
  );
  record = await published();
  const bad = {
    ...record.draft,
    team: record.draft.team.map((m, i) =>
      i ? m : { ...m, image: { ...portrait, publicId: "not-registered" } },
    ),
  };
  assert.equal(
    (await post("about", { action: "save", revision: record.revision, content: bad })).status(),
    422,
  );
  assert.equal(
    (
      await post("home", {
        action: "save",
        revision: 0,
        content: { text: {}, images: {}, team: authored },
      })
    ).status(),
    422,
  );
  assert.equal(
    (await post("about", { action: "save", revision: 0, content: record.draft })).status(),
    409,
  );
  const editor = await b.newContext();
  await login(editor, "team-editor@example.test");
  assert.equal(
    (
      await post(
        "about",
        { action: "publish", revision: record.revision, content: record.draft },
        editor,
      )
    ).status(),
    403,
  );
  await editor.close();
  checks.push(
    "Unregistered portraits, cross-page team payloads, stale revisions and editor publishing are rejected",
  );
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks, browserErrors: errors }, null, 2));
} finally {
  await b.close();
}
