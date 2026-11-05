import { z } from "zod";
// Avoid dynamic-code probes in browsers protected by our Content Security Policy.
z.config({ jitless: true });
export const topics = [
  "Plant enquiry",
  "Orchard installation",
  "General enquiry",
] as const;
export const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name.").max(100),
    email: z.string().trim().email("Please enter a valid email.").max(254),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (v) => !v || /^[+()\d .-]{7,30}$/.test(v),
        "Please enter a valid phone number.",
      ),
    topic: z.enum(topics),
    message: z
      .string()
      .trim()
      .min(20, "Please add at least 20 characters.")
      .max(3000),
    website: z.string().max(200),
    submissionId: z.string().uuid(),
  })
  .strict();
export type ContactInput = z.infer<typeof contactSchema>;
export function emailBody(d: ContactInput) {
  return [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone || "Not provided"}`,
    `Topic: ${d.topic}`,
    "",
    d.message,
  ].join("\n");
}
