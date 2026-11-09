import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";

test.describe("production checks", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "chromium", "Run once against the production server.");
  });
  test("every route passes the automated WCAG A/AA audit", async ({ page }) => {
    test.setTimeout(100000);
    for (const route of [
      "/",
      "/platform",
      "/zeebaran-hub",
      "/innovation",
      "/impact",
      "/partnerships",
      "/governance",
      "/about",
      "/contact",
      "/contact/simple",
      "/products",
      "/products/gala",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(
        () =>
          new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
      );
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        route,
      ).toEqual([]);
    }
  });
  test("retries are idempotent and conflicting updates fail", async ({ request }) => {
    const data = {
      requestId: randomUUID(),
      name: "Test grower",
      email: "grower@example.test",
      organisation: "",
      reason: "research",
      channel: "email",
      topic: null,
      message: "An isolated retry test for the local enquiry desk.",
      attachment: null,
      website: "",
    };
    const responses = await Promise.all([
      request.post("/api/enquiries", { data }),
      request.post("/api/enquiries", { data }),
    ]);
    expect(responses.map((r) => r.status())).toEqual([201, 201]);
    const conflict = await request.post("/api/enquiries", {
      data: { ...data, message: "Different enquiry using the same ID." },
    });
    expect(conflict.status()).toBe(409);
    const invalid = await request.post("/api/enquiries", { data: { ...data, email: "invalid" } });
    expect(invalid.status()).toBe(422);
  });
});
