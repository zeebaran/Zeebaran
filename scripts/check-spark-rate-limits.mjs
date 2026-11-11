// Isolated integration tests: no .env file and no production credentials or product records.
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  consumeRateLimit,
  cleanupExpiredRateLimits,
  deleteExpiredRateLimits,
  RateLimitReached,
} from "../lib/server/rate-limits.ts";
import fs from "node:fs/promises";
if (process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8395")
  throw Error("Use only the explicit loopback Firestore emulator.");
const project = "demo-spark-limits",
  app = initializeApp({ projectId: project }),
  db = getFirestore(app),
  other = getFirestore(initializeApp({ projectId: "demo-spark-other" }, "other")),
  results = [];
const assert = (ok, message) => {
  if (!ok) throw Error(message);
  results.push(message);
};
const now = Date.now(),
  prefix = "spark-" + now.toString(36),
  hour = 3600000;
const policy = (key, extra = {}) => ({
  collection: "cmsRateLimits",
  keyForWindow: (w) => key + "-" + w,
  windowMs: hour,
  max: 3,
  now: () => now,
  ...extra,
});
const refs = [];
async function seed(collection, id, data, database = db) {
  const ref = database.collection(collection).doc(id);
  refs.push(ref);
  await ref.set(data);
  return ref;
}
try {
  const currentKey = prefix + "-expired-" + Math.floor(now / hour);
  await seed("cmsRateLimits", currentKey, { count: 999, expiresAt: Timestamp.fromMillis(now - 1) });
  const result = await consumeRateLimit(db, policy(prefix + "-expired"));
  assert(result.count === 1, "Retained expired admin counters reset without TTL deletion");
  const enquiryKey = prefix + "-enquiry-" + Math.floor(now / 900000);
  await seed("enquiryRateLimits", enquiryKey, {
    count: 99,
    expiresAt: Timestamp.fromMillis(now - 1),
  });
  assert(
    (
      await consumeRateLimit(db, {
        collection: "enquiryRateLimits",
        keyForWindow: (w) => prefix + "-enquiry-" + w,
        windowMs: 900000,
        max: 12,
        now: () => now,
      })
    ).count === 1,
    "Retained expired enquiry counters reset",
  );
  const burst = await Promise.allSettled(
    Array.from({ length: 8 }, () => consumeRateLimit(db, policy(prefix + "-burst"))),
  );
  refs.push(db.collection("cmsRateLimits").doc(prefix + "-burst-" + Math.floor(now / hour)));
  assert(
    burst.filter((r) => r.status === "fulfilled").length === 3 &&
      burst
        .filter((r) => r.status === "rejected")
        .every((r) => r.reason instanceof RateLimitReached),
    "Concurrent requests never exceed the quota and rejected requests remain limited",
  );
  const deadline = (Math.floor(now / hour) + 1) * hour;
  let ticks = 0;
  const rollover = await consumeRateLimit(
    db,
    policy(prefix + "-rollover", { now: () => (ticks++ === 0 ? deadline - 1 : deadline) }),
  );
  const freshRef = db
    .collection("cmsRateLimits")
    .doc(prefix + "-rollover-" + Math.floor(deadline / hour));
  refs.push(freshRef);
  assert(
    rollover.expiresAt === deadline + hour && (await freshRef.get()).get("count") === 1,
    "A window that rolls over during a transaction is retried against the new window",
  );
  const active = await seed("cmsRateLimits", prefix + "-active", {
    count: 2,
    expiresAt: Timestamp.fromMillis(now + hour),
  });
  const expired = await seed("cmsRateLimits", prefix + "-old", {
    count: 3,
    expiresAt: Timestamp.fromMillis(now - 100),
  });
  const racing = await seed("cmsRateLimits", prefix + "-refresh", {
    count: 3,
    expiresAt: Timestamp.fromMillis(now - 100),
  });
  const [activeSnapshot, expiredSnapshot, racingSnapshot] = await db.getAll(
    active,
    expired,
    racing,
  );
  await racing.set({ count: 1, expiresAt: Timestamp.fromMillis(now + hour) });
  const removed = await deleteExpiredRateLimits(
    db,
    [activeSnapshot, expiredSnapshot, racingSnapshot],
    now,
  );
  assert(
    removed.deleted === 1 &&
      removed.skipped === 2 &&
      (await active.get()).exists &&
      (await racing.get()).exists &&
      !(await expired.get()).exists,
    "Conditional deletion skips active counters and counters refreshed after the cleanup query",
  );
  const protectedRef = await seed("catalogPublished", prefix + "-protected", {
    expiresAt: Timestamp.fromMillis(now - 100),
  });
  let rejected = false;
  try {
    await deleteExpiredRateLimits(db, [await protectedRef.get()], now);
  } catch {
    rejected = true;
  }
  assert(
    rejected && (await protectedRef.get()).exists,
    "Cleanup rejects product collections before enqueuing writes",
  );
  const otherRef = await seed(
    "cmsRateLimits",
    prefix + "-other",
    { count: 1, expiresAt: Timestamp.fromMillis(now - 1) },
    other,
  );
  rejected = false;
  try {
    await deleteExpiredRateLimits(db, [await otherRef.get()], now);
  } catch {
    rejected = true;
  }
  assert(
    rejected && (await otherRef.get()).exists,
    "Cleanup cannot operate on a different Firestore instance or project",
  );
  assert(
    (await consumeRateLimit(other, policy(prefix + "-expired"))).count === 1,
    "Equal rate-limit keys in different projects do not share counters",
  );
  refs.push(other.collection("cmsRateLimits").doc(currentKey));
  for (let i = 0; i < 30; i++)
    await seed("cmsRateLimits", prefix + "-backlog-" + i, {
      count: 1,
      expiresAt: Timestamp.fromMillis(now - 1000 - i),
    });
  await db.collection("appMaintenance").doc("rate-limit-cleanup-v1").delete();
  const jobs = await Promise.all([
    cleanupExpiredRateLimits(db, { now: () => now }),
    cleanupExpiredRateLimits(db, { now: () => now }),
  ]);
  assert(
    jobs.filter((j) => j.acquired).length === 1 && jobs.every((j) => j.scanned <= 50),
    "Distributed cleanup lease admits one worker and queries stay bounded",
  );
  assert(
    jobs.find((j) => j.acquired).scanned <= 26,
    "Each collection is limited to 25 cleanup candidates",
  );
  assert(
    (await active.get()).exists && (await racing.get()).exists,
    "Leased cleanup preserves active records",
  );
  const later = await cleanupExpiredRateLimits(db, { now: () => now, force: true });
  assert(
    later.acquired && later.scanned > 0,
    "An explicit bounded maintenance run can drain the next backlog batch",
  );
  const cooldown = await cleanupExpiredRateLimits(db, { now: () => now });
  assert(!cooldown.acquired, "Ordinary requests respect the five-minute cleanup cooldown");
  console.log(results);
} finally {
  for (const ref of refs) await ref.delete();
  await db.collection("appMaintenance").doc("rate-limit-cleanup-v1").delete();
  await fs.writeFile(
    "/private/tmp/zeebaran-spark-integration.json",
    JSON.stringify(results, null, 2),
  );
}
