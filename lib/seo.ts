import { socialImage } from "@/features/media/social";
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
      images: [socialImage],
    },
    twitter: {
      images: [socialImage.url],
      card: "summary_large_image",
      title: `${title} | ${SITE.name}`,
      description,
    },
  };
}
