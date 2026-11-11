import { hubs } from "@/lib/content";
import { hubCoordinates, nodes, stationNotes } from "./map-content";
import { textKey, type ContentValue } from "@/features/cms/model";
import type { HubLocation, RegionalHub } from "@/features/cms/regional-hubs";
const ids = ["baramulla", "srinagar", "lassipora", "achabal", "delhi"];
function location(index: number): HubLocation {
  return {
    id: ids[index],
    name: nodes[index].name,
    lat: hubCoordinates[index][0],
    lng: hubCoordinates[index][1],
    area: index === 4 ? "other" : "kashmir",
    kind: nodes[index].kind === "delhi" ? "office" : (nodes[index].kind as HubLocation["kind"]),
    note: stationNotes[index],
    sub: nodes[index].sub,
    order: index,
  };
}
export const defaultRegionalHubs: RegionalHub[] = hubs.map((hub, index) => ({
  id: ["srinagar-hq", "lassipora-hub", "field-stations", "delhi-office"][index],
  ...hub,
  facts: [hub.facts[0], hub.facts[1]],
  enabled: true,
  locations: [[1], [2], [0, 3], [4]][index].map(location),
}));
export function regionalHubs(content: ContentValue): RegionalHub[] {
  if (content.regionalHubs !== undefined) return content.regionalHubs;
  const copy = (value: string) => content.text[textKey(value)] ?? value;
  return defaultRegionalHubs.map((hub) => ({
    ...hub,
    title: copy(hub.title),
    place: copy(hub.place),
    body: copy(hub.body),
    facts: [copy(hub.facts[0]), copy(hub.facts[1])],
    locations: hub.locations.map((location) => ({
      ...location,
      name: copy(location.name),
      note: copy(location.note),
      sub: copy(location.sub),
    })),
  }));
}
