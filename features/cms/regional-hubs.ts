export type HubLocation = {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  area: "kashmir" | "other";
  kind: "hq" | "cold" | "field" | "office";
  note: string;
  sub: string;
  order?: number;
};
export type RegionalHub = {
  id: string;
  title: string;
  place: string;
  body: string;
  facts: [string, string];
  enabled: boolean;
  locations: HubLocation[];
};
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max;
const id = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9-]{0,79}$/.test(value);
export const validCoordinate = (value: unknown, limit: number): value is number =>
  typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit;
export function isRegionalHubs(value: unknown, incomplete = false): value is RegionalHub[] {
  if (!Array.isArray(value) || value.length > 24) return false;
  const ids = new Set<string>(),
    locations = new Set<string>();
  for (const hub of value) {
    if (
      !record(hub) ||
      Object.keys(hub).some(
        (key) => !["id", "title", "place", "body", "facts", "enabled", "locations"].includes(key),
      ) ||
      !id(hub.id) ||
      ids.has(hub.id) ||
      !text(hub.title, 160) ||
      (!incomplete && !(hub.title as string).trim()) ||
      !text(hub.place, 120) ||
      !text(hub.body, 3000) ||
      !Array.isArray(hub.facts) ||
      hub.facts.length !== 2 ||
      hub.facts.some((fact) => !text(fact, 180)) ||
      typeof hub.enabled !== "boolean" ||
      !Array.isArray(hub.locations) ||
      hub.locations.length > 8 ||
      (!incomplete && hub.enabled && !hub.locations.length)
    )
      return false;
    ids.add(hub.id);
    for (const location of hub.locations) {
      if (
        !record(location) ||
        Object.keys(location).some(
          (key) =>
            !["id", "name", "lat", "lng", "area", "kind", "note", "sub", "order"].includes(key),
        ) ||
        !id(location.id) ||
        locations.has(location.id) ||
        !text(location.name, 120) ||
        (!incomplete && hub.enabled && !(location.name as string).trim()) ||
        !["kashmir", "other"].includes(String(location.area)) ||
        !["hq", "cold", "field", "office"].includes(String(location.kind)) ||
        !text(location.note, 800) ||
        !text(location.sub, 160) ||
        (location.order !== undefined &&
          (typeof location.order !== "number" ||
            !Number.isInteger(location.order) ||
            location.order < 0 ||
            location.order > 999)) ||
        (!validCoordinate(location.lat, 90) &&
          !((incomplete || !hub.enabled) && location.lat === null)) ||
        (!validCoordinate(location.lng, 180) &&
          !((incomplete || !hub.enabled) && location.lng === null))
      )
        return false;
      locations.add(location.id);
    }
  }
  return locations.size <= 60;
}
export function regionalHubIssue(hubs: RegionalHub[]): string | undefined {
  for (const [index, hub] of hubs.entries()) {
    if (!hub.title.trim()) return `Hub ${index + 1}: enter a name.`;
    if (!hub.enabled) continue;
    if (!hub.locations.length)
      return `${hub.title}: add at least one map location, or disable the hub.`;
    for (const [i, location] of hub.locations.entries()) {
      if (!location.name.trim()) return `${hub.title}, location ${i + 1}: enter a map label.`;
      if (!validCoordinate(location.lat, 90))
        return `${hub.title}, location ${i + 1}: enter a latitude between -90 and 90.`;
      if (!validCoordinate(location.lng, 180))
        return `${hub.title}, location ${i + 1}: enter a longitude between -180 and 180.`;
    }
  }
  if (!isRegionalHubs(hubs))
    return "Check the hub details and map locations. Maximum: 24 hubs and 60 locations.";
}
export type MappedHub = Omit<HubLocation, "lat" | "lng"> & {
  lat: number;
  lng: number;
  hubId: string;
  place: string;
};
export function mappedHubs(hubs: RegionalHub[]): MappedHub[] {
  return hubs
    .filter((hub) => hub.enabled)
    .flatMap((hub) =>
      hub.locations
        .filter(
          (location) => validCoordinate(location.lat, 90) && validCoordinate(location.lng, 180),
        )
        .map((location) => ({
          ...location,
          name: location.name || hub.title,
          note: location.note || hub.body,
          lat: location.lat as number,
          lng: location.lng as number,
          hubId: hub.id,
          place: hub.place,
        })),
    )
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}
