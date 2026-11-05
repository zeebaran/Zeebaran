import { handleContact } from "@/lib/contact-handler";
import {
  contactDeliveryAvailable,
  rateLimit,
  deliver,
} from "@/lib/contact-delivery";
import { site } from "@/lib/site";
export const runtime = "nodejs";
export const maxDuration = 20;
export async function POST(request: Request) {
  const allowedOrigins = [new URL(site.url).origin];
  if (process.env.VERCEL_URL)
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV !== "production")
    allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
  return handleContact(request, {
    allowedOrigins,
    available: contactDeliveryAvailable(),
    rateLimit,
    deliver,
  });
}
