import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";

test.describe("production checks", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "chromium", "Run once against the production server.");
  });
  test("automated accessibility reports the approved brand exception and rejects other violations", async ({
    page,
  }, info) => {
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
      ...(process.env.E2E_BASE_URL || process.env.E2E_CATALOG ? ["/products/gala"] : []),
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(
        () =>
          new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
      );
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      // Owner decision, 10 November 2026: retain #8cc63f text. This remains a
      // documented WCAG contrast failure, not a claim of AA conformance.
      const accepted = audit.violations.flatMap((violation) =>
        violation.nodes.filter(
          (node) =>
            violation.id === "color-contrast" &&
            node.html.includes("accent-leaf") &&
            node.any.some((check) => check.data?.fgColor?.toLowerCase() === "#8cc63f"),
        ),
      );
      if (accepted.length) {
        info.annotations.push({
          type: "known-accessibility-exception",
          description:
            route + ": " + accepted.length + " owner-preserved #8cc63f text nodes fail contrast",
        });
        await info.attach("contrast-" + route.replace(/\W/g, "-"), {
          body: JSON.stringify(accepted, null, 2),
          contentType: "application/json",
        });
      }
      const unapproved = audit.violations
        .map((violation) => ({
          id: violation.id,
          nodes: violation.nodes
            .filter((node) => !accepted.includes(node))
            .map((node) => node.target),
        }))
        .filter((violation) => violation.nodes.length);
      expect(unapproved, route).toEqual([]);
    }
  });
  test("retries are idempotent and conflicting updates fail", async ({ request }) => {
    test.skip(
      Boolean(process.env.E2E_BASE_URL),
      "Inbox writes run only against Playwright’s isolated local server.",
    );
    const data = {
      requestId: randomUUID(),
      name: "Test grower",
      email: "grower@example.test",
      organisation: "",
      phone: "+91 98765 43210",
      place: "Srinagar",
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
