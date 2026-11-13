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
  "Meet the purpose, people and working principles behind Zeebaran. Explore how to contribute as a colleague or team leader.",
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
