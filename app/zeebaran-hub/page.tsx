import { PageContent } from "@/features/cms/server/public";
import {
  AaaModel,
  Carries,
  FieldLoop,
  HubCta,
  HubHero,
  VisitSteps,
  WhyHub,
} from "@/components/pages/hub";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Zeebaran Hub",
  "Permanent local presence where growers get access, advice and support that leads to lasting adoption.",
  "/zeebaran-hub",
);

export default function ZeebaranHub() {
  return (
    <PageContent page="zeebaran-hub">
      {
        <>
          <HubHero />
          <WhyHub />
          <AaaModel />
          <VisitSteps />
          <Carries />
          <FieldLoop />
          <HubCta />
        </>
      }
    </PageContent>
  );
}
