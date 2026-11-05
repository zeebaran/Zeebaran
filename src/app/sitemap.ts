import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { plants } from "@/content/plants";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/products",
    "/apple-trees",
    "/orchard-installation",
    "/about",
    "/contact",
    "/privacy",
    ...plants.map((p) => `/apple-trees/${p.slug}`),
  ].map((path) => ({ url: `${site.url}${path}` }));
}
