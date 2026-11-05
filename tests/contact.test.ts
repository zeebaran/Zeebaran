import test from "node:test";
import assert from "node:assert/strict";
import {
  handleContact,
  type ContactServices,
} from "../src/lib/contact-handler";
import { contactSchema, emailBody } from "../src/lib/contact-schema";
const input = {
  name: "Test Grower",
  email: "test@example.com",
  phone: "",
  topic: "Plant enquiry",
  message: "Please discuss my orchard planting requirements.",
  website: "",
  submissionId: "276bdb04-fc63-49f0-b873-d01ce06c9ed5",
};
function request(data: unknown = input, origin = "https://zeebaran.com") {
  return new Request("https://zeebaran.com/api/contact", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
function services(overrides: Partial<ContactServices> = {}): ContactServices {
  return {
    allowedOrigins: ["https://zeebaran.com"],
    available: true,
    rateLimit: async () => true,
    deliver: async () => {},
    ...overrides,
  };
}
test("valid data is trimmed and body retains message", () => {
  const d = contactSchema.parse({ ...input, name: "  Test Grower  " });
  assert.equal(d.name, "Test Grower");
  assert.match(emailBody(d), /orchard planting/);
});
test("invalid email and short message rejected", () =>
  assert.equal(
    contactSchema.safeParse({ ...input, email: "no", message: "short" })
      .success,
    false,
  ));
test("unknown fields rejected", () =>
  assert.equal(
    contactSchema.safeParse({ ...input, admin: true }).success,
    false,
  ));
test("cross-origin request never delivers", async () => {
  const r = await handleContact(
    request(input, "https://evil.example"),
    services({ deliver: async () => assert.fail() }),
  );
  assert.equal(r.status, 403);
});
test("validation returns field errors", async () => {
  const r = await handleContact(
    request({ ...input, email: "bad" }),
    services(),
  );
  assert.equal(r.status, 422);
  assert.ok((await r.json()).fieldErrors.email);
});
test("missing configuration cannot claim delivery", async () =>
  assert.equal(
    (await handleContact(request(), services({ available: false }))).status,
    503,
  ));
test("rate limit gives retry interval", async () => {
  const r = await handleContact(
    request(),
    services({
      rateLimit: async () => false,
      deliver: async () => assert.fail(),
    }),
  );
  assert.equal(r.status, 429);
  assert.equal(r.headers.get("Retry-After"), "900");
});
test("rate limiter failure fails closed", async () =>
  assert.equal(
    (
      await handleContact(
        request(),
        services({
          rateLimit: async () => {
            throw Error();
          },
          deliver: async () => assert.fail(),
        }),
      )
    ).status,
    503,
  ));
test("provider failure cannot claim success", async () =>
  assert.equal(
    (
      await handleContact(
        request(),
        services({
          deliver: async () => {
            throw Error();
          },
        }),
      )
    ).status,
    502,
  ));
test("successful accepted delivery is invoked exactly once", async () => {
  let count = 0;
  const r = await handleContact(
    request(),
    services({
      deliver: async (d) => {
        count++;
        assert.equal(d.submissionId, input.submissionId);
      },
    }),
  );
  assert.equal(r.status, 200);
  assert.equal(count, 1);
  assert.equal((await r.json()).ok, true);
  assert.equal(r.headers.get("Cache-Control"), "no-store");
});
test("honeypot discarded without delivery", async () =>
  assert.equal(
    (
      await handleContact(
        request({ ...input, website: "spam" }),
        services({ deliver: async () => assert.fail() }),
      )
    ).status,
    200,
  ));
test("oversize actual body rejected without trusting Content-Length", async () =>
  assert.equal(
    (
      await handleContact(
        request({ ...input, message: "x".repeat(17000) }),
        services(),
      )
    ).status,
    413,
  ));
test("invalid JSON rejected", async () => {
  const r = new Request("https://zeebaran.com/api/contact", {
    method: "POST",
    headers: {
      origin: "https://zeebaran.com",
      "Content-Type": "application/json",
    },
    body: "{",
  });
  assert.equal((await handleContact(r, services())).status, 400);
});
test("non-JSON rejected", async () => {
  const r = new Request("https://zeebaran.com/api/contact", {
    method: "POST",
    headers: { origin: "https://zeebaran.com" },
    body: "hello",
  });
  assert.equal((await handleContact(r, services())).status, 415);
});
