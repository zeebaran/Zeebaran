export const journey = [
  {
    n: "01",
    title: "Nursery",
    body: "Rootstock development, varietal programmes, and the production of high-quality planting materials each year.",
  },
  {
    n: "02",
    title: "Orchard",
    body: "Site preparation, climate-responsive high-density orchard development, and season-by-season management and advisory.",
  },
  {
    n: "03",
    title: "Storage & Processing",
    body: "Grading, quality management, and 30,000 MT of controlled-atmosphere and cold storage capacity.",
  },
  {
    n: "04",
    title: "Market",
    body: "Procurement, traceability, cold-chain logistics, and distribution to quality-driven markets.",
  },
] as const;

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** start = 1-based month column, span = number of months. */
export const calendar = [
  {
    name: "Dormancy",
    body: "Pruning, planting, orchard establishment, and preparation for the season ahead.",
    start: 1,
    span: 3,
    color: "#cbd5c8",
  },
  {
    name: "Bloom",
    body: "Pollination support, frost risk management, nutrition, and early season monitoring.",
    start: 4,
    span: 2,
    color: "#8CC63F",
  },
  {
    name: "Growth",
    body: "Diagnostics, crop protection, biological solutions, thinning, irrigation guidance, and field advisory.",
    start: 5,
    span: 4,
    color: "#6d9652",
  },
  {
    name: "Harvest",
    body: "Harvest planning, picking, grading, quality management, and procurement.",
    start: 9,
    span: 2,
    color: "#497f39",
  },
  {
    name: "Storage & Market",
    body: "Controlled-atmosphere storage, logistics, traceability, dispatch, and market access.",
    start: 8,
    span: 3,
    color: "#c1cca9",
  },
  {
    name: "Zeebaran Field Layer",
    body: "Field advisory, diagnostics, demonstrations, guidance, and continuous grower support connect every stage of the orchard year.",
    start: 4,
    span: 9,
    color: "#8ba47d",
  },
] as const;
