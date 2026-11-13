import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  test.skip(
    process.env.E2E_HARVEST_CATALOG !== "1",
    "Published Gala and rootstock fixtures required.",
  );
});

test("variety autocomplete matches a partial alias and supports keyboard selection", async ({
  page,
}) => {
  await page.goto("/products#variety-portfolio");
  const field = page.getByRole("combobox", { name: "Search varieties" });
  await expect(page.getByText("Search varieties", { exact: true })).toBeVisible();
  const requests: string[] = [];
  page.on("request", (request) => {
    if (
      request.url().includes("/api/catalog") ||
      request.url().includes("firestore.googleapis.com")
    ) {
      requests.push(request.url());
    }
  });
  await field.pressSequentially("Roy Ga");
  const option = page.getByRole("option", { name: /Gala.*Royal Gala/ });
  await expect(option).toBeVisible();
  await field.press("Escape");
  await expect(option).toBeHidden();
  await field.press("ArrowDown");
  await expect(option).toHaveAttribute("aria-selected", "true");
  expect(requests).toEqual([]);
  await field.press("Enter");
  await expect(page).toHaveURL(/\/products\/gala$/);
});

test("rootstock autocomplete fits a narrow touch screen and can open a result", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 720 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("/products#rootstock-selection");
    const field = page.getByRole("combobox", { name: "Search rootstocks" });
    await field.fill("m");
    const list = page.getByRole("listbox", { name: "Search rootstocks suggestions" });
    await expect(list).toBeVisible();
    const box = await list.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    await field.fill("zzzz");
    await expect(page.getByText("No matching suggestions.")).toBeVisible();
    await field.fill("m2");
    await list.getByRole("option", { name: /M26/ }).tap();
    await expect(page).toHaveURL(/\/products\/rootstocks\/m26$/);
  } finally {
    await context.close();
  }
});

test("Enter applies a full search and preserves the other section and harvest filter", async ({
  page,
}) => {
  await page.goto("/products?rootQ=M9&season=early#variety-portfolio");
  const field = page.getByRole("combobox", { name: "Search varieties" });
  await field.fill("gal");
  await field.press("Enter");
  await expect(page).toHaveURL(/q=gal/);
  expect(new URL(page.url()).searchParams.get("season")).toBe("early");
  await expect(page.getByRole("combobox", { name: "Search rootstocks" })).toHaveValue("M9");
  const cards = page.locator("#harvest-results article");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Gala");
  await page.getByLabel("Clear variety search").click();
  await expect(field).toHaveValue("");
  expect(new URL(page.url()).searchParams.has("q")).toBe(false);
});
