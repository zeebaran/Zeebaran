import { youtubePoster } from "@/features/media/video-posters";
import type { VideoSource } from "./model";

/** Canonical, HTTPS-only privacy-enhanced embeds. No third-party request is made here. */
export function youtubeUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    let id: string | null = null;
    if (url.hostname === "youtu.be") id = url.pathname.slice(1);
    else if (["youtube.com", "www.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname))
      id =
        url.searchParams.get("v") ||
        url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1] ||
        null;
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return "https://www.youtube-nocookie.com/embed/" + id;
  } catch {
    return null;
  }
}

/** CDN images only: previews never download the video or read another Firestore document. */
export function videoPoster(source?: VideoSource): string | null {
  if (!source) return null;
  if (source.kind === "youtube") {
    const embed = youtubeUrl(source.src);
    return embed ? youtubePoster(embed.split("/").at(-1)!) : null;
  }
  try {
    const url = new URL(source.src);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com" ||
      url.username ||
      url.password ||
      !url.pathname.includes("/video/upload/")
    )
      return null;
    url.pathname = url.pathname.replace(/\.[^/.]+$/, ".jpg");
    if (!url.pathname.endsWith(".jpg")) url.pathname += ".jpg";
    return url.href;
  } catch {
    return null;
  }
}
