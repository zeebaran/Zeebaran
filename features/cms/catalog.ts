import { assetId } from "@/features/media/delivery";
import { governanceEditableCopy } from "@/lib/governance-content";
import { homeAbility } from "@/lib/home-ability";
import generated from "./catalog.generated.json";
import { textKey, type PageDefinition } from "./model";
import { NAV, FOOTER, ABOUT_LINKS } from "@/lib/site";
import { capabilities } from "@/lib/capabilities";
import { nodes, stationNotes } from "@/features/contact/map-content";
import { podcastCopy } from "@/features/podcast/model";
const source = Object.fromEntries(
  Object.entries(generated as Record<string, PageDefinition>).map(([page, definition]) => [
    page,
    {
      ...definition,
      images: definition.images.map((image) => ({ ...image, src: assetId(image.src) })),
    },
  ]),
) as Record<string, PageDefinition>;
const sharedLabels = [
  ...NAV,
  ...ABOUT_LINKS,
  ...FOOTER.explore,
  ...FOOTER.company,
  { label: "Contact" },
].map((item) => ({ key: textKey(item.label), value: item.label, group: "Navigation & footer" }));
export const catalog: Record<string, PageDefinition> = {
  ...source,
  podcast: {
    fields: Object.values(podcastCopy).map((value) => ({
      key: textKey(value),
      value,
      group: "Bazm-e-Khayal",
    })),
    images: [],
  },
  site: {
    ...source.site,
    fields: [
      ...new Map(
        [...source.site.fields, ...sharedLabels].map((field) => [field.key, field]),
      ).values(),
    ],
  },
};
function register(page: string, values: readonly string[], group: string) {
  const fields = new Map(catalog[page].fields.map((field) => [field.key, field]));
  for (const value of values) {
    const key = textKey(value);
    if (!fields.has(key)) fields.set(key, { key, value, group });
  }
  catalog[page] = { ...catalog[page], fields: [...fields.values()] };
}
for (const page of ["home", "platform"])
  register(
    page,
    capabilities.flatMap((item) => [
      item.label,
      item.title,
      item.description,
      ...item.overview,
      ...item.details.flat(),
    ]),
    "Value chain capabilities",
  );
register(
  "contact",
  [...nodes.flatMap((node) => [node.name, node.sub]), ...stationNotes],
  "Regional locations",
);
for (const page of ["contact", "contact-simple"])
  register(
    page,
    ["Contact number", "Place", "+91 98765 43210", "Town, village or city"],
    "Contact form",
  );
register("contact", ["Regional hubs · geographic map"], "Regional locations");

register(
  "home",
  homeAbility.flatMap((item) => [item.title, ...item.paragraphs, item.quote]),
  "Ability is widely distributed. The means to act on it are not.",
);

register("governance", governanceEditableCopy, "People, culture & joining Zeebaran");
