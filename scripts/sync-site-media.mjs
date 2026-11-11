/** Existing-account migration. Dry run unless --apply --cloud=<existing cloud> is supplied.
 * Never overwrites/deletes assets or renames public IDs. Original byte hashes must match.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
const apply = process.argv.includes("--apply"),
  register = process.argv.includes("--register");
const cloud = process.env.CLOUDINARY_CLOUD_NAME,
  key = process.env.CLOUDINARY_API_KEY,
  secret = process.env.CLOUDINARY_API_SECRET;
if (!cloud || !key || !secret) throw Error("Use the existing Cloudinary server configuration.");
if (apply && !process.argv.includes("--cloud=" + cloud))
  throw Error("Select the configured cloud explicitly.");
if (register && (!apply || !process.argv.includes("--project=" + process.env.FIREBASE_PROJECT_ID)))
  throw Error("Registry writes require --apply and the configured --project.");
const headers = { Authorization: "Basic " + Buffer.from(key + ":" + secret).toString("base64") };
async function api(endpoint, options = {}) {
  const r = await fetch("https://api.cloudinary.com/v1_1/" + cloud + endpoint, {
    ...options,
    headers: options.body ? undefined : headers,
    signal: AbortSignal.timeout(60000),
  });
  if (!r.ok) throw Error("Cloudinary " + endpoint.split("?")[0] + " HTTP " + r.status);
  return r.json();
}
function signed(params) {
  const signature = createHash("sha256")
    .update(
      Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => k + "=" + v)
        .join("&") + secret,
    )
    .digest("hex");
  const form = new FormData();
  for (const [k, v] of Object.entries({ ...params, signature, api_key: key }))
    form.append(k, String(v));
  return form;
}
async function walk(dir) {
  const files = [];
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    files.push(...(d.isDirectory() ? await walk(p) : [p]));
  }
  return files;
}
function category(src) {
  if (/Varrients/.test(src)) return /banner/.test(src) ? "banners/varieties" : "apple-varieties";
  if (/laboratory/.test(src)) return "laboratory";
  if (/thumb-/.test(src)) return "galleries/home";
  if (/Home_Desktop|hero|legacy-sunset|TV_Orchard/.test(src))
    return "banners/" + (/TV_/.test(src) ? "mission" : "home");
  if (/nursery/.test(src)) return "orchards/nurseries";
  if (/sorting|storage/.test(src)) return "products/infrastructure";
  if (/field-|agronomists|community|consultation|clean-editorial/.test(src))
    return "galleries/field-work";
  return "orchards";
}
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const folderRoot = "zeebaran/";
let cursor,
  remote = [];
do {
  const d = await api(
    "/resources/image/upload?max_results=500" +
      (cursor ? "&next_cursor=" + encodeURIComponent(cursor) : ""),
  );
  remote.push(...d.resources);
  cursor = d.next_cursor;
} while (cursor);
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backup = ".local/cloudinary-migration-" + stamp;
await fs.mkdir(backup, { recursive: true });
await fs.writeFile(backup + "/remote-before.json", JSON.stringify(remote, null, 2), {
  mode: 0o600,
});
// Archived originals and any newly supplied local files form one inventory. A new local
// file takes precedence over its archived counterpart; the complete manifest is retained.
const sourceFiles = new Map();
for (const root of [".local/media-originals/images", "public/images"]) {
  for (const file of await walk(root).catch(() => [])) {
    if (/\.(avif|webp|jpe?g|png)$/i.test(file))
      sourceFiles.set("/images/" + path.relative(root, file).split(path.sep).join("/"), file);
  }
}
const byFile = new Map([...sourceFiles].map(([source, file]) => [file, source]));
const only = process.argv.find((value) => value.startsWith("--only="))?.slice(7);
const sources = [...sourceFiles.values()].filter((file) => !only || file === only);
if (!sources.length) throw Error("No matching original files; the manifest has not been changed.");
const manifest = await fs
  .readFile("features/media/assets.generated.json", "utf8")
  .then((value) => JSON.parse(value))
  .catch((error) => {
    if (error.code === "ENOENT") return {};
    throw error;
  });
// OG artwork, favicons and brand identity remain local project assets.
for (const [id, asset] of Object.entries(manifest))
  if (!asset.legacySource.startsWith("/images/")) delete manifest[id];
let reused = 0,
  uploaded = 0,
  moved = 0;
const checked = new Map();
for (const file of sources) {
  const bytes = await fs.readFile(file),
    sha256 = digest(bytes),
    source = byFile.get(file),
    cat = category(source);
  const slug = path
    .basename(file)
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const id = "asset:" + cat + "/" + slug + "-" + path.extname(file).slice(1),
    folder = folderRoot + cat;
  let resource;
  const candidates = remote
    .filter((r) => r.bytes === bytes.length)
    .sort(
      (a, b) =>
        Number(b.public_id.startsWith("zeebaran/")) - Number(a.public_id.startsWith("zeebaran/")),
    );
  for (const candidate of candidates) {
    let hash = checked.get(candidate.public_id);
    if (!hash) {
      const r = await fetch(candidate.secure_url, { signal: AbortSignal.timeout(60000) });
      if (!r.ok) continue;
      hash = digest(Buffer.from(await r.arrayBuffer()));
      checked.set(candidate.public_id, hash);
    }
    if (hash === sha256) {
      resource = candidate;
      reused++;
      break;
    }
  }
  if (!resource && !apply) {
    console.log("Would upload:", source, "to", folder);
    continue;
  }
  if (!resource) {
    const public_id = folder + "/" + slug + "-" + sha256.slice(0, 12);
    const body = signed({
      public_id,
      asset_folder: folder,
      overwrite: "false",
      timestamp: Math.floor(Date.now() / 1000),
    });
    body.append("file", new Blob([bytes]), path.basename(file));
    resource = await api("/image/upload", { method: "POST", body });
    uploaded++;
  }
  if (apply && resource.asset_folder !== folder) {
    await api("/image/explicit", {
      method: "POST",
      body: signed({
        public_id: resource.public_id,
        type: "upload",
        asset_folder: folder,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    });
    moved++;
  }
  const verified = await api("/resources/image/upload/" + encodeURIComponent(resource.public_id));
  if (
    verified.bytes !== bytes.length ||
    verified.resource_type !== "image" ||
    !verified.secure_url.startsWith("https://res.cloudinary.com/" + cloud + "/image/upload/")
  )
    throw Error("Resource verification mismatch: " + source);
  const r = await fetch(verified.secure_url, { signal: AbortSignal.timeout(60000) });
  if (!r.ok || digest(Buffer.from(await r.arrayBuffer())) !== sha256)
    throw Error("Original checksum mismatch: " + source);
  manifest[id] = {
    legacySource: source,
    src: verified.secure_url,
    publicId: verified.public_id,
    resourceType: "image",
    width: verified.width,
    height: verified.height,
    bytes: verified.bytes,
    format: verified.format,
    category: cat,
    sha256,
  };
  console.log("Verified:", source);
}
if (apply) {
  for (const file of sources) {
    const target = backup + "/originals" + byFile.get(file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(file, target);
  }
  await fs.writeFile(
    "features/media/assets.generated.json",
    JSON.stringify(manifest, null, 2) + "\n",
  );
  if (register) {
    const db = getFirestore(
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      }),
    );
    const refs = Object.values(manifest).map((m) =>
        db.collection("cmsMedia").doc(Buffer.from(m.publicId).toString("base64url")),
      ),
      before = await db.getAll(...refs);
    await fs.writeFile(
      backup + "/registry-before.json",
      JSON.stringify(
        before.filter((d) => d.exists).map((d) => ({ id: d.id, data: d.data() })),
        null,
        2,
      ),
      { mode: 0o600 },
    );
    const batch = db.batch();
    Object.values(manifest).forEach((m, i) => {
      const { legacySource, category, sha256, ...resource } = m;
      if (!before[i].exists)
        batch.create(refs[i], {
          ...resource,
          category,
          sha256,
          legacySource,
          name: path.basename(legacySource),
          alt: path
            .basename(legacySource)
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]/g, " "),
          createdBy: "authored-media-migration",
          createdAt: Timestamp.now(),
        });
      else batch.update(refs[i], { category, sha256, legacySource });
    });
    await batch.commit();
  }
}
await fs.writeFile(backup + "/manifest.json", JSON.stringify(manifest, null, 2));
console.log(
  JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    images: sources.length,
    reused,
    uploaded,
    moved,
    registered: register,
    backup,
    categories: [...new Set(Object.values(manifest).map((m) => m.category))],
  }),
);
