import "server-only";
import { after } from "next/server";
import type { Firestore } from "firebase-admin/firestore";
import { cleanupExpiredRateLimits, cleanupIntervalMs } from "./rate-limits";

const nextAttempts = new Map<string, number>();
export function rateLimitEnvironment(
  projectId: string,
  databaseId: string,
  host = process.env.FIRESTORE_EMULATOR_HOST || "cloud",
) {
  return [projectId, databaseId, host].join(":");
}
/** Traffic-driven maintenance, coordinated across instances by a Firestore lease; no scheduler or TTL. */
export async function scheduleRateLimitCleanup(db: Firestore) {
  const scope = rateLimitEnvironment(
      process.env.FIREBASE_PROJECT_ID || "unconfigured",
      db.databaseId,
    ),
    now = Date.now();
  if ((nextAttempts.get(scope) || 0) > now) return;
  nextAttempts.set(scope, now + cleanupIntervalMs);
  const task = async () => {
    try {
      const result = await cleanupExpiredRateLimits(db);
      nextAttempts.set(scope, result.nextRunAt);
      if (result.failed)
        console.error(
          JSON.stringify({ event: "rate_limit.cleanup_partial", failed: result.failed }),
        );
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "rate_limit.cleanup_failed",
          code:
            typeof error === "object" && error && "code" in error ? String(error.code) : "unknown",
        }),
      );
    }
  };
  try {
    after(task);
  } catch {
    // Command-line callers have no Next request lifetime. Complete the bounded task before returning.
    await task();
  }
}
