import { notFound } from "next/navigation";
import { productWithRoots, publishedPage } from "@/features/catalog/server/public";
import { ProductDetailPage } from "@/components/pages/product-detail";
import { ContentProvider } from "@/features/cms/Content";
import { emptyContent } from "@/features/cms/model";
import { pageMeta } from "@/lib/seo";
export const revalidate = 300;
export function generateStaticParams() {
  return [];
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const product = await productWithRoots((await params).slug);
  if (!product || product.kind !== "variety") return { robots: { index: false } };
  return pageMeta(
    product.name + " — Apple Variety",
    product.intro.slice(0, 155),
    "/products/" + product.slug,
  );
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const product = await productWithRoots((await params).slug);
  if (!product || product.kind !== "variety") notFound();
  const related = await publishedPage("variety");
  return (
    <ContentProvider page="catalog" value={emptyContent()}>
      <ProductDetailPage product={product} related={related.items} />
    </ContentProvider>
  );
}
