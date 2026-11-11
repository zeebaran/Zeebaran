import { z } from "zod";
z.config({ jitless: true });
export const reasons = ["research", "investment", "collaboration", "careers", "general"] as const;
export const topics = [
  "Grower Collaboration",
  "CA Storage & Fleet",
  "R&D Field Trial",
  "Impact Investment",
] as const;
export const channels = {
  email: "Email reply",
  video: "Virtual video call",
  srinagar: "In-person · Srinagar HQ",
  delhi: "In-person · New Delhi",
} as const;
export const maxPdfBytes = 25 * 1024 * 1024;
export const formSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  organisation: z.string().trim().max(160),
  email: z.email({ error: "Enter a valid email address." }).max(254),
  phone: z
    .string()
    .trim()
    .max(30, "Enter a valid contact number.")
    .regex(/^\+?[0-9][0-9 ()-]*[0-9]$/, "Enter a valid contact number.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }, "Enter a contact number with 7–15 digits."),
  place: z
    .string()
    .trim()
    .min(2, "Enter your town, village or city.")
    .max(160, "Keep the place under 160 characters."),
  channel: z.enum(["email", "video", "srinagar", "delhi"]),
  reason: z.enum(reasons),
  topic: z.enum(topics).nullable(),
  message: z
    .string()
    .trim()
    .min(10, "Please give a little more detail (at least 10 characters).")
    .max(5000, "Keep your message under 5,000 characters."),
});
export const pdfSchema = z.object({
  name: z
    .string()
    .min(5)
    .max(180)
    .regex(/^[^/\\\u0000-\u001f]+\.pdf$/i, "Choose a PDF file."),
  size: z.number().int().min(5).max(maxPdfBytes, "Choose a PDF up to 25 MB."),
});
export const prepareSchema = pdfSchema.extend({ requestId: z.uuid() });
export const submissionSchema = formSchema.extend({
  requestId: z.uuid(),
  attachment: pdfSchema.extend({ ticket: z.uuid() }).nullable(),
  website: z.literal(""),
});
export type FormFields = z.infer<typeof formSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export function hasPdfHeader(bytes: Uint8Array) {
  return (
    bytes.length >= 5 &&
    bytes[0] === 37 &&
    bytes[1] === 80 &&
    bytes[2] === 68 &&
    bytes[3] === 70 &&
    bytes[4] === 45
  );
}
