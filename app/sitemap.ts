import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { PRODUCTS } from "@/lib/products-content";

const paths = [
  "",
  "/platform",
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

const productPaths = PRODUCTS.map((p) => `/products/${p.slug}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = paths.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : p === "/products" ? 0.9 : 0.7,
  }));
  const productPages = productPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...productPages];
}
