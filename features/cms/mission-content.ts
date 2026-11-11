import { textKey, type ContentValue } from "./model";
import { missionVideoCards, missionVideoSections, type MissionSections } from "./mission-videos";

/** Two defaults per section; preserve extra legacy cards only when someone actually edited/configured them. */
export function missionSections(content: ContentValue): MissionSections {
  if (content.missionSections) return content.missionSections;
  return Object.fromEntries(
    missionVideoSections.map((section) => [
      section.id,
      missionVideoCards
        .filter((card) => card.group === section.label)
        .filter(
          (card, index) =>
            index < 2 ||
            !!content.videos?.[card.id] ||
            content.text[textKey(card.title)] !== undefined ||
            content.text[textKey(card.subtitle)] !== undefined,
        )
        .map((card) => ({
          id: card.id,
          title: content.text[textKey(card.title)] ?? card.title,
          description: content.text[textKey(card.subtitle)] ?? card.subtitle,
          ...(content.videos?.[card.id] ? { video: content.videos[card.id] } : {}),
        })),
    ]),
  ) as MissionSections;
}
