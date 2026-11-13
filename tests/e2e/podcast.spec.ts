import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const origin = process.env.E2E_PODCAST_BASE_URL;
test.beforeEach(async () => test.skip(!origin, "Disposable Podcast emulator preview only"));
test("episode selection, filters and search stay local and use a single on-demand player", async ({
  page,
}) => {
  let apiReads = 0;
  page.on("request", (r) => {
    if (r.url().includes("/api/")) apiReads++;
  });
  await page.route("https://www.youtube.com/iframe_api", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: "window.YT={Player:class {constructor(frame,options){this.frame=frame;setTimeout(()=>options.events.onReady({target:this}),0)}destroy(){}playVideo(){}pauseVideo(){}getPlayerState(){return 1}}};window.onYouTubeIframeAPIReady?.();",
    }),
  );
  await page.route("https://www.youtube-nocookie.com/embed/**", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Isolated player fixture</title><p>Player fixture</p>",
    }),
  );
  await page.goto(origin + "/podcast");
  await expect(page.getByRole("heading", { name: "Bazm-e-Khayal", exact: true })).toBeVisible();
  expect(await page.content()).not.toContain("PRIVATE DRAFT FIXTURE");
  await expect(page.locator('iframe[src*="youtube-nocookie"]')).toHaveCount(0);
  const before = apiReads;
  await page
    .getByRole("button", { name: "Select Fixture: Questions from the orchard", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Play Fixture: Questions from the orchard", exact: true })
    .click();
  await expect(page.locator('iframe[src*="M7lc1UVf-VE"]')).toHaveCount(1);
  await page
    .getByRole("button", { name: "Select Fixture: The life beneath our feet", exact: true })
    .click();
  await expect(page.locator('iframe[src*="youtube-nocookie"]')).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Featured podcast" })).toContainText(
    "Fixture: The life beneath our feet",
  );
  await page.getByRole("button", { name: "Soil health", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Select Fixture:/ })).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search podcast episodes" }).fill("unmatched");
  await expect(page.getByText("No matching conversations.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Select Fixture:/ })).toHaveCount(2);
  expect(apiReads).toBe(before);
});
test("responsive page and navigation work by pointer and keyboard", async ({ page }) => {
  await page.goto(origin + "/podcast");
  for (const width of [320, 390, 768, 1440, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  const disclosure = nav.getByRole("button", { name: "About related pages" });
  const podcast = nav.getByRole("link", { name: "Podcast", exact: true });
  await expect(podcast).toHaveAttribute("href", "/podcast");
  await expect(nav.getByRole("link", { name: "About", exact: true })).toHaveAttribute(
    "href",
    "/about",
  );
  await podcast.hover();
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await disclosure.hover();
  const governance = nav.getByRole("link", { name: "Governance", exact: true });
  await governance.hover();
  await expect(nav.getByRole("link", { name: "Impact", exact: true })).toBeVisible();
  await podcast.hover();
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await disclosure.click();
  await expect(governance).toBeVisible();
  await expect(nav.getByRole("link", { name: "Our Mission", exact: true })).toHaveAttribute(
    "href",
    "/mission",
  );
  await nav.getByRole("link", { name: "Governance", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await expect(disclosure).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(nav.getByRole("link", { name: "Governance", exact: true })).toBeVisible();
  await page.getByRole("heading", { name: "Bazm-e-Khayal", exact: true }).click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  const mobile = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobile.getByRole("link", { name: "Podcast", exact: true })).toBeVisible();
  await expect(mobile.getByRole("link", { name: "Governance", exact: true })).toHaveAttribute(
    "href",
    "/governance",
  );
  await expect(mobile.getByRole("link", { name: "Impact", exact: true })).toHaveAttribute(
    "href",
    "/impact",
  );
  const mobileContact = mobile.getByRole("link").last();
  await expect(mobileContact).toHaveText("Contact");
  await expect(mobileContact).toHaveAttribute("href", "/contact");
  const headerContact = nav.getByRole("link", { name: "Contact", exact: true });
  const background = await headerContact.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await expect(mobileContact).toHaveCSS("background-color", background);
  await page.keyboard.press("Escape");
  await expect(mobile).toHaveCount(0);
  const axe = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
});
test("custom microphone drawing respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(origin + "/podcast");
  const drawing = page.locator('svg[viewBox="0 0 360 300"] rect');
  expect(await drawing.evaluate((e) => getComputedStyle(e).animationName)).not.toBe("none");
  const waves = page.locator("[data-podcast-wave]");
  await expect(waves).toHaveCount(2);
  const firstWave = waves.first();
  await expect(firstWave).toHaveCSS("animation-iteration-count", "infinite");
  const start = await firstWave.evaluate((e) => getComputedStyle(e).transform);
  await expect.poll(() => firstWave.evaluate((e) => getComputedStyle(e).transform)).not.toBe(start);
  const pause = page.getByRole("button", { name: "Pause sketch animation" });
  await expect(pause.locator("svg")).toHaveCount(0);
  await pause.click({ position: { x: 5, y: 5 } });
  await expect(firstWave).toHaveCSS("animation-play-state", "paused");
  await expect(drawing).toHaveCSS("animation-play-state", "paused");
  await pause.press("Space");
  await expect(firstWave).toHaveCSS("animation-play-state", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(firstWave).toHaveCSS("animation-name", "none");
  await expect(pause).toHaveCount(0);
  await expect(drawing).toHaveCSS("animation-name", "none");
});
