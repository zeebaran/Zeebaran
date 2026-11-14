import { test, expect, type Page } from "@playwright/test";
import { governanceCopy } from "../../lib/governance-content";

// Bound individual browser operations so CI identifies the stalled operation,
// rather than exhausting the entire test budget without a useful call log.
test.use({ actionTimeout: 15000, navigationTimeout: 30000 });

async function openGovernance(page: Page) {
  await page.goto("/governance", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toContainText("Good people. Shared purpose.");
}

test("Governance explains joining the team and responsibilities", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openGovernance(page);
  await expect(page.locator("main")).toContainText("The CEO, division heads, and team leaders");
  await expect(page.locator("main")).toContainText("Working at Zeebaran");
  await expect(page.locator("main")).toContainText("Raising Concerns");
  await expect(page.locator("main")).not.toContainText("Board & investor oversight");
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`Governance sketch and copy fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openGovernance(page);
    // Poll a serializable state with a deadline. Returning fonts.ready from
    // evaluate leaves a native FontFaceSet promise outside assertion timeouts.
    await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe("loaded");
    const sketch = page.locator("main section").first().locator("svg");
    await expect(sketch).toHaveAttribute("aria-hidden", "true");
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
  });
}

test("Governance people link opens the team section", async ({ page }) => {
  await openGovernance(page);
  await page.getByRole("link", { name: governanceCopy.hero.peopleLink }).click();
  await expect(page).toHaveURL(/\/about#team$/);
  await expect(page.locator("#team")).toContainText("People behind");
});

test("Governance careers link selects the careers enquiry", async ({ page }) => {
  await openGovernance(page);
  await page.getByRole("link", { name: governanceCopy.hero.careersLink }).click();
  await expect(page).toHaveURL(/\/contact\?reason=careers#write$/);
  await expect(page.locator('select[name="reason"]')).toHaveValue("careers");
});
