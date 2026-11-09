import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/products-content";
import { pageMeta } from "@/lib/seo";
import { ProductDetailPage } from "@/components/pages/product-detail";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};
  return pageMeta(
    `${product.name} — Apple Variety`,
    `${product.intro.slice(0, 155)}…`,
    `/products/${slug}`,
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();
  return <ProductDetailPage product={product} />;
}
