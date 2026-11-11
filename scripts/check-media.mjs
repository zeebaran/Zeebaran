import { chromium, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const common = [
  "/",
  "/platform",
  "/mission",
  "/products",
  "/zeebaran-hub",
  "/innovation",
  "/impact",
  "/partnerships",
  "/governance",
  "/about",
  "/contact",
  "/contact/simple",
];
const details = [
  "gala",
  "red-delicious",
  "fuji",
  "golden-delicious",
  "granny-smith",
  "honeycrisp",
  "pink-lady",
  "ambri",
]
  .map((s) => "/products/" + s)
  .concat(
    ["m9", "m26", "m7", "mm106"].map((s) => "/products/rootstocks/" + s),
    ["/products/compare"],
  );
const results = [];
const origin =
  process.argv.find((value) => value.startsWith("--origin="))?.slice(9) || "http://localhost:3000";
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
  throw Error("Use an explicit local server.");
for (const [engine, label] of [
  [chromium, "Chromium"],
  [webkit, "WebKit"],
]) {
  const browser = await engine.launch();
  for (const width of [390, 1440]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    for (const route of [
      ...common,
      ...(width === 1440
        ? details
        : ["/products/gala", "/products/rootstocks/m9", "/products/compare"]),
    ]) {
      const errors = [],
        local = [];
      const error = (e) => errors.push(e.message);
      const request = (r) => {
        if (new URL(r.url()).pathname.startsWith("/images/")) local.push(r.url());
      };
      page.on("pageerror", error);
      page.on("request", request);
      const r = await page.goto(origin + route, { waitUntil: "domcontentloaded", timeout: 60000 });
      assert.equal(r.status(), 200, route);
      await page.locator("h1").first().waitFor();
      for (
        let y = 0;
        y < (await page.evaluate(() => document.documentElement.scrollHeight));
        y += 850
      ) {
        await page.evaluate((y) => scrollTo(0, y), y);
        await page.waitForTimeout(70);
      }
      await page.waitForTimeout(500);
      await page.locator("img").evaluateAll((images) =>
        images.forEach((image) => {
          image.loading = "eager";
        }),
      );
      await expect
        .poll(
          () =>
            page
              .locator("img:not(.leaflet-tile)")
              .evaluateAll((a) =>
                a
                  .filter(
                    (i) =>
                      !i.closest('[aria-hidden="true"]') && (!i.complete || i.naturalWidth === 0),
                  )
                  .map((i) => i.currentSrc || i.src),
              ),
          { timeout: 30000 },
        )
        .toEqual([]);
      const data = await page.evaluate(() => ({
        images: [...document.querySelectorAll("img:not(.leaflet-tile)")]
          .filter((i) => !i.closest('[aria-hidden="true"]'))
          .map((i) => i.currentSrc || i.src),
        placeholders: document.querySelectorAll('[data-media-placeholder="error"]').length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }));
      assert.equal(local.length, 0, route + " local image request");
      assert.equal(data.overflow, false, route + " overflow");
      assert.deepEqual(errors, [], route + " errors");
      assert(
        data.images.every((src) => src.startsWith("https://res.cloudinary.com/jfiuaflr/")),
        route + " non-Cloudinary photograph: " + data.images.join(","),
      );
      assert.equal(data.placeholders, 0, route + " unexpected image failure");
      results.push({
        browser: label,
        width,
        route,
        images: data.images.length,
        localRequests: 0,
        overflow: false,
        errors: 0,
      });
      console.log("PASS", label, width, route, data.images.length + " images");
      if (route === "/" || route === "/products" || route === "/mission") {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path:
            "/private/tmp/zeebaran-media-" +
            label.toLowerCase() +
            "-" +
            width +
            "-" +
            (route.slice(1) || "home") +
            ".png",
        });
      }
      page.off("pageerror", error);
      page.off("request", request);
    }
    await ctx.close();
  }
  await browser.close();
}
await fs.writeFile(
  "/private/tmp/zeebaran-media-public-results.json",
  JSON.stringify(results, null, 2),
);
console.log("Verified", results.length, "browser/page/viewport cases");
