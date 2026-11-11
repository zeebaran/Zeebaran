import "server-only";
import { consumeRateLimit, RateLimitReached } from "@/lib/server/rate-limits";
import { scheduleRateLimitCleanup } from "@/lib/server/rate-limit-maintenance";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { EnquiryError } from "./errors";
import { validatePdf, scanCloudPdf, scannerUrl } from "./pdf";
import { type Submission } from "../schema";
import { firebase } from "@/lib/firebase-admin";
export async function limitCloud(keyForWindow: (window: number) => string) {
  const database = getFirestore(firebase());
  try {
    await consumeRateLimit(database, {
      collection: "enquiryRateLimits",
      windowMs: 15 * 60 * 1000,
      keyForWindow,
      max: 12,
    });
  } catch (error) {
    if (error instanceof RateLimitReached)
      throw new EnquiryError(429, "Too many requests. Please try again in 15 minutes.");
    throw error;
  } finally {
    await scheduleRateLimitCleanup(database);
  }
}
function bucket() {
  if (!process.env.FIREBASE_STORAGE_BUCKET)
    throw new EnquiryError(
      503,
      "PDF storage is unavailable. You can send the enquiry without a file or email the team.",
    );
  return getStorage(firebase()).bucket();
}
export async function issueCloud(ticket: string, id: string, size: number) {
  const file = bucket().file("pending/" + id + "/" + ticket + ".pdf");
  scannerUrl();
  const [policy] = await file.generateSignedPostPolicyV4({
    expires: Date.now() + 600000,
    fields: { "Content-Type": "application/pdf" },
    conditions: [
      ["content-length-range", size, size],
      ["eq", "$Content-Type", "application/pdf"],
    ],
  });
  return { ticket, ...policy };
}
function compareFingerprint(existing: string, fingerprint: string) {
  if (existing !== fingerprint)
    throw new EnquiryError(409, "This enquiry was already submitted with different details.");
}
async function acceptAttachment(
  id: string,
  attachment: NonNullable<Submission["attachment"]>,
  reserve: () => Promise<void>,
) {
  const storage = bucket();
  const pending = storage.file("pending/" + id + "/" + attachment.ticket + ".pdf");
  const destination = storage.file("received/" + id + "/" + attachment.ticket + ".pdf");
  const [alreadyCopied] = await destination.exists();
  if (!alreadyCopied) {
    const [exists] = await pending.exists();
    if (!exists)
      throw new EnquiryError(422, "The PDF upload is missing. Please select the file again.");
    const [meta] = await pending.getMetadata();
    if (Number(meta.size) !== attachment.size || meta.contentType !== "application/pdf")
      throw new EnquiryError(422, "The uploaded file does not match the attachment.");
    const snapshot = storage.file(pending.name, { generation: meta.generation });
    const [bytes] = await snapshot.download();
    await validatePdf(bytes);
    await scanCloudPdf(bytes);
    await reserve();
    try {
      await snapshot.copy(destination, { preconditionOpts: { ifGenerationMatch: 0 } });
    } catch (error) {
      if ((error as { code?: number }).code !== 412) throw error;
    }
  }
  if (alreadyCopied) {
    const [meta] = await destination.getMetadata();
    if (Number(meta.size) !== attachment.size)
      throw new EnquiryError(422, "The stored attachment size does not match.");
    const [bytes] = await storage
      .file(destination.name, { generation: meta.generation })
      .download();
    await validatePdf(bytes);
    await scanCloudPdf(bytes);
    await reserve();
  }
  const [accepted] = await destination.getMetadata();
  if (Number(accepted.size) !== attachment.size || accepted.contentType !== "application/pdf") {
    throw new EnquiryError(422, "The stored PDF does not match the attachment.");
  }
  return destination.name;
}
export async function saveCloud(data: Submission, fingerprint: string) {
  const database = getFirestore(firebase());
  const doc = database.collection("enquiries").doc(data.requestId);
  const prior = await doc.get();
  if (prior.exists) {
    compareFingerprint(prior.get("fingerprint"), fingerprint);
    if (prior.get("status") !== "receiving") return;
  }
  const reserve = () =>
    database.runTransaction(async (tx) => {
      const previous = await tx.get(doc);
      if (previous.exists) {
        compareFingerprint(previous.get("fingerprint"), fingerprint);
        return;
      }
      tx.create(doc, {
        ...data,
        fingerprint,
        status: "receiving",
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  const object = data.attachment
    ? await acceptAttachment(data.requestId, data.attachment, reserve)
    : null;
  await database.runTransaction(async (tx) => {
    const previous = await tx.get(doc);
    if (previous.exists) {
      compareFingerprint(previous.get("fingerprint"), fingerprint);
      if (previous.get("status") === "receiving")
        tx.update(doc, { object, status: "received", receivedAt: FieldValue.serverTimestamp() });
      return;
    }
    tx.create(doc, {
      ...data,
      object,
      fingerprint,
      status: "received",
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}
