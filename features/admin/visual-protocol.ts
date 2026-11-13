import { isTeamMembers } from "@/features/team/schema";
import { isRegionalHubs } from "@/features/cms/regional-hubs";
import { isPartnerEntries } from "@/features/cms/partners";
import type { ContentValue } from "@/features/cms/model";
import type { MissionSectionId } from "@/features/cms/mission-videos";
export const visualChannel = "zeebaran.visual.v1";
export type VisualSelection =
  | { kind: "text" | "image"; page: string; key: string }
  | { kind: "mission"; page: "mission"; id: string; section: MissionSectionId }
  | { kind: "catalog"; page: string; id: string }
  | { kind: "hubs"; page: "contact" }
  | { kind: "partners"; page: "partnerships" }
  | { kind: "team"; page: "about" }
  | { kind: "podcast"; page: "podcast" }
  | { kind: "shared"; page: "site" };
export type FrameMessage =
  | { channel: typeof visualChannel; page: string; type: "ready" | "synced" }
  | { channel: typeof visualChannel; page: string; type: "select"; selection: VisualSelection };
export type EditorMessage = {
  channel: typeof visualChannel;
  page: string;
  type: "sync";
  content: ContentValue;
  editing: boolean;
};
export function isVisualMessage(
  value: unknown,
): value is { channel: typeof visualChannel; page: string; type: string } {
  return (
    !!value &&
    typeof value === "object" &&
    "channel" in value &&
    value.channel === visualChannel &&
    "page" in value &&
    typeof value.page === "string" &&
    "type" in value &&
    typeof value.type === "string"
  );
}
export function isVisualContent(value: unknown): value is ContentValue {
  const record = (item: unknown): item is Record<string, unknown> =>
    !!item && typeof item === "object" && !Array.isArray(item);
  const source = (item: unknown) =>
    record(item) &&
    (item.kind === "youtube" || item.kind === "cloudinary") &&
    typeof item.src === "string" &&
    item.src.length <= 2000;
  if (!record(value) || !record(value.text) || !record(value.images)) return false;
  if (
    Object.entries(value.text).some(
      ([key, text]) => key.length > 100 || typeof text !== "string" || text.length > 12000,
    )
  )
    return false;
  if (
    Object.values(value.images).some(
      (image) =>
        image !== null &&
        (!record(image) ||
          typeof image.src !== "string" ||
          image.src.length > 2000 ||
          typeof image.alt !== "string" ||
          image.alt.length > 300),
    )
  )
    return false;
  if (
    value.videos !== undefined &&
    (!record(value.videos) || Object.values(value.videos).some((video) => !source(video)))
  )
    return false;
  if (value.missionSections !== undefined) {
    if (!record(value.missionSections)) return false;
    for (const [section, cards] of Object.entries(value.missionSections))
      if (
        !["orchard", "process", "demos"].includes(section) ||
        !Array.isArray(cards) ||
        cards.length > 24 ||
        cards.some(
          (card) =>
            !record(card) ||
            typeof card.id !== "string" ||
            typeof card.title !== "string" ||
            typeof card.description !== "string" ||
            (card.video !== undefined && !source(card.video)),
        )
      )
        return false;
    if (
      !["orchard", "process", "demos"].every(
        (section) => section in (value.missionSections as object),
      )
    )
      return false;
  }
  if (value.team !== undefined && !isTeamMembers(value.team, true)) return false;
  if (value.regionalHubs !== undefined && !isRegionalHubs(value.regionalHubs, true)) return false;
  if (value.partners !== undefined && !isPartnerEntries(value.partners, true)) return false;
  if (value.podcast !== undefined) {
    const podcast = value.podcast;
    if (
      !record(podcast) ||
      typeof podcast.channelUrl !== "string" ||
      podcast.channelUrl.length > 500 ||
      !Array.isArray(podcast.episodes) ||
      podcast.episodes.length > 80 ||
      podcast.episodes.some(
        (e) =>
          !record(e) ||
          typeof e.id !== "string" ||
          e.id.length > 80 ||
          typeof e.enabled !== "boolean" ||
          ["url", "title", "description", "guest", "topic"].some(
            (key) =>
              typeof e[key] !== "string" ||
              (e[key] as string).length >
                (key === "description" ? 4000 : key === "url" ? 2000 : 200),
          ),
      )
    )
      return false;
  }
  try {
    return JSON.stringify(value).length <= 300000;
  } catch {
    return false;
  }
}
