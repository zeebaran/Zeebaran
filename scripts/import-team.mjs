/** Import the owner-supplied team and portrait without replacing existing About copy or images. */
import fs from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const apply = process.argv.includes("--apply"),
  project = process.env.FIREBASE_PROJECT_ID,
  cloud = process.env.CLOUDINARY_CLOUD_NAME;
const source = process.argv.find((v) => v.startsWith("--photo="))?.slice(8);
if (!source) throw Error("Specify the supplied portrait with --photo=<absolute path>.");
const members = JSON.parse(await fs.readFile("features/team/members.json", "utf8"));
if (!apply) {
  console.log(
    JSON.stringify({
      action: "Import the supplied portrait and six About team profiles",
      members: members.map((m) => m.name),
      apply: false,
    }),
  );
  process.exit(0);
}
if (
  process.env.FIRESTORE_EMULATOR_HOST ||
  !project ||
  !cloud ||
  !process.argv.includes("--project=" + project) ||
  !process.argv.includes("--cloud=" + cloud)
)
  throw Error("Select the existing Firebase project and Cloudinary cloud explicitly.");
const key = process.env.CLOUDINARY_API_KEY,
  secret = process.env.CLOUDINARY_API_SECRET;
if (!key || !secret || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY)
  throw Error("Use the existing private server configuration.");
const bytes = await fs.readFile(source),
  sha256 = createHash("sha256").update(bytes).digest("hex");
if (bytes.length > 10 * 1024 * 1024)
  throw Error("Portrait exceeds the existing 10 MB image limit.");
const publicId = "zeebaran/team/aadil-sheikh-" + sha256.slice(0, 12);
const api = "https://api.cloudinary.com/v1_1/" + cloud;
const resource = await fetch(api + "/resources/image/upload/" + encodeURIComponent(publicId), {
  headers: { Authorization: "Basic " + Buffer.from(key + ":" + secret).toString("base64") },
  signal: AbortSignal.timeout(30000),
});
let media;
if (resource.ok) media = await resource.json();
else if (resource.status === 404) {
  const params = {
    asset_folder: "zeebaran/team",
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
  form.append("file", new Blob([bytes], { type: "image/webp" }), "aadil-sheikh.webp");
  const upload = await fetch(api + "/image/upload", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  if (!upload.ok) throw Error("Cloudinary portrait upload failed (HTTP " + upload.status + ").");
  media = await upload.json();
} else throw Error("Cloudinary verification failed (HTTP " + resource.status + ").");
if (
  media.public_id !== publicId ||
  media.resource_type !== "image" ||
  !media.secure_url?.startsWith("https://res.cloudinary.com/" + cloud + "/image/upload/")
)
  throw Error("Portrait verification failed.");
const image = {
  src: media.secure_url,
  alt: "Mr. Aadil Sheikh",
  publicId,
  resourceType: "image",
  width: media.width,
  height: media.height,
};
members[0] = { ...members[0], image };
const app = initializeApp({
  credential: cert({
    projectId: project,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore(app),
  ref = db.collection("cmsPages").doc("about"),
  mediaRef = db.collection("cmsMedia").doc(Buffer.from(publicId).toString("base64url"));
const before = await ref.get(),
  backup = ".local/team-import-" + new Date().toISOString().replace(/[:.]/g, "-");
await fs.mkdir(backup, { recursive: true });
await fs.writeFile(backup + "/about-before.json", JSON.stringify(before.data() || null, null, 2), {
  mode: 0o600,
});
let changed = false;
await db.runTransaction(async (tx) => {
  const [page, registered] = await Promise.all([tx.get(ref), tx.get(mediaRef)]),
    data = page.data() || {},
    now = Timestamp.now();
  const attach = (content) => {
    const value = content || { text: {}, images: {} };
    const team =
      value.team === undefined
        ? members
        : value.team.map((m) => (m.id === "aadil-sheikh" && !m.image ? { ...m, image } : m));
    return { ...value, team };
  };
  const draft = attach(data.draft),
    published = attach(data.published);
  changed =
    JSON.stringify(draft) !== JSON.stringify(data.draft) ||
    JSON.stringify(published) !== JSON.stringify(data.published);
  if (!registered.exists)
    tx.create(mediaRef, {
      ...image,
      bytes: media.bytes,
      format: media.format,
      category: "team",
      sha256,
      name: "aadil-sheikh.webp",
      createdBy: "owner-supplied-team-import",
      createdAt: now,
    });
  if (!changed) return;
  const revision = (data.revision || 0) + 1;
  tx.create(ref.collection("history").doc(randomUUID()), {
    action: "before-team-import",
    actor: "owner-supplied-team-import",
    revision: data.revision || 0,
    createdAt: now,
    content: data.draft || { text: {}, images: {} },
  });
  tx.set(
    ref,
    { draft, published, revision, updatedAt: now, publishedAt: now },
    { mergeFields: ["draft", "published", "revision", "updatedAt", "publishedAt"] },
  );
  tx.create(db.collection("cmsAudit").doc(randomUUID()), {
    page: "about",
    action: "team-import",
    actor: "owner-supplied-team-import",
    revision,
    createdAt: now,
  });
});
await fs.writeFile("features/team/members.json", JSON.stringify(members, null, 2) + "\n");
console.log(
  JSON.stringify({
    portrait: "Verified in Cloudinary and registered in cmsMedia",
    profiles: members.length,
    aboutUpdated: changed,
    existingAboutContent: "Preserved",
    backup,
  }),
);
