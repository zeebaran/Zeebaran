/** Owner-supplied partner import. Additive, backed up, idempotent; never removes existing entries. */
import fs from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
try {
  process.loadEnvFile(".env.local");
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const apply = process.argv.includes("--apply"),
  project = process.env.FIREBASE_PROJECT_ID,
  cloud = process.env.CLOUDINARY_CLOUD_NAME;
const input = JSON.parse(await fs.readFile("features/cms/strategic-partners.json", "utf8"));
if (!apply) {
  console.log(
    JSON.stringify({
      partners: input.map((p) => p.name),
      action: "Add supplied logos and profiles while preserving existing draft/published content",
      apply: false,
    }),
  );
  process.exit(0);
}
if (
  project !== "zeebaran085" ||
  process.env.FIRESTORE_EMULATOR_HOST ||
  !process.argv.includes("--project=" + project) ||
  !process.argv.includes("--cloud=" + cloud)
)
  throw Error("Select the existing live project and cloud explicitly.");
const credential = cert({
  projectId: project,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
});
const db = getFirestore(initializeApp({ projectId: project, credential })),
  ref = db.collection("cmsPages").doc("partnerships");
const before = (await ref.get()).data();
if (!before?.published?.partners)
  throw Error("Expected the existing managed partner list; inspect before importing.");
await fs.mkdir(".local/partner-profiles", { recursive: true });
const backup = ".local/partner-profiles/before-" + Date.now() + ".json";
await fs.writeFile(backup, JSON.stringify(before, null, 2));
const api = "https://api.cloudinary.com/v1_1/" + cloud,
  key = process.env.CLOUDINARY_API_KEY,
  secret = process.env.CLOUDINARY_API_SECRET;
if (!key || !secret) throw Error("Existing Cloudinary credentials required.");
const registrations = [];
for (const partner of input) {
  const arg = process.argv.find((v) => v.startsWith("--" + partner.id + "="));
  if (!arg) throw Error("Provide --" + partner.id + "=<logo path>");
  const bytes = await fs.readFile(arg.slice(arg.indexOf("=") + 1)),
    hash = createHash("sha256").update(bytes).digest("hex"),
    publicId = "zeebaran/partners/" + partner.id + "-" + hash.slice(0, 12);
  let response = await fetch(api + "/resources/image/upload/" + encodeURIComponent(publicId), {
      headers: { Authorization: "Basic " + Buffer.from(key + ":" + secret).toString("base64") },
      signal: AbortSignal.timeout(30000),
    }),
    media;
  if (response.ok) media = await response.json();
  else if (response.status === 404) {
    const params = {
      asset_folder: "zeebaran/partners",
      public_id: publicId,
      overwrite: "false",
      timestamp: Math.floor(Date.now() / 1000),
    };
    const signature = createHash("sha256")
      .update(
        Object.entries(params)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => k + "=" + v)
          .join("&") + secret,
      )
      .digest("hex");
    const form = new FormData();
    for (const [k, v] of Object.entries({ ...params, api_key: key, signature }))
      form.append(k, String(v));
    form.append("file", new Blob([bytes], { type: "image/png" }), partner.id + ".png");
    response = await fetch(api + "/image/upload", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw Error("Cloudinary upload failed: " + response.status);
    media = await response.json();
  } else throw Error("Cloudinary verification failed: " + response.status);
  if (
    media.public_id !== publicId ||
    media.resource_type !== "image" ||
    !media.secure_url?.startsWith("https://res.cloudinary.com/" + cloud + "/image/upload/")
  )
    throw Error("Unexpected image identity");
  const image = {
    src: media.secure_url,
    publicId,
    alt: partner.name + " logo",
    resourceType: "image",
    width: media.width,
    height: media.height,
  };
  partner.mode = "image";
  partner.image = image;
  registrations.push({
    ...image,
    name: partner.id + ".png",
    bytes: media.bytes,
    format: media.format,
    category: "partners",
    sha256: hash,
  });
}
let changed = false;
await db.runTransaction(async (tx) => {
  const page = await tx.get(ref),
    data = page.data() || {};
  const mediaRefs = registrations.map((m) =>
    db.collection("cmsMedia").doc(Buffer.from(m.publicId).toString("base64url")),
  );
  const existing = await tx.getAll(...mediaRefs);
  // Require explicit lists; never reconstruct or replace a manually authored list.
  const attach = (content) => {
    if (!Array.isArray(content?.partners))
      throw Error("Partner list changed; inspect before retry.");
    const ids = new Set(content.partners.map((p) => p.id));
    return { ...content, partners: [...content.partners, ...input.filter((p) => !ids.has(p.id))] };
  };
  const draft = attach(data.draft),
    published = attach(data.published);
  changed =
    JSON.stringify(draft) !== JSON.stringify(data.draft) ||
    JSON.stringify(published) !== JSON.stringify(data.published);
  const now = Timestamp.now();
  for (let i = 0; i < registrations.length; i++)
    if (!existing[i].exists)
      tx.create(mediaRefs[i], {
        ...registrations[i],
        createdBy: "owner-supplied-partner-import",
        createdAt: now,
      });
  if (!changed) return;
  const revision = (data.revision || 0) + 1;
  tx.create(ref.collection("history").doc(randomUUID()), {
    action: "before-partner-import",
    actor: "owner-supplied-partner-import",
    revision: data.revision || 0,
    createdAt: now,
    content: data.draft,
  });
  tx.set(
    ref,
    { draft, published, revision, updatedAt: now, publishedAt: now },
    { mergeFields: ["draft", "published", "revision", "updatedAt", "publishedAt"] },
  );
  tx.create(db.collection("cmsAudit").doc(randomUUID()), {
    page: "partnerships",
    action: "partner-import",
    actor: "owner-supplied-partner-import",
    revision,
    createdAt: now,
  });
});
await fs.writeFile("features/cms/strategic-partners.json", JSON.stringify(input, null, 2) + "\n");
console.log(
  JSON.stringify({
    changed,
    logos: registrations.length,
    existingContent: "preserved",
    backup,
    partners: input.map((p) => ({ id: p.id, publicId: p.image.publicId })),
  }),
);
await db.terminate();
