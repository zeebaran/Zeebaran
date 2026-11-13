import { PageContent } from "@/features/cms/server/public";
import { pageMeta } from "@/lib/seo";
import { ProductsPage } from "@/components/pages/products";
import { publishedPage, resolvePublished, catalogCounts } from "@/features/catalog/server/public";
import { normalizeHarvestSeason, harvestKey } from "@/features/catalog/harvest";
import { catalogSearchEntry, matchesCatalogSearch } from "@/features/catalog/search";
import { CatalogUnavailable } from "@/features/catalog/PublicSections";
export const metadata = pageMeta(
  "Plant Material & Varieties",
  "Explore our published planting portfolio, independent rootstock profiles and side-by-side comparisons. Find the right planting choice for your orchard.",
  "/products",
);
type Params = {
  varieties?: string;
  rootstocks?: string;
  q?: string;
  rootQ?: string;
  season?: string;
};

function searchTerm(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

async function load(query: Params) {
  const harvestSeason = normalizeHarvestSeason(query.season);
  const varietySearch = searchTerm(query.q);
  const rootstockSearch = searchTerm(query.rootQ);
  const varietyCursor = typeof query.varieties === "string" ? query.varieties : null;
  const rootstockCursor = typeof query.rootstocks === "string" ? query.rootstocks : null;
  const [firstPage, firstRoots, counts] = await Promise.all([
    publishedPage("variety"),
    publishedPage("rootstock"),
    catalogCounts(),
  ]);
  // Small catalogs reuse the cached lists for search and harvest filtering.
  // Larger catalogs use the existing indexed name search and pagination.
  const completeVarieties = !firstPage.nextCursor;
  const completeRootstocks = !firstRoots.nextCursor;
  const [varieties, roots] = await Promise.all([
    completeVarieties
      ? {
          items: firstPage.items.filter((item) => matchesCatalogSearch(item, varietySearch)),
          nextCursor: null,
        }
      : harvestSeason || varietyCursor || varietySearch
        ? publishedPage("variety", varietyCursor, varietySearch, 24, harvestSeason)
        : firstPage,
    completeRootstocks
      ? {
          items: firstRoots.items.filter((item) => matchesCatalogSearch(item, rootstockSearch)),
          nextCursor: null,
        }
      : rootstockCursor || rootstockSearch
        ? publishedPage("rootstock", rootstockCursor, rootstockSearch)
        : firstRoots,
  ]);
  const rootMap = new Map([...firstRoots.items, ...roots.items].map((r) => [r.id, r])),
    missing = [...new Set(varieties.items.flatMap((p) => p.rootstockIds))].filter(
      (id) => !rootMap.has(id),
    );
  for (let i = 0; i < missing.length; i += 24)
    for (const r of await resolvePublished(missing.slice(i, i + 24)))
      if (r.kind === "rootstock") rootMap.set(r.id, r);
  return {
    products: varieties.items.map((p) => ({
      ...p,
      rootstocks: p.rootstockIds.flatMap((id) => (rootMap.has(id) ? [rootMap.get(id)!] : [])),
    })),
    heroProducts: firstPage.items,
    rootstocks: roots.items,
    counts,
    harvestSeason,
    completeVarieties,
    completeRootstocks,
    varietySuggestions: firstPage.items.map(catalogSearchEntry),
    rootstockSuggestions: firstRoots.items.map(catalogSearchEntry),
    varietySearch,
    rootstockSearch,
    varietyNext: varieties.nextCursor
      ? "/products?" +
        new URLSearchParams({
          varieties: varieties.nextCursor,
          ...(varietySearch ? { q: varietySearch } : {}),
          ...(rootstockSearch ? { rootQ: rootstockSearch } : {}),
          ...(harvestSeason ? { season: harvestKey(harvestSeason) } : {}),
          ...(rootstockCursor ? { rootstocks: rootstockCursor } : {}),
        }) +
        "#variety-portfolio"
      : undefined,
    rootstockNext: roots.nextCursor
      ? "/products?" +
        new URLSearchParams({
          rootstocks: roots.nextCursor,
          ...(varietySearch ? { q: varietySearch } : {}),
          ...(rootstockSearch ? { rootQ: rootstockSearch } : {}),
          ...(harvestSeason ? { season: harvestKey(harvestSeason) } : {}),
          ...(varietyCursor ? { varieties: varietyCursor } : {}),
        }) +
        "#rootstock-selection"
      : undefined,
  };
}
export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  // Let Next handle request-time rendering before catching catalog service failures.
  const query = await searchParams;
  let result: Awaited<ReturnType<typeof load>> | null = null;
  try {
    result = await load(query);
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "catalog.page_unavailable",
        type: error instanceof Error ? error.name : "Unknown",
      }),
    );
  }
  return result ? (
    <PageContent page="products">
      <ProductsPage {...result} />
    </PageContent>
  ) : (
    <CatalogUnavailable />
  );
}
