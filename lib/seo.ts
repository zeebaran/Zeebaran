import type { Metadata } from "next";
import { SITE } from "./site";

export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url: path,
      siteName: SITE.name,
      type: "website",
      locale: "en",
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE.name}`, description },
  };
}
