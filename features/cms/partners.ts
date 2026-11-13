import strategic from "./strategic-partners.json";
import { textKey, type ContentValue, type MediaValue } from "./model";
export const partnerFonts = [
  { id: "sans", label: "Brand sans" },
  { id: "serif", label: "Editorial serif" },
  { id: "serif-italic", label: "Editorial italic" },
  { id: "sans-italic", label: "Bold italic" },
] as const;
export type PartnerFont = (typeof partnerFonts)[number]["id"];
export type PartnerProfile = {
  category: string;
  headline: string;
  description: string;
  focusLabel: string;
  focusAreas: { title: string; description: string }[];
  commitmentLabel: string;
  commitment: string;
  closing: string;
};
export type PartnerEntry = {
  id: string;
  name: string;
  mode: "text" | "image";
  font: PartnerFont;
  subtitle?: string;
  preset?: "civ" | "fruit-control" | "fiedlin" | "gripple" | "incofin";
  image?: MediaValue;
  profile?: PartnerProfile;
};
export const defaultPartners: PartnerEntry[] = [
  {
    id: "civ",
    name: "CIV",
    mode: "text",
    font: "sans",
    preset: "civ",
    subtitle: "We Enhance Nature",
  },
  {
    id: "fruit-control",
    name: "FRUIT CONTROL",
    mode: "text",
    font: "sans",
    preset: "fruit-control",
  },
  { id: "fiedlin", name: "FIEDLIN", mode: "text", font: "sans", preset: "fiedlin" },
  { id: "gripple", name: "GRIPPLE", mode: "text", font: "sans-italic", preset: "gripple" },
  { id: "incofin", name: "incofin", mode: "text", font: "sans", preset: "incofin" },
];
export const strategicPartners = strategic as PartnerEntry[];

export function partnerEntries(content: ContentValue): PartnerEntry[] {
  if (content.partners !== undefined) return content.partners;
  const legacyPartners = defaultPartners.map((partner) => ({
    ...partner,
    name: content.text[textKey(partner.name)] ?? partner.name,
    ...(partner.subtitle
      ? { subtitle: content.text[textKey(partner.subtitle)] ?? partner.subtitle }
      : {}),
  }));
  return [...legacyPartners, ...strategicPartners];
}
/** Shared preview/input boundary; media provenance is verified separately on the server. */
export function isPartnerEntries(value: unknown, allowIncomplete = false): value is PartnerEntry[] {
  const record = (item: unknown): item is Record<string, unknown> =>
    !!item && typeof item === "object" && !Array.isArray(item);
  if (!Array.isArray(value) || value.length > 40) return false;
  const ids = new Set<string>();
  for (const item of value) {
    if (
      !record(item) ||
      Object.keys(item).some(
        (key) =>
          !["id", "name", "mode", "font", "subtitle", "preset", "image", "profile"].includes(key),
      ) ||
      typeof item.id !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9-]{0,79}$/.test(item.id) ||
      ids.has(item.id) ||
      typeof item.name !== "string" ||
      (!allowIncomplete && item.mode === "text" && !item.name.trim()) ||
      item.name.length > 120 ||
      !["text", "image"].includes(String(item.mode)) ||
      !partnerFonts.some((font) => font.id === item.font) ||
      (item.subtitle !== undefined &&
        (typeof item.subtitle !== "string" || item.subtitle.length > 100)) ||
      (item.preset !== undefined &&
        !defaultPartners.some((partner) => partner.preset === item.preset))
    )
      return false;
    if (item.profile !== undefined && !isPartnerProfile(item.profile)) return false;
    ids.add(item.id);
    if (item.mode === "image") {
      const image = item.image;
      if (allowIncomplete && image === undefined) continue;
      if (
        !record(image) ||
        Object.keys(image).some(
          (key) => !["src", "alt", "publicId", "resourceType", "width", "height"].includes(key),
        ) ||
        typeof image.src !== "string" ||
        image.src.length > 2000 ||
        typeof image.alt !== "string" ||
        image.alt.length > 300 ||
        typeof image.publicId !== "string" ||
        !image.publicId ||
        image.publicId.length > 300 ||
        image.resourceType !== "image" ||
        [image.width, image.height].some(
          (n) => n !== undefined && (typeof n !== "number" || !Number.isFinite(n) || n <= 0),
        )
      )
        return false;
    } else if (item.image !== undefined) return false;
  }
  return true;
}

export function partnerLabel(partner: PartnerEntry): string {
  return partner.name.trim() || partner.image?.alt.trim().slice(0, 120) || "Partner logo";
}
export function partnerIssue(partners: PartnerEntry[]): string | undefined {
  for (const [index, partner] of partners.entries()) {
    if (partner.mode === "text" && !partner.name.trim())
      return `Partner ${index + 1}: enter a name, or choose Uploaded logo.`;
    if (partner.mode === "image" && !partner.image)
      return `Partner ${index + 1}: choose or upload a logo.`;
  }
  if (!isPartnerEntries(partners)) return "Check partner names, fonts, and logo files.";
}

export function isPartnerProfile(value: unknown): value is PartnerProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const p = value as Record<string, unknown>;
  const limits = {
    category: 120,
    headline: 240,
    description: 12000,
    focusLabel: 100,
    commitmentLabel: 100,
    commitment: 6000,
    closing: 800,
  };
  if (Object.keys(p).some((key) => key !== "focusAreas" && !(key in limits))) return false;
  for (const [key, max] of Object.entries(limits))
    if (typeof p[key] !== "string" || (p[key] as string).length > max) return false;
  return (
    Array.isArray(p.focusAreas) &&
    p.focusAreas.length <= 12 &&
    p.focusAreas.every((row: unknown) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return false;
      const item = row as Record<string, unknown>;
      return (
        Object.keys(item).every((key) => ["title", "description"].includes(key)) &&
        typeof item.title === "string" &&
        item.title.length <= 160 &&
        typeof item.description === "string" &&
        item.description.length <= 2000
      );
    })
  );
}
