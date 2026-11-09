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
    <>
      <InnovationHero />
      <Laboratory />
      <DigitalExtension />
      <TechnicalPriorities />
      <AdoptionGap />
      <Callout />
    </>
  );
}
