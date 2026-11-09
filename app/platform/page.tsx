import { SectionHead } from "@/components/sections";
import { Timeline } from "@/components/Timeline";
import {
  Capabilities,
  Integration,
  Journey,
  OrchardYear,
  PlatformCta,
  PlatformHero,
} from "@/components/pages/platform";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "The Platform",
  "An integrated horticulture platform that strengthens every link from nursery to market.",
  "/platform",
);

export default function Platform() {
  return (
    <>
      <PlatformHero />
      <Journey />
      <Capabilities />

      <section className="panel section">
        <div className="wrap">
          <SectionHead
            eyebrow="How it was built"
            title="Each capability was built in {response to a constraint.}"
            className="mb-12"
          />
          <Timeline />
        </div>
      </section>

      <OrchardYear />
      <Integration />
      <PlatformCta />
    </>
  );
}
