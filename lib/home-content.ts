import { figures } from "./figures";
/** Copy for the Home page. Source: approved Stitch design. */
export const thumbs = [
  { src: "/images/home/thumb-1.jpg", alt: "Himalayan valley trees", label: "01 · Terrain" },
  {
    src: "/images/home/thumb-2.jpg",
    alt: "Grower tending a high-density apple tree",
    label: "02 · Stewardship",
  },
  {
    src: "/images/home/thumb-3.jpg",
    alt: "Agronomists inspecting soil and leaf",
    label: "03 · Agronomy",
  },
  {
    src: "/images/home/thumb-4.jpg",
    alt: "Targeted nutrition and irrigation",
    label: "04 · Inputs",
  },
  {
    src: "/images/home/thumb-5.jpg",
    alt: "High-grade harvested red apples",
    label: "05 · Grade sorting",
  },
  {
    src: "/images/home/thumb-6.jpg",
    alt: "Controlled-atmosphere cold storage chamber",
    label: "06 · CA Storage",
  },
];

export const tags = [
  "Knowledge Within Reach",
  "Better Planting Material",
  "Orchards that Perform",
  "Timely Advice",
  "Harvest Preserved",
  "Market Access",
];

export const chain = [
  "Nursery Development",
  "Orchard Development",
  "Management & Advisory",
  "Agri-Inputs",
  "Warehousing & Processing",
  "Procurement & Sales",
];

export const homeStats = [
  {
    to: figures.growersReached,
    suffix: "+",
    unit: "",
    label: "Growers Reached",
    body: "Growers engaged in full advisory, orchard management, inputs, or harvest sale.",
    foot: "Cumulative In Field",
  },
  {
    to: figures.developedHectares,
    suffix: "+",
    unit: "ha",
    label: "Orchards Developed",
    body: "Area converted or redeveloped under systematic canopy design and rootstock.",
    foot: "High Density Footprint",
  },
  {
    to: figures.orchardsPerSeason,
    suffix: "+",
    unit: "",
    label: "Orchards Built / Season",
    body: "Individual orchards established each season within precision horticultural micro-climates.",
    foot: "Per Season Velocity",
  },
  {
    to: figures.storageTonnes,
    suffix: "",
    unit: "MT",
    label: "Storage Capacity",
    body: "Controlled Atmosphere (CA) cold chain capacity safeguarding shelf-life and grower margins.",
    foot: "Infrastructure Assets",
  },
  {
    to: figures.yearsInHorticulture,
    suffix: "+",
    unit: "yrs",
    label: "Himalayan Horticulture",
    body: "Continuous operational history in fruit production, post-harvest infrastructure, and distribution.",
    foot: "Institutional Legacy",
  },
];

export const adoption = [
  {
    tag: "A · 01",
    title: "Access",
    body: "Bring growers closer to the experts, diagnostic facilities, demonstration blocks, and quality planting inputs they need to improve orchards.",
    active: false,
  },
  {
    tag: "A · 02",
    title: "Advice",
    body: "Provide timely, practical guidance shaped to the micro-climate, the season, and the specific variety and age of rootstock.",
    active: false,
  },
  {
    tag: "A · 03",
    title: "Adoption",
    body: "Support growers until better practice becomes second nature. Success is not measured by the advice given, but by the outcomes achieved in the harvest.",
    active: true,
  },
];

export const outcomes = [
  "Healthier, better performing orchards",
  "Stronger soil and more resilient plant health",
  "Greater value retained beyond the harvest",
  "Better information and transparent market access",
];
