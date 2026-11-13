import { PartnerProfiles } from "@/components/partners/PartnerProfiles";
import { PageContent } from "@/features/cms/server/public";
import {
  PartnershipsHero,
  ResearchPartners,
  TechCapital,
  FieldPartnerships,
  HowWeWork,
  PartnerWordmarks,
  PartnerCta,
} from "@/components/pages/partnerships";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Partnerships",
  "How research, technology, capital and field institutions combine to strengthen Himalayan horticulture.",
  "/partnerships",
);

export default function Partnerships() {
  return (
    <PageContent page="partnerships">
      {
        <PartnerProfiles>
          <PartnershipsHero />
          <ResearchPartners />
          <TechCapital />
          <FieldPartnerships />
          <HowWeWork />
          <PartnerWordmarks />
          <PartnerCta />
        </PartnerProfiles>
      }
    </PageContent>
  );
}
