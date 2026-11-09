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
    <>
      <GovernanceHero />
      <OversightSection />
      <MetricOwnership />
      <Doctrine />
      <RaisingConcerns />
      <Standard />
    </>
  );
}
