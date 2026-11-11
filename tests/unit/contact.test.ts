import { describe, expect, it } from "vitest";
import {
  formSchema,
  hasPdfHeader,
  maxPdfBytes,
  pdfSchema,
  submissionSchema,
} from "../../features/contact/schema";
const form = {
  name: " Orchard Team ",
  organisation: "",
  email: "grower@example.test",
  phone: "+91 98765 43210",
  place: "Srinagar",
  channel: "email",
  reason: "research",
  topic: null,
  message: "We would like to discuss rootstock trials.",
};
describe("enquiry validation", () => {
  it("normalises the grower’s name and preserves optional fields", () => {
    expect(formSchema.parse(form).name).toBe("Orchard Team");
  });
  it.each([
    { name: " " },
    { email: "invalid" },
    { phone: "" },
    { phone: "abc9876543" },
    { phone: "12345" },
    { phone: "+1234567890123456" },
    { phone: "+91 98765\n43210" },
    { place: " " },
    { message: "hi" },
    { reason: "unknown" },
    { topic: "unlisted" },
  ])("rejects invalid fields %o", (change) => {
    expect(formSchema.safeParse({ ...form, ...change }).success).toBe(false);
  });
  it("requires an idempotency key and an empty honeypot", () => {
    const input = {
      ...form,
      attachment: null,
      requestId: "f4d98f4a-1630-4e04-bf58-7515452b07c3",
      website: "",
    };
    expect(submissionSchema.safeParse(input).success).toBe(true);
    expect(submissionSchema.safeParse({ ...input, website: "spam" }).success).toBe(false);
  });
  it.each(["+91 98765 43210", "0194-2458011", "+44 (20) 7946 0123"])(
    "accepts formatted contact numbers: %s",
    (phone) => {
      expect(formSchema.parse({ ...form, phone }).phone).toBe(phone);
    },
  );
  it.each([
    { name: "brief.pdf", size: maxPdfBytes, valid: true },
    { name: "../secret.pdf", size: 7, valid: false },
    { name: "brief.bin", size: 7, valid: false },
    { name: "brief.pdf", size: maxPdfBytes + 1, valid: false },
  ])("bounds private uploads %o", ({ valid, ...pdf }) => {
    expect(pdfSchema.safeParse(pdf).success).toBe(valid);
  });
  it("checks PDF bytes independently of the filename", () => {
    expect(hasPdfHeader(Buffer.from("%PDF-1.7"))).toBe(true);
    expect(hasPdfHeader(Buffer.from("<html>"))).toBe(false);
  });
});
