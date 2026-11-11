import { test, expect } from "@playwright/test";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { emptyCatalog } from "../../features/catalog/model";
const origin = process.env.E2E_ADMIN_EMULATOR_BASE_URL;
const enabled = Boolean(
  origin &&
  /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) &&
  process.env.FIRESTORE_EMULATOR_HOST === "127.0.0.1:8395" &&
  process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:9098",
);
let app: ReturnType<typeof initializeApp> | undefined;
const created: string[] = [];
test.beforeAll(async ({}, info) => {
  test.skip(
    !enabled || info.project.name !== "chromium",
    "Explicit demo-emulator admin server required.",
  );
  app = initializeApp({ projectId: "demo-zeebaran-admin" }, "pagination-" + Date.now());
  const db = getFirestore(app),
    batch = db.batch(),
    prefix = "pagination-" + Date.now();
  for (let i = 0; i < 27; i++) {
    const id = prefix + "-" + i;
    created.push(id);
    batch.create(db.collection("catalogEntries").doc(id), {
      kind: "variety",
      draft: { ...emptyCatalog("variety"), slug: id, name: "Pagination fixture " + i },
      nameSort: "pagination fixture " + String(i).padStart(2, "0"),
      deleted: false,
      published: false,
      revision: 1,
      updatedAt: Timestamp.now(),
    });
  }
  await batch.commit();
});
test.afterAll(async () => {
  if (!app) return;
  const db = getFirestore(app),
    batch = db.batch();
  created.forEach((id) => batch.delete(db.collection("catalogEntries").doc(id)));
  await batch.commit();
  await deleteApp(app);
});
test.beforeEach(async ({ context }) => {
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
  await context.route("https://res.cloudinary.com/**", (route) => route.abort());
});
test("an old catalog page cannot enter a newer search", async ({ page }) => {
  let release = () => {},
    started = () => {};
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route("**/api/admin/catalog?**", async (route) => {
    if (new URL(route.request().url()).searchParams.has("cursor")) {
      const response = await route.fetch();
      started();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({ response });
    } else await route.continue();
  });
  await page.goto(origin + "/admin/catalog?kind=variety");
  await page.getByRole("button", { name: "Load more entries", exact: true }).click();
  await began;
  await page.getByLabel("Search catalog entries").fill("zzzz-no-match");
  await expect(page.locator(".catalog-empty")).toContainText("No matching entries.");
  release();
  await page.waitForTimeout(200);
  await expect(page.locator(".catalog-admin-list article")).toHaveCount(0);
});
const item = (id: string, name: string) => ({
  id,
  revision: 1,
  draft: { name, kind: "rootstock" },
  published: false,
  deleted: false,
  updatedAt: "",
  publishedAt: null,
});
test("an old rootstock page cannot enter a newer relationship search", async ({ page }) => {
  let release = () => {},
    started = () => {};
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route("**/api/admin/catalog?**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.has("cursor")) {
      started();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({ json: { items: [item("old-root", "Old root")], nextCursor: null } });
    } else
      await route.fulfill({
        json: {
          items: [
            item(
              url.searchParams.get("q") ? "fresh-root" : "initial-root",
              url.searchParams.get("q") ? "Fresh root" : "Initial root",
            ),
          ],
          nextCursor: url.searchParams.get("q") ? null : "fixture",
        },
      });
  });
  await page.goto(origin + "/admin/catalog/new?kind=variety");
  await page.locator(".catalog-root-options label").filter({ hasText: "Initial root" }).waitFor();
  await page.getByRole("button", { name: "More rootstocks", exact: true }).click();
  await began;
  await page.getByLabel("Find a rootstock").fill("fresh");
  await expect(page.locator(".catalog-root-options")).toContainText("Fresh root");
  release();
  await page.waitForTimeout(200);
  await expect(page.locator(".catalog-root-options label")).toHaveCount(1);
  await expect(page.locator(".catalog-root-options")).not.toContainText("Old root");
});
test("repeated pagination clicks cannot duplicate original photographs", async ({ page }) => {
  let release = () => {},
    started = () => {};
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  const image = (name: string) => ({
    name,
    alt: name,
    src: "https://res.cloudinary.com/jfiuaflr/image/upload/fixture-" + name + ".png",
  });
  let pages = 0;
  await page.route("**/api/admin/catalog/assets**", async (route) => {
    if (new URL(route.request().url()).searchParams.has("cursor")) {
      pages++;
      started();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({ json: { items: [image("second"), image("first")], nextCursor: null } });
    } else await route.fulfill({ json: { items: [image("first")], nextCursor: "fixture" } });
  });
  await page.goto(origin + "/admin/catalog/new?kind=rootstock");
  await page.getByRole("button", { name: "Choose or upload a photograph", exact: true }).click();
  await page.locator(".catalog-originals > div > button").first().waitFor();
  await page.getByRole("button", { name: "More original photographs", exact: true }).dblclick();
  await began;
  release();
  await expect(page.locator(".catalog-originals > div > button")).toHaveCount(2);
  expect(pages).toBe(1);
});
test("partial media pages and filtered results have accurate empty states", async ({ page }) => {
  await page.route("**/api/admin/media", (route) =>
    route.fulfill({
      json: {
        media: [
          {
            publicId: "fixture",
            src: "https://res.cloudinary.com/jfiuaflr/image/upload/fixture-photo.png",
            name: "Photo",
            alt: "Photo",
            resourceType: "image",
            bytes: 100,
            width: 100,
            height: 100,
          },
        ],
        nextCursor: "more",
      },
    }),
  );
  await page.goto(origin + "/admin/media");
  await page.getByText("Opening the media library…").waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Films", exact: true }).click();
  await expect(page.locator(".admin-empty")).toContainText("No films in the loaded media");
  await expect(page.locator(".admin-empty")).not.toContainText("first film");
  await page.getByRole("button", { name: "Images", exact: true }).click();
  await page.getByLabel("Search media", { exact: true }).fill("not-found");
  await expect(page.locator(".admin-empty")).toContainText("No matches in the loaded media");
});
