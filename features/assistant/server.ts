import "server-only";
import { publishedPage } from "@/features/catalog/server/public";
import { publishedContent } from "@/features/cms/server/public";
import { catalog } from "@/features/cms/catalog";
import { contentPages } from "@/features/cms/model";
import { regionalHubs } from "@/features/contact/hubs-content";
import { teamMembers } from "@/features/team/model";
import { contactChannels } from "@/features/site/model";
import { resolveSettings } from "@/features/site/server";
import { partnerEntries, partnerLabel } from "@/features/cms/partners";
import { partnerProfile } from "@/features/cms/partner-profiles";
import type { AssistantItem, Knowledge, SiteExcerpt } from "./types";
// Share overlapping refreshes only. Published data uses the existing catalog/CMS caches and tags.
let pending: Promise<Knowledge> | undefined;
async function collect(): Promise<Knowledge> {
  let partial = false;
  const groupsPromise = Promise.all(
    (["variety", "rootstock"] as const).map(async (kind) => {
      const result: AssistantItem[] = [];
      let cursor: string | null = null;
      for (let page = 0; page < 10; page++) {
        const data = await publishedPage(kind, cursor);
        result.push(
          ...data.items.map((item) => ({
            id: item.id,
            slug: item.slug,
            kind: item.kind,
            name: item.name,
            localName: item.localName,
            code: item.code,
            intro: item.intro,
            origin: item.origin,
            season: item.season,
            seasonMonths: item.seasonMonths,
            colour: item.colour,
            flavour: item.flavour,
            brix: item.brix,
            firmness: item.firmness,
            shelfLife: item.shelfLife,
            storageLife: item.storageLife,
            marketClass: item.marketClass,
            system: item.system,
            spacing: item.spacing,
            yield: item.yield,
            bestFor: item.bestFor,
            note: item.note,
            rootstockIds: item.rootstockIds,
            images: item.images.slice(0, 1),
            specifications: item.specifications,
            sortOrder: item.sortOrder,
            publishedAt: item.publishedAt,
          })),
        );
        cursor = data.nextCursor;
        if (!cursor) return result;
      }
      partial = true;
      return result;
    }),
  );
  const recordsPromise = Promise.all(
    contentPages
      .filter(([id]) => id !== "products" && id !== "contact-simple")
      .map(async ([id, title, href]) => {
        return { id, title, href, content: await publishedContent(id) };
      }),
  );
  const [groups, records] = await Promise.all([groupsPromise, recordsPromise]);
  const site = records.find((entry) => entry.id === "site")!.content;
  const settings = resolveSettings(site.publicSettings, site.text);
  const pages: SiteExcerpt[] = records.map(({ id, title, href, content }) => {
    const passages = catalog[id].fields
      .map((f) => content.text[f.key] ?? f.value)
      .filter((s) => s.length >= 45 && s.length <= 1800)
      .map((s) => s.replace(/[{}]/g, ""))
      .slice(0, 90);
    if (id === "contact") {
      // Replace old location prose with the same enabled hub records used by the real map.
      const locationValues = new Set(
        catalog[id].fields
          .filter((f) => /regional|location/i.test(f.group))
          .map((f) => content.text[f.key] ?? f.value),
      );
      return {
        page: id,
        title,
        href,
        passages: [
          ...passages.filter((s) => !locationValues.has(s)),
          `Contact Zeebaran: email ${settings.email}; phone ${settings.phone}.`,
          ...contactChannels.map(([key, label]) => `${label}: ${settings.channels[key]}.`),
          ...settings.addresses.map((address) =>
            [address.label, address.address, address.note].filter(Boolean).join(". "),
          ),
          ...regionalHubs(content)
            .filter((h) => h.enabled)
            .map((h) => [h.title, h.place, h.body, ...h.facts].join(". ")),
        ],
      };
    }
    if (id === "about")
      passages.push(
        ...teamMembers(content)
          .filter((member) => member.enabled)
          .map((member) =>
            [
              member.name,
              member.role,
              member.organisation,
              member.summary,
              member.specialisations.filter(Boolean).join(", "),
            ]
              .filter(Boolean)
              .join(". "),
          ),
      );
    if (id === "partnerships") {
      for (const partner of partnerEntries(content)) {
        const profile = partnerProfile(partner);
        const label = `${partnerLabel(partner)}. ${profile.category}. `;
        // Read the already-loaded published partner list; no per-profile query or image payload.
        for (const text of [
          [profile.headline, profile.description].filter(Boolean).join(". "),
          [
            profile.focusLabel,
            ...profile.focusAreas.map((area) => `${area.title}: ${area.description}`),
          ]
            .filter(Boolean)
            .join(". "),
          [profile.commitmentLabel, profile.commitment, profile.closing].filter(Boolean).join(". "),
        ]) {
          if (text.trim()) passages.push((label + text).slice(0, 1800));
        }
      }
    }
    return { page: id, title, href, passages };
  });
  return {
    items: [...new Map(groups.flat().map((i) => [i.id, i])).values()],
    pages,
    retrievedAt: new Date().toISOString(),
    partial,
  };
}
export function assistantKnowledge() {
  if (!pending)
    pending = collect().finally(() => {
      pending = undefined;
    });
  return pending;
}
