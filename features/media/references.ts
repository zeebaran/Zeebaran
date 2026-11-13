import { authoredAsset, authoredAssets } from "./delivery";
import { defaultTeam } from "@/features/team/model";
export type MediaIdentity = { publicId: string; resourceType: "image" | "video"; src: string };
/** Canonical uploads and their delivery transformations refer to the same original asset. */
export function mediaIdentity(src: string): MediaIdentity | undefined {
  const authored = authoredAsset(src);
  if (authored) return { ...authored, resourceType: "image" };
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return;
    const match = url.pathname.match(/^\/[^/]+\/(image|video)\/upload\/(.+)$/);
    if (!match) return;
    const parts = decodeURIComponent(match[2]).split("/");
    while (
      parts.length > 1 &&
      (/^v\d+$/.test(parts[0]) || /^(?:f|q|c|w|h|so|ar|g|dpr|e)_/.test(parts[0]))
    )
      parts.shift();
    return {
      publicId: parts.join("/").replace(/\.(?:jpe?g|png|webp|avif|gif|mp4|webm|mov)$/i, ""),
      resourceType: match[1] as "image" | "video",
      src,
    };
  } catch {
    return;
  }
}
export function mediaReferences(value: unknown): MediaIdentity[] {
  const found = new Map<string, MediaIdentity>();
  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const object = node as Record<string, unknown>;
    if (typeof object.src === "string") {
      const identity = mediaIdentity(object.src);
      if (identity)
        found.set(identity.resourceType + ":" + identity.publicId + ":" + identity.src, identity);
    }
    Object.values(object).forEach(walk);
  }
  walk(value);
  return [...found.values()];
}
export function usesMedia(value: unknown, target: MediaIdentity) {
  return mediaReferences(value).some(
    (m) => m.resourceType === target.resourceType && m.publicId === target.publicId,
  );
}
export function isDefaultMedia(target: MediaIdentity) {
  return (
    target.resourceType === "image" &&
    (Object.values(authoredAssets).some((a) => a.publicId === target.publicId) ||
      defaultTeam.some((member) => member.image?.publicId === target.publicId))
  );
}
/** Retain revision copy/card details; remove only the deleted photograph/film reference. */
export function withoutMedia<T>(value: T, target: MediaIdentity): T {
  function clean(node: unknown): unknown {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) return node.map(clean).filter((n) => n !== undefined);
    const object = node as Record<string, unknown>;
    if (typeof object.src === "string" && usesMedia({ src: object.src }, target)) return undefined;
    const next = Object.fromEntries(
      Object.entries(object)
        .map(([key, item]) => [key, clean(item)])
        .filter(([, item]) => item !== undefined),
    );
    if (next.mode === "image" && !next.image) next.mode = "text";
    return next;
  }
  return clean(value) as T;
}
