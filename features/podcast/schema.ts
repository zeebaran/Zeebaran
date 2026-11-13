import { z } from "zod";
import { youtubeUrl } from "@/features/cms/video";
import { channelUrl } from "./model";
const episodeSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z0-9-]{1,80}$/),
    url: z
      .string()
      .max(2000)
      .refine((v) => !!youtubeUrl(v), "Use a valid HTTPS YouTube video link."),
    title: z.string().trim().min(1, "Add an episode title.").max(200),
    description: z.string().trim().max(4000),
    guest: z.string().trim().max(200),
    topic: z.string().trim().max(80),
    enabled: z.boolean(),
    addedAt: z.int().positive().optional(),
  })
  .strict();
export const podcastSchema = z
  .object({
    channelUrl: z
      .string()
      .max(500)
      .refine((v) => !!channelUrl(v), "Use a YouTube channel link."),
    episodes: z.array(episodeSchema).max(80),
  })
  .strict()
  .superRefine((value, ctx) => {
    const ids = new Set<string>(),
      videos = new Set<string>();
    for (const episode of value.episodes) {
      const video = youtubeUrl(episode.url)!;
      if (ids.has(episode.id) || videos.has(video))
        ctx.addIssue({ code: "custom", message: "Each episode must have a unique video and ID." });
      ids.add(episode.id);
      videos.add(video);
    }
  });
