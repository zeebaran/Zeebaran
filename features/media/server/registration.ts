import "server-only";
import type { Firestore, Transaction } from "firebase-admin/firestore";
import { authoredAsset } from "../delivery";
import { mediaReferences } from "../references";
import { AdminError } from "@/features/admin/server/security";
/** Read registrations inside the content transaction, so a concurrent deletion cannot win silently. */
export async function verifyMediaReferences(db: Firestore, tx: Transaction, value: unknown) {
  function checkIdentity(node: unknown) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(checkIdentity);
      return;
    }
    const object = node as Record<string, unknown>;
    if (typeof object.src === "string" && typeof object.publicId === "string") {
      const identity = mediaReferences({ src: object.src })[0];
      if (!identity || identity.publicId !== object.publicId)
        throw new AdminError(422, "The file URL and library identifier do not match.");
    }
    Object.values(object).forEach(checkIdentity);
  }
  checkIdentity(value);
  const media = mediaReferences(value).filter((item) => !authoredAsset(item.src));
  if (!media.length) return;
  const ids = [...new Set(media.map((item) => item.publicId))].sort();
  const registered = await tx.getAll(
    ...ids.map((item) => db.collection("cmsMedia").doc(Buffer.from(item).toString("base64url"))),
  );
  const library = new Map(ids.map((id, index) => [id, registered[index]]));
  for (const expected of media) {
    const doc = library.get(expected.publicId)!;
    if (
      !doc.exists ||
      doc.get("state") === "deleting" ||
      doc.get("src") !== expected.src ||
      doc.get("resourceType") !== expected.resourceType
    )
      throw new AdminError(
        422,
        "A selected file is unavailable or being deleted. Choose another file from the media library.",
      );
  }
}
