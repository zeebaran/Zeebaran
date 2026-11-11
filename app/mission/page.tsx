import { PageContent } from "@/features/cms/server/public";
import { pageMeta } from "@/lib/seo";
import {
  MissionHero,
  OrchardInstallations,
  InstallationProcess,
  FieldDemos,
  OrchardGallery,
  MissionCta,
} from "@/components/pages/mission";

export const metadata = pageMeta(
  "Our Mission",
  "Documented proof of Zeebaran's work — orchard installations, installation process, grower testimonials, and field demonstrations across the Kashmir Valley.",
  "/mission",
);

export default function MissionPage() {
  return (
    <PageContent page="mission">
      <>
        <MissionHero />
        <OrchardInstallations />
        <InstallationProcess />
        {/* <CustomerReviews /> */}
        <FieldDemos />
        <OrchardGallery />
        <MissionCta />
      </>
    </PageContent>
  );
}
