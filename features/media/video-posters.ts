import { cloudinaryCloud, imageDelivery } from "./delivery";
export function youtubePosterId(id: string) {
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? "zeebaran/videos/posters/youtube-" + id : null;
}
export function youtubePoster(id: string) {
  const publicId = youtubePosterId(id);
  return publicId
    ? imageDelivery(
        "https://res.cloudinary.com/" + cloudinaryCloud + "/image/upload/" + publicId + ".jpg",
        960,
      )
    : null;
}
