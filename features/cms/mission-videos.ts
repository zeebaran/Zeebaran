import type { VideoSource } from "./model";
export const missionVideoSections = [
  {
    id: "orchard",
    label: "Orchard Installations",
    tag: "Orchard Installation",
    tagColor: "text-green",
  },
  { id: "process", label: "Installation Process", tag: "Process", tagColor: "text-[#fe6901]" },
  { id: "demos", label: "Demonstrations & Proof", tag: "Field Demo", tagColor: "text-green" },
] as const;
export type MissionSectionId = (typeof missionVideoSections)[number]["id"];
export type MissionVideoEntry = {
  id: string;
  title: string;
  description: string;
  video?: VideoSource;
};
export type MissionSections = Record<MissionSectionId, MissionVideoEntry[]>;
// Legacy placements stay available to resolve existing saved edits without a data migration.
export type MissionVideoCardDefinition = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor?: string;
  thumb?: string;
  featured?: boolean;
  group?: string;
  video?: VideoSource;
  managed?: boolean;
  section?: MissionSectionId;
};
export const missionVideoCards: MissionVideoCardDefinition[] = [
  {
    group: "Orchard Installations",
    id: "ZB-OI-01",
    title: "High-Density Trellis Setup — Pulwama Valley",
    subtitle:
      "Full documentation of a 2.5-acre high-density apple orchard installation, covering rootstock selection, row layout, trellis construction, and initial training.",
    tag: "Orchard Installation",
    tagColor: "text-green",
    featured: true,
  },
  {
    group: "Orchard Installations",
    id: "ZB-OI-02",
    title: "Rootstock Preparation & Planting",
    subtitle:
      "Step-by-step rootstock preparation process from certified nursery stock through to in-ground planting at 1,900 m elevation.",
    tag: "Orchard Installation",
    tagColor: "text-green",
  },
  {
    group: "Orchard Installations",
    id: "ZB-OI-03",
    title: "Canopy Architecture — Year 1 Training",
    subtitle:
      "First-year canopy training methodology for high-density systems, demonstrating lateral positioning and leader management.",
    tag: "Orchard Installation",
    tagColor: "text-green",
  },
  {
    group: "Orchard Installations",
    id: "ZB-OI-04",
    title: "Shopian Block — Before & After",
    subtitle:
      "Side-by-side documentation of a 1.8-acre conversion from traditional seedling orchard to high-density spur system.",
    tag: "Orchard Installation",
    tagColor: "text-green",
  },
  {
    group: "Installation Process",
    id: "ZB-IP-01",
    title: "Full Installation Walkthrough — 90 Minutes",
    subtitle:
      "An uncut documentation of a complete orchard block installation from first stake to final wire tensioning.",
    tag: "Process",
    tagColor: "text-[#fe6901]",
  },
  {
    group: "Installation Process",
    id: "ZB-IP-02",
    title: "The Zeebaran Method — Explained",
    subtitle:
      "Our senior agronomist walks through the principles behind Zeebaran's precision canopy architecture approach.",
    tag: "Process",
    tagColor: "text-[#fe6901]",
  },
  {
    group: "Demonstrations & Proof",
    id: "ZB-DM-01",
    title: "Diagnostic Walk — Identifying Common Errors",
    subtitle:
      "Our agronomist walks through three orchards identifying the most common mistakes in Himalayan apple cultivation and explaining what each error costs in yield.",
    tag: "Field Demo",
    tagColor: "text-green",
    featured: true,
  },
  {
    group: "Demonstrations & Proof",
    id: "ZB-DM-02",
    title: "Soil Sampling & Lab Reading — Explained",
    subtitle:
      "How to read a soil report, what the numbers mean for a high-altitude orchard, and what amendments are worth making before planting.",
    tag: "Field Demo",
    tagColor: "text-green",
  },
  {
    group: "Demonstrations & Proof",
    id: "ZB-DM-03",
    title: "Trellis Wire Tensioning & Anchor Installation",
    subtitle:
      "Correct trellis installation technique for high-density apple systems at elevation — the detail most growers get wrong.",
    tag: "Field Demo",
    tagColor: "text-green",
  },
  {
    group: "Demonstrations & Proof",
    id: "ZB-DM-04",
    title: "Canopy Light Distribution — Visual Proof",
    subtitle:
      "Using a handheld quantum sensor to measure light distribution at different canopy heights, demonstrating why architecture matters.",
    tag: "Field Demo",
    tagColor: "text-green",
  },
  {
    group: "Demonstrations & Proof",
    id: "ZB-DM-05",
    title: "Cold Chain — From Orchard to Cold Store",
    subtitle:
      "Following a harvested apple consignment from the orchard gate through to controlled atmosphere cold store, measuring temperature chain integrity.",
    tag: "Cold Chain",
    tagColor: "text-[#fe6901]",
  },
];
