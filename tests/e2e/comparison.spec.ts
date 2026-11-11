import { test, expect } from "@playwright/test";
const available = Boolean(process.env.E2E_BASE_URL || process.env.E2E_CATALOG);
test.beforeEach(() =>
  test.skip(
    !available,
    "Comparison data workflows require the isolated Firebase test app or a configured read-only catalog.",
  ),
);
test("cleared and removed shared selections stay cleared after reload", async ({ page }) => {
  await page.goto("/products/compare?left=gala&right=fuji");
  await expect(page.locator(".compare-dock-choices button")).toHaveCount(2);
  await page.getByRole("button", { name: "Remove Gala from comparison" }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("left")).toBe("fuji");
  await expect.poll(() => new URL(page.url()).searchParams.has("right")).toBe(false);
  await page.getByRole("button", { name: "Clear comparison", exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.has("left")).toBe(false);
  await page.reload();
  await expect(page.locator(".compare-dock")).toHaveCount(0);
});
test("late rootstock pagination cannot enter the varieties selector", async ({ page, request }) => {
  const roots = (await (await request.get("/api/catalog?kind=rootstock")).json()).items;
  const varieties = (await (await request.get("/api/catalog?kind=variety")).json()).items;
  let release: () => void = () => {};
  let markStarted: () => void = () => {};
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  await page.route("**/api/catalog?**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.has("cursor")) {
      markStarted();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({
        json: { items: [roots.find((item: { id: string }) => item.id === "m7")], nextCursor: null },
      });
      return;
    }
    const rootstock = url.searchParams.get("kind") === "rootstock";
    await route.fulfill({
      json: {
        items: rootstock ? roots.filter((item: { id: string }) => item.id !== "m7") : varieties,
        nextCursor: rootstock ? "fixture-cursor" : null,
      },
    });
  });
  await page.goto("/products/compare?left=m9&right=m26");
  const picker = page.locator(".catalog-picker").nth(1);
  await picker.locator("summary").click();
  await expect(picker.locator("select option[value=m9]")).toBeAttached();
  await picker.getByRole("button", { name: "More selections" }).click();
  await started;
  await picker.getByRole("button", { name: "Varieties", exact: true }).click();
  await expect(picker.locator("select option[value=gala]")).toBeAttached();
  release();
  await page.waitForTimeout(250);
  await expect(picker.locator("select option[value=m7]")).toHaveCount(0);
});
