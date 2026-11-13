import { test, expect } from "@playwright/test";

test("every partner opens one accessible profile without fetching data", async ({ page }) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/partnerships");
  await page.getByRole("heading", { name: /Better systems/ }).waitFor();
  const buttons = page.getByRole("button", { name: /^View partnership with/ });
  const names = (await buttons.evaluateAll((nodes) => [
    ...new Set(nodes.map((n) => n.getAttribute("aria-label"))),
  ])) as string[];
  expect(names.length).toBeGreaterThanOrEqual(15);
  page.on("request", (r) => {
    if (/\/api\/|firestore.googleapis.com/.test(r.url())) requests.push(r.url());
  });
  for (const name of names) {
    const button = page.getByRole("button", { name, exact: true }).first();
    await button.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveCount(1);
    await expect(dialog).toHaveAccessibleName(
      name.replace("View partnership with", "Partnership with"),
    );
    await expect(dialog.getByRole("heading", { level: 2 })).not.toBeEmpty();
    await expect(dialog.getByRole("link", { name: "Discuss this partnership" })).toHaveAttribute(
      "href",
      "/contact?reason=collaboration#write",
    );
    await expect(dialog.getByRole("button", { name: "Close partner profile" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
  }
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test("strategic partner profiles fit mobile, tablet and desktop, retain content and dismiss cleanly", async ({
  page,
}, info) => {
  await page.goto("/partnerships");
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ["Balson", "Feno Nursery, Italy"]) {
      await page
        .getByRole("button", { name: `View partnership with ${name}`, exact: true })
        .first()
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name, exact: true })).toBeVisible();
      const image = dialog.getByRole("img");
      await expect(image).toHaveAttribute("src", /res.cloudinary.com/);
      await expect
        .poll(() =>
          image.evaluate(
            (el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0,
          ),
        )
        .toBe(true);
      expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      const rect = await dialog.boundingBox();
      expect(rect!.width).toBeLessThanOrEqual(width - 20);
      expect(rect!.height).toBeLessThanOrEqual(880);
      await expect(dialog.locator("dt")).toHaveCount(name === "Balson" ? 5 : 6);
      await expect(dialog).toContainText(
        name === "Balson" ? "authorised distributor" : "exclusive partnership",
      );
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: `.local/deep-review/partner-${name.startsWith("Balson") ? "balson" : "feno"}-${width}-${info.project.name}.png`,
        });
      await page.keyboard.press("Tab");
      await expect(dialog.getByRole("link", { name: "Discuss this partnership" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(dialog.getByRole("button", { name: "Close partner profile" })).toBeFocused();
      await page.mouse.click(2, 2);
      await expect(dialog).toHaveCount(0);
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    }
  }
});

test("partnership enquiry opens the collaboration channel", async ({ page }) => {
  await page.goto("/partnerships");
  await page
    .getByRole("button", { name: "View partnership with Balson", exact: true })
    .first()
    .click();
  await page.getByRole("dialog").getByRole("link", { name: "Discuss this partnership" }).click();
  await expect(page).toHaveURL(/contact\?reason=collaboration#write$/);
  await expect(page.locator("#reason")).toHaveValue("collaboration");
});
