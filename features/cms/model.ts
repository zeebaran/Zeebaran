import imageManifest from "../media/assets.generated.json" with { type: "json" };
import type { TeamMember } from "@/features/team/model";
import type { RegionalHub } from "./regional-hubs";
import type { PartnerEntry } from "./partners";
import type { MissionSections } from "./mission-videos";
import type { SiteSettings } from "@/features/site/model";
import type { PodcastContent } from "@/features/podcast/model";

export const contentPages = [
  ["home", "Home", "/", "The opening chapter"],
  ["platform", "The Platform", "/platform", "From nursery to market"],
  ["mission", "Our Mission", "/mission", "Installations and field stories"],
  ["podcast", "Podcast · Bazm-e-Khayal", "/podcast", "Conversations rooted in agriculture"],
  ["products", "Varieties", "/products", "The planting portfolio"],
  ["zeebaran-hub", "Zeebaran Hub", "/zeebaran-hub", "Access, advice and adoption"],
  ["innovation", "Innovation", "/innovation", "Science in the field"],
  ["impact", "Impact", "/impact", "Outcomes and evidence"],
  ["partnerships", "Partnerships", "/partnerships", "Working together"],
  ["governance", "Governance", "/governance", "Responsible stewardship"],
  ["about", "About", "/about", "The institutional story"],
  ["contact", "Contact", "/contact", "Begin a conversation"],
  ["site", "Navigation & footer", "/", "Navigation and footer"],
  ["contact-simple", "Short enquiry", "/contact/simple", "The short contact form"],
] as const;
export type MediaValue = {
  src: string;
  alt: string;
  publicId?: string;
  resourceType?: "image" | "video";
  width?: number;
  height?: number;
};
export type ContentValue = {
  /** Shared public contact settings, attached only by the cached site reader. */
  publicSettings?: SiteSettings;
  text: Record<string, string>;
  /** Null explicitly removes a placement. An absent key uses the original. */
  images: Record<string, MediaValue | null>;
  videos?: Record<string, VideoSource>;
  missionSections?: MissionSections;
  podcast?: PodcastContent;
  partners?: PartnerEntry[];
  team?: TeamMember[];
  regionalHubs?: RegionalHub[];
  /** Legacy page-wide film. Never rendered; retained only to read older revisions. */
  video?: { kind: "cloudinary" | "youtube"; src: string; title: string; poster?: string };
};
export type VideoSource = { kind: "cloudinary" | "youtube"; src: string };
export const emptyContent = (): ContentValue => ({ text: {}, images: {} });
/** Page-wide films are obsolete; only Mission's explicit card placements can reach the UI. */
export function placedContent(page: string, value: ContentValue): ContentValue {
  return {
    text: value.text,
    images: value.images,
    ...(page === "podcast" && value.podcast !== undefined ? { podcast: value.podcast } : {}),
    ...(page === "about" && value.team !== undefined ? { team: value.team } : {}),
    ...(page === "contact" && value.regionalHubs !== undefined
      ? { regionalHubs: value.regionalHubs }
      : {}),
    ...(page === "partnerships" && value.partners !== undefined
      ? { partners: value.partners }
      : {}),
    ...(page === "mission" && value.videos ? { videos: value.videos } : {}),
    ...(page === "mission" && value.missionSections
      ? { missionSections: value.missionSections }
      : {}),
  };
}
export type FieldDefinition = {
  key: string;
  value: string;
  group: string;
  numeric?: boolean;
  label?: string;
};
export type ImageDefinition = { key: string; src: string; alt: string; group: string };
export type PageDefinition = { fields: FieldDefinition[]; images: ImageDefinition[] };
export type PageRecord = {
  fetchedAt?: number;
  revision: number;
  draft: ContentValue;
  published: ContentValue;
  updatedAt: string | null;
  publishedAt: string | null;
};
export function contentKey(value: string) {
  let a = 2166136261,
    b = 5381;
  for (let i = 0; i < value.length; i++) {
    a = Math.imul(a ^ value.charCodeAt(i), 16777619);
    b = Math.imul(b, 33) ^ value.charCodeAt(i);
  }
  return (a >>> 0).toString(36) + (b >>> 0).toString(36) + "-" + value.length.toString(36);
}
export function textKey(value: string) {
  return "t-" + contentKey(value);
}
export function imageKey(src: string) {
  return (
    "i-" +
    contentKey(
      (imageManifest as Record<string, { legacySource: string }>)[src]?.legacySource || src,
    )
  );
}
export function pageForPath(path: string) {
  return contentPages.find((x) => x[2] === path)?.[0];
}
