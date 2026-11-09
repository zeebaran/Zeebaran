import Image from "next/image";
import Link from "next/link";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { flow, priorityCards, type Status } from "@/lib/innovation-content";
import type { CSSProperties } from "react";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const eyebrow = "mb-3 block text-eyebrow font-bold uppercase tracking-[0.18em] text-green";

const statusCls: Record<Status, [string, string]> = {
  "Under Validation": ["border-stone-200 bg-stone-100 text-stone-600", "bg-stone-400"],
  "In Field": ["border-leaf/40 bg-leaf/15 text-[#3b6000]", "bg-leaf"],
  "In Development": ["border-orange/30 bg-orange/10 text-[#FE6901]", "bg-orange"],
};

export function InnovationHero() {
  return (
    <section className="pb-16 pt-16 sm:pb-24 sm:pt-24">
      <div className="home-wrap">
        <div className="hero-rise mb-6 flex items-center gap-3">
          <span className="h-[1.5px] w-7 bg-green/60" />
          <span className="text-eyebrow font-bold uppercase tracking-[0.18em] text-green">
            Innovation
          </span>
        </div>
        <Heading
          as="h1"
          immediate
          delay={0.1}
          tone="leaf"
          text={"Proof in the field,\n{before scale on paper.}"}
          className="mb-8 max-w-4xl text-display text-forest"
        />
        <div
          className="hero-rise max-w-2xl space-y-6 text-body text-forest/75 sm:text-lead"
          style={d(0.3)}
        >
          <p>
            Innovation is valuable only when it works under the conditions growers actually face.
            Every new idea must first prove itself in the orchard before it earns a place in the
            platform.
          </p>
          <p>
            Zeebaran develops, tests, and validates new approaches under Himalayan conditions. We
            distinguish clearly between what is operational today, what is under validation, and
            what remains an ambition for the future.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Laboratory() {
  return (
    <section className="border-t border-black/[0.04] py-16 sm:py-24">
      <div className="home-wrap">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-8 lg:col-span-6">
            <div>
              <Reveal y={8}>
                <span className={eyebrow}>Biological Laboratory</span>
              </Reveal>
              <Heading
                text="From the laboratory {to the orchard.}"
                tone="leaf"
                className="text-h2 text-forest"
              />
            </div>
            <Reveal delay={0.1} className="space-y-5 text-body text-forest/70">
              <p>
                Zeebaran&apos;s biological laboratory in Lassipora develops and evaluates biological
                solutions for Himalayan fruit cultivation. Research is guided by field conditions,
                validated through orchard trials, and refined through continuous feedback from
                growers and field teams.
              </p>
              <p>
                The laboratory currently has pilot-production capability. Commercial-scale
                production is a future step and will be described as such when the necessary
                validation, production and quality systems are in place.
              </p>
              <p>
                The aim is not simply to replace one input with another. It is to reduce avoidable
                dependence on synthetic applications while protecting crop performance, soil health
                and grower economics.
              </p>
            </Reveal>
            <Reveal>
              <div className="rounded-2xl border border-stone-200/70 bg-[#fbfaf5] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] sm:p-7">
                <div className="mb-4">
                  <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-stone-600">
                    Stated Plainly
                  </span>
                  <h3 className="mt-0.5 text-body font-semibold text-forest">
                    Transparency in how we describe our work
                  </h3>
                </div>
                <p className="mb-6 text-small text-stone-600">
                  Zeebaran distinguishes clearly between what is operational, what is being
                  validated, and what remains under development. The same standard applies across
                  our website, technical publications, partnership material, and investor
                  communications.
                </p>
                <dl className="space-y-2.5 border-t border-stone-200/80 pt-4 text-small">
                  {[
                    ["Operational", "Proven capability currently in use."],
                    ["Validated", "Pilot production, field trials, and technical evaluation."],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-12 gap-2">
                      <dt className="col-span-4 text-[0.6875rem] font-semibold uppercase tracking-wider text-stone-600 sm:col-span-3">
                        {k}
                      </dt>
                      <dd className="col-span-8 text-stone-700 sm:col-span-9">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
          <Reveal className="flex justify-center lg:col-span-6 lg:justify-end" y={30}>
            <div className="group relative aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-stone-200/40 shadow-xl">
              <Image
                src="/images/innovation/laboratory.jpg"
                alt="Female laboratory researcher conducting experiments with culture samples and scientific glassware in laboratory"
                fill
                sizes="(min-width: 1024px) 512px, 90vw"
                className="object-cover transition-transform duration-700 ease-out "
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function DigitalExtension() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="rounded-[2.5rem] border border-stone-200/60 bg-white p-8 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.03)] sm:rounded-[3.5rem] sm:p-14 lg:p-16">
          <div className="mb-14 max-w-3xl">
            <Reveal y={8}>
              <span className={eyebrow}>Digital Extension &amp; AI</span>
            </Reveal>
            <Heading
              text="Technology that extends {the field team.}"
              tone="leaf"
              className="mb-6 text-h2 text-forest"
            />
            <Reveal delay={0.1} className="space-y-4 text-body text-forest/70">
              <p>
                Digital tools are most valuable when they strengthen the relationship between the
                grower and the field team. They help organise information, recognise patterns, and
                support better decisions, but they do not replace judgement, local knowledge, or the
                experience gained in the orchard.
              </p>
              <p>
                Zeebaran&apos;s digital layer connects orchard records, field observations,
                diagnostics, weather conditions, and technical guidance into a single
                decision-support system. As the platform grows, its capabilities and coverage are
                described precisely.
              </p>
            </Reveal>
          </div>

          <Stagger
            gap={0.08}
            className="mb-20 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            {flow.map((f) => (
              <Item key={f.n} className="h-full">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-stone-200/80 bg-[#fbfaf5]/60 p-6 transition-colors hover:border-green/40">
                  <div>
                    <span className="mb-4 inline-block rounded-full border border-stone-300 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-forest/75">
                      {f.n}
                    </span>
                    <h3 className="mb-2 text-body font-bold text-forest">{f.t}</h3>
                    <p className="mb-6 text-small text-stone-600">{f.b}</p>
                  </div>
                  <div className="border-t border-stone-200/80 pt-3">
                    <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone-600">
                      Contributes
                    </span>
                    <span className="text-small font-medium text-stone-700">{f.c}</span>
                  </div>
                </div>
              </Item>
            ))}
          </Stagger>

          <Reveal>
            <div className="flex flex-col items-center border-t border-stone-100 pt-8 text-center">
              <span className="mb-6 inline-block h-[1.5px] w-10 bg-leaf/80" />
              <blockquote className="max-w-2xl font-serif text-h3 leading-snug text-forest">
                AI belongs in the field work, <br className="hidden sm:inline" />
                <span className="italic text-[#597b23]">not in the vocabulary.</span>
              </blockquote>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function TechnicalPriorities() {
  return (
    <section className="py-16 sm:py-24">
      <div className="home-wrap">
        <div className="mb-12 max-w-3xl">
          <Reveal y={8}>
            <span className={eyebrow}>Technical Priorities</span>
          </Reveal>
          <Heading
            text="Building capability requires knowing, {what is not yet complete.}"
            tone="leaf"
            className="mb-6 text-h2 text-forest"
          />
          <Reveal delay={0.1} className="space-y-4 text-body text-forest/70">
            <p>
              Not every important question has been answered. Zeebaran&apos;s technical priorities
              reflect the areas where we are actively building knowledge, validating new approaches,
              and strengthening capability across the horticulture value chain.
            </p>
            <p>
              The status of each priority is updated as evidence, validation, and approvals
              progress. We distinguish clearly between what is operational today, what is under
              validation, and what remains in development.
            </p>
          </Reveal>
        </div>

        <Stagger gap={0.07} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {priorityCards.map((p) => {
            const [cls, dot] = statusCls[p.s];
            return (
              <Item key={p.n} className="h-full">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-stone-200/70 bg-white p-6 shadow-sm sm:p-7">
                  <div>
                    <span className="mb-1 block text-[0.6875rem] font-bold uppercase tracking-wider text-stone-600">
                      {p.n}
                    </span>
                    <h3 className="mb-2 text-body font-bold text-forest">{p.t}</h3>
                    <p className="mb-6 text-small text-stone-600">{p.b}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider ${cls}`}
                    >
                      <span className={`size-1.5 rounded-full ${dot}`} />
                      {p.s}
                    </span>
                  </div>
                </div>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export function AdoptionGap() {
  return (
    <section className="border-t border-black/[0.04] py-16 sm:py-24">
      <div className="home-wrap">
        <div className="max-w-3xl">
          <Reveal y={8}>
            <span className={eyebrow}>The Adoption Gap</span>
          </Reveal>
          <Heading
            text="A better practice must be {possible to use.}"
            tone="leaf"
            className="mb-8 text-h2 text-forest"
          />
          <Reveal delay={0.1}>
            <div className="mb-8 space-y-6 text-body text-forest/70">
              <p>
                Adoption fails when either half is missing: advisory without product supply is
                advice a grower cannot act on; product without advisory is a bottle nobody knows how
                to use.
              </p>
              <p>
                Zeebaran&apos;s innovation work therefore connects technical development with field
                delivery. A practice is not complete when it works in a laboratory. It must also be
                understandable, accessible and usable in the conditions of the orchard.
              </p>
            </div>
            <Link
              href="/zeebaran-hub"
              className="inline-flex items-center gap-2 text-[0.8125rem] font-bold text-green underline decoration-1 underline-offset-4 transition-colors hover:text-forest"
            >
              How practice reaches the orchard →
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Callout() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="flex items-center justify-center rounded-[2.5rem] bg-[#bccebc]/70 p-6 sm:rounded-[3rem] sm:p-14 lg:p-20">
            <div className="w-full max-w-2xl rounded-2xl bg-cream p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:rounded-3xl sm:p-12 lg:p-14">
              <Heading
                text="Bring an idea {to the orchard.}"
                tone="leaf"
                className="mb-4 text-h2 text-forest"
              />
              <p className="mb-3 text-small font-medium text-stone-600 sm:text-body">
                Some ideas deserve more than a laboratory. They deserve an orchard.
              </p>
              <p className="mx-auto mb-8 max-w-md text-small text-stone-600">
                If your research, technology, or technical capability can be meaningfully tested
                under Himalayan conditions — and has the potential to strengthen growers, orchards,
                or the wider horticulture system — we would welcome the opportunity to understand
                your work.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/partnerships"
                  className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-2.5 text-[0.8125rem] font-semibold text-white shadow-sm transition-colors hover:bg-forest"
                >
                  Explore partnership <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/contact"
                  className="btn-orange inline-flex items-center gap-2 rounded-full bg-orange px-6 py-2.5 text-[0.8125rem] font-semibold text-white shadow-sm transition-colors hover:bg-[#e05d00]"
                >
                  Contact Zeebaran <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
