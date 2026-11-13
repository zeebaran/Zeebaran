import type { CatalogItem } from "./model";

export const normalizeSearch = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function catalogSearchEntry({ id, slug, name, localName, code, season }: CatalogItem) {
  return { id, slug, name, localName, code, season };
}

export type CatalogSearchEntry = ReturnType<typeof catalogSearchEntry>;

export function matchesCatalogSearch(
  item: Pick<CatalogSearchEntry, "slug" | "name" | "localName" | "code">,
  term: string,
) {
  const names = normalizeSearch(
    [item.name, item.localName, item.code, item.slug.replace(/-/g, " ")].join(" "),
  );
  return normalizeSearch(term)
    .split(/\s+/)
    .every((word) => names.includes(word));
}
