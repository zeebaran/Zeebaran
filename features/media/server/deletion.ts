import "server-only";
import {
  getFirestore,
  Timestamp,
  type Transaction,
  type Firestore,
} from "firebase-admin/firestore";
import { firebase } from "@/lib/firebase-admin";
import { AdminError } from "@/features/admin/server/security";
import { destroyResource } from "@/features/admin/server/cloudinary";
import { isDefaultMedia, usesMedia, withoutMedia, type MediaIdentity } from "../references";

const mediaRef = (db: Firestore, publicId: string) =>
  db.collection("cmsMedia").doc(Buffer.from(publicId).toString("base64url"));
export type MediaUsage = { label: string; href?: string };
/** On-demand safety audit only. Never runs on media-list/page navigation. Fails closed above the bound. */
async function usage(db: Firestore, tx: Transaction, target: MediaIdentity) {
  const used: MediaUsage[] = [];
  if (isDefaultMedia(target))
    used.push({ label: "An original website image (protected fallback)" });
  for (const name of ["cmsPages", "catalogEntries", "catalogPublished"] as const) {
    const rows = await tx.get(db.collection(name).limit(1001));
    if (rows.size > 1000)
      throw new AdminError(
        503,
        "The collection needs an indexed media audit before files can be deleted safely.",
      );
    for (const row of rows.docs) {
      const data = row.data();
      // Deleted catalog entries still need their photographs for Restore as draft.
      if (
        usesMedia(
          name === "cmsPages" ? { draft: data.draft, published: data.published } : data,
          target,
        )
      )
        used.push({
          label:
            name === "cmsPages"
              ? row.id + " — page draft or published revision"
              : (data.draft?.name || data.name || row.id) +
                (data.deleted ? " — catalog Trash" : " — catalog"),
          href: name === "cmsPages" ? "/admin/pages/" + row.id : "/admin/catalog/" + row.id,
        });
    }
  }
  return used;
}
export async function inspectMedia(publicId: string) {
  const db = getFirestore(firebase());
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(mediaRef(db, publicId));
    if (!doc.exists) throw new AdminError(404, "This file is no longer in the library.");
    return {
      name: doc.get("name") as string,
      usage: await usage(db, tx, doc.data() as MediaIdentity),
      pending: doc.get("state") === "deleting",
    };
  });
}
async function cleanHistory(db: Firestore, target: MediaIdentity) {
  const pages = await db.collection("cmsPages").listDocuments();
  for (const page of pages) {
    let cursor: string | undefined;
    for (;;) {
      let query = page.collection("history").orderBy("__name__").limit(100);
      if (cursor) query = query.startAfter(cursor);
      const rows = await query.get();
      for (const row of rows.docs) {
        if (!usesMedia(row.get("content"), target)) continue;
        await db.runTransaction(async (tx) => {
          const current = await tx.get(row.ref);
          if (current.exists && usesMedia(current.get("content"), target))
            tx.update(row.ref, { content: withoutMedia(current.get("content"), target) });
        });
      }
      if (rows.size < 100) break;
      cursor = rows.docs.at(-1)!.id;
    }
  }
  for (const field of ["publicId", "src"]) {
    for (;;) {
      const rows = await db
        .collection("catalogAssets")
        .where(field, "==", target[field as "publicId" | "src"])
        .limit(100)
        .get();
      if (rows.empty) break;
      const batch = db.batch();
      rows.docs.forEach((row) => batch.delete(row.ref));
      await batch.commit();
    }
  }
}
export async function deleteMedia(publicId: string, confirmation: string, actor: string) {
  const db = getFirestore(firebase()),
    ref = mediaRef(db, publicId);
  const target = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return null; // A retry after completed deletion is successful.
    if (confirmation !== doc.get("name"))
      throw new AdminError(422, "Type the exact file name to confirm deletion.");
    const asset = doc.data() as MediaIdentity;
    if (
      !["image", "video"].includes(asset.resourceType) ||
      !asset.src.startsWith(
        "https://res.cloudinary.com/" +
          process.env.CLOUDINARY_CLOUD_NAME +
          "/" +
          asset.resourceType +
          "/upload/",
      )
    )
      throw new AdminError(422, "This file does not belong to the configured Cloudinary library.");
    const used = await usage(db, tx, asset);
    if (used.length)
      throw new AdminError(
        409,
        "This file is still used by " + used[0].label + ". Remove or replace it there first.",
      );
    if (doc.get("deletionStartedAt")?.toMillis() > Date.now() - 60000)
      throw new AdminError(409, "Deletion is still running. Wait a minute before retrying.");
    tx.update(ref, { state: "deleting", deletionStartedAt: Timestamp.now(), deletionActor: actor });
    return asset;
  });
  if (!target) return;
  // Keep a retryable registration on every failure, including an uncertain network timeout.
  try {
    await destroyResource(target.publicId, target.resourceType);
    await cleanHistory(db, target);
    await ref.delete();
  } catch (error) {
    await ref.update({ deletionStartedAt: Timestamp.fromMillis(0) }).catch(() => {});
    if (error instanceof AdminError) throw error;
    throw new AdminError(
      503,
      "Deletion is incomplete. Retry this file in the media library to finish Cloudinary and database cleanup.",
    );
  }
}
