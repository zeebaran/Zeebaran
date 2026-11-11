import { authoredAsset, isCloudinaryImage } from "@/features/media/delivery";
import "server-only";
import {
  getFirestore,
  Timestamp,
  FieldPath,
  type Query,
  type DocumentData,
} from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { firebase } from "@/lib/firebase-admin";
import { AdminError } from "@/features/admin/server/security";
import { catalogSchema, publicationProblems, slugSchema, normalizeSearch } from "../schema";
import type {
  CatalogData,
  CatalogEntry,
  CatalogKind,
  CatalogPage,
  CatalogIndexEntry,
} from "../model";
export const catalogDb = () => getFirestore(firebase());
export function validSlug(value: string) {
  const s = slugSchema.safeParse(value);
  if (!s.success) throw new AdminError(422, "Use a valid catalog URL.");
  return s.data;
}
const date = (v: unknown) => (v instanceof Timestamp ? v.toDate().toISOString() : "");
export function serializeEntry(id: string, d: DocumentData): CatalogEntry {
  return {
    id,
    revision: d.revision,
    draft: d.draft,
    published: !!d.published,
    deleted: !!d.deleted,
    updatedAt: date(d.updatedAt),
    publishedAt: d.publishedAt ? date(d.publishedAt) : null,
  };
}
export async function readEntry(id: string) {
  const d = await catalogDb().collection("catalogEntries").doc(validSlug(id)).get();
  if (!d.exists) throw new AdminError(404, "Catalog entry not found.");
  return serializeEntry(d.id, d.data()!);
}
export function encodeCursor(value: unknown[]) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
export function decodeCursor(value: string | null, count = 2) {
  if (!value) return null;
  if (value.length > 4096) throw new AdminError(422, "Invalid page cursor.");
  try {
    const d = JSON.parse(Buffer.from(value, "base64url").toString());
    if (
      !Array.isArray(d) ||
      d.length !== count ||
      typeof d[0] !== "string" ||
      typeof d[1] !== "string" ||
      !slugSchema.safeParse(d[1]).success
    )
      throw Error();
    return d;
  } catch {
    throw new AdminError(422, "Invalid page cursor.");
  }
}
export async function adminEntries(
  kind: CatalogKind,
  deleted = false,
  cursor: string | null = null,
  search = "",
): Promise<CatalogPage<CatalogIndexEntry>> {
  let q: Query = catalogDb()
    .collection("catalogEntries")
    .where("kind", "==", kind)
    .where("deleted", "==", deleted)
    .orderBy("nameSort")
    .orderBy(FieldPath.documentId());
  if (search) {
    const normalized = normalizeSearch(search).slice(0, 80);
    q = q.where("nameSort", ">=", normalized).where("nameSort", "<=", normalized + "\uf8ff");
  }
  const after = decodeCursor(cursor);
  if (after) q = q.startAfter(...after);
  const docs = (
      await q
        .select(
          "draft.name",
          "draft.kind",
          "revision",
          "published",
          "deleted",
          "updatedAt",
          "publishedAt",
          "nameSort",
        )
        .limit(26)
        .get()
    ).docs,
    visible = docs.slice(0, 25),
    last = visible.at(-1);
  return {
    items: visible.map((d) => ({
      ...serializeEntry(d.id, d.data()),
      draft: { name: d.get("draft.name"), kind: d.get("draft.kind") },
    })),
    nextCursor: docs.length > 25 && last ? encodeCursor([last.get("nameSort"), last.id]) : null,
  };
}
async function validateImages(data: CatalogData, original?: CatalogData) {
  const db = catalogDb();
  data.images = data.images.map((image) => {
    const asset = authoredAsset(image.src);
    return asset
      ? {
          src: asset.src,
          publicId: asset.publicId,
          width: asset.width,
          height: asset.height,
          alt: image.alt,
        }
      : image;
  });
  if (data.images.some((image) => !isCloudinaryImage(image.src) || !image.publicId))
    throw new AdminError(422, "Choose a verified Cloudinary photograph from the media library.");
  const ids = [
    ...new Set(
      data.images
        .filter((i) => !original?.images.some((o) => o.src === i.src && o.publicId === i.publicId))
        .map((i) => i.publicId),
    ),
  ];
  if (ids.some((id) => !id))
    throw new AdminError(422, "Choose images from the verified media library.");
  if (!ids.length) return;
  const docs = await db.getAll(
    ...ids.map((id) => db.collection("cmsMedia").doc(Buffer.from(id!).toString("base64url"))),
  );
  const library = new Map(docs.map((d) => [d.get("publicId"), d.data()]));
  for (const image of data.images) {
    if (original?.images.some((o) => o.src === image.src && o.publicId === image.publicId))
      continue;
    const asset = library.get(image.publicId);
    if (
      !asset ||
      asset.resourceType !== "image" ||
      asset.src !== image.src ||
      !image.src.startsWith(
        "https://res.cloudinary.com/" + process.env.CLOUDINARY_CLOUD_NAME + "/image/upload/",
      )
    )
      throw new AdminError(422, "Image verification failed. Choose a verified library image.");
  }
}
export type CatalogAction = "save" | "publish" | "unpublish" | "delete" | "restore";
export async function writeEntry(
  id: string,
  action: CatalogAction,
  revision: number,
  raw: unknown,
  actor: { uid: string; email?: string },
  confirmation?: string,
) {
  validSlug(id);
  const db = catalogDb(),
    ref = db.collection("catalogEntries").doc(id),
    publicRef = db.collection("catalogPublished").doc(id);
  const existing = await ref.get();
  const old = existing.data();
  let data: CatalogData | undefined;
  if (action === "save" || action === "publish") {
    const parsed = catalogSchema.safeParse(raw);
    if (!parsed.success)
      throw new AdminError(422, parsed.error.issues[0]?.message || "Check the catalog fields.");
    data = parsed.data;
    if (data.slug !== id)
      throw new AdminError(422, "The catalog URL cannot change after creation.");
    if (old && old.kind !== data.kind) throw new AdminError(422, "The entry type cannot change.");
    if (action === "publish") {
      const problems = publicationProblems(data);
      if (problems.length) throw new AdminError(422, problems.join(" "));
    }
    await validateImages(data, old?.draft);
  }
  await db.runTransaction(async (tx) => {
    const current = await tx.get(ref),
      d = current.data();
    if ((d?.revision || 0) !== revision)
      throw new AdminError(409, "This entry changed in another tab. Reload before saving.");
    if (!d && action !== "save" && action !== "publish")
      throw new AdminError(404, "Catalog entry not found.");
    if (!d && revision !== 0) throw new AdminError(409, "This entry no longer exists.");
    if (d?.deleted && action !== "restore")
      throw new AdminError(409, "Restore the deleted entry before editing it.");
    const selected = data || (d!.draft as CatalogData);
    if (action === "delete" && confirmation !== selected.name)
      throw new AdminError(422, "Type the exact entry name to confirm deletion.");
    // Both draft and published relations stay indexed until explicitly removed.
    const published = await tx.get(publicRef);
    const refs = [
      ...new Set([
        ...(selected.rootstockIds || []),
        ...(action !== "save" ? [] : published.get("rootstockIds") || []),
      ]),
    ];
    if (refs.length) {
      const related = await tx.getAll(
        ...refs.map((slug) => db.collection("catalogEntries").doc(slug)),
      );
      for (const r of related)
        if (!r.exists || r.get("kind") !== "rootstock" || r.get("deleted"))
          throw new AdminError(422, "A linked rootstock was removed. Update the selection.");
      if (action === "publish" && related.some((r) => !r.get("published")))
        throw new AdminError(422, "Publish linked rootstocks before publishing this variety.");
    }
    if ((action === "delete" || action === "unpublish") && selected.kind === "rootstock") {
      const using = await tx.get(
        db
          .collection("catalogEntries")
          .where("rootstockRefs", "array-contains", id)
          .where("deleted", "==", false)
          .limit(1),
      );
      if (!using.empty)
        throw new AdminError(
          409,
          "This rootstock is linked to a variety. Remove it from that variety's draft and published version before " +
            (action === "delete" ? "deleting" : "unpublishing") +
            ".",
        );
    }
    const now = Timestamp.now(),
      nextRevision = revision + 1;
    const update = {
      draft: selected,
      kind: selected.kind,
      nameSort: normalizeSearch(selected.name),
      rootstockRefs: action === "delete" ? [] : refs,
      revision: nextRevision,
      published:
        action === "publish"
          ? true
          : action === "unpublish" || action === "delete" || action === "restore"
            ? false
            : !!d?.published,
      deleted: action === "delete",
      updatedAt: now,
      updatedBy: actor.uid,
      publishedAt: action === "publish" ? now : d?.publishedAt || null,
      ...(!d ? { createdAt: now } : {}),
      deletedAt: action === "delete" ? now : null,
      retainedPublished:
        action === "publish"
          ? null
          : (action === "delete" || action === "unpublish") && published.exists
            ? published.data()
            : d?.retainedPublished || null,
    };
    tx.set(ref, update);
    if (action === "publish")
      tx.set(publicRef, {
        ...selected,
        nameSort: normalizeSearch(selected.name),
        publishedAt: now,
        revision: nextRevision,
      });
    if (action === "unpublish" || action === "delete" || action === "restore") tx.delete(publicRef);
    tx.create(db.collection("catalogAudit").doc(randomUUID()), {
      entry: id,
      action,
      revision: nextRevision,
      actor: actor.uid,
      createdAt: now,
    });
  });
  return readEntry(id);
}
