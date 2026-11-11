import { CompareExperience } from "@/features/catalog/Comparison";
import { resolvePublished } from "@/features/catalog/server/public";
import { CatalogUnavailable } from "@/features/catalog/PublicSections";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta(
  "Compare varieties & rootstocks",
  "Compare current planting choices side by side, from orchard characteristics to harvest, storage and care.",
  "/products/compare",
);
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ left?: string; right?: string }>;
}) {
  const params = await searchParams;
  let result: Awaited<ReturnType<typeof load>> | null = null;
  async function load() {
    return Promise.all([
      resolvePublished([params.left, params.right].filter((id): id is string => !!id)),
    ]);
  }
  try {
    result = await load();
  } catch {}
  return result ? <CompareExperience initial={result[0]} options={[]} /> : <CatalogUnavailable />;
}
