import type { Metadata } from "next";
export const site = {
  name: "Zeebaran",
  legalName: "Zeebaran Services Private Limited",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://zeebaran.com").replace(
    /\/$/,
    "",
  ),
  email: "contact@zeebaran.com",
  phone: "+91 7889796733",
  phoneHref: "tel:+917889796733",
  whatsapp: "https://wa.me/917889385964",
  address: "Anantnag, Kashmir · 192201",
  description:
    "Fruit trees, practical planting guidance and high-density apple orchard installation in Kashmir. Explore Zeebaran and discuss your next growing season.",
} as const;
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | Zeebaran`,
      description,
      url: path,
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Zeebaran`,
      description,
      images: ["/opengraph-image"],
    },
  };
}
export const navigation = [
  { href: "/products", label: "Our plants" },
  { href: "/orchard-installation", label: "Orchard installation" },
  { href: "/about", label: "Our story" },
] as const;
