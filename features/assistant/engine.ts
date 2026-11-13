import type {
  Answer,
  AssistantItem,
  ConversationContext,
  Fact,
  Knowledge,
  Requirement,
} from "./types";
import { freshContext } from "./types";
export const normalize = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const has = (text: string, words: string[]) =>
  words.some((w) => (" " + normalize(text) + " ").includes(" " + normalize(w) + " "));
const value = (s: string) =>
  s.trim() && !/^(?:n\/?a|unknown|not (?:available|specified|recorded)|-|tbd)$/i.test(s.trim());
export function facts(item: AssistantItem): Fact[] {
  const fields: [string, string][] = [
    ["Origin", item.origin],
    ["Harvest season", item.season],
    ["Harvest window", item.seasonMonths],
    ["Colour", item.colour],
    ["Flavour", item.flavour],
    ["Sugar (°Bx)", item.brix],
    ["Firmness", item.firmness],
    ["Shelf life", item.shelfLife],
    ["CA storage", item.storageLife],
    ["Market", item.marketClass],
    ["Vigour / system", item.system],
    ["Spacing", item.spacing],
    ["Yield", item.yield],
    ["Best suited to", item.bestFor],
    ["Guidance", item.note],
  ];
  return [
    ...fields.map(([label, value]) => ({ label, value })),
    ...item.specifications.map((s) => ({
      label: (s.group ? s.group + " · " : "") + s.label,
      value: s.value,
    })),
  ].filter((f) => value(f.value));
}
function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i ? (j ? 0 : i) : j)),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}
function mentions(text: string, items: AssistantItem[]) {
  const words = normalize(text).split(" ").slice(0, 100);
  return items
    .map((item) => {
      const aliases = [item.name, item.localName, item.code, item.slug.replace(/-/g, " ")]
        .filter(Boolean)
        .map(normalize);
      let index = Infinity;
      for (const alias of aliases) {
        const parts = alias.split(" ");
        for (let i = 0; i <= words.length - parts.length; i++) {
          const exact = parts.every((p, j) => p === words[i + j]);
          const fuzzy = parts.every(
            (p, j) =>
              p === words[i + j] ||
              (p.length >= 5 &&
                words[i + j].length >= 5 &&
                distance(p, words[i + j]) <= (p.length >= 8 ? 2 : 1)),
          );
          if (exact || fuzzy) index = Math.min(index, i);
        }
      }
      // M 9 / MM 106 are common ways of writing a rootstock code.
      if (
        item.code &&
        (" " + normalize(text).replace(/\b(m{1,2}) +([0-9]+)/g, "$1$2") + " ").includes(
          " " + normalize(item.code) + " ",
        )
      )
        index = Math.min(index, normalize(text).indexOf("m"));
      return { item, index };
    })
    .filter((x) => Number.isFinite(x.index))
    .sort((a, b) => a.index - b.index)
    .map((x) => x.item);
}
const factors: { label: string; cues: string[]; alternatives?: string[][] }[] = [
  {
    label: "Soil",
    cues: ["soil", "drainage"],
    alternatives: [
      ["clay", "clayey"],
      ["sandy", "sand"],
      ["loam", "loamy"],
      ["waterlogged", "poor drainage", "wet soil"],
      ["well drained", "good drainage"],
    ],
  },
  {
    label: "Climate",
    cues: ["climate", "chilling", "frost"],
    alternatives: [
      ["cold", "cool", "frost"],
      ["warm", "hot"],
      ["low chill", "low chilling"],
      ["high chill", "high chilling"],
    ],
  },
  {
    label: "Planting density",
    cues: ["density", "vigour", "vigor", "spacing", "dwarf"],
    alternatives: [["high density"], ["intensive"], ["low density", "traditional"]],
  },
  {
    label: "Vigour",
    cues: ["vigour", "vigor", "dwarf", "dwarfing"],
    alternatives: [
      ["semi dwarf", "semi dwarfing"],
      ["dwarf", "dwarfing"],
      ["vigorous", "vigour", "vigor"],
    ],
  },
  {
    label: "Harvest",
    cues: ["harvest", "season"],
    alternatives: [
      ["early", "early season"],
      ["late", "late season"],
      ["mid season", "midseason"],
    ],
  },
  {
    label: "Storage",
    cues: ["storage", "keeping"],
    alternatives: [["long storage", "storage", "keeping", "shelf life"]],
  },
];
function requirements(text: string): Requirement[] {
  const found: Requirement[] = [];
  const n = normalize(text);
  const altitude =
    text.match(/\b([1-9]\d{0,2}(?:,\d{3})+|[1-9]\d{2,4})\s*(?:m(?:et(?:re|er)s?)?|ft|feet)\b/i) ||
    text.match(/(?:altitude|elevation|height)\s*(?:is|of|at|:)?\s*([1-9]\d{2,4})/i);
  if (altitude) {
    const raw = Number(altitude[1].replace(/,/g, "")),
      metres = /ft|feet/i.test(altitude[0]) ? Math.round(raw * 0.3048) : raw;
    found.push({
      label: "Altitude",
      value: metres + " m",
      terms: ["altitude", "elevation"],
      altitude: metres,
    });
  }
  for (const factor of factors) {
    const matching = factor.alternatives?.filter(
      (a) =>
        has(n, a) &&
        !(factor.label === "Vigour" && a[0] === "dwarf" && has(n, ["semi dwarf", "semi dwarfing"])),
    );
    if (matching?.length) {
      const terms = matching.flat();
      const negative = matching.some((a) =>
        a.some((t) => has(n, ["not " + t, "no " + t, "avoid " + t, "without " + t])),
      );
      found.push({
        label: factor.label,
        value: (negative ? "Avoid " : "") + matching.map((a) => a[0]).join(", "),
        terms: negative ? [] : terms,
        ...(negative ? { excluded: terms } : {}),
      });
    }
  }
  return found;
}
function supporting(item: AssistantItem, r: Requirement): Fact[] {
  const rows = facts(item);
  if (r.altitude) {
    return rows
      .filter((f) => /altitude|elevation/i.test(f.label))
      .filter((f) => {
        const nums =
          f.value
            .replace(/,/g, "")
            .match(/\d+(?:\.\d+)?/g)
            ?.map(Number) || [];
        if (!/\bm\b|metre|meter/i.test(f.value) || nums.length !== 2) return false;
        return r.altitude! >= Math.min(...nums) && r.altitude! <= Math.max(...nums);
      });
  }
  // Match explicit specifications; descriptive prose is shown on the profile, never treated as a suitability rule.
  const relevant: Record<string, RegExp> = {
    Soil: /soil|drainage/i,
    Climate: /climate|chill|frost|temperature/i,
    "Planting density": /density|spacing|system|suited/i,
    Vigour: /vigour|vigor|system|suited/i,
    Harvest: /harvest|season/i,
    Storage: /storage|shelf/i,
  };
  return rows.filter((f) => {
    if (!r.terms.length || !relevant[r.label]?.test(f.label) || !has(f.value, r.terms))
      return false;
    if (
      r.label === "Vigour" &&
      r.value === "dwarf" &&
      has(f.value, ["semi dwarf", "semi dwarfing"])
    )
      return false;
    if (
      r.label === "Planting density" &&
      r.value === "high density" &&
      /\b(?:medium|low)\b/.test(normalize(f.value))
    )
      return false;
    return !r.terms.some((t) =>
      has(f.value, [
        "not " + t,
        "no " + t,
        "avoid " + t,
        "unsuitable for " + t,
        "not suitable for " + t,
        "not recommended for " + t,
      ]),
    );
  });
}
function conflicts(item: AssistantItem, r: Requirement): boolean {
  const rows = facts(item);
  if (
    r.excluded?.length &&
    rows.some(
      (f) =>
        /vigour|vigor|system|density|soil|drainage|climate|harvest|season/i.test(f.label) &&
        has(f.value, r.excluded!),
    )
  )
    return true;
  if (r.altitude)
    return rows
      .filter((f) => /altitude|elevation/i.test(f.label) && /\bm\b|metre|meter/i.test(f.value))
      .some((f) => {
        const nums =
          f.value
            .replace(/,/g, "")
            .match(/\d+(?:\.\d+)?/g)
            ?.map(Number) || [];
        return (
          nums.length === 2 && (r.altitude! < Math.min(...nums) || r.altitude! > Math.max(...nums))
        );
      });
  if (
    r.label === "Planting density" &&
    r.value === "high density" &&
    rows.some(
      (f) => /system|density/i.test(f.label) && /\b(?:medium|low)\b/.test(normalize(f.value)),
    )
  )
    return true;
  return r.terms.some((t) =>
    rows.some((f) =>
      has(f.value, [
        "not suitable for " + t,
        "not recommended for " + t,
        "avoid " + t,
        "unsuitable for " + t,
      ]),
    ),
  );
}
export function answerQuestion(
  input: string,
  knowledge: Knowledge,
  previous: ConversationContext = freshContext(),
): Answer {
  const context: ConversationContext = {
    ...previous,
    ids: [...previous.ids],
    requirements: [...previous.requirements],
  };
  const base: Answer = { text: "", items: [], links: [], suggestions: [], context };
  const raw = input.trim();
  if (!raw || raw.length > 600)
    return {
      ...base,
      text: "Ask a question of up to 600 characters about Zeebaran, a variety or a rootstock.",
    };
  const text = normalize(raw),
    mentioned = mentions(raw, knowledge.items),
    ids = mentioned.map((i) => i.id);
  if (/\b(?:reset|start over|new search|forget)\b/.test(text))
    return {
      ...base,
      text: "A fresh start. What would you like to explore?",
      suggestions: ["Explore apple varieties", "Explore rootstocks", "Help me choose"],
      context: freshContext(),
    };
  const askedKind = /root ?stock|rootstoks|rootstocks/.test(text)
    ? "rootstock"
    : /variet|apple|cultivar/.test(text)
      ? "variety"
      : undefined;
  if (askedKind) context.kind = askedKind;
  else if (mentioned.length && mentioned.every((i) => i.kind === mentioned[0].kind))
    context.kind = mentioned[0].kind;
  const newRequirements = requirements(raw);
  for (const r of newRequirements)
    context.requirements = [...context.requirements.filter((old) => old.label !== r.label), r];
  if (/^(explore|show|list|browse|discover)\b/.test(text)) context.recommending = false;
  const comparing = /\b(?:compare|comparison|versus|vs|difference|differences)\b/.test(text);
  const switching = /\b(?:instead|replace|switch|change|swap|what about|how about)\b/.test(text);
  if (switching && previous.ids.length === 2 && ids.length) {
    const replacements = ids.filter((id) => !previous.ids.includes(id));
    if (replacements.length === 1) {
      const old = ids.find((id) => previous.ids.includes(id)),
        slot = old ? previous.ids.indexOf(old) : /\b(?:first|left)\b/.test(text) ? 0 : 1;
      context.ids = [...previous.ids];
      context.ids[slot] = replacements[0];
    } else if (ids.length === 2) context.ids = ids;
  } else if (ids.length) context.ids = ids.slice(0, 2);
  const selected = context.ids
    .map((id) => knowledge.items.find((i) => i.id === id))
    .filter((i): i is AssistantItem => !!i);
  if (comparing || (switching && selected.length === 2)) {
    context.recommending = false;
    if (ids.length > 2)
      return {
        ...base,
        text: "Choose two entries for a clear comparison. Which pair would you like?",
        items: ids.slice(0, 6),
        suggestions: ids
          .slice(1, 4)
          .map(
            (id) =>
              "Compare " +
              mentioned[0].name +
              " vs " +
              knowledge.items.find((i) => i.id === id)!.name,
          ),
      };
    if (selected.length !== 2)
      return {
        ...base,
        text: "Which two entries would you like to compare? Choose from the published collection below.",
        items: knowledge.items
          .filter((i) => !context.kind || i.kind === context.kind)
          .slice(0, 6)
          .map((i) => i.id),
        suggestions: ["Explore rootstocks", "Explore apple varieties"],
      };
    const maps = selected.map((i) => new Map(facts(i).map((f) => [f.label, f.value]))),
      labels = [...new Set(maps.flatMap((m) => [...m.keys()]))];
    const rows = labels.map((label) => {
      const values = maps.map((m) => m.get(label) || "Not recorded");
      return { label, values, different: new Set(values.map(normalize)).size > 1 };
    });
    return {
      ...base,
      title: selected.map((i) => i.name).join(" vs "),
      text:
        "These are the published specifications, shown as recorded. Highlighted rows differ; a difference does not mean one is better for your site." +
        (selected[0].kind !== selected[1].kind
          ? " You selected a variety and a rootstock; they have different roles, so many fields will not be directly comparable."
          : ""),
      items: context.ids,
      comparison: rows,
      links: [
        {
          label: "Open full comparison",
          href:
            "/products/compare?left=" +
            encodeURIComponent(selected[0].id) +
            "&right=" +
            encodeURIComponent(selected[1].id),
        },
      ],
      suggestions: [
        "Help me choose",
        ...knowledge.items
          .filter((i) => i.kind === selected[1].kind && !context.ids.includes(i.id))
          .slice(0, 2)
          .map((i) => "Switch to " + i.name),
      ],
    };
  }
  if (/\b(?:price|pricing|cost|stock|availability|buy|order|purchase)\b/.test(text))
    return {
      ...base,
      text: "Live availability and pricing are not recorded in the published catalog. The nursery team can confirm them for your quantity and location.",
      items: ids,
      links: [{ label: "Ask the nursery team", href: "/contact/simple" }],
      suggestions: ["Explore apple varieties", "Explore rootstocks"],
    };
  if (/\b(?:missing|unavailable)\b/.test(text) && !selected.length)
    return {
      ...base,
      text: "Only populated published fields can support a match. Share your altitude, soil or drainage, climate and planting density; I’ll show the recorded evidence and call out gaps. Missing data never proves suitability or incompatibility.",
      suggestions: ["Help me choose a rootstock", "Help me choose a variety"],
      links: [{ label: "Ask for a site assessment", href: "/contact/simple" }],
    };
  const recommend =
    /\b(?:recommend|recommendation|suitable|suitability|best|choose|suggest|plant|orchard|need|want)\b/.test(
      text,
    ) ||
    (context.recommending && (newRequirements.length > 0 || !!askedKind));
  if (recommend && !comparing) {
    context.recommending = true;
    if (!context.kind)
      return {
        ...base,
        text: "Are you choosing an apple variety or a rootstock? I can match your requirements against the published specifications.",
        suggestions: ["Help me choose a variety", "Help me choose a rootstock"],
      };
    if (!context.requirements.length)
      return {
        ...base,
        text: "Tell me your orchard altitude, soil or drainage, and planned planting density. Share whichever you know, for example ‘1,800 m, loamy soil, high density’. I’ll check what the catalog actually records.",
        suggestions: [
          "Explore " + (context.kind === "rootstock" ? "rootstocks" : "apple varieties"),
          "What information is missing?",
        ],
      };
    const ranked = knowledge.items
      .filter((i) => i.kind === context.kind && !context.requirements.some((r) => conflicts(i, r)))
      .map((i) => ({
        item: i,
        evidence: context.requirements.flatMap((r) => supporting(i, r)),
        matched: context.requirements.filter((r) => supporting(i, r).length).map((r) => r.label),
      }))
      .filter((r) => r.evidence.length)
      .sort((a, b) => b.matched.length - a.matched.length || a.item.sortOrder - b.item.sortOrder)
      .slice(0, 3);
    if (!ranked.length)
      return {
        ...base,
        title: "No supported match yet",
        text:
          "I can’t confirm a suitable option from the published specifications for " +
          context.requirements.map((r) => r.label.toLowerCase() + ": " + r.value).join("; ") +
          ". Missing information is not a mismatch. Please ask the nursery team to assess your site; I won’t infer suitability from an origin or a product name.",
        links: [{ label: "Discuss your orchard", href: "/contact/simple" }],
        suggestions: [
          "Explore " + (context.kind === "rootstock" ? "rootstocks" : "apple varieties"),
          "Start over",
        ],
      };
    return {
      ...base,
      title: "A shortlist to investigate",
      text: "These entries explicitly match at least one stated requirement. This is a specification match, not a confirmed planting recommendation. Other requirements may be unrecorded or conflicting; confirm climate, altitude, soil, support needs and compatibility with the nursery team.",
      items: ranked.map((r) => r.item.id),
      evidence: ranked.map((r) => ({
        id: r.item.id,
        facts: [...new Map(r.evidence.map((f) => [f.label, f])).values()],
        unconfirmed: context.requirements
          .filter((q) => !supporting(r.item, q).length)
          .map((q) => q.label),
      })),
      links: [{ label: "Confirm site suitability", href: "/contact/simple" }],
      suggestions:
        ranked.length >= 2
          ? ["Compare " + ranked[0].item.name + " vs " + ranked[1].item.name, "Start over"]
          : ["Explore rootstocks", "Start over"],
    };
  }
  const missing = /\b(?:missing|unavailable|not recorded)\b/.test(text);
  if (
    ids.length ||
    (missing && selected.length) ||
    (/\b(?:specifications|specs|details|more|tell me more|compatibility|compatible)\b/.test(text) &&
      selected.length)
  ) {
    context.recommending = false;
    const chosen = ids.length ? mentioned.slice(0, 2) : selected;
    if (/\bcompatib/.test(text)) {
      const varieties = chosen.filter((i) => i.kind === "variety"),
        roots = chosen.filter((i) => i.kind === "rootstock"),
        links = varieties.flatMap((i) =>
          i.rootstockIds
            .map((id) => knowledge.items.find((r) => r.id === id))
            .filter((r): r is AssistantItem => !!r),
        );
      if (varieties.length && roots.length)
        return {
          ...base,
          text: varieties[0].rootstockIds.includes(roots[0].id)
            ? varieties[0].name +
              " lists " +
              roots[0].name +
              " as a rootstock in the published catalog. Site suitability still needs confirmation."
            : "This pairing is not listed in the published catalog. That does not prove incompatibility; confirm it with the nursery team.",
          items: context.ids,
          suggestions: ["Compare " + chosen.map((i) => i.name).join(" vs ")],
        };
      if (roots.length && !varieties.length)
        links.push(
          ...knowledge.items.filter(
            (i) => i.kind === "variety" && i.rootstockIds.includes(roots[0].id),
          ),
        );
      return {
        ...base,
        text: links.length
          ? "These published entries explicitly list the selected relationship. This is catalog information, not a guarantee of suitability."
          : "No published compatibility relationship is recorded for this selection.",
        items: [...new Set(links.map((i) => i.id))],
        links: [{ label: "Confirm compatibility", href: "/contact/simple" }],
        suggestions: ["Help me choose"],
      };
    }
    const requested = factors.filter((f) => has(text, [...f.cues, f.label]));
    const rows = chosen.map((item) => ({ id: item.id, rows: facts(item) }));
    const unknown = requested
      .filter((f) => rows.some((r) => !r.rows.some((v) => has(v.label, [...f.cues, f.label]))))
      .map((f) => f.label);
    if (
      /\b(?:altitude|elevation)\b/.test(text) &&
      rows.some((r) => !r.rows.some((f) => /altitude|elevation/i.test(f.label)))
    )
      unknown.push("Altitude");
    return {
      ...base,
      title: chosen.map((i) => i.name).join(" & "),
      text: missing
        ? "I only use populated published fields. ‘Not recorded’ means no evidence is available here; it is not a negative agricultural finding."
        : unknown.length
          ? unknown.join(", ") +
            " is not recorded for every selected entry. Here are the specifications that are available."
          : "Here are the published specifications. Open the profile for the full description and guidance.",
      items: chosen.map((i) => i.id),
      facts: rows,
      suggestions:
        chosen.length === 2
          ? ["Compare " + chosen.map((i) => i.name).join(" vs ")]
          : ["Compatibility of " + chosen[0].name, "Help me choose"],
    };
  }
  if (/\b(?:hello|hi|hey|help|thanks|thank you)\b/.test(text) && text.split(" ").length < 7)
    return {
      ...base,
      text: "Welcome to Zeebaran. I can explore the published planting collection, compare specifications, or help you narrow a shortlist. What would you like to find?",
      suggestions: ["Explore apple varieties", "Explore rootstocks", "Help me choose"],
    };
  if (askedKind || /\b(?:show|list|explore|discover|browse|collection)\b/.test(text)) {
    context.recommending = previous.recommending && !!askedKind;
    if (context.recommending && !newRequirements.length && context.requirements.length === 0)
      return {
        ...base,
        text:
          "What altitude, soil or drainage, and planting density are you planning? I’ll check only specifications recorded for the published " +
          (context.kind === "rootstock" ? "rootstocks" : "varieties") +
          ".",
        suggestions: [
          "Explore " + (context.kind === "rootstock" ? "rootstocks" : "apple varieties"),
          "Start over",
        ],
      };
    if (/^explore|^show|^list|^browse|^discover/.test(text)) context.recommending = false;
    const list = knowledge.items.filter((i) => !askedKind || i.kind === askedKind);
    return {
      ...base,
      title: askedKind === "rootstock" ? "The rootstock collection" : "The planting collection",
      text: list.length
        ? list.length +
          " published " +
          (askedKind === "rootstock" ? "rootstocks" : "entries") +
          " in this collection. Choose a profile or ask for two names to compare." +
          (knowledge.partial
            ? " The collection is larger than this snapshot; browse the website for the complete list."
            : "")
        : "There are no published entries in this collection yet.",
      items: list.map((i) => i.id),
      links: [
        {
          label: "Browse the collection",
          href: askedKind === "rootstock" ? "/products#rootstock-selection" : "/products",
        },
      ],
      suggestions: [
        "Help me choose",
        ...(list.length >= 2 ? ["Compare " + list[0].name + " vs " + list[1].name] : []),
      ],
    };
  }
  const terms = text
    .split(" ")
    .filter(
      (w) =>
        (w.length > 3 || /^(ceo|civ|pvc|hq)$/.test(w)) &&
        ![
          "what",
          "does",
          "about",
          "where",
          "have",
          "your",
          "with",
          "that",
          "this",
          "please",
          "tell",
          "zeebaran",
        ].includes(w),
    );
  // Prefer a published full role over generic copy mentioning its abbreviation.
  const searchTerms = terms.includes("ceo") ? [...terms, "chief", "executive", "officer"] : terms;
  const passages = knowledge.pages
    .flatMap((page) =>
      page.passages.map((p) => {
        const words = new Set(normalize(p).split(" "));
        const singular = new Set([...words].map((word) => word.replace(/s$/, "")));
        return {
          page,
          p,
          score: searchTerms.filter(
            (t) =>
              words.has(t) ||
              (t.length >= 4 && singular.has(t.replace(/s$/, ""))) ||
              has(page.title, [t]),
          ).length,
        };
      }),
    )
    .filter((p) => p.score >= Math.min(2, terms.length) && p.score > 0)
    .sort((a, b) => b.score - a.score);
  if (passages.length) {
    const p = passages[0];
    return {
      ...base,
      title: p.page.title,
      text: p.p,
      links: [{ label: "Read " + p.page.title, href: p.page.href }],
      suggestions: ["Explore apple varieties", "Explore rootstocks"],
    };
  }
  return {
    ...base,
    text: "I don’t have published information to answer that reliably. I can help with Zeebaran’s varieties, rootstocks, recorded specifications and website information. For a site assessment or anything outside the catalog, contact the team.",
    links: [{ label: "Contact Zeebaran", href: "/contact" }],
    suggestions: ["Explore apple varieties", "Explore rootstocks", "Help me choose"],
  };
}
