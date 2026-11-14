import { socialImage } from "@/features/media/social";
import { PageContent, publishedContent } from "@/features/cms/server/public";
import { resolveSettings } from "@/features/site/server";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import "./catalog.css";
import "./assistant.css";
import "./field-motion.css";
import "./action-motion.css";
import { SiteFrame } from "@/components/SiteFrame";
import { Providers } from "@/components/Motion";
import { SITE } from "@/lib/site";
import { env, SITE_URL } from "@/lib/env";

const sans = localFont({
  src: "./fonts/hanken-grotesk-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
const serif = localFont({
  src: [
    { path: "./fonts/newsreader-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/newsreader-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-serif",
  weight: "200 800",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE.name} | ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: { url: "/brand/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
  },
  openGraph: { siteName: SITE.name, type: "website", locale: "en", images: [socialImage] },
  twitter: { card: "summary_large_image", site: "@zeebaran", images: [socialImage.url] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F7F5EA",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function organizationData(settings: ReturnType<typeof resolveSettings>) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: SITE.name,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/icon-512.png`,
        description: SITE.description,
        email: settings.email,
        telephone: settings.phone,
        sameAs: Object.values(settings.socials).filter(Boolean),
        address: settings.addresses.map((office) => ({
          "@type": "PostalAddress",
          name: office.label,
          streetAddress: office.address,
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        url: SITE_URL,
        name: SITE.name,
        publisher: { "@id": `${SITE_URL}/#org` },
      },
    ],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ga = env.NEXT_PUBLIC_GA_ID;
  const site = await publishedContent("site");
  const jsonLd = organizationData(resolveSettings(site.publicSettings, site.text));
  return (
    <html data-scroll-behavior="smooth" lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-white px-4 py-2 text-small font-semibold text-forest focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers>
          <PageContent page="site">
            <SiteFrame>{children}</SiteFrame>
          </PageContent>
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {ga && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4"
              strategy="afterInteractive"
            >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
