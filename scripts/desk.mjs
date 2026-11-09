import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
const env = process.env;
if (!env.FIREBASE_PROJECT_ID) throw Error("Set the desk project before running this command.");
const app = initializeApp({
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  credential:
    env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
      ? cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        })
      : applicationDefault(),
});
const db = getFirestore(app),
  entries = db.collection("enquiries");
const mode = process.argv[2] || "inbox";
if (mode === "inbox") {
  for (const doc of (await entries.orderBy("createdAt", "desc").limit(50).get()).docs)
    console.log(
      doc.id,
      doc.get("status") || "received",
      doc.get("reason"),
      doc.get("createdAt").toDate().toISOString(),
    );
} else if (mode === "recover") {
  const id = process.argv[3];
  if (!/^[a-f0-9-]{36}$/i.test(id || "")) throw Error("Supply one enquiry UUID.");
  const ref = entries.doc(id),
    snap = await ref.get(),
    row = snap.data();
  if (!row || row.status !== "receiving" || !row.attachment) throw Error("No pending receipt.");
  const path = "received/" + id + "/" + row.attachment.ticket + ".pdf",
    file = getStorage(app).bucket().file(path);
  const [meta] = await file.getMetadata();
  if (meta.contentType !== "application/pdf" || Number(meta.size) !== row.attachment.size)
    throw Error("Stored receipt mismatch.");
  const [bytes] = await getStorage(app)
    .bucket()
    .file(path, { generation: meta.generation })
    .download();
  if (!env.PDF_SCAN_URL?.startsWith("https://") || !env.PDF_SCAN_TOKEN)
    throw Error("Scanner configuration required.");
  const response = await fetch(env.PDF_SCAN_URL, {
    method: "POST",
    redirect: "error",
    headers: { "Content-Type": "application/pdf", Authorization: "Bearer " + env.PDF_SCAN_TOKEN },
    body: bytes,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok || (await response.json()).verdict !== "clean")
    throw Error("No clean scan verdict.");
  await db.runTransaction(async (tx) => {
    const current = await tx.get(ref);
    if (current.get("status") === "receiving" && current.get("fingerprint") === row.fingerprint)
      tx.update(ref, {
        object: path,
        status: "received",
        receivedAt: FieldValue.serverTimestamp(),
      });
  });
  console.log("Receipt reconciled", id);
} else throw Error("Use inbox or recover <UUID>.");
