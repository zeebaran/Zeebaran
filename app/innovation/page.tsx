import { PageContent } from "@/features/cms/server/public";
import {
  InnovationHero,
  Laboratory,
  DigitalExtension,
  TechnicalPriorities,
  AdoptionGap,
  Callout,
} from "@/components/pages/innovation";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Innovation",
  "Field-tested approaches, clearly labelled by what is operational, under validation or still in development.",
  "/innovation",
);

export default function Innovation() {
  return (
    <PageContent page="innovation">
      {
        <>
          <InnovationHero />
          <Laboratory />
          <DigitalExtension />
          <TechnicalPriorities />
          <AdoptionGap />
          <Callout />
        </>
      }
    </PageContent>
  );
}
