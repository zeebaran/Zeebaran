export const podcastCopy = {
  eyebrow: "BAZM-E-KHAYAL · THE ZEEBARAN PODCAST",
  heading: "Good questions.\nGrounded conversations.",
  intro:
    "A meeting of minds, rooted in agriculture. Conversations with growers, doctors, scientists and professionals who bring experience, evidence and fresh perspective to the questions that matter in the field.",
  library: "Conversations worth keeping.",
};
export const defaultChannel = "https://www.youtube.com/@Bazm-e-Khayal";
export function channelUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" &&
      ["www.youtube.com", "youtube.com"].includes(u.hostname) &&
      !u.username &&
      !u.password &&
      !u.port &&
      /^\/(?:@[A-Za-z0-9_.-]+|channel\/[A-Za-z0-9_-]+)\/?$/.test(u.pathname) &&
      !u.search &&
      !u.hash
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export type PodcastEpisode = {
  id: string;
  url: string;
  title: string;
  description: string;
  guest: string;
  topic: string;
  enabled: boolean;
  addedAt?: number;
};
export type PodcastContent = { channelUrl: string; episodes: PodcastEpisode[] };
export const emptyPodcast = (): PodcastContent => ({ channelUrl: defaultChannel, episodes: [] });

export function newestEpisodes(episodes: readonly PodcastEpisode[]) {
  // Older entries were appended without timestamps, so read those in reverse insertion order.
  return [...episodes].reverse().sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
}
