import { socialImage } from "@/features/media/social";
import type { Metadata } from "next";
import { SITE } from "./site";

export function pageMeta(title: string, description: string, path: string): Metadata {
  const fullTitle = `${title} | ${SITE.name}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE.name,
      type: "website",
      locale: "en",
      images: [socialImage],
    },
    twitter: {
      images: [socialImage.url],
      card: "summary_large_image",
      site: "@zeebaran",
      title: fullTitle,
      description,
    },
  };
}
