import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
const required = [
  "NEXT_PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "CONTACT_FROM",
  "CONTACT_TO",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];
const missing = required.filter((k) => !process.env[k]);
const optional = [
  "NEXT_PUBLIC_GA_ID",
  "GOOGLE_SITE_VERIFICATION",
  "GOOGLE_MAPS_EMBED_URL",
].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    "Direct online enquiry delivery is not configured. Missing: " +
      missing.join(", "),
  );
  process.exitCode = 1;
} else
  console.log(
    "Required configuration is present; verify delivery with your real provider before release.",
  );
if (optional.length)
  console.log("Optional integrations disabled: " + optional.join(", "));
console.log(
  "Also confirm catalogue, imagery rights, contact channels and mailbox retention policy before release.",
);
