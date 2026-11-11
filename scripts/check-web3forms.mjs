// Provider responses are intercepted before the network. Never sends an email or writes a fixture to Firebase.
import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const origin =
  process.argv.find((value) => value.startsWith("--origin="))?.slice(9) || "http://localhost:3000";
if (!/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin)) throw Error("Use a local app only.");
const browser = await chromium.launch(),
  results = [];
const check = (condition, label) => {
  if (!condition) throw Error(label);
  results.push(label);
};
try {
  const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    }),
    page = await ctx.newPage(),
    errors = [],
    sent = [],
    enquiryRequests = [];
  let respond;
  page.on("pageerror", (error) => errors.push(error.message));
  ctx.on("request", (request) => {
    if (request.method() !== "GET" && new URL(request.url()).pathname.startsWith("/api/enquiries"))
      enquiryRequests.push(request.url());
  });
  await ctx.route("https://api.web3forms.com/**", async (route) => {
    const request = route.request();
    if (request.url() !== "https://api.web3forms.com/submit" || request.method() !== "POST")
      return route.abort();
    const fields = await new Response(request.postDataBuffer(), {
      headers: { "content-type": request.headers()["content-type"] },
    }).formData();
    check(
      /^[0-9a-f-]{36}$/i.test(fields.get("access_key")),
      "Configured public form key reaches the provider request",
    );
    fields.delete("access_key"); // Never retain keys in test output.
    sent.push(Object.fromEntries(fields));
    const response = await new Promise((resolve) => {
      respond = resolve;
    });
    if (response.abort) return route.abort("failed");
    await route.fulfill({
      status: response.status,
      headers: { "Access-Control-Allow-Origin": origin },
      contentType: "application/json",
      body: JSON.stringify(response.body),
    });
  });
  async function submitResponse(status, body) {
    await page.getByRole("button", { name: "Send message", exact: true }).click();
    await expect(page.getByRole("button", { name: "Sending…", exact: true })).toBeDisabled();
    await expect.poll(() => typeof respond).toBe("function");
    const deliver = respond;
    respond = undefined;
    deliver({ status, body });
  }
  const response = await page.goto(origin + "/contact");
  check(response.status() === 200, "Contact page loads");
  check(
    response.headers()["content-security-policy"].includes("https://api.web3forms.com"),
    "CSP permits the provider API",
  );
  await expect(page.locator("#full-name")).toBeEnabled();
  check(
    (await page.locator("#proposal,.attachment-field").count()) === 0,
    "Free plan offers no unsupported file upload",
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#name-error")).toBeVisible();
  check(sent.length === 0, "Invalid fields never trigger delivery");
  await page.locator("#full-name").fill("Web3Forms Browser Fixture");
  await page.locator("#email").fill("fixture@example.test");
  await page.locator("#phone").fill("123");
  await page.locator("#place").fill("Srinagar");
  await page.locator("#organisation").fill("Isolated Test Nursery");
  await page.locator("#channel").selectOption("video");
  await page.locator("#reason").selectOption("research");
  await page.getByRole("button", { name: "R&D Field Trial", exact: true }).click();
  await page
    .locator("#message")
    .fill("This synthetic browser fixture never reaches an email inbox.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#phone-error")).toBeVisible();
  check(sent.length === 0, "Invalid contact numbers cannot be sent");
  await page.locator("#phone").fill("+91 98765 43210");
  await page
    .locator(".enquiry-desk")
    .screenshot({ path: "/private/tmp/zeebaran-web3forms-contact.png" });
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sending…", exact: true })).toBeDisabled();
  await expect.poll(() => sent.length).toBe(1);
  await page.locator("form[aria-label='Zeebaran enquiry']").dispatchEvent("submit");
  check(sent.length === 1, "An in-flight submission cannot be submitted again");
  const delivery = respond;
  respond = undefined;
  delivery({ status: 200, body: { success: true } });
  await expect(page.locator(".enquiry-success")).toContainText("sent to the Zeebaran team");
  check(
    sent[0].email === "fixture@example.test" &&
      sent[0].reason === "Research & Institutions" &&
      sent[0].preferred_channel === "Virtual video call" &&
      sent[0].topic === "R&D Field Trial" &&
      sent[0].contact_number === "+91 98765 43210" &&
      sent[0].place === "Srinagar" &&
      sent[0].from_name === "Zeebaran · Enquiry Desk" &&
      sent[0].subject === "Zeebaran | Research & Institutions | Web3Forms Browser Fixture",
    "Professional email payload includes contact number, place, reason, topic and reply channel",
  );
  await page.getByRole("button", { name: "Write another enquiry" }).click();
  await expect(page.locator("#full-name")).toHaveValue("");
  await expect(page.locator("#message")).toHaveValue("");
  await expect(page.locator("#phone")).toHaveValue("");
  await expect(page.locator("#place")).toHaveValue("");
  results.push("Confirmed delivery resets the form");
  await page.locator("#full-name").fill("Retry Fixture");
  await page.locator("#email").fill("fixture@example.test");
  await page.locator("#phone").fill("+91 98765 43210");
  await page.locator("#place").fill("Srinagar");
  await page.locator("#message").fill("Keep these values when the provider returns an error.");
  await submitResponse(200, { success: false });
  await expect(page.locator(".delivery-error[role='alert']")).toContainText(
    "could not be confirmed",
  );
  await expect(page.locator("#message")).toHaveValue(
    "Keep these values when the provider returns an error.",
  );
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeEnabled();
  check(
    (await page.locator(".enquiry-success").count()) === 0,
    "HTTP 200 without provider success does not clear the form",
  );
  await submitResponse(429, { success: false });
  await expect(page.locator(".delivery-error[role='alert']")).toContainText("wait a few minutes");
  results.push("Provider rate limits leave the form recoverable");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect.poll(() => typeof respond).toBe("function");
  const fail = respond;
  respond = undefined;
  fail({ abort: true });
  await expect(page.locator(".delivery-error[role='alert']")).toContainText("connection failed");
  await expect(page.locator("#full-name")).toHaveValue("Retry Fixture");
  await expect(page.locator("#phone")).toHaveValue("+91 98765 43210");
  await expect(page.locator("#place")).toHaveValue("Srinagar");
  results.push("Network failure retains the message and email fallback");
  await page.goto(
    origin +
      "/contact/simple?reason=collaboration&message=An%20orchard%20planting%20material%20enquiry.",
  );
  await expect(page.locator("#reason")).toHaveValue("collaboration");
  await expect(page.locator("#message")).toHaveValue("An orchard planting material enquiry.");
  await page.locator("#full-name").fill("Short Form Fixture");
  await page.locator("#email").fill("fixture@example.test");
  await page.locator("#phone").fill("+91 98765 43210");
  await page.locator("#place").fill("Baramulla");
  await submitResponse(200, { success: true });
  await expect(page.locator(".enquiry-success")).toBeVisible();
  results.push("Short form uses the same delivery and preserves routed enquiry context");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Write another enquiry" }).click();
  check(
    !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
    "Contact form fits a mobile viewport",
  );
  const noJS = await browser.newContext({ javaScriptEnabled: false }),
    staticPage = await noJS.newPage();
  await staticPage.goto(origin + "/contact/simple");
  await expect(staticPage.locator("#email")).toBeDisabled();
  await expect(staticPage.getByRole("link", { name: "email the Zeebaran team" })).toBeVisible();
  results.push("No-JavaScript visitors retain the email fallback");
  check(
    enquiryRequests.length === 0,
    "Neither contact form requests Firebase enquiry or attachment APIs",
  );
  check(errors.length === 0, "No browser exceptions");
  console.log(results);
  await fs.writeFile(
    "/private/tmp/zeebaran-web3forms-results.json",
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
