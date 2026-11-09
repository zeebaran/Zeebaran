import { history } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import {
  AboutHero,
  Why,
  Ecosystem,
  HistoryHead,
  Principles,
  Proof,
  AboutCta,
} from "@/components/pages/about";
import { HistoryTimeline } from "@/components/pages/HistoryTimeline";

export const metadata = pageMeta(
  "About",
  "Why Zeebaran exists, how it was built and what it is building across the Himalayas.",
  "/about",
);

export default function About() {
  return (
    <>
      <AboutHero />
      <Why />
      <Ecosystem />
      <section className="rounded-t-[2rem] border-t border-line bg-white py-16 shadow-sm sm:rounded-t-[3rem] sm:py-28">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <HistoryHead />
          <HistoryTimeline items={history} />
        </div>
      </section>
      <Principles />
      <Proof />
      <AboutCta />
    </>
  );
}
