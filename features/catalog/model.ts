export type CatalogKind = "variety" | "rootstock";
export type CatalogImage = {
  src: string;
  alt: string;
  publicId?: string;
  width?: number;
  height?: number;
};
export type Specification = { group: string; label: string; value: string };
export type CatalogData = {
  slug: string;
  kind: CatalogKind;
  name: string;
  localName: string;
  eyebrow: string;
  headline: string;
  intro: string;
  origin: string;
  season: string;
  seasonMonths: string;
  colour: string;
  flavour: string;
  brix: string;
  firmness: string;
  shelfLife: string;
  storageLife: string;
  marketClass: string;
  code: string;
  system: string;
  spacing: string;
  yield: string;
  bestFor: string;
  note: string;
  highlights: string[];
  agronomyNotes: string;
  rootstockIds: string[];
  images: CatalogImage[];
  specifications: Specification[];
  badge: string;
  sortOrder: number;
};
export type CatalogEntry = {
  id: string;
  revision: number;
  draft: CatalogData;
  published: boolean;
  deleted: boolean;
  updatedAt: string;
  publishedAt: string | null;
};
export type CatalogItem = CatalogData & {
  id: string;
  publishedAt: string;
  image?: string;
  rootstocks: Rootstock[];
};
export type Rootstock = CatalogData;
export type Product = CatalogItem;
export type CatalogSummary = Pick<
  CatalogData,
  "slug" | "kind" | "name" | "intro" | "sortOrder" | "badge"
> & { id: string; image?: CatalogImage };
export type CatalogPage<T> = { items: T[]; nextCursor: string | null };
export const emptyCatalog = (kind: CatalogKind): CatalogData => ({
  slug: "",
  kind,
  name: "",
  localName: "",
  eyebrow: "",
  headline: "",
  intro: "",
  origin: "",
  season: "",
  seasonMonths: "",
  colour: "",
  flavour: "",
  brix: "",
  firmness: "",
  shelfLife: "",
  storageLife: "",
  marketClass: "",
  code: "",
  system: "",
  spacing: "",
  yield: "",
  bestFor: "",
  note: "",
  highlights: [],
  agronomyNotes: "",
  rootstockIds: [],
  images: [],
  specifications: [],
  badge: "",
  sortOrder: 0,
});
export const catalogHref = (item: Pick<CatalogData, "kind" | "slug">) =>
  item.kind === "rootstock" ? "/products/rootstocks/" + item.slug : "/products/" + item.slug;
export function summary(item: CatalogItem): CatalogSummary {
  return {
    id: item.id,
    slug: item.slug,
    kind: item.kind,
    name: item.name,
    intro: item.intro.slice(0, 240),
    sortOrder: item.sortOrder,
    badge: item.badge,
    ...(item.images[0] ? { image: item.images[0] } : {}),
  };
}

export type CatalogIndexEntry = Omit<CatalogEntry, "draft"> & {
  draft: Pick<CatalogData, "name" | "kind">;
};
