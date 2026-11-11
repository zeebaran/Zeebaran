// Real authored assets only. Server-side signing; credentials never enter the manifest or logs.
import { PRODUCTS } from "../lib/products-content.ts";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
if (!process.argv.includes("--upload"))
  throw Error(
    "Pass --upload to synchronize the existing authored product photographs to Cloudinary.",
  );
const cloud = process.env.CLOUDINARY_CLOUD_NAME,
  key = process.env.CLOUDINARY_API_KEY,
  secret = process.env.CLOUDINARY_API_SECRET;
if (!cloud || !key || !secret) throw Error("Cloudinary configuration is incomplete.");
const files = [
    ...new Set(
      [
        ...PRODUCTS.map((p) => p.image),
        "/images/nursery-development-and-hillside-mother-block-orchards-11ecd.webp",
      ].filter(Boolean),
    ),
  ],
  manifest = {};
for (const source of files) {
  const bytes = await fs
      .readFile(path.join(process.cwd(), "public", source))
      .catch(() => fs.readFile(path.join(process.cwd(), ".local/media-originals", source))),
    public_id = "zeebaran/catalog/" + createHash("sha256").update(bytes).digest("hex").slice(0, 24),
    timestamp = Math.floor(Date.now() / 1000),
    params = { overwrite: "false", public_id, timestamp };
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
  form.append("file", new Blob([bytes], { type: "image/webp" }), path.basename(source));
  const uploaded = await fetch("https://api.cloudinary.com/v1_1/" + cloud + "/image/upload", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(45000),
  });
  if (!uploaded.ok)
    throw Error(
      "Cloudinary upload rejected for " + path.basename(source) + " (HTTP " + uploaded.status + ")",
    );
  const check = await fetch(
    "https://api.cloudinary.com/v1_1/" +
      cloud +
      "/resources/image/upload/" +
      encodeURIComponent(public_id),
    {
      headers: { Authorization: "Basic " + Buffer.from(key + ":" + secret).toString("base64") },
      signal: AbortSignal.timeout(20000),
    },
  );
  if (!check.ok) throw Error("Uploaded resource could not be independently verified.");
  const resource = await check.json();
  if (
    !resource.secure_url.startsWith("https://res.cloudinary.com/" + cloud + "/image/upload/") ||
    resource.resource_type !== "image"
  )
    throw Error("Cloudinary resource verification failed.");
  manifest[source] = {
    src: resource.secure_url,
    publicId: resource.public_id,
    width: resource.width,
    height: resource.height,
    bytes: resource.bytes,
    format: resource.format,
  };
  console.log("Verified authored image:", path.basename(source));
}
await fs.mkdir(".local", { recursive: true });
await fs.writeFile(".local/catalog-media-map.json", JSON.stringify(manifest, null, 2) + "\n", {
  mode: 0o600,
});
console.log("Saved verified media manifest for", files.length, "existing images.");
