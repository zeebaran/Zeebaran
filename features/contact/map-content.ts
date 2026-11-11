export const nodes = [
  { x: 110, y: 80, name: "Baramulla", sub: "1,580m AMSL", tx: 80, ty: 65, kind: "field" },
  { x: 180, y: 110, name: "Srinagar HQ", sub: "Executive Command", tx: 194, ty: 108, kind: "hq" },
  {
    x: 250,
    y: 145,
    name: "Lassipora Hub",
    sub: "CA Storage & Tech",
    tx: 264,
    ty: 143,
    kind: "cold",
  },
  { x: 320, y: 180, name: "Achabal", sub: "2,250m High Altitude", tx: 332, ty: 182, kind: "field" },
  {
    x: 440,
    y: 225,
    name: "New Delhi Office",
    sub: "National Gateway",
    tx: 380,
    ty: 245,
    kind: "delhi",
  },
] as const;

export const stationNotes = [
  "1,580 m · Grower extension and rootstock nurseries in North Kashmir.",
  "1,585 m · Institutional partnerships and field operations at Jawahar Nagar.",
  "8,500 MT · Controlled-atmosphere storage and optical grading in Pulwama.",
  "2,250 m · High-altitude field trials and grower advisory in South Kashmir.",
  "National gateway · Institutional liaison and distribution coordination in Vasant Kunj.",
];

// Regional reference points, not surveyed entrances or building-level addresses.
// Keep the order aligned with nodes: Baramulla, Srinagar, Lassipora, Achabal, Delhi.
export const hubCoordinates: readonly (readonly [number, number])[] = [
  [34.2087, 74.3435],
  [34.0837, 74.7973],
  [33.80402, 74.92911],
  [33.6839, 75.2195],
  [28.52925, 77.15413],
];
