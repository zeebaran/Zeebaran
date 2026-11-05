import { createHash } from "node:crypto";
import { emailBody, type ContactInput } from "./contact-schema";
export function contactDeliveryAvailable() {
  return Boolean(
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_FROM &&
    process.env.CONTACT_TO &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}
export async function rateLimit(request: Request) {
  // Vercel overwrites this header. On other hosts, configure a trusted proxy adapter.
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown"
    : "local";
  const key =
    "zeebaran:contact:" + createHash("sha256").update(ip).digest("hex");
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      "EVAL",
      "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",
      1,
      key,
      900,
    ]),
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Rate limiter unavailable");
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("result" in data) ||
    typeof data.result !== "number"
  )
    throw new Error("Invalid rate limit response");
  return data.result <= 5;
}
export async function deliver(d: ContactInput) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `zeebaran/${d.submissionId}`,
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM,
      to: [process.env.CONTACT_TO],
      reply_to: d.email,
      subject: `Website enquiry: ${d.topic}`,
      text: emailBody(d),
    }),
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Email rejected");
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "string"
  )
    throw new Error("Delivery not confirmed");
}
