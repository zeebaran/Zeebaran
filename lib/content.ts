/**
 * ALL PAGE COPY LIVES HERE.
 * Words in {braces} render as the accent in headings (see Heading in components/Motion.tsx).
 * Copy is taken from the supplied Stitch design exports.
 */

export const moments = [
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
];

export const capabilities = [
  {
    eyebrow: "Operating capability 01",
    title: "Nursery Development & Genetics",
    variant: "canopy" as const,
    body: "Planting material, rootstock, and varietal development establish the foundation on which every later stage depends. Zeebaran propagates high-quality planting material each year.",
    rows: [
      ["Operating asset", "Nursery infrastructure and mother-block programmes"],
      [
        "Constraint answered",
        "Limited access to reliable, high-quality planting material at the start of orchard development.",
      ],
      ["Outcome", "Reliable planting material with assured provenance for growers."],
    ],
  },
  {
    eyebrow: "Operating capability 02",
    title: "Orchard Development",
    variant: "rows" as const,
    body: "Site preparation, climate-responsive design, and high-density orchard establishment transform mountain land into productive, resilient orchards. More than 3,000 hectares have been developed to date. 3000+ orchards being built every season.",
    rows: [
      ["Operating asset", "High-density plantation design and installation teams"],
      ["Constraint answered", "Land that underperforms without scientific orchard design."],
      ["Outcome", "Orchards designed for long-term productivity and resilience."],
    ],
  },
  {
    eyebrow: "Operating capability 03",
    title: "Orchard Management & Advisory",
    variant: "centre" as const,
    body: "Field agronomy, diagnostics, and digital decision support ensure that technical knowledge reaches the orchard when it is needed - not after the opportunity has passed.",
    rows: [
      [
        "Operating asset",
        "Field operations and advisory teams, diagnostic services, and digital decision support.",
      ],
      ["Constraint answered", "Advice that arrives too late, or never reaches the orchard."],
      ["Outcome", "Timely intervention before challenges become losses."],
    ],
  },
  {
    eyebrow: "Operating capability 04",
    title: "Agri-inputs",
    variant: "hills" as const,
    body: "Crop nutrition, crop protection, and biological solutions are matched to diagnostics and local conditions, ensuring inputs are applied with purpose rather than in isolation.",
    rows: [
      ["Operating asset", "Inputs integrated with diagnostic capability and field advisory."],
      [
        "Constraint answered",
        "Inputs applied without the right guidance, resulting in poor timing and unnecessary waste.",
      ],
      [
        "Outcome",
        "The right intervention at the right time, with greater efficiency and less waste.",
      ],
    ],
  },
  {
    eyebrow: "Operating capability 05",
    title: "Value-Added Processing",
    variant: "canopy" as const,
    body: "Grading, quality management, and 30,000 MT of controlled-atmosphere and cold storage preserve product quality between harvest and market.",
    rows: [
      ["Operating asset", "Controlled-atmosphere storage and primary processing infrastructure."],
      ["Constraint answered", "Harvest value lost in the critical period after picking."],
      [
        "Outcome",
        "Preserved quality, reduced post-harvest losses, and greater flexibility in when to sell.",
      ],
    ],
  },
  {
    eyebrow: "Operating capability 06",
    title: "Procurement, Marketing, Sales & Distribution",
    variant: "centre" as const,
    body: "Procurement, traceability, cold-chain logistics, and market distribution connect produce to markets that recognise and reward quality.",
    rows: [
      [
        "Operating asset",
        "Procurement systems, cold-chain logistics, traceability, and distribution networks.",
      ],
      ["Constraint answered", "Limited access to reliable, transparent, and remunerative markets."],
      ["Outcome", "Produce reaching stronger markets, with greater value returning to the grower."],
    ],
  },
];

export const seasons = [
  {
    label: "Dormancy",
    note: "Pruning, planting, orchard establishment, and preparation for the season ahead.",
    start: 0,
    end: 3,
  },
  {
    label: "Bloom",
    note: "Pollination support, frost risk management, nutrition, and early season monitoring.",
    start: 3,
    end: 5,
  },
  {
    label: "Growth",
    note: "Diagnostics, crop protection, biological solutions, thinning, irrigation guidance, and field advisory.",
    start: 4,
    end: 8,
  },
  {
    label: "Harvest",
    note: "Harvest planning, picking, grading, quality management, and procurement.",
    start: 8,
    end: 11,
  },
  {
    label: "Storage & Market",
    note: "Controlled-atmosphere storage, logistics, traceability, dispatch, and market access.",
    start: 9,
    end: 12,
  },
  {
    label: "Zeebaran Field Layer",
    note: "Field advisory, diagnostics, demonstrations, guidance, and continuous grower support connect every stage of the orchard year.",
    start: 0,
    end: 12,
  },
];

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

export const conditions = [
  {
    n: "01",
    eyebrow: "Access",
    title: "Reach what you need.",
    body: "Every grower should be within reach of the knowledge, people, diagnostics, demonstrations, digital tools, and inputs needed to improve an orchard.",
    example: "Access to people, information, diagnostics, tools, and support.",
  },
  {
    n: "02",
    eyebrow: "Advice",
    title: "Know what to do.",
    body: "Technical knowledge becomes valuable only when it is translated into practical guidance. Field teams provide timely advice shaped by the crop, the season, and the specific conditions of each orchard.",
    example: "Evidence-based decisions, timely action, and orchard-specific guidance.",
  },
  {
    n: "03",
    eyebrow: "Adoption",
    title: "Make it part of the work.",
    body: "Repeated support that helps a grower test a practice, use it correctly and continue with it when the season changes.",
    example: "Testing, learning, continuous improvement, and lasting practice.",
  },
];

export const visitSteps = [
  {
    n: "01",
    title: "Bring the question",
    body: "Every visit begins with the orchard. A concern, a leaf sample, an image, a planting plan, or a problem already visible in the field.",
    who: "The grower starts the conversation",
  },
  {
    n: "02",
    title: "Work through the decision",
    body: "Field experience, diagnostics, and technical guidance help understand the problem and identify the most appropriate next step.",
    who: "People, evidence, and judgement",
  },
  {
    n: "03",
    title: "Put it into practice",
    body: "The recommendation is demonstrated, tested, and adapted to the orchard's conditions - where better practice becomes practical.",
    who: "In the orchard, not on paper",
  },
  {
    n: "04",
    title: "Return with what happened",
    body: "The outcome becomes part of the next conversation. Field experience strengthens future decisions, improves technical guidance, and helps the platform continue learning.",
    who: "Learning continues, season after season",
  },
];

export const tools = [
  {
    n: "01",
    title: "Network",
    body: "A growing network of permanent farmer engagement centres located close to the orchards they serve.",
    out: "Presence, continuity, and local access.",
  },
  {
    n: "02",
    title: "Advisory",
    body: "Year-round field support delivered by teams who understand local orchards, seasons, and growing conditions.",
    out: "Knowledge, guidance, and trusted relationships.",
  },
  {
    n: "03",
    title: "Capability",
    body: "Diagnostics, demonstrations, training, and digital tools that help growers make better decisions where they matter most - in the orchard.",
    out: "Evidence, practical skills, and confidence to act.",
  },
  {
    n: "04",
    title: "Feedback",
    body: "Every visit strengthens the platform. Field observations, grower experiences, and seasonal outcomes help shape Zeebaran's technical priorities, research, and future improvements.",
    out: "Learning, continuous improvement, and institutional memory.",
  },
];

export const loop = [
  {
    n: "01",
    title: "Observe",
    body: "Every season begins with the orchard. Growers and field teams identify conditions, questions, and challenges that cannot be understood from a distance.",
    where: "The field.",
  },
  {
    n: "02",
    title: "Understand",
    body: "Field observations are combined with diagnostics, data, and technical expertise to understand what is happening and why.",
    where: "The laboratory and the platform.",
  },
  {
    n: "03",
    title: "Act",
    body: "The most appropriate practice, input, or intervention is applied, demonstrated, and refined under real orchard conditions.",
    where: "The orchard.",
  },
  {
    n: "04",
    title: "Learn",
    body: "The outcome becomes part of the institution's knowledge. It informs future advisory, improves digital tools, shapes research priorities, and strengthens the next decision.",
    where: "The institution.",
  },
];

export const techTiles = [
  {
    n: "01",
    title: "Orchard Record",
    body: "A living record of each orchard - what is planted, where it is located, the rootstock and variety, and the history of management decisions.",
    out: "Context.",
  },
  {
    n: "02",
    title: "Field Observation",
    body: "Images, symptoms, measurements, and observations captured by growers and field teams throughout the season.",
    out: "Evidence.",
  },
  {
    n: "03",
    title: "Weather & Season",
    body: "Local weather, seasonal conditions, and orchard context that determine whether an intervention should happen now, later, or not at all.",
    out: "Timing.",
  },
  {
    n: "04",
    title: "Decision Support",
    body: "The platform combines records, observations, weather, and technical knowledge to support timely, practical guidance that field teams can recommend and growers can confidently act upon.",
    out: "Better decisions.",
  },
];

export const priorities = [
  {
    n: "01",
    title: "Rootstock Validation",
    body: "Evaluating rootstocks for performance, resilience, and suitability under Himalayan growing conditions.",
    status: "Under validation",
  },
  {
    n: "02",
    title: "Germplasm Characterisation",
    body: "Understanding the traits, performance and potential of fruit varieties relevant to Himalayan horticulture.",
    status: "Under validation",
  },
  {
    n: "03",
    title: "Biological Crop Protection",
    body: "Developing and validating biological approaches that reduce avoidable dependence on synthetic crop protection while maintaining orchard performance.",
    status: "In field",
  },
  {
    n: "04",
    title: "Digital Extension",
    body: "Improving how orchard records, diagnostics, weather intelligence, and practical guidance reach dispersed growers through field teams.",
    status: "In development",
  },
  {
    n: "05",
    title: "Post-Harvest Quality",
    body: "Improving quality preservation across harvesting, grading, storage, processing, and distribution.",
    status: "In field",
  },
  {
    n: "06",
    title: "Soil & Plant Health",
    body: "Understanding local soil and plant conditions to support more precise, evidence-based orchard management.",
    status: "In field",
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
    value: 18000,
    suffix: "+",
    unit: "",
    label: "Growers reached",
    def: "Advisory, inputs, orchard services or procurement engagement from Zeebaran.",
    foot: "Cumulative field operations",
  },
  {
    value: 3000,
    suffix: "+",
    unit: "ha",
    label: "Orchards developed",
    def: "Area established or redeveloped under Zeebaran, including site preparation and installation.",
    foot: "Cumulative orchard development",
  },
  {
    value: 3000,
    suffix: "+",
    unit: "",
    label: "Orchards built every season",
    def: "Individual orchards established under Zeebaran orchard development in a single season.",
    foot: "Per-season orchard development",
  },
  {
    value: 30000,
    suffix: "",
    unit: "MT",
    label: "Storage capacity",
    def: "Installed controlled-atmosphere and cold storage across Zeebaran facilities.",
    foot: "Installed post-harvest operations",
  },
  {
    value: 18,
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

export const partnerGroups = [
  {
    title: "Research & Academic",
    items: [
      { name: "SKUAST-K", note: "Sher-e-Kashmir Agri University" },
      { name: "ICAR-CITH", note: "Central Institute of Temperate Horticulture" },
      { name: "Purdue University", note: "College of Agriculture" },
      { name: "Wageningen University & Research", note: "" },
    ],
  },
  {
    title: "Technical & Applied",
    items: [
      { name: "Koppert Biological Systems", note: "Natural pollination & pest control" },
      { name: "IVAR", note: "Orchard moisture & sensor telemetry" },
      { name: "Consorzio Italiano Vivaisti", note: "Certified planting stock & rootstocks" },
    ],
  },
  {
    title: "Long-Term Capital",
    items: [
      { name: "Incofin Investment Management", note: "Agri-value chain impact debt & equity" },
      { name: "responsAbility Investments", note: "Sustainable agriculture finance" },
      { name: "Fiedlin Ventures", note: "Agtech & supply chain patient capital" },
    ],
  },
] as const;

export const partnerOutcomes = [
  "Better knowledge reaching the field",
  "Better planting material reaching growers",
  "Better decisions made at the right time",
  "Better use of infrastructure across the value chain",
  "Better access to markets that reward quality",
  "More capable growers, institutions, and horticultural systems",
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
