// Historical authored content: used only by the one-time Firestore migration and legacy tests.
// Runtime catalog pages must never import this data.
export type Rootstock = {
  code: string;
  system: string;
  spacing: string;
  yield: string;
  note: string;
};

export type Product = {
  slug: string;
  name: string;
  localName?: string;
  origin: string;
  season: "Early" | "Mid" | "Late" | "Very Late";
  seasonMonths: string;
  colour: string;
  flavour: string;
  brix: string; // sugar content
  firmness: string;
  shelfLife: string;
  storageLife: string; // in CA store
  marketClass: string;
  eyebrow: string;
  headline: string;
  intro: string;
  highlights: string[];
  agronomyNotes: string;
  rootstocks: Rootstock[];
  image?: string;
  sceneVariant?: string;
  sceneSeed?: number;
  badge?: string; // e.g. "Best Seller", "New Introduction"
};

export const ROOTSTOCKS: Record<string, Rootstock> = {
  M9: {
    code: "M9",
    system: "High-Density (HDO)",
    spacing: "1.0 – 1.5 m × 3.5 m",
    yield: "40 – 60 MT/ha",
    note: "Industry benchmark for HDO orchards. Requires permanent support structure. Favoured for premium export blocks.",
  },
  M26: {
    code: "M26",
    system: "Medium-High Density",
    spacing: "1.5 – 2.0 m × 3.5 m",
    yield: "30 – 45 MT/ha",
    note: "Moderate anchorage. Good choice for growers transitioning from traditional to intensive systems.",
  },
  MM106: {
    code: "MM106",
    system: "Semi-Vigorous",
    spacing: "2.5 – 3.5 m × 4.5 m",
    yield: "20 – 35 MT/ha",
    note: "Deeper rooting, better drought tolerance. Suitable for sloped terrain and rain-fed plots.",
  },
  M7: {
    code: "M7",
    system: "Semi-Dwarfing",
    spacing: "2.0 – 2.5 m × 4.0 m",
    yield: "25 – 40 MT/ha",
    note: "Reliable performer in J&K conditions. Good for farmers upgrading from traditional orchards.",
  },
};

export const PRODUCTS: Product[] = [
  {
    slug: "gala",
    name: "Gala",
    localName: "Royal Gala",
    origin: "New Zealand",
    season: "Early",
    seasonMonths: "August – September",
    colour: "Red-orange striped over yellow-green background",
    flavour: "Sweet with mild tartness, honey-like aroma",
    brix: "12 – 14 °Bx",
    firmness: "7 – 8 kg/cm²",
    shelfLife: "3 – 4 weeks ambient",
    storageLife: "6 – 7 months CA",
    marketClass: "Domestic retail & institutional supply",
    eyebrow: "Early Season · Export Grade",
    headline: "The {orchard's} first harvest. Every year.",
    intro:
      "Gala is the world's most widely planted apple variety — and for good reason. It delivers a reliable, high-colour early crop that enters the market before competition, commanding premium shelf positioning. Zeebaran's certified Gala planting material comes from virus-indexed mother blocks and is propagated to strict clonal standards.",
    highlights: [
      "Earliest commercial harvest window in J&K — market access by mid-August",
      "High red-colour expression (Royal Gala strains) meets export colour grading",
      "Reliable annual bearing, low biennial bearing tendency",
      "Excellent consumer acceptance across all Indian market segments",
      "Compatible with all Zeebaran cold-chain and CA storage infrastructure",
    ],
    agronomyNotes:
      "Gala performs best on M9 and M26 rootstocks in high-density planting systems. It requires good calcium nutrition during cell division stage (40–60 days after full bloom) to prevent bitter pit. Thinning is critical — target 1 fruit per spur at 25–30 mm fruitlet stage. Gala is susceptible to scab and powdery mildew; a structured spray programme is essential.",
    rootstocks: [ROOTSTOCKS.M9, ROOTSTOCKS.M26, ROOTSTOCKS.MM106, ROOTSTOCKS.M7],
    image: "/images/Varrients/Apples/Royal Gala.webp",
    sceneVariant: "orchard",
    sceneSeed: 2,
    badge: "Best Seller",
  },
  {
    slug: "red-delicious",
    name: "Red Delicious",
    origin: "USA",
    season: "Mid",
    seasonMonths: "September – October",
    colour: "Deep solid red, characteristic five-point crown",
    flavour: "Mild, sweet, low acid — classic appearance-first variety",
    brix: "11 – 13 °Bx",
    firmness: "7 – 9 kg/cm²",
    shelfLife: "4 – 6 weeks ambient",
    storageLife: "7 – 9 months CA",
    marketClass: "Domestic wholesale, institutional, cold-storage trading",
    eyebrow: "Mid Season · High Volume",
    headline: "The {benchmark} variety. Built for Indian markets.",
    intro:
      "Red Delicious remains the dominant commercial variety across J&K orchards and Indian wholesale markets. Its deep colour, long storage life, and wide consumer familiarity make it the backbone of the region's apple economy. Zeebaran supplies improved Redchief and Scarlet Spur strains that deliver better colour and firmness than traditional selections.",
    highlights: [
      "Highest market volume and institutional demand across India",
      "Deep red colouration with no post-harvest colour loss in CA storage",
      "9-month CA storage window enables year-round supply chain positioning",
      "Improved Scarlet Spur strain: spur-type growth habit, compact canopy",
      "Redchief strain: better red blush coverage, maintains traditional flavour profile",
    ],
    agronomyNotes:
      "Red Delicious is relatively vigorous and responds well to M7 and MM106 on traditional orchard systems, and M9/M26 in HDO blocks. It is prone to water core in warm pre-harvest conditions; irrigation management in the final 4 weeks before harvest is critical. Pre-harvest calcium sprays and growth regulator applications improve storability.",
    rootstocks: [ROOTSTOCKS.M9, ROOTSTOCKS.M26, ROOTSTOCKS.MM106, ROOTSTOCKS.M7],
    image: "/images/Varrients/Apples/Red Delicious.webp",
    sceneVariant: "hills",
    sceneSeed: 5,
  },
  {
    slug: "fuji",
    name: "Fuji",
    localName: "Fuji Supreme",
    origin: "Japan",
    season: "Late",
    seasonMonths: "October – November",
    colour: "Red-striped over greenish-yellow, full red in Beni Fuji strains",
    flavour: "Exceptionally sweet, dense, crisp — highest consumer satisfaction scores",
    brix: "14 – 17 °Bx",
    firmness: "8 – 10 kg/cm²",
    shelfLife: "6 – 8 weeks ambient",
    storageLife: "10 – 12 months CA",
    marketClass: "Premium retail, organized trade, modern retail chains",
    eyebrow: "Late Season · Premium Segment",
    headline: "Highest {Brix}. Longest shelf. Strongest margins.",
    intro:
      "Fuji is the premium workhorse of the global apple industry — and increasingly of India's organised retail sector. Its extraordinary sugar content (up to 17 °Bx), exceptional crunch, and near year-round CA storability make it the highest-margin variety Zeebaran offers. Beni Fuji and Fuji Supreme strains are available as improved red-sport selections.",
    highlights: [
      "Highest sugar content (°Brix) of any commercially grown apple variety",
      "Up to 12 months CA storage — enables strategic selling at peak price windows",
      "Strong demand from modern retail: Big Bazaar, Reliance Fresh, premium online grocers",
      "Available in Beni Fuji (earlier colouring), Fuji Supreme, and Fuji Kiku strains",
      "Best suited for well-drained, slightly heavier soils with good cold accumulation",
    ],
    agronomyNotes:
      "Fuji requires the highest chilling hours (900–1200 CH) of all our commercial varieties — it performs best above 1,600 m elevation in J&K. It is a late-bloomer and needs 165–180 days to maturity. Biennial bearing is a risk; chemical thinning at 15–20 mm fruitlet is essential. Fuji is relatively scab-resistant but susceptible to fire blight — apply copper during dormancy.",
    rootstocks: [ROOTSTOCKS.M9, ROOTSTOCKS.M26, ROOTSTOCKS.MM106],
    image: "/images/Varrients/Apples/Fuji Apple.webp",
    sceneVariant: "valley",
    sceneSeed: 8,
    badge: "Premium",
  },
  {
    slug: "golden-delicious",
    name: "Golden Delicious",
    localName: "Gold Spur",
    origin: "USA",
    season: "Mid",
    seasonMonths: "September – October",
    colour: "Golden yellow, lenticel dots, smooth bloom",
    flavour: "Honey-sweet, mild, complex aroma — melting flesh",
    brix: "13 – 15 °Bx",
    firmness: "6 – 8 kg/cm²",
    shelfLife: "3 – 5 weeks ambient",
    storageLife: "8 – 10 months CA",
    marketClass: "Retail, juice processing, culinary",
    eyebrow: "Mid Season · Dual Purpose",
    headline: "Gold on the tree. {Gold} in the market.",
    intro:
      "Golden Delicious occupies a unique commercial position — premium eating apple, juice processing workhorse, and the pollinator of choice for mixed-variety orchards. Its Gold Spur strain offers compact canopy architecture ideal for high-density systems. Zeebaran's certified material covers both standard and spur-type selections.",
    highlights: [
      "Excellent pollinator variety for Gala, Fuji, and Red Delicious blocks",
      "Dual-use: premium fresh market and processing (juice, dried, puree)",
      "Gold Spur spur-type strain: 30% more compact canopy, easier mechanisation",
      "High colour uniformity meets export sorting standards",
      "10-month CA storage with minimal quality degradation",
    ],
    agronomyNotes:
      "Golden Delicious is the most adaptable variety in our portfolio — tolerates a wider range of soils and elevations. It is prone to russeting in high-humidity conditions; fungicide timing around flowering is critical. Fruit thinning must be aggressive (target 25–30 cm between fruits) to achieve size suitable for fresh-market grading. Avoid nitrogen excess — it promotes excessive vegetative growth.",
    rootstocks: [ROOTSTOCKS.M9, ROOTSTOCKS.M26, ROOTSTOCKS.MM106, ROOTSTOCKS.M7],
    image: "/images/Varrients/Apples/Golden Delicious.webp",
    sceneVariant: "orchard",
    sceneSeed: 3,
  },
  {
    slug: "granny-smith",
    name: "Granny Smith",
    origin: "Australia",
    season: "Very Late",
    seasonMonths: "October – November",
    colour: "Bright green, maintains colour in storage",
    flavour: "Sharp tart, firm, excellent acid balance — baker's favourite",
    brix: "10 – 12 °Bx",
    firmness: "9 – 11 kg/cm²",
    shelfLife: "6 – 8 weeks ambient",
    storageLife: "10 – 14 months CA",
    marketClass: "Export, premium retail, food service, culinary",
    eyebrow: "Very Late Season · Export Specialist",
    headline: "The {green} standard. For the market that never sleeps.",
    intro:
      "Granny Smith is the global benchmark for tart apple varieties — universally recognised, consistently priced, and commanding sustained export demand. Its extraordinary shelf and storage life (up to 14 months CA) makes it a strategic cash-flow tool: plant, store, and sell at the market window you choose. Zeebaran's Granny Smith material comes from certified disease-free clonal selections.",
    highlights: [
      "Longest CA storage life in our portfolio — 14 months enables year-round supply",
      "Globally recognised colour and flavour profile: consistent export specification",
      "Zero colour change in storage — stays market-green throughout",
      "Strong food service demand: hotels, restaurants, bakeries, airlines",
      "Natural resistance to many common storage rots",
    ],
    agronomyNotes:
      "Granny Smith is the latest-maturing variety we supply and requires the longest growing season — late frosts at harvest can be damaging. It performs best above 1,800 m in J&K. It has the highest chilling requirement in our portfolio and is very poorly suited to low-altitude orchards. Fire blight susceptibility is moderate; Granny Smith rewards well-managed copper programmes during dormancy.",
    rootstocks: [ROOTSTOCKS.M9, ROOTSTOCKS.M26, ROOTSTOCKS.MM106],
    image: "/images/Varrients/Apples/Granny Smith.webp",
    sceneVariant: "hills",
    sceneSeed: 7,
    badge: "Export Specialist",
  },
  {
    slug: "honeycrisp",
    name: "Honeycrisp",
    origin: "USA (Minnesota)",
    season: "Early",
    seasonMonths: "Late August – September",
    colour: "Bright red-yellow bi-colour, attractive lenticel pattern",
    flavour: "Explosively crisp, balanced sweet-tart, juicy — premium eating",
    brix: "13 – 16 °Bx",
    firmness: "8 – 10 kg/cm²",
    shelfLife: "5 – 7 weeks ambient",
    storageLife: "7 – 8 months CA",
    marketClass: "Super-premium retail, luxury gifting, export",
    eyebrow: "Early Season · Ultra Premium",
    headline: "No other apple {commands} this price.",
    intro:
      "Honeycrisp is the highest value-per-kg apple variety in the world at retail. Developed by the University of Minnesota, its unique cellular structure delivers an explosive crack on first bite that no other variety can replicate. Indian premium retail is in early adoption — Zeebaran is positioning certified Honeycrisp blocks for growers with the right altitude and CA infrastructure.",
    highlights: [
      "Highest retail price premium of any apple variety globally",
      "Unique explosive crunch profile driven by large, starch-dense cell structure",
      "Strong early-mover advantage: limited Indian supply, rising premium demand",
      "Bi-colour development suits high-altitude J&K growing conditions",
      "High media coverage: drives consumer pull at modern retail",
    ],
    agronomyNotes:
      "Honeycrisp is a high-reward, high-management variety. It is prone to bitter pit (high calcium demand), Honeycrisp pith necrosis (temperature management), and tipburn. Post-harvest handling is demanding — fruit is fragile and bruises easily. Requires experienced orchard management. We recommend Honeycrisp only for growers with existing orchard management infrastructure and CA storage access.",
    rootstocks: [ROOTSTOCKS.M9, ROOTSTOCKS.M26],
    image: "/images/Varrients/Apples/Honeycrisp Apple.webp",
    sceneVariant: "orchard",
    sceneSeed: 11,
    badge: "New Introduction",
  },
  {
    slug: "pink-lady",
    name: "Pink Lady",
    localName: "Cripps Pink",
    origin: "Australia (Cripps Pink cross)",
    season: "Very Late",
    seasonMonths: "November",
    colour: "Pinkish-red blush over creamy yellow, distinctive rose tone",
    flavour: "Crisp, tangy-sweet balance, floral finish — complex flavour",
    brix: "14 – 16 °Bx",
    firmness: "8 – 10 kg/cm²",
    shelfLife: "5 – 7 weeks ambient",
    storageLife: "8 – 10 months CA",
    marketClass: "Premium retail, export, modern trade",
    eyebrow: "Very Late Season · Premium Brand",
    headline: "A {trademarked} flavour. Unmistakable in every market.",
    intro:
      "Pink Lady (Cripps Pink) is a legally trademarked brand variety — growers who meet quality standards can supply into the Pink Lady premium supply chain. Its instantly recognisable rose-blush colour and unique tangy-sweet flavour profile command a consistent price premium. Zeebaran supplies certified Cripps Pink planting material under licence, with agronomy support to meet brand compliance.",
    highlights: [
      "Trademarked brand: growers who meet spec sell into a protected premium market",
      "Distinctive pink colouration and flavour — highest brand recognition among apple consumers",
      "Late-season availability fills supply gap when early varieties are exhausted",
      "Very long CA storability maintains premium quality through spring",
      "International export specification aligned with global Pink Lady standards",
    ],
    agronomyNotes:
      "Pink Lady (Cripps Pink) is the most demanding variety in terms of colour development — it requires the highest light exposure during the final 4–6 weeks before harvest. Fruit must remain on the tree as long as possible to develop full pink blush; early picking results in poor colour and fails brand specification. Requires the latest harvest season, good post-harvest temperature management, and CA storage.",
    rootstocks: [ROOTSTOCKS.M9, ROOTSTOCKS.M26, ROOTSTOCKS.MM106],
    image: "/images/Varrients/Apples/Pink Lady.webp",
    sceneVariant: "valley",
    sceneSeed: 14,
    badge: "Licensed Variety",
  },
  {
    slug: "ambri",
    name: "Ambri",
    localName: "Kashmiri Ambri",
    origin: "Kashmir Valley (indigenous)",
    season: "Early",
    seasonMonths: "August",
    colour: "Yellow-green with light red flush, small to medium size",
    flavour: "Intensely aromatic, sweet, distinctly Kashmiri — unique terroir",
    brix: "13 – 15 °Bx",
    firmness: "5 – 7 kg/cm²",
    shelfLife: "2 – 3 weeks ambient",
    storageLife: "4 – 5 months CA",
    marketClass: "Geographical Indication (GI) certified, premium niche, gifting",
    eyebrow: "Early Season · GI Certified Heritage",
    headline: "Kashmir's {original} apple. No replica exists.",
    intro:
      "Ambri is Kashmir's ancient indigenous apple — cultivated for centuries before any commercial variety arrived. It carries a Geographical Indication (GI) certification recognising its unique terroir link. Ambri's flavour is unmistakable: intensely aromatic in a way no imported variety can match. Zeebaran is investing in certified Ambri clonal preservation and high-specification GI-compliant supply chains.",
    highlights: [
      "GI Certification: legal protection and premium pricing under Indian IP law",
      "Unique aroma profile linked to Kashmiri altitude and terroir — not reproducible elsewhere",
      "Strong and growing premium niche demand: gifting, luxury grocery, diaspora markets",
      "Cultural heritage value: increasingly favoured by institutional buyers seeking authenticity",
      "Zeebaran operates Ambri clonal preservation blocks to maintain genetic integrity",
    ],
    agronomyNotes:
      "Ambri is an early-season variety well-adapted to traditional J&K orchard systems. It performs across a wider altitude range than international varieties. Its main limitation is short shelf life — post-harvest handling speed and CA access are critical to preserve premium quality. We supply certified, virus-indexed Ambri material from clean mother blocks to protect the GI lineage.",
    rootstocks: [ROOTSTOCKS.MM106, ROOTSTOCKS.M7, ROOTSTOCKS.M26],
    image: "/images/Varrients/Apples/Ambri Apples.webp",
    sceneVariant: "valley",
    sceneSeed: 6,
    badge: "GI Certified",
  },
];
