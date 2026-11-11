import { test, expect } from "@playwright/test";

test("gallery respects reduced motion and exposes only the selected slide", async ({ page }) => {
  await page.goto("/mission");
  const gallery = page.getByRole("region", { name: "Orchard photographs" });
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator('[aria-hidden="false"] img')).toHaveCount(1);
  await expect(gallery.locator('[aria-hidden="true"] img')).toHaveCount(2);
  await expect(gallery.getByRole("button", { name: "Photo 1", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.waitForTimeout(4100);
  await expect(gallery.getByRole("button", { name: "Photo 1", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await gallery.getByRole("button", { name: "Photo 3", exact: true }).click();
  await expect(gallery.getByRole("button", { name: "Photo 3", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await gallery.getByRole("button", { name: "Previous photo" }).click();
  await expect(gallery.getByRole("button", { name: "Photo 2", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("autoplay stops for keyboard users and resumes only when requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/mission");
  const gallery = page.getByRole("region", { name: "Orchard photographs" });
  await gallery.scrollIntoViewIfNeeded();
  await gallery.getByRole("button", { name: "Photo 2", exact: true }).focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(4100);
  await expect(gallery.getByRole("button", { name: "Photo 1", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await gallery.getByRole("button", { name: "Photo 3", exact: true }).click();
  await page.locator("h1").click({ force: true });
  await page.waitForTimeout(4100);
  await expect(gallery.getByRole("button", { name: "Photo 3", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await gallery.getByRole("button", { name: "Resume slideshow" }).click();
  await page.waitForTimeout(4100);
  await expect(gallery.getByRole("button", { name: "Photo 4", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("an HTML proxy error preserves correspondence and offers recovery", async ({ page }) => {
  await page.goto("/contact/simple");
  await page.locator("#full-name").fill("Regression fixture");
  await page.locator("#email").fill("qa@example.test");
  await page.locator("#phone").fill("+91 98765 43210");
  await page.locator("#place").fill("Srinagar");
  await page.locator("#message").fill("Synthetic proxy failure verification.");
  await page.route("https://api.web3forms.com/**", (route) =>
    route.fulfill({ status: 503, contentType: "text/html", body: "<h1>Unavailable</h1>" }),
  );
  await page.route("**/api/enquiries", (route) =>
    route.fulfill({ status: 503, contentType: "text/html", body: "<h1>Unavailable</h1>" }),
  );
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".delivery-error[role=alert]")).toContainText(
    /Delivery failed|Delivery could not be confirmed/,
  );
  await expect(page.locator("#message")).toHaveValue("Synthetic proxy failure verification.");
  await expect(page.getByRole("link", { name: "Open email draft" })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
});

test("an unconfirmed success response never acknowledges correspondence", async ({ page }) => {
  await page.goto("/contact/simple");
  await page.locator("#full-name").fill("Regression fixture");
  await page.locator("#email").fill("qa@example.test");
  await page.locator("#phone").fill("+91 98765 43210");
  await page.locator("#place").fill("Srinagar");
  await page.locator("#message").fill("Synthetic malformed delivery reply.");
  await page.route("https://api.web3forms.com/**", (route) =>
    route.fulfill({ status: 200, json: {} }),
  );
  await page.route("**/api/enquiries", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".delivery-error")).toContainText(
    /did not confirm delivery|Delivery could not be confirmed/,
  );
  await expect(page.locator(".enquiry-success")).toHaveCount(0);
});
