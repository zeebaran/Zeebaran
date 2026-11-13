/** One vocabulary for editorial input, published queries and visitor filters. */
export const harvestSeasons = [
  { key: "early", value: "Early", label: "Early Season", colour: "bg-leaf/20 text-green" },
  { key: "mid", value: "Mid", label: "Mid Season", colour: "bg-orange/15 text-[#a34404]" },
  { key: "late", value: "Late", label: "Late Season", colour: "bg-forest/10 text-forest" },
  {
    key: "very-late",
    value: "Very Late",
    label: "Very Late Season",
    colour: "bg-green/10 text-green",
  },
] as const;
export type HarvestSeason = (typeof harvestSeasons)[number]["value"];
export function normalizeHarvestSeason(raw: unknown): HarvestSeason | null {
  if (typeof raw !== "string") return null;
  const value = raw
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ season$/, "");
  return harvestSeasons.find((season) => season.value.toLowerCase() === value)?.value || null;
}
export function harvestKey(value: HarvestSeason) {
  return harvestSeasons.find((season) => season.value === value)!.key;
}
export function harvestHref(query: URLSearchParams, season: HarvestSeason | null) {
  const next = new URLSearchParams(query);
  next.delete("varieties");
  if (season) next.set("season", harvestKey(season));
  else next.delete("season");
  const search = next.toString();
  return "/products" + (search ? "?" + search : "") + "#variety-portfolio";
}
