import { isValidElement, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { requireCanvasSession } from "@/features/admin/server/require-admin";
import { contentPages } from "@/features/cms/model";
import { catalog } from "@/features/cms/catalog";
import { editorDefinition } from "@/features/cms/editor-fields";
import { ContentProvider } from "@/features/cms/Content";
import { emptyContent } from "@/features/cms/model";
import { PageContent, publishedContent } from "@/features/cms/server/public";
import { VisualCanvas } from "@/features/admin/VisualCanvas";
import Home from "@/app/page";
import Platform from "@/app/platform/page";
import Mission from "@/app/mission/page";
import Products from "@/app/products/page";
import Hub from "@/app/zeebaran-hub/page";
import Innovation from "@/app/innovation/page";
import Impact from "@/app/impact/page";
import Partnerships from "@/app/partnerships/page";
import Governance from "@/app/governance/page";
import About from "@/app/about/page";
import Contact from "@/app/contact/page";
import SimpleContact from "@/app/contact/simple/page";
export const dynamic = "force-dynamic";
const pages: Record<string, () => ReactNode | Promise<ReactNode>> = {
  home: Home,
  platform: Platform,
  mission: Mission,
  products: () => Products({ searchParams: Promise.resolve({}) }),
  "zeebaran-hub": Hub,
  innovation: Innovation,
  impact: Impact,
  partnerships: Partnerships,
  governance: Governance,
  about: About,
  contact: Contact,
  "contact-simple": SimpleContact,
  site: Home,
};
export default async function CanvasPage({ params }: { params: Promise<{ page: string }> }) {
  await requireCanvasSession();
  const { page } = await params,
    entry = contentPages.find((item) => item[0] === page),
    Page = pages[page];
  if (!entry || !Page) notFound();
  // The authenticated parent already owns the current draft. It sends it through
  // the origin/source-checked handshake before revealing this public-layout shell.
  const [site, composition] = await Promise.all([publishedContent("site"), Page()]);
  // Reuse the exact public composition, but not its request-time CMS loader.
  // Draft values arrive exclusively from the protected parent handshake.
  const body =
    isValidElement<{ children?: ReactNode }>(composition) && composition.type === PageContent
      ? composition.props.children
      : composition;
  return (
    <VisualCanvas
      page={page}
      path={entry[2]}
      initial={emptyContent()}
      site={site}
      definition={editorDefinition(page, catalog[page], "visual")}
    >
      <ContentProvider page={page === "site" ? "home" : page} value={emptyContent()}>
        {body}
      </ContentProvider>
    </VisualCanvas>
  );
}
