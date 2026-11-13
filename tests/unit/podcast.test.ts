import { expect, it } from "vitest";
import { podcastSchema } from "@/features/podcast/schema";
import { channelUrl, emptyPodcast, newestEpisodes } from "@/features/podcast/model";
import { placedContent } from "@/features/cms/model";
const episode = {
  id: "fixture-one",
  url: "https://youtu.be/M7lc1UVf-VE",
  title: "Orchard questions",
  guest: "A scientist",
  topic: "Orchards",
  description: "Questions from growers.",
  enabled: true,
};
it("starts empty and keeps the requested channel handle without invented episodes", () => {
  expect(emptyPodcast().episodes).toEqual([]);
  expect(channelUrl(emptyPodcast().channelUrl)).toContain("@Bazm-e-Khayal");
  expect(
    placedContent("podcast", {
      text: {},
      images: {},
      podcast: { ...emptyPodcast(), episodes: [episode] },
    }).podcast?.episodes,
  ).toHaveLength(1);
  expect(
    placedContent("home", { text: {}, images: {}, podcast: emptyPodcast() }).podcast,
  ).toBeUndefined();
});
it("rejects duplicate videos across URL formats and invalid or privileged fields", () => {
  expect(
    podcastSchema.safeParse({
      ...emptyPodcast(),
      episodes: [
        episode,
        { ...episode, id: "two", url: "https://www.youtube.com/watch?v=M7lc1UVf-VE" },
      ],
    }).success,
  ).toBe(false);
  for (const url of [
    "http://youtube.com/watch?v=M7lc1UVf-VE",
    "https://youtube.com.evil.test/watch?v=M7lc1UVf-VE",
    "https://localhost/a",
  ])
    expect(
      podcastSchema.safeParse({ ...emptyPodcast(), episodes: [{ ...episode, url }] }).success,
    ).toBe(false);
  expect(
    podcastSchema.safeParse({ ...emptyPodcast(), episodes: [{ ...episode, secret: true }] })
      .success,
  ).toBe(false);
  expect(
    podcastSchema.safeParse({ ...emptyPodcast(), episodes: [{ ...episode, title: " " }] }).success,
  ).toBe(false);
  expect(
    podcastSchema.safeParse({ ...emptyPodcast(), episodes: [{ ...episode, enabled: false }] })
      .success,
  ).toBe(true);
  expect(podcastSchema.safeParse({ ...emptyPodcast(), episodes: [] }).success).toBe(true);
});
it("bounds collections and channel links", () => {
  expect(
    podcastSchema.safeParse({
      ...emptyPodcast(),
      episodes: Array.from({ length: 81 }, (_, i) => ({ ...episode, id: String(i) })),
    }).success,
  ).toBe(false);
  for (const url of [
    "https://evil.test/@channel",
    "https://user@www.youtube.com/@channel",
    "https://www.youtube.com/@channel?redirect=evil",
  ])
    expect(channelUrl(url)).toBeNull();
});

it("sorts by when an episode was added, with legacy entries in reverse saved order", () => {
  const entries = [
    episode,
    { ...episode, id: "latest", addedAt: 200 },
    { ...episode, id: "legacy-second" },
    { ...episode, id: "recent", addedAt: 100 },
  ];
  expect(newestEpisodes(entries).map(({ id }) => id)).toEqual([
    "latest",
    "recent",
    "legacy-second",
    "fixture-one",
  ]);
  expect(entries[0]).toBe(episode);
});
