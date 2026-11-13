import { describe, expect, it } from "vitest";
import { defaultPartners, isPartnerEntries, isPartnerProfile } from "../../features/cms/partners";
import {
  institutionalPartners,
  partnerProfile,
  strategicPartners,
} from "../../features/cms/partner-profiles";

describe("partner profiles", () => {
  it("preserves legacy partners and validates the complete strategic profiles", () => {
    expect(isPartnerEntries(defaultPartners)).toBe(true);
    expect(isPartnerEntries(strategicPartners)).toBe(true);
    expect(strategicPartners.map((p) => p.id)).toEqual(["balson", "feno-nursery"]);
    expect(strategicPartners.map((p) => p.profile!.focusAreas.length)).toEqual([5, 6]);
    for (const p of strategicPartners) {
      expect(p.image!.publicId).toMatch(/^zeebaran\/partners\//);
      expect(p.image!.src).toMatch(/^https:\/\/res.cloudinary.com\//);
      expect(isPartnerProfile(p.profile)).toBe(true);
    }
  });
  it("rejects oversized, incomplete, unknown and malformed nested fields", () => {
    const profile = strategicPartners[0].profile!;
    for (const invalid of [
      { ...profile, unknown: true },
      { ...profile, description: "x".repeat(12001) },
      { ...profile, category: null },
      { ...profile, focusAreas: Array(13).fill({ title: "Focus", description: "Details" }) },
      { ...profile, focusAreas: [{ title: "Focus", description: false }] },
      { ...profile, focusAreas: [{ title: "Focus", description: "Details", url: "unsafe" }] },
    ]) {
      expect(isPartnerProfile(invalid)).toBe(false);
      expect(isPartnerEntries([{ ...defaultPartners[0], profile: invalid }])).toBe(false);
    }
  });
  it("uses admin content first and supplies information for every existing partner", () => {
    const authored = { ...strategicPartners[0].profile!, headline: "An administrator's revision" };
    expect(partnerProfile({ ...defaultPartners[0], profile: authored })).toBe(authored);
    for (const partner of [...defaultPartners, ...institutionalPartners]) {
      expect(isPartnerProfile(partnerProfile(partner))).toBe(true);
      expect(partnerProfile(partner).description.length).toBeGreaterThan(20);
    }
    expect(
      partnerProfile({ id: "new", name: "New partner", mode: "text", font: "sans" }).category,
    ).toBe("Partner network");
  });
});
