// node --conditions=react-server --experimental-strip-types --env-file=.env.local scripts/cleanup-rate-limits.mjs --project=zeebaran085 [--apply] [--max-batches=5]
import { cert, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  cleanupExpiredRateLimits,
  cleanupBatchPerCollection,
  rateLimitCollections,
} from "../lib/server/rate-limits.ts";
const project = process.argv.find((v) => v.startsWith("--project="))?.slice(10),
  apply = process.argv.includes("--apply"),
  max = Number(process.argv.find((v) => v.startsWith("--max-batches="))?.slice(14) || 1);
if (!project || project !== process.env.FIREBASE_PROJECT_ID)
  throw Error("Pass --project matching FIREBASE_PROJECT_ID.");
if (!Number.isInteger(max) || max < 1 || max > 5) throw Error("Use one to five bounded batches.");
const host = process.env.FIRESTORE_EMULATOR_HOST;
if (host && (!project.startsWith("demo-") || !/^127\.0\.0\.1:\d+$/.test(host)))
  throw Error("Emulator cleanup requires an explicit demo project and loopback host.");
if (project.startsWith("demo-") && !host)
  throw Error("A demo project requires the Firestore emulator.");
const app = initializeApp({
    projectId: project,
    ...(!host
      ? {
          credential:
            process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
              ? cert({
                  projectId: project,
                  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                })
              : applicationDefault(),
        }
      : {}),
  }),
  db = getFirestore(app);
if (!apply) {
  const cutoff = Timestamp.now();
  for (const collection of rateLimitCollections) {
    const rows = await db
      .collection(collection)
      .where("expiresAt", "<=", cutoff)
      .orderBy("expiresAt")
      .limit(cleanupBatchPerCollection)
      .get();
    console.log(
      JSON.stringify({
        collection,
        candidates: rows.size,
        limit: cleanupBatchPerCollection,
        mode: "dry-run",
      }),
    );
  }
} else {
  for (let i = 0; i < max; i++) {
    const result = await cleanupExpiredRateLimits(db, { force: true });
    console.log(JSON.stringify(result));
    if (!result.acquired || !result.scanned) break;
  }
}
