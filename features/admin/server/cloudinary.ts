import { isMediaCategory, type MediaCategory } from "@/features/media/categories";
import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { AdminError } from "./security";
export function cloudConfig() {
  const name = process.env.CLOUDINARY_CLOUD_NAME,
    key = process.env.CLOUDINARY_API_KEY,
    secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret)
    throw new AdminError(
      503,
      "Cloudinary is not configured. Add its private API secret on the server.",
    );
  return { name, key, secret };
}
export function signUpload(
  kind: "image" | "video",
  uid: string,
  category: MediaCategory = "galleries/field-work",
  name = "image",
) {
  const c = cloudConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  if (!isMediaCategory(category)) throw new AdminError(422, "Choose a media folder.");
  const slug =
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || kind;
  const public_id = "zeebaran/" + uid + "/" + category + "/" + slug + "-" + randomUUID();
  const params = {
    public_id,
    asset_folder: "zeebaran/" + category,
    timestamp,
    overwrite: "false",
    allowed_formats: kind === "image" ? "jpg,jpeg,png,webp,avif" : "mp4,webm,mov",
  };
  const serialized = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => k + "=" + v)
    .join("&");
  const signature = createHash("sha256")
    .update(serialized + c.secret)
    .digest("hex");
  return {
    ...params,
    signature,
    api_key: c.key,
    url: "https://api.cloudinary.com/v1_1/" + c.name + "/" + kind + "/upload",
    kind,
  };
}
export async function verifyResource(publicId: string, kind: "image" | "video") {
  const c = cloudConfig();
  const url =
    "https://api.cloudinary.com/v1_1/" +
    c.name +
    "/resources/" +
    kind +
    "/upload/" +
    encodeURIComponent(publicId);
  const response = await fetch(url, {
    headers: { Authorization: "Basic " + Buffer.from(c.key + ":" + c.secret).toString("base64") },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new AdminError(422, "Cloudinary could not verify this upload.");
  const d = await response.json();
  if (
    d.resource_type !== kind ||
    d.type !== "upload" ||
    !d.secure_url?.startsWith("https://res.cloudinary.com/" + c.name + "/" + kind + "/upload/")
  )
    throw new AdminError(422, "Upload verification failed.");
  if (d.bytes > (kind === "image" ? 10 : 100) * 1024 * 1024)
    throw new AdminError(422, "The uploaded file exceeds the media limit.");
  if (
    !(kind === "image" ? ["jpg", "jpeg", "png", "webp", "avif"] : ["mp4", "webm", "mov"]).includes(
      d.format,
    )
  )
    throw new AdminError(422, "This file format is not supported.");
  return {
    publicId: d.public_id,
    src: d.secure_url,
    resourceType: kind,
    width: d.width,
    height: d.height,
    bytes: d.bytes,
    format: d.format,
    duration: d.duration || null,
    category: isMediaCategory(d.asset_folder?.replace(/^zeebaran\//, ""))
      ? d.asset_folder.replace(/^zeebaran\//, "")
      : kind === "video"
        ? "videos"
        : "galleries/field-work",
  };
}

/** Signed server-side deletion of the original and its derived resources. Safe to retry. */
export async function destroyResource(publicId: string, kind: "image" | "video") {
  const c = cloudConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: "true", public_id: publicId, timestamp: String(timestamp) };
  const signature = createHash("sha256")
    .update(
      Object.entries(params)
        .map(([key, value]) => key + "=" + value)
        .join("&") + c.secret,
    )
    .digest("hex");
  const response = await fetch(
    "https://api.cloudinary.com/v1_1/" + c.name + "/" + kind + "/destroy",
    {
      method: "POST",
      body: new URLSearchParams({ ...params, api_key: c.key, signature }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    },
  );
  const result = await response.json();
  if (!response.ok || !["ok", "not found"].includes(result.result))
    throw new AdminError(
      502,
      "Cloudinary did not confirm deletion. The file remains in the library for retry.",
    );
}
