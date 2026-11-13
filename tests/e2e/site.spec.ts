import { PDFDocument } from "pdf-lib";
import { expect, test } from "@playwright/test";
import { PRODUCTS } from "../../lib/products-content";
const hasCatalog = Boolean(process.env.E2E_BASE_URL || process.env.E2E_CATALOG);
const pages = [
  "/",
  "/platform",
  "/mission",
  "/zeebaran-hub",
  "/innovation",
  "/impact",
  "/partnerships",
  "/governance",
  "/about",
  "/contact",
  "/contact/simple",
  "/products",
  ...(hasCatalog ? PRODUCTS.map((p) => "/products/" + p.slug) : []),
];
const widths = [320, 360, 375, 390, 430, 480, 600, 768, 820, 912, 1024, 1280, 1440, 1920];
for (const url of pages) {
  test("page fits the reference viewport range · " + url, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("main h1")).toHaveCount(1);
    for (const width of widths) {
      await page.setViewportSize({ width, height: width >= 1000 ? 850 : 800 });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      const result = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
        scale: window.visualViewport?.scale,
      }));
      expect(result.content, url + " at " + width).toBeLessThanOrEqual(result.width + 1);
      expect(result.scale).toBe(1);
    }
    expect(errors).toEqual([]);
  });
}
test("landscape menu, focus and destination", async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await page.goto("/");
  const open = page.getByRole("button", { name: "Open menu" });
  await open.click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await open.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Zeebaran Hub" })
    .click();
  await expect(page).toHaveURL(/\/zeebaran-hub$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
test("capability selection works by keyboard and links to its story", async ({ page }) => {
  await page.goto("/#system");
  const tabs = page.locator("#system").getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.getByRole("link", { name: "Explore this capability" }).click();
  await expect(page).toHaveURL(/platform#orchard-development$/);
});
test("contact routing, validation and confirmed delivery", async ({ page }) => {
  await page.route("https://api.web3forms.com/**", (route) =>
    route.fulfill({ json: { success: true } }),
  );
  await page.route("**/api/enquiries", (route) =>
    route.fulfill({ status: 201, json: { delivery: "local" } }),
  );
  await page.route("**/api/enquiries/attachments", (route) =>
    route.fulfill({
      json: {
        ticket: "fixture-ticket",
        url: "/api/enquiries/attachments/fixture-ticket",
        fields: null,
      },
    }),
  );
  await page.route("**/api/enquiries/attachments/fixture-ticket", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact");
  await page.getByRole("link", { name: /Start a research conversation/ }).click();
  await expect(page.locator("#reason")).toHaveValue("research");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#full-name")).toBeFocused();
  await page.locator("#full-name").fill("Test grower");
  await page.locator("#email").fill("example@example.test");
  await page.locator("#phone").fill("+91 98765 43210");
  await page.locator("#place").fill("Srinagar");
  await page.locator("#message").fill("A local test of a nursery field trial enquiry.");
  await page.getByRole("button", { name: "R&D Field Trial" }).click();
  if (await page.locator("#proposal").count()) {
    await page.locator("#proposal").setInputFiles({
      name: "wrong.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not a PDF"),
    });
    await expect(page.locator(".attachment-field").getByRole("alert")).toContainText(
      "contains a PDF",
    );
    await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
    await page.getByRole("button", { name: "Remove attachment" }).click();
    await expect(page.getByRole("button", { name: "Send message" })).toBeEnabled();
    await page.locator("#proposal").setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer: await (async () => {
        const pdf = await PDFDocument.create();
        pdf.addPage();
        return Buffer.from(await pdf.save());
      })(),
    });
    await expect(page.locator(".upload-target")).toContainText("test.pdf");
  }
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".enquiry-success[role=status]")).toContainText(
    /local inbox|message has been sent/,
  );
});
test("regional hub map and short form", async ({ page }) => {
  await page.goto("/contact#map-section");
  await page.getByRole("button", { name: "Show Achabal" }).click();
  await expect(page.locator(".hub-details")).toContainText("2,250 m");
  await page.getByRole("link", { name: "Use the short enquiry form" }).click();
  await expect(page).toHaveURL(/contact\/simple$/);
  await expect(page.locator("#proposal")).toHaveCount(0);
});
test("variety and rootstock carry through to an enquiry", async ({ page }) => {
  test.skip(
    !hasCatalog,
    "Catalog workflows require Firebase; covered separately with isolated emulators.",
  );
  await page.goto("/products");
  await page.getByRole("link", { name: "Full details" }).first().click();
  await expect(page).toHaveURL(/\/products\/gala$/);
  await page.getByRole("button", { name: "M9", exact: true }).click();
  await expect(page.getByRole("button", { name: "M9", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const nursery = page.getByRole("link", { name: /Enquire about Gala on M9/i });
  const href = await nursery.getAttribute("href");
  if (href?.startsWith("https://wa.me/")) {
    expect(decodeURIComponent(href)).toContain("M9");
    return;
  }
  await nursery.click();
  await expect(page.locator("#reason")).toHaveValue("collaboration");
  await expect(page.locator("#message")).toHaveValue(
    /Gala apple planting material on M9 rootstock/,
  );
});
test("the archive typefaces and word reveals work with visitor motion preferences", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => {
    const family = (selector: string) =>
      getComputedStyle(document.querySelector(selector)!).fontFamily;
    return {
      body: family("body"),
      heading: family("h1"),
      nav: family("nav ul"),
      mark: family('header a[aria-label="Zeebaran home"] span'),
    };
  });
  expect(fonts.heading).toBe(fonts.body);
  expect(fonts.nav).toBe(fonts.body);
  expect(fonts.mark).not.toBe(fonts.body);
  await expect(page.locator("h1 .word").first()).toHaveCSS("animation-name", "word-rise");
  const next = page.locator("#query-section h2");
  await expect(next).toHaveAttribute("data-reveal-words", "hidden");
  await next.scrollIntoViewIfNeeded();
  await expect(next).toHaveAttribute("data-reveal-words", "in");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#query-section h2")).not.toHaveAttribute(
    "data-reveal-words",
    "hidden",
  );
  await expect(page.locator("h1 .word").first()).toHaveCSS("transform", "none");
});

test("private enquiry fields cannot enter a URL when JavaScript is unavailable", async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const p = await ctx.newPage();
    for (const path of ["/contact", "/contact/simple"]) {
      await p.goto(path);
      await expect(p.locator("#email")).toBeDisabled();
      await expect(p.locator('form[aria-label="Zeebaran enquiry"]')).toHaveAttribute(
        "method",
        "post",
      );
      await expect(p.getByRole("link", { name: "email the Zeebaran team" })).toBeVisible();
    }
  } finally {
    await ctx.close();
  }
});
