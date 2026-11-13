import { ContentText } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { CountUp, Heading, Item, Reveal, Stagger } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { measureChecklist, outcomes, stats } from "@/lib/content";
import type { CSSProperties } from "react";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const eyebrow = "mb-3 block text-eyebrow font-bold uppercase tracking-[0.18em] text-green";
const card = "rounded-2xl border border-[#ece8db] bg-white shadow-sm";

export function ImpactHero() {
  return (
    <section className="home-wrap pb-16 pt-16 sm:pb-20 sm:pt-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="hero-rise mb-6 flex items-center gap-3">
            <span className="h-[1.5px] w-8 bg-green" />
            <span className="text-eyebrow font-bold uppercase tracking-[0.18em] text-green">
              <ContentText>Impact &amp; Outcomes</ContentText>
            </span>
          </div>
          <Heading
            as="h1"
            immediate
            delay={0.1}
            tone="leaf"
            text="The measure is {what stays behind.}"
            className="mb-8 text-display text-forest"
          />
          <div
            className="hero-rise max-w-2xl space-y-6 text-body text-forest/75 sm:text-lead"
            style={d(0.3)}
          >
            <p>
              <ContentText>
                The purpose of Zeebaran&apos;s work is not only to build capabilities, but to leave
                behind stronger growers, healthier orchards, and more capable horticultural systems.
              </ContentText>
            </p>
            <p>
              <ContentText>
                Impact is measured not by activity alone, but by the changes that remain after the
                work is done.
              </ContentText>
            </p>
          </div>
        </div>
        <div className="hero-rise lg:col-span-5" style={d(0.4)}>
          <div className="rounded-3xl border border-[#ece8db] bg-white p-2.5 shadow-xl">
            <Photo
              src="asset:orchards/editorial-documentary-photography-of-kashmiri-apple-orchard-1c8bf-webp"
              variant="rows"
              seed={11}
              priority
              alt="Himalayan orchard rows during the Pulwama and Shopian research trials"
              className="aspect-[4/3] rounded-2xl sm:aspect-[16/11]"
              sizes="(min-width: 1024px) 460px, 90vw"
            />
            <div className="flex items-center justify-between gap-3 px-2.5 pb-1 pt-3 text-[0.6875rem]">
              <span className="font-medium text-forest/80">
                <ContentText>Pulwama &amp; Shopian research trials</ContentText>
              </span>
              <span className="font-bold uppercase tracking-wider text-green">
                <ContentText>Field Evidence</ContentText>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FourThings() {
  return (
    <section className="home-wrap py-16 sm:py-20">
      <div className="mb-12 max-w-3xl">
        <Reveal y={8}>
          <span className={eyebrow}>
            <ContentText>What Changes</ContentText>
          </span>
        </Reveal>
        <Heading
          text="Four things the work {should leave behind.}"
          tone="leaf"
          className="text-h2"
        />
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-2xl text-body text-forest/75">
            <ContentText>
              Zeebaran&apos;s work is intended to leave behind more than infrastructure or services.
            </ContentText>
          </p>
        </Reveal>
      </div>
      <Stagger gap={0.08} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {outcomes.map((o) => (
          <Item key={o.n} className="h-full">
            <div className={`${card} flex h-full flex-col justify-between p-8 sm:p-9`}>
              <div>
                <span className="text-small font-semibold tracking-wider text-forest/75">
                  <ContentText>{o.n}</ContentText>
                </span>
                <h3 className="mb-3 mt-3 font-serif text-h3 text-forest">
                  <ContentText>{o.title}</ContentText>
                </h3>
                <p className="mb-8 text-small text-forest/75">
                  <ContentText>{o.body}</ContentText>
                </p>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-[#f0eee4] pt-6 text-small">
                <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-forest/75">
                  <ContentText>The Measure</ContentText>
                </span>
                <span className="max-w-[65%] text-right font-medium text-forest">
                  <ContentText>{o.measure}</ContentText>
                </span>
              </div>
            </div>
          </Item>
        ))}
      </Stagger>
    </section>
  );
}

export function AuditedMetrics() {
  return (
    <section className="home-wrap py-12 sm:py-16">
      <div className="rounded-3xl border border-[#ece8db] bg-[#fbfaf5] p-8 sm:p-12 md:p-16">
        <div className="mb-12 max-w-3xl">
          <Heading text="Every number, {with its definition.}" tone="leaf" className="text-h2" />
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-xl text-body text-forest/75">
              <ContentText>
                A figure without a definition is a claim. Every number published by Zeebaran is
                accompanied by a clear definition, the period it covers, and the basis on which it
                has been measured.
              </ContentText>
            </p>
          </Reveal>
        </div>
        <Stagger gap={0.07} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <Item key={s.label} className="h-full">
              <div className="flex h-full min-h-[14rem] flex-col justify-between rounded-xl border border-[#ece8db] bg-white p-5">
                <div>
                  <div className="text-3xl font-semibold tracking-tight text-green">
                    <CountUp to={s.value} />
                    <ContentText>
                      {s.suffix && (
                        <span className="text-xl font-normal text-green">
                          <ContentText>{s.suffix}</ContentText>
                        </span>
                      )}
                    </ContentText>
                    <ContentText>
                      {s.unit && (
                        <span className="ml-1 text-small font-semibold text-forest/75">
                          <ContentText>{s.unit}</ContentText>
                        </span>
                      )}
                    </ContentText>
                  </div>
                  <div className="mb-2 mt-1 text-small font-bold text-forest">
                    <ContentText>{s.label}</ContentText>
                  </div>
                  <p className="text-[0.75rem] leading-relaxed text-forest/75">
                    <ContentText>{s.def}</ContentText>
                  </p>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 text-[0.6875rem] font-bold uppercase tracking-wider text-forest/75">
                  <ContentText>{s.foot}</ContentText>
                </div>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function ProofStandard() {
  return (
    <section className="home-wrap py-16 sm:py-20">
      <div className="max-w-3xl">
        <Reveal y={8}>
          <span className={eyebrow}>
            <ContentText>The Proof Standard</ContentText>
          </span>
        </Reveal>
        <Heading
          text="Documented outcomes only. {Nothing published without evidence or consent.}"
          tone="leaf"
          className="mb-8 text-h2"
        />
        <Reveal delay={0.1} className="space-y-5 text-body text-forest/75">
          <p>
            <ContentText>
              Every published story is supported by evidence and shared with permission. Each case
              includes a participant (named or appropriately anonymised), a location, a defined
              timeframe, a documented evidence source, and at least one measurable outcome.
            </ContentText>
          </p>
          <p>
            <ContentText>Until these conditions are met, it remains unpublished.</ContentText>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function ClaimsContext() {
  return (
    <section className="home-wrap py-16 sm:py-20">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal y={8}>
            <span className={eyebrow}>
              <ContentText>How We Measure</ContentText>
            </span>
          </Reveal>
          <Heading text="Claims {require context.}" tone="leaf" className="mb-8 text-h2" />
          <Reveal delay={0.1} className="mb-8 space-y-6 text-body text-forest/75">
            <p>
              <ContentText>
                A number without context can be misleading. The purpose of measurement is not to
                make figures appear larger, but to make them meaningful, comparable, and useful.
              </ContentText>
            </p>
            <p>
              <ContentText>
                Measurement is only useful when others can understand what a figure represents, how
                it was derived, and what it does, and does not, claim.
              </ContentText>
            </p>
          </Reveal>
          <Link
            href="/governance"
            className="group inline-flex items-center gap-2 text-eyebrow font-bold uppercase tracking-[0.14em] text-green transition-colors hover:text-orange"
          >
            <span>
              <ContentText>Metric ownership and governance</ContentText>
            </span>
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              <ContentText>→</ContentText>
            </span>
          </Link>
        </div>
        <Reveal delay={0.1} className="lg:col-span-6">
          <div className={`${card} p-8 sm:p-10`}>
            <div className="mb-2 border-b border-[#f0eee4] pb-6 text-[0.6875rem] font-bold uppercase tracking-widest text-forest/75">
              <ContentText>Every Published Metric Carries</ContentText>
            </div>
            <ul className="space-y-5">
              {measureChecklist.map((t, i) => (
                <li
                  key={t}
                  className={`flex items-start pt-3 text-small font-medium text-forest ${i ? "border-t border-[#f7f5ea]" : ""}`}
                >
                  <span className="mr-3 mt-2.5 inline-block h-[1.5px] w-4 shrink-0 bg-forest/40" />
                  <span>
                    <ContentText>{t}</ContentText>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function TheTest() {
  return (
    <section className="home-wrap py-12 sm:py-16">
      <div className={`${card} p-8 sm:p-14 md:p-16`}>
        <div className="max-w-4xl">
          <Reveal y={8}>
            <span className={eyebrow}>
              <ContentText>The Test</ContentText>
            </span>
          </Reveal>
          <Heading
            text="The test is not whether people need Zeebaran more. {It is whether they can do more without it.}"
            tone="leaf"
            className="mb-10 text-h2"
          />
          <Reveal delay={0.1} className="max-w-3xl space-y-6 text-body text-forest/75">
            <p>
              <ContentText>
                The purpose of Zeebaran&apos;s work is to expand capability, not dependence. Growers
                should leave with greater knowledge, stronger choices, and more confidence in the
                decisions they make about their orchards and livelihoods.
              </ContentText>
            </p>
            <p>
              <ContentText>
                The measure of success is not how often Zeebaran is needed. It is whether better
                practice continues because growers have the ability to sustain it themselves.
              </ContentText>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function EvidenceCta() {
  return (
    <section id="contact" className="home-wrap py-12 sm:py-16">
      <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-3xl border border-[#ece8db] p-6 sm:p-16">
        <Photo
          src="asset:orchards/lush-green-apple-orchard-in-himalayan-valley-7ab59-webp"
          variant="canopy"
          seed={5}
          alt="Lush green apple orchard in a Himalayan valley"
          className="absolute inset-0"
          sizes="(min-width: 1280px) 1216px, 100vw"
        />
        <div className="absolute inset-0 bg-stone-900/35" />
        <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/50 bg-[#fbfaf5]/60 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
          <Heading text="Ask for {the evidence.}" tone="leaf" className="mb-4 text-h2" />
          <p className="mx-auto mb-4 max-w-lg text-body text-forest/75">
            <ContentText>
              If you are assessing Zeebaran as a partner, an investor, or an institution, we would
              rather share our definitions, methodologies, and evidence than rely on adjectives.
            </ContentText>
          </p>
          <p className="mb-8 text-small font-semibold text-forest/85">
            <ContentText>
              We believe evidence should be available to those making important decisions.
            </ContentText>
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/partnerships"
              className="action-motion inline-flex w-full items-center justify-center gap-2 rounded-full bg-green px-6 py-3 text-[0.8125rem] font-semibold text-white shadow-sm transition-colors hover:bg-forest sm:w-auto"
            >
              <ContentText>Explore partnership </ContentText>
              <span aria-hidden>
                <ContentText>→</ContentText>
              </span>
            </Link>
            <Link
              href="/contact"
              className="action-motion btn-orange inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange px-6 py-3 text-[0.8125rem] font-semibold text-white shadow-sm transition-colors hover:bg-[#e05d00] sm:w-auto"
            >
              <ContentText>Contact Zeebaran </ContentText>
              <span aria-hidden>
                <ContentText>→</ContentText>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
