import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import members from "../../features/team/members.json";

test("team cards preserve supplied order and open complete accessible profiles", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(page.locator("[data-team-member]")).toHaveCount(6);
  expect(
    await page
      .locator("[data-team-member]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-team-member"))),
  ).toEqual(members.map((m) => m.id));
  for (const member of members) {
    const button = page.getByRole("button", {
      name: "View profile of " + member.name,
      exact: true,
    });
    await button.click();
    const dialog = page.getByRole("dialog", { name: "Profile of " + member.name, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(member.role);
    for (const paragraph of member.biography.split("\n\n"))
      await expect(dialog).toContainText(paragraph);
    for (const specialisation of member.specialisations)
      await expect(dialog).toContainText(specialisation);
    if (member.philosophy) await expect(dialog).toContainText(member.philosophy);
    if (member.vision) await expect(dialog).toContainText(member.vision);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
  }
});
test("team section and profile fit mobile through large screens", async ({ page }) => {
  await page.goto("/about");
  for (const width of [320, 390, 768, 1024, 1440, 2560]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const button = page.getByRole("button", {
      name: "View profile of Mr. Aadil Sheikh",
      exact: true,
    });
    await button.click();
    const dialog = page.getByRole("dialog", { name: "Profile of Mr. Aadil Sheikh", exact: true });
    expect(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
    const bounds = await dialog.boundingBox();
    expect(bounds!.height).toBeLessThanOrEqual(844);
    await dialog.getByRole("button", { name: "Close team profile", exact: true }).click();
    await expect(button).toBeFocused();
  }
  await page.getByRole("button", { name: "View profile of Mr. Hilal Sheikh", exact: true }).click();
  const audit = await new AxeBuilder({ page })
    .include("dialog[open]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});
test("portraits use Cloudinary and missing photographs use reusable placeholders", async ({
  page,
}) => {
  await page.goto("/about");
  const ceo = page.locator('[data-team-member="aadil-sheikh"]');
  await ceo.scrollIntoViewIfNeeded();
  await expect(ceo.locator("img")).toHaveAttribute("src", /^https:\/\/res.cloudinary.com\//);
  for (const member of members.slice(1)) {
    const card = page.locator(`[data-team-member="${member.id}"]`);
    const portrait = card.locator("img");
    // Portraits are editable in the real CMS. A newly uploaded photograph is not a regression.
    if (await portrait.count())
      await expect(portrait).toHaveAttribute("src", /^https:\/\/res.cloudinary.com\//);
    else await expect(card.getByRole("img")).toBeVisible();
  }
});
