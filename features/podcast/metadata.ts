import "server-only";
import { youtubeUrl } from "@/features/cms/video";
import { AdminError } from "@/features/admin/server/security";
export async function fetchYoutubeMetadata(value: string) {
  const embed = youtubeUrl(value);
  if (!embed) throw new AdminError(422, "Use a valid YouTube video link.");
  const id = embed.split("/").at(-1)!;
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", "https://www.youtube.com/watch?v=" + id);
  endpoint.searchParams.set("format", "json");
  try {
    const response = await fetch(endpoint, {
      redirect: "error",
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 86400 },
    });
    if (!response.ok || !response.body) throw Error("Unavailable");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 16000) {
          await reader.cancel();
          throw Error("Too large");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (typeof data.title !== "string" || !data.title.trim() || data.title.length > 200)
      throw Error("Invalid title");
    return {
      url: embed,
      title: data.title.trim(),
      channel: typeof data.author_name === "string" ? data.author_name.slice(0, 200) : "",
    };
  } catch {
    throw new AdminError(
      422,
      "YouTube could not supply this title. The video may be private, removed or unavailable. You can enter the title manually.",
    );
  }
}
