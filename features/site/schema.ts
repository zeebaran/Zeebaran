import { z } from "zod";
import { defaultFooterVisibility, phoneDigits, type SiteSettings } from "./model";
const email = z.string().trim().max(254).email("Enter a valid email address.");
const phone = z
  .string()
  .trim()
  .max(40)
  .refine(
    (value) => /^[+\d][\d\s().-]*$/.test(value) && /^[1-9]\d{7,14}$/.test(phoneDigits(value)),
    "Enter a phone number with its country code.",
  );
const social = (hosts: string[]) =>
  z
    .string()
    .trim()
    .max(500)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          hosts.includes(url.hostname.toLowerCase()) &&
          !url.username &&
          !url.password &&
          !url.port &&
          url.pathname !== "/"
        );
      } catch {
        return false;
      }
    }, "Enter the complete HTTPS profile link for this platform, or leave it empty.");
export const siteSettingsSchema: z.ZodType<SiteSettings> = z
  .object({
    email,
    phone,
    whatsapp: z.union([phone, z.literal("")]),
    channels: z
      .object({
        research: email,
        investment: email,
        collaboration: email,
        careers: email,
        general: email,
      })
      .strict(),
    socials: z
      .object({
        facebook: social([
          "facebook.com",
          "www.facebook.com",
          "m.facebook.com",
          "fb.com",
          "www.fb.com",
        ]),
        instagram: social(["instagram.com", "www.instagram.com"]),
        youtube: social(["youtube.com", "www.youtube.com", "m.youtube.com"]),
      })
      .strict(),
    footer: z
      .object({
        email: z.boolean().default(true),
        phone: z.boolean().default(true),
        addresses: z.boolean().default(true),
        socials: z.boolean().default(true),
        facebook: z.boolean().default(true),
        instagram: z.boolean().default(true),
        youtube: z.boolean().default(true),
        whatsapp: z.boolean().default(true),
      })
      .strict()
      .default(defaultFooterVisibility),
    addresses: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),
            label: z.string().trim().min(1, "Add an office label.").max(100),
            address: z.string().trim().min(1, "Add the office address.").max(600),
            note: z.string().trim().max(300),
            showInFooter: z.boolean().default(true),
          })
          .strict(),
      )
      .max(8)
      .refine(
        (items) => new Set(items.map((item) => item.id)).size === items.length,
        "Office identifiers must be unique.",
      ),
  })
  .strict();
