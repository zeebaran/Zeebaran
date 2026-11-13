import { expect, test } from "@playwright/test";

test("harvest controls filter a complete search locally, retain URL state and handle empty results", async ({
  page,
}) => {
  test.skip(process.env.E2E_HARVEST_CATALOG !== "1", "Isolated published Gala fixture required.");
  await page.goto("/products?q=gala#variety-portfolio");
  const results = page.locator("#harvest-results article");
  await expect(results).toHaveCount(1);
  await expect(results).toContainText("Gala");
  const requests: string[] = [];
  page.on("request", (request) => {
    if (["fetch", "xhr"].includes(request.resourceType())) requests.push(request.url());
  });
  await page.getByRole("button", { name: "Late Season", exact: true }).click();
  await expect(results).toHaveCount(0);
  await expect(page.locator(".catalog-empty")).toContainText("No late season varieties");
  await expect(page).toHaveURL(/q=gala&season=late#variety-portfolio$/);
  await page.getByRole("button", { name: "Early Season", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(results).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Early Season", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("link", { name: "Show all", exact: true }).click();
  await expect(results).toHaveCount(1);
  expect(requests).toEqual([]);
  await page.goBack();
  await expect(page.getByRole("button", { name: "Early Season", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.reload();
  await expect(results).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Early Season", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
