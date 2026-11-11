import { PageContent } from "@/features/cms/server/public";
import {
  GovernanceHero,
  OversightSection,
  MetricOwnership,
  Doctrine,
  RaisingConcerns,
  Standard,
} from "@/components/pages/governance";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Governance",
  "Oversight, reporting and decision discipline built into how Zeebaran operates.",
  "/governance",
);

export default function Governance() {
  return (
    <PageContent page="governance">
      {
        <>
          <GovernanceHero />
          <OversightSection />
          <MetricOwnership />
          <Doctrine />
          <RaisingConcerns />
          <Standard />
        </>
      }
    </PageContent>
  );
}
