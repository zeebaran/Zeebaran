import { PageContent } from "@/features/cms/server/public";
import {
  ImpactHero,
  FourThings,
  AuditedMetrics,
  ProofStandard,
  ClaimsContext,
  TheTest,
  EvidenceCta,
} from "@/components/pages/impact";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Impact",
  "Impact measured by what remains after the work is done, with every number published alongside its definition.",
  "/impact",
);

export default function Impact() {
  return (
    <PageContent page="impact">
      {
        <>
          <ImpactHero />
          <FourThings />
          <AuditedMetrics />
          <ProofStandard />
          <ClaimsContext />
          <TheTest />
          <EvidenceCta />
        </>
      }
    </PageContent>
  );
}
