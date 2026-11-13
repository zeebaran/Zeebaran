import { expect, test } from "@playwright/test";
import { homeAbility } from "../../lib/home-ability";
import { textKey } from "../../features/cms/model";

test("Home capabilities change their copy without shifting the controls or making requests", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const section = page.locator(".home-ability-tabs");
  await section.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "fetch" || request.resourceType() === "xhr")
      requests.push(request.url());
  });
  for (const width of [360, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    // WebKit applies viewport media queries on its next rendering frame.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const buttons = section.getByRole("tab");
    const top = await section
      .locator(".home-ability-controls")
      .evaluate(
        (el) =>
          el.getBoundingClientRect().top -
          el.closest(".home-ability-tabs")!.getBoundingClientRect().top,
      );
    for (const [index, item] of homeAbility.entries()) {
      await buttons.nth(index).click();
      await expect(buttons.nth(index)).toHaveAttribute("aria-selected", "true");
      const panel = section.getByRole("tabpanel");
      await expect(panel).toHaveCount(1);
      await expect(panel).toContainText(item.paragraphs[0]);
      await expect(panel).toContainText(item.paragraphs[1]);
      await expect(section.locator("blockquote:visible")).toContainText(item.quote);
      expect(
        await section
          .locator(".home-ability-controls")
          .evaluate(
            (el) =>
              el.getBoundingClientRect().top -
              el.closest(".home-ability-tabs")!.getBoundingClientRect().top,
          ),
      ).toBeCloseTo(top, 0);
      expect(await buttons.nth(index).evaluate((el) => getComputedStyle(el).fontWeight)).toBe(
        "700",
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1);
    }
  }
  await section.getByRole("tab").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(section.getByRole("tab").nth(1)).toBeFocused();
  await expect(section.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(section.getByRole("tab").last()).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(section.getByRole("tab").first()).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(section.getByRole("tab").last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(section.getByRole("tab").first()).toBeFocused();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test("Home CTA is clear and map marker respects reduced motion", async ({ page }) => {
  await page.goto("/");
  const legacy = page.locator("#legacy");
  await legacy.scrollIntoViewIfNeeded();
  const filters = await legacy.locator("*").evaluateAll((elements) =>
    elements
      .map((el) => ({
        blur: getComputedStyle(el).backdropFilter,
        filter: getComputedStyle(el).filter,
      }))
      .filter((style) => style.blur.includes("blur") || style.filter.includes("blur")),
  );
  expect(filters).toEqual([]);
  const marker = page.locator(".himalayas-marker-ripple");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await marker.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "himalayas-ripple",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await marker.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  const label = page.locator("#himalayas text").filter({ hasText: "THE HIMALAYAN BELT" });
  await expect(label).toHaveAttribute("y", "64");
});

test("new selection copy remains connected to CMS overrides", async ({ page }) => {
  await page.goto("/");
  await page.locator(".home-ability-tabs").getByRole("tab").nth(3).click();
  await expect(
    page.locator(".home-ability-tabs [role=tabpanel]:visible [data-cms-field]").first(),
  ).toHaveAttribute("data-cms-field", textKey(homeAbility[3].paragraphs[0]));
});
