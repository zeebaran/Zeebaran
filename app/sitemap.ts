import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { catalogSitemap } from "@/features/catalog/server/public";
export const dynamic = "force-dynamic";

const paths = [
  "",
  "/platform",
  "/mission",
  "/products",
  "/zeebaran-hub",
  "/innovation",
  "/impact",
  "/partnerships",
  "/governance",
  "/about",
  "/contact",
  "/contact/simple",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = paths.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : p === "/products" ? 0.9 : 0.7,
  }));
  const productPages = (await catalogSitemap()).map((p) => ({
    url: `${SITE_URL}/products/${p.kind === "rootstock" ? "rootstocks/" : ""}${p.slug}`,
    lastModified: p.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...productPages];
}
