import { test, expect } from "@playwright/test";
import { governanceCopy } from "../../lib/governance-content";

test("Governance explains joining the team, fits every viewport and connects to people and careers", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/governance");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("h1")).toContainText("Good people. Shared purpose.");
  await expect(page.locator("main")).toContainText("The CEO, division heads, and team leaders");
  await expect(page.locator("main")).toContainText("Working at Zeebaran");
  await expect(page.locator("main")).toContainText("Raising Concerns");
  await expect(page.locator("main")).not.toContainText("Board & investor oversight");
  const sketch = page.locator("main section").first().locator("svg");
  await expect(sketch).toHaveAttribute("aria-hidden", "true");
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(sketch).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    const bounds = await sketch.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    if (width < 1024) {
      const gap = await sketch.evaluate((illustration, careersHref) => {
        const careersLink = illustration.closest("section")?.querySelector(careersHref);
        if (!careersLink) throw new Error("Governance careers link is missing");
        return (
          illustration.getBoundingClientRect().top - careersLink.getBoundingClientRect().bottom
        );
      }, 'a[href="/contact?reason=careers#write"]');
      expect(gap).toBeGreaterThan(0);
    }
  }
  await page.getByRole("link", { name: governanceCopy.hero.peopleLink }).click();
  await expect(page).toHaveURL(/\/about#team$/);
  await expect(page.locator("#team")).toContainText("People behind");
  await page.goto("/governance");
  await page.getByRole("link", { name: governanceCopy.hero.careersLink }).click();
  await expect(page).toHaveURL(/\/contact\?reason=careers#write$/);
  await expect(page.locator('select[name="reason"]')).toHaveValue("careers");
  expect(errors).toEqual([]);
});
