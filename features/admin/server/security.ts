import "server-only";
import { consumeRateLimit, RateLimitReached } from "@/lib/server/rate-limits";
import { scheduleRateLimitCleanup } from "@/lib/server/rate-limit-maintenance";
import { cache } from "react";
import { cookies } from "next/headers";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { firebase } from "@/lib/firebase-admin";
export const sessionCookie = "zeebaran-admin";
export class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function authService() {
  return getAuth(firebase());
}
export function allowedAdmin(
  token: Pick<DecodedIdToken, "email" | "email_verified"> & { zeebaranRole?: unknown },
) {
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  return (
    token.email_verified === true &&
    !!token.email &&
    (allow.includes(token.email.toLowerCase()) ||
      token.zeebaranRole === "admin" ||
      token.zeebaranRole === "editor")
  );
}
export const adminSession = cache(async function adminSession() {
  const value = (await cookies()).get(sessionCookie)?.value;
  if (!value) throw new AdminError(401, "Sign in to continue.");
  try {
    const token = await authService().verifySessionCookie(value, true);
    if (!allowedAdmin(token))
      throw new AdminError(403, "This account has no administration access.");
    return token;
  } catch (e) {
    if (e instanceof AdminError) throw e;
    throw new AdminError(401, "Your session expired. Sign in again.");
  }
});
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const url = new URL(req.url);
  const host = req.headers.get("host") || url.host;
  const proto = req.headers.get("x-forwarded-proto") === "https" ? "https:" : url.protocol;
  if (!origin || origin !== proto + "//" + host)
    throw new AdminError(403, "Use the administration site to make this request.");
}
export async function csrfGuard(req: Request) {
  sameOrigin(req);
  const jar = await cookies();
  const expected = jar.get("zeebaran-csrf")?.value || "",
    supplied = req.headers.get("x-csrf-token") || "";
  if (
    !expected ||
    !/^[a-f0-9]{64}$/.test(supplied) ||
    expected.length !== supplied.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
  )
    throw new AdminError(403, "Refresh the page and try again.");
}
export function secureCookie(req: Request) {
  const host = new URL(req.url).hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "[::1]";
}
export const csrfToken = () => randomBytes(32).toString("hex");
export function adminFailure(e: unknown) {
  if (e instanceof AdminError)
    return Response.json(
      { error: e.message },
      { status: e.status, headers: { "Cache-Control": "no-store" } },
    );
  const reference = randomBytes(6).toString("hex");
  console.error(
    JSON.stringify({
      event: "admin.failure",
      reference,
      type: e instanceof Error ? e.name : "Unknown",
    }),
  );
  return Response.json(
    { error: "The operation could not complete. Please retry. Reference " + reference },
    { status: 503 },
  );
}
export async function bodyJson(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new AdminError(415, "Send JSON content.");
  const reader = req.body?.getReader();
  if (!reader) throw new AdminError(400, "The request is empty.");
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 300000) {
        await reader.cancel();
        throw new AdminError(413, "The page is too large.");
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString("utf8"));
  } catch {
    throw new AdminError(400, "Invalid request data.");
  }
}
export async function limitAdmin(key: string, max = 60) {
  const db = getFirestore(firebase());
  try {
    await consumeRateLimit(db, {
      collection: "cmsRateLimits",
      windowMs: 3600000,
      keyForWindow: (window) => key + "-" + window,
      max,
    });
  } catch (error) {
    if (error instanceof RateLimitReached)
      throw new AdminError(429, "Too many requests. Please try again later.");
    throw error;
  } finally {
    await scheduleRateLimitCleanup(db);
  }
}
