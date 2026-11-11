import "server-only";
import { randomUUID } from "node:crypto";
import {
  Timestamp,
  type Firestore,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase-admin/firestore";

export const rateLimitCollections = ["cmsRateLimits", "enquiryRateLimits"] as const;
export type RateLimitCollection = (typeof rateLimitCollections)[number];
export const cleanupIntervalMs = 5 * 60 * 1000;
export const cleanupBatchPerCollection = 25;
const leaseMs = 2 * 60 * 1000;
export class RateLimitReached extends Error {
  readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super("Rate limit reached.");
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
class WindowChanged extends Error {}
export function timestampMillis(value: unknown): number | null {
  let result: number;
  if (value instanceof Date) result = value.getTime();
  else if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  )
    result = value.toMillis();
  else return null;
  return Number.isFinite(result) ? result : null;
}
export function activeRateCount(data: DocumentData | undefined, now: number) {
  if (!data) return 0;
  const expiry = timestampMillis(data.expiresAt);
  // Logical expiry is authoritative; physical deletion is never required to reset a quota.
  if (expiry !== null && expiry <= now) return 0;
  if (expiry === null || !Number.isSafeInteger(data.count) || data.count < 0)
    throw Error("Invalid rate-limit state.");
  return data.count as number;
}
function collectionAllowed(value: string): asserts value is RateLimitCollection {
  if (!rateLimitCollections.some((c) => c === value))
    throw Error("Rate-limit maintenance collection is not allowed.");
}
export async function consumeRateLimit(
  db: Firestore,
  options: {
    collection: RateLimitCollection;
    keyForWindow: (window: number) => string;
    windowMs: number;
    max: number;
    now?: () => number;
  },
) {
  collectionAllowed(options.collection);
  if (
    !Number.isSafeInteger(options.max) ||
    options.max < 1 ||
    !Number.isSafeInteger(options.windowMs) ||
    options.windowMs < 1000
  )
    throw Error("Invalid rate-limit policy.");
  const clock = options.now || Date.now;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.runTransaction(async (tx) => {
        const window = Math.floor(clock() / options.windowMs),
          key = options.keyForWindow(window);
        if (!key || key.includes("/")) throw Error("Invalid rate-limit key.");
        const ref = db.collection(options.collection).doc(key),
          snapshot = await tx.get(ref),
          now = clock();
        if (Math.floor(now / options.windowMs) !== window) throw new WindowChanged();
        const expiresAt = (window + 1) * options.windowMs,
          count = activeRateCount(snapshot.data(), now);
        if (count >= options.max)
          throw new RateLimitReached(Math.max(1, Math.ceil((expiresAt - now) / 1000)));
        tx.set(ref, { count: count + 1, expiresAt: Timestamp.fromMillis(expiresAt) });
        return { count: count + 1, expiresAt };
      });
    } catch (error) {
      if (error instanceof WindowChanged && attempt < 2) continue;
      throw error;
    }
  }
  throw Error("The rate-limit window changed repeatedly.");
}
export type CleanupSummary = {
  acquired: boolean;
  nextRunAt: number;
  scanned: number;
  deleted: number;
  skipped: number;
  failed: number;
};
export async function deleteExpiredRateLimits(
  db: Firestore,
  candidates: DocumentSnapshot[],
  cutoff: number,
) {
  if (candidates.length > cleanupBatchPerCollection * rateLimitCollections.length)
    throw Error("Cleanup batch exceeds its safety bound.");
  // Validate every reference before enqueuing any deletion. Subcollections and other projects are forbidden.
  for (const doc of candidates) {
    collectionAllowed(doc.ref.parent.path);
    if (doc.ref.firestore !== db) throw Error("Cleanup database mismatch.");
  }
  const summary = { deleted: 0, skipped: 0, failed: 0 };
  const writer = db.bulkWriter({ throttling: { initialOpsPerSecond: 20, maxOpsPerSecond: 20 } });
  writer.onWriteError((error) => [4, 10, 13, 14].includes(error.code) && error.failedAttempts < 2);
  const operations = candidates.map((doc) => {
    const expiry = timestampMillis(doc.get("expiresAt"));
    if (!doc.exists || !doc.updateTime || expiry === null || expiry > cutoff) {
      summary.skipped++;
      return Promise.resolve();
    }
    // A concurrent refresh changes updateTime. The delete then fails rather than removing the active counter.
    return writer.delete(doc.ref, { lastUpdateTime: doc.updateTime }).then(
      () => {
        summary.deleted++;
      },
      (error) => {
        if ([5, 9].includes(Number(error.code))) summary.skipped++;
        else summary.failed++;
      },
    );
  });
  await writer.close();
  await Promise.all(operations);
  return summary;
}
export async function cleanupExpiredRateLimits(
  db: Firestore,
  options: { now?: () => number; force?: boolean } = {},
): Promise<CleanupSummary> {
  const clock = options.now || Date.now,
    started = clock(),
    owner = randomUUID(),
    control = db.collection("appMaintenance").doc("rate-limit-cleanup-v1");
  const claim = await db.runTransaction(async (tx) => {
    const current = await tx.get(control),
      leaseUntil = timestampMillis(current.get("leaseUntil")) || 0,
      nextRunAt = timestampMillis(current.get("nextRunAt")) || 0;
    if (leaseUntil > started || (!options.force && nextRunAt > started))
      return { acquired: false, nextRunAt: Math.max(leaseUntil, nextRunAt) };
    tx.set(
      control,
      {
        owner,
        leaseUntil: Timestamp.fromMillis(started + leaseMs),
        nextRunAt: Timestamp.fromMillis(started + cleanupIntervalMs),
      },
      { merge: true },
    );
    return { acquired: true, nextRunAt: started + cleanupIntervalMs };
  });
  const result: CleanupSummary = { ...claim, scanned: 0, deleted: 0, skipped: 0, failed: 0 };
  if (!claim.acquired) return result;
  try {
    const pages = await Promise.all(
      rateLimitCollections.map((collection) =>
        db
          .collection(collection)
          .where("expiresAt", "<=", Timestamp.fromMillis(started))
          .orderBy("expiresAt")
          .limit(cleanupBatchPerCollection)
          .get(),
      ),
    );
    const candidates = pages.flatMap((page) => page.docs);
    result.scanned = candidates.length;
    Object.assign(result, await deleteExpiredRateLimits(db, candidates, started));
    return result;
  } catch (error) {
    result.failed++;
    throw error;
  } finally {
    await db.runTransaction(async (tx) => {
      const current = await tx.get(control);
      if (current.get("owner") !== owner) return;
      tx.set(
        control,
        {
          owner: null,
          leaseUntil: Timestamp.fromMillis(0),
          completedAt: Timestamp.fromMillis(clock()),
          summary: {
            scanned: result.scanned,
            deleted: result.deleted,
            skipped: result.skipped,
            failed: result.failed,
          },
        },
        { merge: true },
      );
    });
  }
}
