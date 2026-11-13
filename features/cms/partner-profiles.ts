import strategic from "./strategic-partners.json";
import { partnerCards } from "@/lib/partnerships-content";
import type { PartnerEntry, PartnerProfile } from "./partners";
export const strategicPartners = strategic as PartnerEntry[];
export const institutionalPartners: PartnerEntry[] = partnerCards.flatMap((group) =>
  group.items.map((item) => ({
    id: item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, ""),
    name: item.name,
    mode: "text" as const,
    font: "sans" as const,
    profile: {
      category: group.title,
      headline: item.note || item.name,
      description: `${item.name} is presented within Zeebaran’s ${group.title.toLowerCase()} network. ${item.note ? `The published focus is ${item.note.toLowerCase()}.` : "The collaboration is focused on connecting horticultural research with practical field questions."}`,
      focusLabel: "Partnership focus",
      focusAreas: [
        {
          title: group.title,
          description: item.note || "Research and practical knowledge for horticulture.",
        },
      ],
      commitmentLabel: "In the field",
      commitment:
        "The scope of each relationship is guided by the work agreed with the partner. Contact Zeebaran to discuss a specific project or opportunity.",
      closing: "",
    },
  })),
);
const extra: Record<string, { category: string; focus: string }> = {
  "fruit-control": {
    category: "Post-harvest technology",
    focus: "Controlled-atmosphere storage and preservation of fruit quality.",
  },
  gripple: {
    category: "Orchard infrastructure",
    focus: "Support and tensioning systems for orchard infrastructure.",
  },
};
export function partnerProfile(partner: PartnerEntry): PartnerProfile {
  if (partner.profile) return partner.profile;
  const known = [...strategicPartners, ...institutionalPartners].find(
    (entry) =>
      entry.id === partner.id ||
      entry.name.toLowerCase() === partner.name.toLowerCase() ||
      (partner.preset === "civ" && entry.name === "Consorzio Italiano Vivaisti") ||
      (partner.preset === "incofin" && entry.name === "Incofin Investment Management") ||
      (partner.preset === "fiedlin" && entry.name === "Fiedlin Ventures"),
  );
  if (known?.profile) return known.profile;
  const item = extra[partner.preset || partner.id];
  return {
    category: item?.category || "Partner network",
    headline: partner.subtitle || "Working together for horticulture",
    description:
      item?.focus ||
      "This organisation is part of the partner network presented by Zeebaran. Contact our team for details about the scope of the relationship and current opportunities to work together.",
    focusLabel: "Partnership focus",
    focusAreas: item ? [{ title: item.category, description: item.focus }] : [],
    commitmentLabel: "Work with Zeebaran",
    commitment:
      "Useful partnerships bring complementary expertise closer to the field. Our team can explain the work, responsibilities, and next steps for a specific enquiry.",
    closing: "",
  };
}
