import "server-only";
import { getFirestore } from "firebase-admin/firestore";
import { firebase } from "@/lib/firebase-admin";
import { AdminError } from "@/features/admin/server/security";
import { validSlug } from "./store";
import { mediaReferences } from "@/features/media/references";
/** Purging is distinct from reversible Trash. Keep the parent locked until child cleanup completes. */
export async function purgeEntry(id: string, revision: number, confirmation: string) {
  validSlug(id);
  const db = getFirestore(firebase()),
    ref = db.collection("catalogEntries").doc(id);
  const removed = await db.runTransaction(async (tx) => {
    const current = await tx.get(ref),
      data = current.data();
    if (!data) throw new AdminError(404, "This entry no longer exists.");
    if (!data.deleted)
      throw new AdminError(
        409,
        "Move this entry to Deleted entries before permanently deleting it.",
      );
    if (data.revision !== revision)
      throw new AdminError(409, "This entry changed. Reload before deleting.");
    if (confirmation !== data.draft.name)
      throw new AdminError(422, "Type the exact entry name to confirm deletion.");
    if (data.kind === "rootstock") {
      const rows = await tx.get(db.collection("catalogEntries").limit(1001));
      if (rows.size > 1000)
        throw new AdminError(
          503,
          "The catalog needs an indexed relationship audit before permanent deletion.",
        );
      if (
        rows.docs.some(
          (row) =>
            row.id !== id &&
            [
              ...(row.get("draft.rootstockIds") || []),
              ...(row.get("retainedPublished.rootstockIds") || []),
              ...(row.get("rootstockRefs") || []),
            ].includes(id),
        )
      )
        throw new AdminError(
          409,
          "A variety still references this rootstock, including in Trash. Remove that relationship or permanently delete the variety first.",
        );
    }
    tx.update(ref, { purging: true });
    tx.delete(db.collection("catalogPublished").doc(id));
    return {
      kind: data.kind as "variety" | "rootstock",
      media: mediaReferences({ draft: data.draft, retainedPublished: data.retainedPublished }),
    };
  });
  for (;;) {
    const rows = await db.collection("catalogAudit").where("entry", "==", id).limit(100).get();
    if (rows.empty) break;
    const batch = db.batch();
    rows.docs.forEach((row) => batch.delete(row.ref));
    await batch.commit();
  }
  // Firestore document deletion alone does not delete subcollections.
  for (const collection of await ref.listCollections()) await db.recursiveDelete(collection);
  await db.runTransaction(async (tx) => {
    const current = await tx.get(ref);
    if (!current.exists) return;
    if (!current.get("purging") || current.get("revision") !== revision)
      throw new AdminError(409, "The entry changed during cleanup. Retry deletion.");
    tx.delete(ref);
  });
  return removed;
}
