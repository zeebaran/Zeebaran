import { ContentText } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { principles } from "@/lib/content";
import type { CSSProperties } from "react";
// import { AppleIllustration } from "@/components/about/AppleIllustration";
import { OrchardGrowerIllustration } from "@/components/about/OrchardGrowerIllustration";
import heroStyles from "@/components/about/about-hero.module.css";

export const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em] text-green";
const arrow =
  "group inline-flex items-center gap-1.5 text-eyebrow font-bold uppercase tracking-[0.14em] text-green transition-colors hover:text-orange";
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function AboutHero() {
  return (
    <section className="border-b border-green/10 pb-4 pt-16 sm:pb-24 sm:pt-24">
      <div className={heroStyles.layout + " mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8"}>
        <p className={`hero-rise ${eyebrow} mb-6`}>
          <ContentText>About Zeebaran</ContentText>
        </p>
        <Heading
          as="h1"
          immediate
          delay={0.1}
          tone="leaf"
          text="Business is {the instrument.}"
          className="max-w-4xl text-display"
        />
        <div className="hero-rise mt-8 max-w-3xl space-y-5 text-lead text-forest/80" style={d(0.3)}>
          <p>
            <ContentText>
              Zeebaran works in horticulture because business is one of the most powerful
              instruments for creating lasting social change. It shapes livelihoods through the
              choices it makes every day: what it builds, what it rewards, what it measures, and
              what it makes possible.
            </ContentText>
          </p>
          <p>
            <ContentText>
              Those choices influence people, markets, and institutions over time. Zeebaran&apos;s
              responsibility is to ensure they expand capability, strengthen opportunity, and leave
              the horticultural system better than it was before.
            </ContentText>
          </p>
        </div>
        <div className={heroStyles.illustration}>
          {/* <AppleIllustration /> */}
          <OrchardGrowerIllustration />
        </div>
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section className="py-16 sm:py-24">
      <div className="home-wrap grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-6 lg:col-span-6">
          <Reveal y={8}>
            <span className={eyebrow}>
              <ContentText>Why Zeebaran exists</ContentText>
            </span>
          </Reveal>
          <Heading
            tone="leaf"
            text="Most growers we work with farm {less than half an acre.}"
            className="text-h2"
          />
          <Reveal delay={0.1} className="space-y-4 text-body text-forest/80">
            <p>
              <ContentText>
                <ContentText>
                  At that scale, access to quality planting material, practical knowledge,
                  infrastructure, storage, and markets is often uneven.
                </ContentText>
                <ContentText></ContentText>{" "}
              </ContentText>
              <strong className="font-semibold text-forest">
                <ContentText>
                  A capable grower can still be limited by the conditions around the orchard.
                </ContentText>
              </strong>
            </p>
            <p>
              <ContentText>
                Zeebaran exists to strengthen those conditions. By connecting knowledge, technology,
                infrastructure, and markets, it works to expand the capability of growers—and the
                horticultural system they depend on.
              </ContentText>
            </p>
          </Reveal>
        </div>
        <Reveal className="flex justify-center lg:col-span-6 lg:justify-end" y={30}>
          <div className="relative aspect-[4/5] w-full max-w-lg overflow-hidden rounded-2xl border border-line/60 bg-forest shadow-lg">
            <Photo
              src="asset:galleries/field-work/clean-editorial-documentary-photograph-of-a-kashmiri-8d6dc-webp"
              alt="A grower working among the apple trees in Kashmir"
              variant="canopy"
              seed={8}
              className="absolute inset-0"
            />
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-white/60 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-green">
                <ContentText>High-Density Trellis Canopy · Pulwama Valley</ContentText>
              </span>
              <span className="font-mono text-[0.625rem] font-medium text-forest/75">
                <ContentText>33.87° N, 74.89° E</ContentText>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Ecosystem() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal y={8}>
          <span className={eyebrow}>
            <ContentText>What we are building</ContentText>
          </span>
        </Reveal>
        <Heading
          tone="leaf"
          text="An integrated horticulture ecosystem, {working across the value chain.}"
          className="mt-4 text-h2"
        />
        <Reveal delay={0.1} className="mt-6 max-w-3xl space-y-4 text-body text-forest/80">
          <p>
            <ContentText>
              Zeebaran is building an integrated horticulture platform that connects the
              capabilities growers depend on throughout the life of an orchard—from planting
              material and orchard development to field advisory, agri-inputs, digital decision
              support, post-harvest infrastructure, procurement, logistics, and market access.
            </ContentText>
          </p>
          <p>
            <ContentText>
              Each capability addresses a different constraint. Together, they create a system that
              is more useful than any one capability could be on its own.
            </ContentText>
          </p>
          <Link href="/platform" className={arrow}>
            <span>
              <ContentText>The platform in detail</ContentText>
            </span>
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              <ContentText>→</ContentText>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function HistoryHead() {
  return (
    <div className="mb-16 max-w-3xl sm:mb-20">
      <Reveal y={8}>
        <span className={eyebrow}>
          <ContentText>The operating history</ContentText>
        </span>
      </Reveal>
      <Heading
        tone="leaf"
        text="Each capability was built in response {to a constraint.}"
        className="mt-4 text-h2"
      />
      <Reveal delay={0.1} className="mt-6 space-y-4 text-body text-forest/80">
        <p>
          <ContentText>
            Zeebaran&apos;s work began by solving practical problems in fruit production and market
            access. As each constraint was addressed, the next became visible. The institution grew
            by responding to those challenges in the order they appeared.
          </ContentText>
        </p>
        <p className="font-medium text-forest">
          <ContentText>
            What exists today is not a collection of unrelated businesses; it is an integrated
            operating system built one capability at a time—each one strengthening the next.
          </ContentText>
        </p>
      </Reveal>
    </div>
  );
}

export function Principles() {
  return (
    <section className="py-16 sm:py-24">
      <div className="home-wrap">
        <div className="mb-12 max-w-3xl">
          <Reveal y={8}>
            <span className={eyebrow}>
              <ContentText>The principles</ContentText>
            </span>
          </Reveal>
          <Heading
            tone="leaf"
            text="When principles conflict, {the order is explicit.}"
            className="mt-4 text-h2"
          />
        </div>
        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {principles.map((p, i) => (
            <Item key={p.t} className="h-full">
              <article className="group relative h-full rounded-2xl border border-line bg-white p-6 shadow-sm transition-colors hover:border-leaf/60 sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-green/10 px-2.5 py-1 font-mono text-[0.75rem] font-bold tracking-wider text-green">
                    <ContentText>{String(i + 1).padStart(2, "0")}</ContentText>
                  </span>
                  <span
                    aria-hidden
                    className="select-none font-serif text-3xl leading-none text-leaf"
                  >
                    <ContentText>“</ContentText>
                  </span>
                </div>
                <h3 className="mb-2 font-serif text-[1.125rem] font-bold text-forest">
                  <ContentText>{p.t}</ContentText>
                </h3>
                <p className="text-small text-forest/75">
                  <ContentText>{p.d}</ContentText>
                </p>
              </article>
            </Item>
          ))}
        </Stagger>
        <p className="mt-8 text-[0.75rem] text-forest/75">
          <ContentText>
            <ContentText>
              The full ordering is applied as a decision tool, not a value statement.
            </ContentText>
            <ContentText></ContentText>{" "}
          </ContentText>
          <Link
            href="/governance"
            className="font-medium text-green underline underline-offset-2 hover:text-forest"
          >
            <ContentText>See governance →</ContentText>
          </Link>
        </p>
      </div>
    </section>
  );
}

export function Proof() {
  return (
    <section className="border-t border-green/10 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal y={8}>
          <span className={eyebrow}>
            <ContentText>The proof</ContentText>
          </span>
        </Reveal>
        <Heading
          tone="leaf"
          text="Transformation is not dependence on Zeebaran. {It is the ability to build something of one’s own.}"
          className="mt-4 text-h2"
        />
        <Reveal delay={0.1} className="mt-6 max-w-3xl space-y-4 text-body text-forest/80">
          <p>
            <ContentText>
              Zeebaran&apos;s work is meaningful when it leaves people with greater knowledge,
              stronger choices, and the capability to build livelihoods, enterprises, and
              institutions that continue to grow without continual dependence on Zeebaran.
            </ContentText>
          </p>
          <p>
            <ContentText>
              Every published story is shared with permission, supported by verified evidence, and
              presented in the participant&apos;s own words wherever possible.
            </ContentText>
          </p>
          <Link href="/impact" className={arrow}>
            <span>
              <ContentText>See what has changed</ContentText>
            </span>
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              <ContentText>→</ContentText>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function AboutCta() {
  return (
    <section className="pb-16 sm:pb-24">
      <div className="home-wrap">
        <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-3xl p-6 shadow-2xl md:p-12">
          <Photo
            src="asset:orchards/mountain-orchards-in-kashmir-valley-1c555-webp"
            variant="hills"
            seed={11}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-forest/50" />
          <Reveal className="relative z-10 w-full max-w-2xl">
            <div className="rounded-2xl border border-white/60 bg-white/60 p-8 text-center shadow-lg backdrop-blur-md md:p-12">
              <Heading
                tone="leaf"
                text={"Some things are grown\n{together.}"}
                className="text-[clamp(1.9rem,1.4rem+1.8vw,2.75rem)] leading-[1.1] tracking-[-0.02em]"
              />
              <p className="mx-auto mt-4 max-w-lg text-small text-forest/80">
                <ContentText>
                  Stronger horticultural systems are built through complementary capabilities.
                  Zeebaran works with growers, researchers, institutions, technology partners, and
                  long-term capital to strengthen what no single organisation can build alone.
                </ContentText>
              </p>
              <p className="mx-auto mt-3 max-w-lg text-small text-forest/80">
                <ContentText>
                  If your work can contribute to that shared effort, we would welcome the
                  opportunity to understand it, and explore where we can build together.
                </ContentText>
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/partnerships"
                  className="action-motion btn-orange rounded-full bg-orange px-6 py-3 text-[0.75rem] font-semibold tracking-wider text-white shadow-sm transition-colors hover:bg-forest"
                >
                  <ContentText>Explore partnership →</ContentText>
                </Link>
                <Link
                  href="/contact"
                  className="action-motion rounded-full border border-green/25 bg-transparent px-6 py-3 text-[0.75rem] font-semibold tracking-wider text-forest transition-colors hover:bg-cream"
                >
                  <ContentText>Contact Zeebaran →</ContentText>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
