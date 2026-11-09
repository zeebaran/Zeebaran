import { figures } from "./figures";
/**
 * ALL PAGE COPY LIVES HERE.
 * Words in {braces} render as the accent in headings (see Heading in components/Motion.tsx).
 * Copy is taken from the supplied Stitch design exports.
 */

export const platformPhases = [
  {
    phase: "Phase 01",
    title: "Planting Material",
    constraint: "Growers could not trust the starting stock.",
    response: "We built a propagation and verification pipeline.",
  },
  {
    phase: "Phase 02",
    title: "Field Advisory",
    constraint: "Good advice rarely reached the farm in time.",
    response: "We placed agronomists in the field, close to growers.",
  },
  {
    phase: "Phase 03",
    title: "Input Supply",
    constraint: "Inputs were costly, inconsistent and poorly understood.",
    response: "We started supplying tested inputs with guidance on use.",
  },
  {
    phase: "Phase 04",
    title: "Post-Harvest Handling",
    constraint: "A good harvest lost value within days.",
    response: "We added grading, handling and controlled storage.",
  },
  {
    phase: "Phase 05",
    title: "Market Access",
    constraint: "Growers sold to whoever came first.",
    response: "We opened direct, transparent routes to buyers.",
  },
  {
    phase: "Phase 06",
    title: "Traceability",
    constraint: "Quality had no record behind it.",
    response: "We recorded origin, practice and handling for every lot.",
  },
  {
    phase: "Phase 07",
    title: "Long-term Capital",
    constraint: "Lasting systems need patient funding.",
    response: "We built the governance that long-term capital expects.",
  },
];

export const principles = [
  {
    t: "Individual Dignity & Responsibility",
    d: "People are agents with the capacity to make decisions - not beneficiaries to be managed.",
  },
  {
    t: "Capability & Independence",
    d: "Support should increase a person's ability to act independently over time, not create lasting dependence.",
  },
  {
    t: "Open Competition",
    d: "Competitive advantage should be earned continuously while strengthening the wider horticultural system.",
  },
  {
    t: "Merit & Equal Opportunity",
    d: "Opportunity should be determined by ability, character, and contribution - not by birth, relationship, or inherited position.",
  },
  {
    t: "Long-term System Health",
    d: "The long-term health of growers, markets, land, and institutions takes precedence over short-term extraction.",
  },
  {
    t: "Commercial Durability",
    d: "The institution must remain commercially sustainable so it can continue investing in people, capability, and the long-term health of the system.",
  },
];

export const outcomes = [
  {
    n: "01",
    title: "Productivity",
    body: "Higher productivity begins long before harvest. Better planting material, orchard design, and timely field support help orchards produce more consistently and remain productive over time.",
    measure: "Not how many trees were planted, but what the orchard continues to produce.",
  },
  {
    n: "02",
    title: "Soil and Plant Health",
    body: "Healthy orchards depend on healthy biological systems. Understanding local conditions and responding to them appropriately builds resilience while reducing avoidable intervention.",
    measure: "A healthier orchard, not simply fewer inputs.",
  },
  {
    n: "03",
    title: "Value Preservation",
    body: "Quality is protected through grading, processing, controlled-atmosphere storage, and reliable market access, allowing growers to retain more of the value they have already created.",
    measure: "More value preserved after harvest.",
  },
  {
    n: "04",
    title: "Agency",
    body: "Knowledge creates value only when people can act on it. Growers should leave with greater confidence to make informed decisions about their orchards, their produce, and their future.",
    measure: "Better decisions, made independently.",
  },
];

export const stats = [
  {
    value: figures.growersReached,
    suffix: "+",
    unit: "",
    label: "Growers reached",
    def: "Advisory, inputs, orchard services or procurement engagement from Zeebaran.",
    foot: "Cumulative field operations",
  },
  {
    value: figures.developedHectares,
    suffix: "+",
    unit: "ha",
    label: "Orchards developed",
    def: "Area established or redeveloped under Zeebaran, including site preparation and installation.",
    foot: "Cumulative orchard development",
  },
  {
    value: figures.orchardsPerSeason,
    suffix: "+",
    unit: "",
    label: "Orchards built every season",
    def: "Individual orchards established under Zeebaran orchard development in a single season.",
    foot: "Per-season orchard development",
  },
  {
    value: figures.storageTonnes,
    suffix: "",
    unit: "MT",
    label: "Storage capacity",
    def: "Installed controlled-atmosphere and cold storage across Zeebaran facilities.",
    foot: "Installed post-harvest operations",
  },
  {
    value: figures.yearsInHorticulture,
    suffix: "+",
    unit: "yrs",
    label: "Working in Himalayan horticulture",
    def: "Continuous operating history in fruit production, infrastructure and market access.",
    foot: "2008 to date, company",
  },
];

export const measureChecklist = [
  "A clear definition of what is being measured",
  "The period it covers",
  "An as-of date",
  "A named data owner",
  "A baseline, where relevant",
  "A clear distinction between current results, targets, and future ambition",
];

export const oversight = [
  {
    eyebrow: "Board & investor oversight",
    title: "Governance exists to improve decisions, not merely review them.",
    body: "Strategy, performance, risk, and long-term priorities are reviewed through established governance processes. Oversight exists to strengthen decision-making, ensure accountability, and maintain stewardship of the institution over time.",
  },
  {
    eyebrow: "Impact & ESG reporting",
    title: "What matters should be measured. What is measured should be reviewed.",
    body: "Zeebaran reports its environmental, social, governance, and institutional performance through defined reporting frameworks and regular review cycles. Reporting exists not only to demonstrate progress, but to improve decisions, strengthen accountability, and support continuous learning.",
  },
];

export const metricRules = [
  "One clear definition",
  "One accountable source owner",
  "One as-of date",
  "One stated reporting period",
  "One consistent version across the website, investor communications, and partnership material",
];

/** About page "operating history", rendered with the shared Timeline component. */
export const history = [
  {
    phase: "2013",
    title: "High-density Demonstration Orchard",
    constraint:
      "Quality required consistent grading and handling before produce entered the market.",
    response:
      "A two-hectare model high-density temperate fruit orchard was established - the first of its kind in the region.",
  },
  {
    phase: "2015",
    title: "Integrated Post-harvest Infrastructure",
    constraint:
      "Growing production required integrated post-harvest infrastructure capable of preserving quality at scale.",
    response:
      "A further 5,000 MT controlled atmosphere facility was commissioned in Lassipora, incorporating modern packhouse technology and high-precision sorting.",
  },
  {
    phase: "2016",
    title: "Traceability",
    constraint:
      "Markets increasingly required confidence in product identity, quality grade, and origin provenance.",
    response:
      "A transparent cold chain was introduced, connecting produce directly from harvest through modern storage to wholesale and retail partners.",
  },
  {
    phase: "2017",
    title: "Regional Storage Expansion",
    constraint:
      "Post-harvest infrastructure needed to expand directly closer to northern production clusters.",
    response:
      "A further 5,000 MT controlled atmosphere facility with automated sorting was established in Sopore, Baramulla.",
  },
  {
    phase: "2018",
    title: "Orchard Development",
    constraint:
      "Growers needed practical, end-to-end technical support to establish modern orchards successfully.",
    response:
      "High-density orchard development became a turnkey commercial service for growers across the Himalayan region.",
  },
  {
    phase: "2019",
    title: "Regional Storage Expansion",
    constraint:
      "Regional access to quality post-harvest infrastructure remained limited across southern valleys.",
    response:
      "A further 5,000 MT controlled atmosphere facility with automated grading and sorting was commissioned in Achabal, Anantnag.",
  },
  {
    phase: "2019",
    title: "Orchard Management",
    constraint:
      "An orchard requires continuous management - not only successful initial establishment.",
    response:
      "Season-long orchard management protocols and tailored advisory services were introduced across partner grower clusters.",
  },
  {
    phase: "2020",
    title: "Storage Network Completion",
    constraint: "Growing production required greater storage volume and operational stability.",
    response:
      "A further 5,000 MT controlled atmosphere facility was commissioned in Lassipora, bringing Zeebaran's total storage capacity to 30,000 MT.",
  },
  {
    phase: "2021",
    title: "Orchard Infrastructure",
    constraint:
      "Critical high-tensile trellis support infrastructure was not consistently available locally.",
    response:
      "The region's first pre-stressed concrete pole manufacturing facility was established in Khrew, Pampore.",
  },
  {
    phase: "2022",
    title: "Digital Platform (Zeebaran FarmOS)",
    constraint:
      "Technical agricultural knowledge had to reach directly into the orchard when time-sensitive decisions were made.",
    response:
      "The digital ag-platform introduced mobile orchard records, pest diagnostics, weather intelligence, and agronomic guidance.",
  },
  {
    phase: "2023",
    title: "Biological Agriculture",
    constraint:
      "Long-term productivity and soil health required natural biological systems alongside conventional protection.",
    response:
      "Zeebaran established dedicated biological testing labs and commenced regional distribution of ecological crop protection solutions.",
  },
  {
    phase: "2024",
    title: "Long-term Capital",
    constraint:
      "Building permanent, generational institutions requires patient capital aligned with system outcomes.",
    response:
      "Zeebaran secured landmark foreign institutional direct investment from premier European sustainability and impact funds.",
  },
];

export const conversations = [
  {
    n: "01",
    title: "Research & Institutions",
    body: "For universities, research organisations, public institutions, and technical bodies interested in research, field validation, or collaborative work in Himalayan horticulture.",
    cta: "Start a research conversation",
    reason: "research",
    tags: ["Field Trials", "Post-Harvest R&D", "Agronomy Desk"],
    mail: "research@zeebaran.com",
    note: "24–48h technical review",
  },
  {
    n: "02",
    title: "Investment & Long-term Capital",
    body: "For impact investors, development finance institutions, family offices, and long-term capital partners interested in building commercially durable horticultural systems.",
    cta: "Start an investment conversation",
    reason: "investment",
    tags: ["Infrastructure CA", "Climate Capital", "Private Placement"],
    mail: "capital@zeebaran.com",
    note: "Direct partner routing",
  },
  {
    n: "03",
    title: "Strategic Collaboration",
    body: "For technology providers, infrastructure partners, market participants, and organisations with capabilities that can strengthen the horticulture system.",
    cta: "Explore a collaboration",
    reason: "collaboration",
    tags: ["Cold Logistics", "Optical Grading Tech", "Wholesale Gateways"],
    mail: "partnerships@zeebaran.com",
    note: "Supply chain team",
  },
  {
    n: "04",
    title: "Careers",
    body: "For people who want to contribute to an organisation that combines complex operations with a clear institutional purpose.",
    cta: "Explore opportunities",
    reason: "careers",
    tags: ["Field Agronomists", "Industrial Cold Operations", "Logistics Tech"],
    mail: "careers@zeebaran.com",
    note: "Talent & operations",
  },
  {
    n: "05",
    title: "General Enquiries & Concerns",
    body: "For all other questions, introductions, and correspondence - including concerns raised by growers, employees, partners, and members of the public.",
    cta: "Send a message",
    reason: "general",
    tags: ["Public Correspondence", "Grower Support", "Ethics & Governance"],
    mail: "hello@zeebaran.com",
    note: "Dedicated helpdesk",
  },
];

export const hubs = [
  {
    title: "Srinagar Central HQ",
    place: "Jawahar Nagar",
    body: "Executive leadership, institutional partnerships, and digital telemetry monitoring.",
    facts: ["Altitude: 1,585m AMSL", "Response: < 24h"],
  },
  {
    title: "Lassipora Agri-Industrial Hub",
    place: "Pulwama",
    body: "Integrated CA Atmosphere Storage, optical grading lines, cold logistics fleet staging.",
    facts: ["Capacity: 8,500 MT", "Direct dispatch desk"],
  },
  {
    title: "Baramulla & Achabal Field Stations",
    place: "North & South Kashmir",
    body: "Grower extension services, orchard rootstock nurseries, micro-climate weather telemetry.",
    facts: ["Elevation: up to 2,250m", "Field extension active"],
  },
  {
    title: "New Delhi Liaison Office",
    place: "Vasant Kunj",
    body: "Commercial buyers, sovereign & development finance institutions, national freight hub.",
    facts: ["Corridor transit: daily", "Scheduled meetings"],
  },
];

export const firstMessage = [
  "Who you are and the organisation you represent (if applicable)",
  "What you are working on",
  "The problem, opportunity, or question you are exploring",
  "Why you think Zeebaran may be relevant",
  "The best way to continue the conversation",
];
