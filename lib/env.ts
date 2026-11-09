import "server-only";
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://www.zeebaran.com"),
  NEXT_PUBLIC_GA_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/, "Expected a GA4 id like G-XXXXXXXXXX")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
});

if (!parsed.success) {
  // Fail the build/boot loudly instead of shipping a silently broken config.
  throw new Error(
    `Invalid environment configuration:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
  );
}

export const env = parsed.data;

/** Canonical site origin, with no trailing slash. Server-only. */
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
