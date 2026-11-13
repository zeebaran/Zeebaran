import "server-only";
import { getFirestore, type DocumentData, type DocumentSnapshot } from "firebase-admin/firestore";
import { firebase } from "@/lib/firebase-admin";
import { contentPages } from "../model";

export const retainedPageRevisions = 20;
export const historyCleanupBatch = 25;

/** Legacy publications share the exact timestamp of their history snapshot. Fail closed if unknown. */
export function isPublishedHistory(page: DocumentData, row: DocumentSnapshot) {
  if (
    typeof page.publishedHistoryId === "string" &&
    /^[a-f0-9-]{36}$/.test(page.publishedHistoryId)
  )
    if (row.id === page.publishedHistoryId) return true;
  if (row.get("action") !== "publish") return false;
  const publishedAt = page.publishedAt;
  const createdAt = row.get("createdAt");
  return (
    !publishedAt?.isEqual ||
    !createdAt?.isEqual ||
    publishedAt.isEqual(createdAt) ||
    Boolean(page.previousPublishedAt?.isEqual?.(createdAt))
  );
}

/** Sequential revisions are created atomically with the page. No offsets or full history scans. */
export async function prunePageHistory(page: string) {
  if (!contentPages.some(([id]) => id === page)) throw Error("Invalid page history scope.");
  const db = getFirestore(firebase());
  const ref = db.collection("cmsPages").doc(page);
  return db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    const current = snapshot.data();
    if (
      !current ||
      !Number.isSafeInteger(current.revision) ||
      current.revision <= retainedPageRevisions
    )
      return 0;
    // Reading the parent makes a concurrent publication/restore retry before deletions commit.
    const obsolete = await tx.get(
      ref
        .collection("history")
        .where("revision", "<=", current.revision - retainedPageRevisions)
        .orderBy("revision", "asc")
        .limit(historyCleanupBatch + 1)
        .select("action", "createdAt", "revision"),
    );
    let deleted = 0;
    for (const row of obsolete.docs) {
      if (isPublishedHistory(current, row) || deleted >= historyCleanupBatch) continue;
      tx.delete(row.ref);
      deleted++;
    }
    return deleted;
  });
}
