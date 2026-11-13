import { describe, expect, it } from "vitest";
import {
  harvestHref,
  harvestSeasons,
  normalizeHarvestSeason,
} from "../../features/catalog/harvest";
import { catalogSchema, publicationProblems } from "../../features/catalog/schema";
import { emptyCatalog } from "../../features/catalog/model";

describe("admin-managed harvest windows", () => {
  it.each(harvestSeasons)(
    "normalizes $label, keys and legacy text without ambiguous Late matches",
    (season) => {
      for (const value of [
        season.value,
        season.key,
        season.label.toUpperCase(),
        ` ${season.label} `,
      ])
        expect(normalizeHarvestSeason(value)).toBe(season.value);
      expect(
        catalogSchema.parse({
          ...emptyCatalog("variety"),
          slug: "fixture",
          name: "Fixture",
          season: season.label,
        }).season,
      ).toBe(season.value);
    },
  );
  it("does not silently classify missing, unknown or malformed seasons", () => {
    for (const value of [undefined, null, [], "", "almost early", "very late autumn", "<script>"])
      expect(normalizeHarvestSeason(value)).toBe(null);
    expect(normalizeHarvestSeason("Very Late")).not.toBe("Late");
  });
  it("requires a recognized season to publish varieties, while allowing incomplete drafts and rootstocks", () => {
    const draft = { ...emptyCatalog("variety"), slug: "fixture", name: "Fixture" };
    expect(catalogSchema.safeParse(draft).success).toBe(true);
    expect(publicationProblems(draft)).toContain("Choose a harvest season.");
    expect(publicationProblems({ ...draft, season: "Winter" })).toContain(
      "Choose a harvest season.",
    );
    expect(publicationProblems({ ...draft, season: "Late" })).not.toContain(
      "Choose a harvest season.",
    );
    expect(publicationProblems({ ...draft, kind: "rootstock" })).not.toContain(
      "Choose a harvest season.",
    );
  });
  it("resets stale variety cursors, preserves search/rootstock state and builds shareable selections", () => {
    const query = new URLSearchParams({
      varieties: "old-page",
      rootstocks: "root-page",
      q: "gala",
      season: "mid",
    });
    expect(harvestHref(query, "Very Late")).toBe(
      "/products?rootstocks=root-page&q=gala&season=very-late#variety-portfolio",
    );
    expect(harvestHref(query, null)).toBe(
      "/products?rootstocks=root-page&q=gala#variety-portfolio",
    );
    expect(query.get("varieties")).toBe("old-page");
  });
});
