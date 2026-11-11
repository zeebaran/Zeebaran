/** One taxonomy for uploads, the media library, migrations and delivery documentation. */
export const mediaCategories = [
  ["banners/home", "Home banners"],
  ["banners/varieties", "Variety banners"],
  ["banners/mission", "Mission artwork"],
  ["apple-varieties", "Apple varieties"],
  ["rootstocks", "Rootstocks"],
  ["orchards", "Orchards"],
  ["orchards/nurseries", "Nurseries"],
  ["laboratory", "Laboratory"],
  ["products/infrastructure", "Infrastructure"],
  ["galleries/home", "Home gallery"],
  ["galleries/field-work", "Field gallery"],
  ["partners", "Partner logos"],
  ["videos", "Videos"],
  ["videos/posters", "Video previews"],
] as const;
export type MediaCategory = (typeof mediaCategories)[number][0];
export function isMediaCategory(value: unknown): value is MediaCategory {
  return mediaCategories.some(([category]) => category === value);
}
export function categoryForEditor(path: string): MediaCategory {
  if (path.includes("partnership")) return "partners";
  if (path.includes("rootstock")) return "rootstocks";
  if (path.includes("home")) return "banners/home";
  if (path.includes("innovation")) return "laboratory";
  if (path.includes("catalog") || path.includes("products")) return "apple-varieties";
  return "galleries/field-work";
}
