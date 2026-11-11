import { describe, expect, it } from "vitest";
import { emptyContent, placedContent, textKey } from "../../features/cms/model";
import { isRegionalHubs, mappedHubs, regionalHubIssue } from "../../features/cms/regional-hubs";
import { defaultRegionalHubs, regionalHubs } from "../../features/contact/hubs-content";
import { isVisualContent } from "../../features/admin/visual-protocol";
const fresh = () => structuredClone(defaultRegionalHubs);
describe("managed regional hubs", () => {
  it("preserves the original four cards and five locations, including the shared field-station card", () => {
    const hubs = regionalHubs(emptyContent());
    expect(hubs).toHaveLength(4);
    expect(hubs[2].locations.map((location) => location.name)).toEqual(["Baramulla", "Achabal"]);
    expect(mappedHubs(hubs).map((location) => location.id)).toEqual([
      "baramulla",
      "srinagar",
      "lassipora",
      "achabal",
      "delhi",
    ]);
    expect(isRegionalHubs(hubs)).toBe(true);
  });
  it("keeps existing text changes until structured hub management takes over", () => {
    const content = emptyContent();
    content.text[textKey(defaultRegionalHubs[0].title)] = "Edited HQ";
    content.text[textKey("Srinagar HQ")] = "Edited map label";
    expect(regionalHubs(content)[0].title).toBe("Edited HQ");
    expect(
      mappedHubs(regionalHubs(content)).find((location) => location.id === "srinagar")?.name,
    ).toBe("Edited map label");
    expect(regionalHubs({ ...content, regionalHubs: [] })).toEqual([]);
  });
  it("hides every pin of a disabled hub and supports completely empty networks", () => {
    const hubs = fresh();
    hubs[2].enabled = false;
    expect(mappedHubs(hubs).map((location) => location.id)).toEqual([
      "srinagar",
      "lassipora",
      "delhi",
    ]);
    hubs.forEach((hub) => {
      hub.enabled = false;
    });
    expect(mappedHubs(hubs)).toEqual([]);
    expect(mappedHubs([])).toEqual([]);
    expect(isRegionalHubs([])).toBe(true);
  });
  it("rejects duplicate IDs, unbounded payloads and invalid enabled coordinates", () => {
    const hubs = fresh(),
      hub = hubs[0],
      location = hub.locations[0];
    for (const value of [
      [hub, hub],
      [{ ...hub, locations: [location, location] }],
      [{ ...hub, locations: [{ ...location, lat: 91 }] }],
      [{ ...hub, locations: [{ ...location, lng: -181 }] }],
      [{ ...hub, locations: [{ ...location, lat: Number.NaN }] }],
      [{ ...hub, locations: [{ ...location, lat: null }] }],
      [{ ...hub, locations: [] }],
      [{ ...hub, title: " " }],
      [{ ...hub, enabled: "true" }],
      [{ ...hub, locations: [{ ...location, kind: "script", area: "unknown" }] }],
      Array.from({ length: 25 }, (_, index) => ({ ...hub, id: "hub-" + index })),
    ])
      expect(isRegionalHubs(value)).toBe(false);
  });
  it("lets local previews remain responsive while coordinates are incomplete, and gives actionable save errors", () => {
    const hubs = fresh();
    hubs[0].locations[0].lat = null;
    expect(isVisualContent({ ...emptyContent(), regionalHubs: hubs })).toBe(true);
    expect(isRegionalHubs(hubs)).toBe(false);
    expect(regionalHubIssue(hubs)).toContain("latitude");
    hubs[0].enabled = false;
    expect(isRegionalHubs(hubs)).toBe(true);
  });
  it("publishes this collection only as part of the Contact page", () => {
    const content = { ...emptyContent(), regionalHubs: fresh() };
    expect(placedContent("contact", content).regionalHubs).toHaveLength(4);
    expect(placedContent("home", content).regionalHubs).toBeUndefined();
    expect(placedContent("contact", { ...content, regionalHubs: [] }).regionalHubs).toEqual([]);
  });
});
