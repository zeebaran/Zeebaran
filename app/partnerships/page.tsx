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
    <>
      <PartnershipsHero />
      <ResearchPartners />
      <TechCapital />
      <FieldPartnerships />
      <HowWeWork />
      <PartnerWordmarks />
      <PartnerCta />
    </>
  );
}
