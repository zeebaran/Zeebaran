import { notFound } from "next/navigation";
import { publishedItem } from "@/features/catalog/server/public";
import { RootstockDetail } from "@/features/catalog/PublicSections";
import { pageMeta } from "@/lib/seo";
export const revalidate = 300;
export function generateStaticParams() {
  return [];
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const item = await publishedItem((await params).slug);
  if (!item || item.kind !== "rootstock") return { robots: { index: false } };
  return pageMeta(
    item.name + " — Rootstock",
    item.intro.slice(0, 155),
    "/products/rootstocks/" + item.slug,
  );
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const item = await publishedItem((await params).slug);
  if (!item || item.kind !== "rootstock") notFound();
  return <RootstockDetail item={item} />;
}
