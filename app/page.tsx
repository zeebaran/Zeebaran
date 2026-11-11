import { PageContent } from "@/features/cms/server/public";
import { Hero, Query } from "@/components/home/Hero";
import {
  Vision,
  Ability,
  System,
  Metrics,
  Himalayas,
  HubPanel,
  FinalHarvest,
  Legacy,
} from "@/components/home/Sections";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMeta(
  `${SITE.name} | Himalayan Horticulture & Orchard Infrastructure`,
  SITE.description,
  "/",
);

export default function Home() {
  return (
    <PageContent page="home">
      <div className="text-forest">
        <Hero />
        <Query />
        <Vision />
        <Ability />
        <System />
        <Metrics />
        <Himalayas />
        <HubPanel />
        <FinalHarvest />
        <Legacy />
      </div>
    </PageContent>
  );
}
