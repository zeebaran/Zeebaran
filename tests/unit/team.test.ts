import { describe, it, expect } from "vitest";
import { defaultTeam, teamMembers, newMember } from "@/features/team/model";
import { isTeamMembers, teamIssue, teamSchema } from "@/features/team/schema";
import { emptyContent, placedContent } from "@/features/cms/model";
import { isVisualContent } from "@/features/admin/visual-protocol";
import { isCloudinaryImage } from "@/features/media/delivery";
describe("managed About team", () => {
  it("keeps all six supplied members in the requested order with complete biographies", () => {
    expect(defaultTeam.map((m) => m.id)).toEqual([
      "aadil-sheikh",
      "hilal-sheikh",
      "auqib-nisar",
      "mudasir-wani",
      "arjumand-bhat",
      "suhail-bhat",
    ]);
    expect(teamIssue(defaultTeam)).toBeUndefined();
    expect(defaultTeam.every((m) => m.biography.length > 500 && m.enabled && m.phone === "")).toBe(
      true,
    );
    expect(defaultTeam[0].philosophy).toBe("Innovation, integrity and sustainable growth.");
    expect(defaultTeam.slice(1).every((m) => !m.image)).toBe(true);
    expect(isCloudinaryImage(defaultTeam[0].image!.src)).toBe(true);
  });
  it("honours managed order, hidden members and an intentionally empty section", () => {
    expect(teamMembers(emptyContent())).toEqual(defaultTeam);
    expect(teamMembers({ ...emptyContent(), team: [] })).toEqual([]);
    const team = [{ ...defaultTeam[1], enabled: false }, defaultTeam[0]];
    expect(teamMembers({ ...emptyContent(), team })).toEqual(team);
    expect(placedContent("about", { ...emptyContent(), team }).team).toEqual(team);
    expect(placedContent("home", { ...emptyContent(), team }).team).toBeUndefined();
  });
  it("permits incomplete editing without allowing an incomplete profile to save", () => {
    const draft = newMember("new-member");
    expect(isVisualContent({ ...emptyContent(), team: [draft] })).toBe(true);
    expect(isTeamMembers([draft])).toBe(false);
    expect(teamIssue([draft])).toContain("designation");
    expect(
      isVisualContent({
        ...emptyContent(),
        team: [{ ...defaultTeam[1], specialisations: ["Orchard planning", ""] }],
      }),
    ).toBe(true);
  });
  it("rejects duplicate IDs, unknown fields, excessive content and malformed phone or portraits", () => {
    const member = defaultTeam[0];
    for (const team of [
      [member, member],
      [{ ...member, phone: "javascript:alert(1)" }],
      [{ ...member, name: "x".repeat(121) }],
      [{ ...member, biography: "x".repeat(12001) }],
      [{ ...member, html: "<script>" }],
      [{ ...member, image: { ...member.image, resourceType: "video" } }],
      Array.from({ length: 31 }, (_, i) => ({ ...member, id: "m" + i })),
    ])
      expect(isTeamMembers(team)).toBe(false);
  });
  it("validates optional contact numbers and keeps portrait provenance metadata", () => {
    const member = { ...defaultTeam[0], phone: "+91 98765 43210" };
    expect(teamSchema.parse([member])[0].image?.publicId).toBe(member.image?.publicId);
    expect(isTeamMembers([member])).toBe(true);
  });
});
