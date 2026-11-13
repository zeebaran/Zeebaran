import { ContentText } from "@/features/cms/Content";
import { capabilities } from "@/lib/capabilities";
import { ContentLink as Link } from "@/features/cms/Content";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { calendar, journey, months } from "@/lib/platform-content";
import type { CSSProperties } from "react";
import { PlatformIllustration } from "@/components/platform/PlatformIllustration";
import heroStyles from "@/components/platform/platform-hero.module.css";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em] text-green";

export function PlatformHero() {
  return (
    <section className={heroStyles.hero + " home-wrap pb-16 pt-16 sm:pb-20 sm:pt-24"}>
      <div className="max-w-3xl">
        <div className="hero-rise mb-6 flex items-center gap-2">
          <span className="h-[1.5px] w-7 bg-green" aria-hidden />
          <span className={eyebrow}>
            <ContentText>What we do</ContentText>
          </span>
        </div>
        <Heading
          as="h1"
          immediate
          delay={0.1}
          tone="leaf"
          text={"The orchard was never\n{the hard part.}"}
          className="mb-8 text-display"
        />
        <div className="hero-rise max-w-2xl space-y-6 text-body text-forest/80" style={d(0.3)}>
          <p>
            <ContentText>
              Zeebaran was built across the value chain because each constraint existed
              independently. An orchard cannot succeed on good planting material alone, nor can
              storage compensate for a poorly managed orchard, or markets create value that was lost
              in the field.
            </ContentText>
          </p>
          <p>
            <ContentText>
              No stage is the whole business. The connection between them is.
            </ContentText>
          </p>
          <p className="text-small text-forest/70">
            <ContentText>
              Every capability Zeebaran has built exists to strengthen a specific point in that
              chain – six capabilities addressing six constraints as one integrated system.
            </ContentText>
          </p>
        </div>
      </div>
      <div className={heroStyles.illustration} data-platform-illustration>
        <PlatformIllustration />
      </div>
    </section>
  );
}

export function Journey() {
  return (
    <section className="border-t border-green/10 py-16 sm:py-24">
      <div className="home-wrap">
        <div className="mb-10 max-w-3xl space-y-3">
          <Reveal y={8}>
            <span className={`${eyebrow} block`}>
              <ContentText>From plant to market</ContentText>
            </span>
          </Reveal>
          <Heading
            text="One product journey. {Four moments where value is created, or lost.}"
            tone="leaf"
            className="text-h2"
          />
          <Reveal delay={0.1}>
            <p className="max-w-2xl text-small text-forest/70">
              <ContentText>
                Everything Zeebaran operates supports this journey. Each stage depends on the one
                before it, and none creates value in isolation.
              </ContentText>
            </p>
          </Reveal>
        </div>
        <Stagger gap={0.08} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map((j) => (
            <Item key={j.n}>
              <article className="flex h-full flex-col justify-between rounded-xl border border-green/15 bg-white/80 p-6 backdrop-blur-sm transition hover:shadow-md">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-leaf px-2 py-0.5 text-[0.625rem] font-bold text-forest">
                    <ContentText>{j.n}</ContentText>
                  </span>
                  <h3 className="mb-2 text-body font-bold text-forest">
                    <ContentText>{j.title}</ContentText>
                  </h3>
                  <p className="text-xs leading-relaxed text-forest/70">
                    <ContentText>{j.body}</ContentText>
                  </p>
                </div>
                <div className="mt-4 border-t border-dashed border-green/15 pt-6">
                  <span className="inline-block rounded-full bg-leaf px-2 py-0.5 text-[0.625rem] font-bold text-forest">
                    <ContentText>{j.n}</ContentText>
                  </span>
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Capabilities() {
  return (
    <section className="py-16 sm:py-24">
      <div className="home-wrap space-y-24">
        <ContentText>
          {capabilities.map((c, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={c.id}
                id={c.id}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
              >
                <Reveal className={flip ? "" : "order-last lg:order-first"}>
                  <div>
                    <span className="mb-2 block text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-forest/70">
                      <ContentText>
                        <ContentText>Operating capability </ContentText>
                        <ContentText></ContentText>
                        {String(i + 1).padStart(2, "0")}
                      </ContentText>
                    </span>
                    <h3 className="mb-4 text-h3 font-bold tracking-tight text-forest">
                      <ContentText>{c.title}</ContentText>
                    </h3>
                    <p className="mb-6 text-small text-forest/80 sm:text-body">
                      <ContentText>{c.description}</ContentText>
                    </p>
                    <dl className="divide-y divide-green/10 border-t border-green/15 text-xs">
                      {c.details.map(([k, v]) => (
                        <div key={k} className="grid grid-cols-3 gap-2 py-3">
                          <dt className="text-[0.6875rem] font-bold uppercase tracking-wider text-forest/70">
                            <ContentText>{k}</ContentText>
                          </dt>
                          <dd className="col-span-2 text-forest/90">
                            <ContentText>{v}</ContentText>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Reveal>
                <Reveal className={flip ? "order-first" : "order-first lg:order-last"} y={30}>
                  <Photo
                    src={c.image.src}
                    alt={c.image.alt}
                    className="aspect-[16/10] rounded-2xl border border-green/15 shadow-sm"
                  />
                </Reveal>
              </div>
            );
          })}
        </ContentText>
      </div>
    </section>
  );
}

export function OrchardYear() {
  return (
    <section className="py-16 sm:py-24">
      <div className="home-wrap">
        <div className="rounded-3xl border border-green/10 bg-white p-6 shadow-sm sm:p-12 lg:p-14">
          <div className="mb-12 max-w-3xl space-y-4">
            <Reveal y={8}>
              <span className={`${eyebrow} block`}>
                <ContentText>The orchard year</ContentText>
              </span>
            </Reveal>
            <Heading
              text="The work is not seasonal. {The seasons are.}"
              tone="leaf"
              className="text-h2"
            />
            <Reveal delay={0.1} className="space-y-4 text-small text-forest/80">
              <p>
                <ContentText>
                  As the orchard changes through the year, so do the decisions that determine its
                  outcome. Different constraints emerge in different seasons, requiring different
                  capabilities at different moments. Zeebaran’s platform is designed to support the
                  orchard throughout that cycle.
                </ContentText>
              </p>
              <p>
                <ContentText>
                  Every capability has a moment when it matters most, but no capability creates
                  value in isolation.
                </ContentText>
              </p>
            </Reveal>
          </div>

          <dl className="divide-y divide-line md:hidden" aria-label="Orchard year calendar">
            {calendar.map((r) => (
              <div key={r.name} className="py-4">
                <dt className="flex flex-wrap items-center justify-between gap-2 text-small font-semibold text-forest">
                  <span>
                    <ContentText>{r.name}</ContentText>
                  </span>
                  <span className="rounded-full bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">
                    <ContentText>{months[r.start - 1]}</ContentText>{" "}
                    <ContentText>
                      – <ContentText></ContentText>
                      {months[r.start + r.span - 2]}
                    </ContentText>
                  </span>
                </dt>
                <dd className="mt-2 text-small">
                  <ContentText>{r.body}</ContentText>
                </dd>
              </div>
            ))}
          </dl>
          <div
            className="hidden overflow-x-auto pb-4 md:block"
            tabIndex={0}
            role="region"
            aria-label="Orchard year calendar by month"
          >
            <div className="min-w-[760px] text-xs">
              <div className="grid grid-cols-12 gap-1 border-b border-gray-100 pb-4 text-center text-[0.6875rem] font-semibold text-forest/70">
                <div className="col-span-4 pl-2 text-left font-bold uppercase tracking-wider">
                  <ContentText>Phase &amp; activity</ContentText>
                </div>
                <div className="col-span-8 grid grid-cols-12 text-[0.625rem] font-semibold uppercase tracking-widest text-forest/70">
                  <ContentText>
                    {months.map((m) => (
                      <span key={m}>
                        <ContentText>{m}</ContentText>
                      </span>
                    ))}
                  </ContentText>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                <ContentText>
                  {calendar.map((r) => (
                    <div key={r.name} className="grid grid-cols-12 items-center gap-1 py-5">
                      <div className="col-span-4 pr-4">
                        <span className="block text-xs font-bold text-forest">
                          <ContentText>{r.name}</ContentText>
                          <span className="sr-only">
                            <ContentText> </ContentText>
                            <ContentText>
                              · <ContentText></ContentText>
                              {months[r.start - 1]}
                            </ContentText>{" "}
                            <ContentText>
                              <ContentText>through </ContentText>
                              <ContentText></ContentText>
                              {months[r.start + r.span - 2]}
                            </ContentText>
                          </span>
                        </span>
                        <span className="text-[0.6875rem] leading-tight text-forest/70">
                          <ContentText>{r.body}</ContentText>
                        </span>
                      </div>
                      <div className="col-span-8 grid grid-cols-12 items-center" aria-hidden>
                        <div
                          className="season-window h-[7px] rounded-full"
                          style={{
                            gridColumn: `${r.start} / span ${r.span}`,
                            backgroundColor: r.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </ContentText>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-gray-100 pt-4 text-[0.625rem] text-forest/70">
            <ContentText>
              Indicative Kashmiri apple calendar. Exact timing varies by district, elevation,
              variety and season.
            </ContentText>
          </p>
        </div>
      </div>
    </section>
  );
}

export function Integration() {
  return (
    <section className="py-16 sm:py-24">
      <div className="home-wrap">
        <div className="max-w-3xl space-y-6">
          <Reveal y={8}>
            <span className={`${eyebrow} block`}>
              <ContentText>Why integration</ContentText>
            </span>
          </Reveal>
          <Heading
            text={"Improving one link is not enough\n{when the next one fails.}"}
            tone="leaf"
            className="text-h2"
          />
          <Reveal delay={0.1} className="space-y-4 text-small text-forest/80 sm:text-body">
            <p>
              <ContentText>
                The constraints facing growers are interconnected, and so are their solutions.
              </ContentText>
            </p>
            <p>
              <ContentText>
                Every capability depends on the one before it, and strengthens the one that follows.
                The greatest value is created not by any single intervention, but by the way each
                capability works together as part of an integrated system.
              </ContentText>
            </p>
            <p className="!text-small text-forest/70">
              <ContentText>
                The integrated value chain – not any individual capability – is the engine that
                enables productivity, resilience, and long-term value creation.
              </ContentText>
            </p>
          </Reveal>
        </div>
        <Reveal>
          <div className="mx-auto mt-20 max-w-4xl border-t border-green/10 pb-12 pt-16 text-center">
            <div className="mx-auto mb-8 h-0.5 w-10 bg-green/40" />
            <blockquote>
              <Heading
                text={"“No stage is the whole business.\n{The connection between them is.”}"}
                tone="leaf"
                className="text-h2"
              />
            </blockquote>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PlatformCta() {
  return (
    <section className="py-12">
      <div className="home-wrap">
        <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-green/10 bg-forest p-6 text-center shadow-lg sm:p-12">
          <Photo
            src="asset:orchards/himalayan-orchard-backdrop-356f6-webp"
            variant="canopy"
            seed={11}
            className="absolute inset-0 h-full w-full opacity-65"
          />
          <div className="absolute inset-0 bg-forest/40 backdrop-blur-[1px]" />
          <Reveal className="relative z-10 w-full max-w-xl">
            <div className="rounded-2xl border border-white/40 bg-[#faf8f1]/60 p-8 shadow-xl backdrop-blur-md sm:p-10">
              <Heading text="There is much more {to build.}" tone="leaf" className="mb-4 text-h3" />
              <p className="mb-4 text-small text-forest/80">
                <ContentText>
                  No single platform can strengthen horticulture alone. It requires growers,
                  researchers, institutions, technology partners, and long-term capital working as
                  part of the same system.
                </ContentText>
              </p>
              <p className="mb-7 text-xs leading-relaxed text-forest/70">
                <ContentText>
                  Zeebaran is building that system across the Himalayas. If your work can contribute
                  to it, we would welcome the opportunity to explore how we can work together.
                </ContentText>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/partnerships"
                  className="action-motion inline-flex items-center gap-1.5 rounded-full bg-green px-5 py-2.5 text-[0.8125rem] font-medium text-white shadow-sm transition hover:bg-forest"
                >
                  <ContentText>Explore partnership </ContentText>
                  <span aria-hidden>
                    <ContentText>→</ContentText>
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="action-motion inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-transparent px-5 py-2.5 text-[0.8125rem] font-medium text-forest transition hover:bg-black/5"
                >
                  <ContentText>Contact Zeebaran </ContentText>
                  <span aria-hidden>
                    <ContentText>→</ContentText>
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
