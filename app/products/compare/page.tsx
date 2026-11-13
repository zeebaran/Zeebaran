import { CompareExperience } from "@/features/catalog/Comparison";
import { resolvePublished } from "@/features/catalog/server/public";
import { slugSchema } from "@/features/catalog/schema";
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
  searchParams: Promise<{ left?: string | string[]; right?: string | string[] }>;
}) {
  const { left, right } = await searchParams;
  const ids = [left, right]
    .map((value) => (Array.isArray(value) ? value[0] : value))
    .filter((id): id is string => slugSchema.safeParse(id).success);
  let initial: Awaited<ReturnType<typeof resolvePublished>>;
  try {
    initial = await resolvePublished(ids);
  } catch {
    return <CatalogUnavailable />;
  }
  return <CompareExperience initial={initial} options={[]} />;
}
