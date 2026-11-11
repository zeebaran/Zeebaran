import manifest from "./assets.generated.json";

export type AuthoredAsset = {
  legacySource: string;
  src: string;
  publicId: string;
  resourceType: string;
  width: number;
  height: number;
  category: string;
  sha256: string;
};
export const authoredAssets = manifest as Record<string, AuthoredAsset>;
const originals = new Map(
  Object.entries(authoredAssets).map(([id, asset]) => [asset.legacySource, id]),
);
export const cloudinaryCloud = "jfiuaflr";
const cloud = cloudinaryCloud; // Public account identifier; never a credential.
export function assetId(source: string) {
  return originals.get(source) || source;
}
export function originalSource(source: string) {
  return authoredAssets[source]?.legacySource || source;
}
const byUrl = new Map(Object.values(authoredAssets).map((asset) => [asset.src, asset]));
export function authoredAsset(source: string) {
  return authoredAssets[assetId(source)] || byUrl.get(source);
}
export function isCloudinaryImage(source: string): boolean {
  try {
    const u = new URL(source);
    return (
      u.protocol === "https:" &&
      u.hostname === "res.cloudinary.com" &&
      !u.username &&
      !u.password &&
      !u.port &&
      (u.pathname.startsWith("/" + cloud + "/image/upload/") ||
        (u.pathname.startsWith("/" + cloud + "/video/upload/") &&
          /\.(jpg|jpeg|png|webp|avif)$/.test(u.pathname))) &&
      !u.search &&
      !u.hash
    );
  } catch {
    return false;
  }
}
/** Unmapped local/external photographs intentionally become a code-native placeholder. */
export function imageSource(source: string) {
  const mapped = authoredAsset(source)?.src || source;
  return isCloudinaryImage(mapped) ? mapped : "";
}
export function imageDelivery(source: string, width: number, quality?: number) {
  const src = imageSource(source).replace(
    /\/(image|video)\/upload\/(?:so_auto,)?f_auto,q_(?:auto|\d+),c_limit,w_\d+\//,
    "/$1/upload/",
  );
  if (!src) return "";
  const w = Math.min(3840, Math.max(32, Math.round(Number.isFinite(width) ? width : 960)));
  const q =
    quality && Number.isFinite(quality)
      ? "q_" + Math.min(100, Math.max(1, Math.round(quality)))
      : "q_auto";
  if (src.includes("/video/upload/"))
    return src.replace(
      "/video/upload/",
      "/video/upload/so_auto,f_auto," + q + ",c_limit,w_" + w + "/",
    );
  return src.replace("/image/upload/", "/image/upload/f_auto," + q + ",c_limit,w_" + w + "/");
}
export function cloudinaryLoader({ src, width }: { src: string; width: number; quality?: number }) {
  return imageDelivery(src, width);
}
