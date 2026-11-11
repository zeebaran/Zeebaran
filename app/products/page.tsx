import { PageContent } from "@/features/cms/server/public";
import { pageMeta } from "@/lib/seo";
import { ProductsPage } from "@/components/pages/products";
import { publishedPage, resolvePublished, catalogCounts } from "@/features/catalog/server/public";
import { CatalogUnavailable } from "@/features/catalog/PublicSections";
export const metadata = pageMeta(
  "Plant Material & Varieties",
  "Explore our published planting portfolio, independent rootstock profiles and side-by-side comparisons. Find the right planting choice for your orchard.",
  "/products",
);
type Params = { varieties?: string; rootstocks?: string; q?: string };
async function load(query: Params) {
  const [varieties, roots, counts] = await Promise.all([
    publishedPage("variety", query.varieties || null, query.q || ""),
    publishedPage("rootstock", query.rootstocks || null),
    catalogCounts(),
  ]);
  const rootMap = new Map(roots.items.map((r) => [r.id, r])),
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
    rootstocks: roots.items,
    counts,
    varietyNext: varieties.nextCursor
      ? "/products?" +
        new URLSearchParams({ varieties: varieties.nextCursor, ...(query.q ? { q: query.q } : {}) })
      : undefined,
    rootstockNext: roots.nextCursor
      ? "/products?" +
        new URLSearchParams({ rootstocks: roots.nextCursor }) +
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
