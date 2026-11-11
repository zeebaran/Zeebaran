import "server-only";
import { createHash } from "node:crypto";
import { cloudConfig } from "@/features/admin/server/cloudinary";
import { youtubePosterId } from "./video-posters";
import { usableJpeg } from "./jpeg";
const prepared = new Map<string, Promise<void>>();
/** One signed import per distinct YouTube film per server instance, never a visitor request.
 * A missing/removed thumbnail leaves the reusable placeholder; it cannot prevent saving copy.
 */
export async function prepareYoutubePoster(id: string) {
  const publicId = youtubePosterId(id);
  if (!publicId || process.env.FIRESTORE_EMULATOR_HOST) return;
  if (prepared.has(id)) {
    await prepared.get(id)?.catch(() => undefined);
    return;
  }
  const work = (async () => {
    const c = cloudConfig();
    const params = {
      asset_folder: "zeebaran/videos/posters",
      overwrite: "false",
      public_id: publicId,
      timestamp: Math.floor(Date.now() / 1000),
    };
    const signature = createHash("sha256")
      .update(
        Object.entries(params)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => k + "=" + v)
          .join("&") + c.secret,
      )
      .digest("hex");
    const body = new FormData();
    for (const [k, v] of Object.entries({ ...params, signature, api_key: c.key }))
      body.append(k, String(v));
    // The host and path are fixed by us; arbitrary remote imports are impossible.
    for (const quality of ["maxresdefault", "hqdefault"]) {
      const thumbnail = await fetch("https://i.ytimg.com/vi/" + id + "/" + quality + ".jpg", {
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      if (!thumbnail?.ok) continue;
      const data = new Uint8Array(await thumbnail.arrayBuffer());
      if (!usableJpeg(data)) continue;
      body.set("file", new Blob([data], { type: "image/jpeg" }), "youtube-" + id + ".jpg");
      const response = await fetch("https://api.cloudinary.com/v1_1/" + c.name + "/image/upload", {
        method: "POST",
        body,
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.public_id === publicId && result.width > 120) return;
      }
    }
    throw Error("Video preview could not be imported.");
  })();
  if (prepared.size >= 128) prepared.delete(prepared.keys().next().value!);
  prepared.set(id, work);
  try {
    await work;
  } catch {
    prepared.delete(id);
  }
}
