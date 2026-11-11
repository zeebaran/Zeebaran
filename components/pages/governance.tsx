import { ContentText } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { oversight, metricRules, principles } from "@/lib/content";

const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em]";
const arrowLink =
  "group inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-green transition-colors hover:text-forest";
const arrow = (
  <span className="transition-transform group-hover:translate-x-1" aria-hidden>
    <ContentText>→</ContentText>
  </span>
);
const sec = "home-wrap";

export function GovernanceHero() {
  return (
    <section className="home-wrap pb-12 pt-16 sm:pb-20 sm:pt-24">
      <div className="max-w-4xl">
        <div className="hero-rise mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-forest/40" />
          <span className={`${eyebrow} text-green`}>
            <ContentText>Governance</ContentText>
          </span>
        </div>
        <Heading
          as="h1"
          immediate
          delay={0.1}
          tone="leaf"
          text="Governed like it {intends to last.}"
          className="mb-10 text-display text-forest"
        />
        <div
          className="hero-rise max-w-2xl space-y-6 text-lead text-forest/80"
          style={{ "--d": "0.3s" } as React.CSSProperties}
        >
          <p>
            <ContentText>
              Zeebaran is a professionally governed operating company built for long-term
              stewardship. Governance is not separate from the work. It shapes how decisions are
              made, how resources are allocated, how risks are managed, and how accountability is
              maintained.
            </ContentText>
          </p>
          <p className="pt-2 text-small text-forest/70">
            <ContentText>
              Oversight, reporting, and decision discipline are part of the operating system — not
              an annex to it.
            </ContentText>
          </p>
        </div>
      </div>
    </section>
  );
}

export function OversightSection() {
  return (
    <section className={`${sec} py-12 sm:py-16`}>
      <div className="mb-10">
        <Reveal y={8}>
          <span className={`${eyebrow} mb-3 block text-green`}>
            <ContentText>Oversight &amp; Reporting</ContentText>
          </span>
        </Reveal>
        <Heading text="Long-term work {requires scrutiny.}" tone="leaf" className="text-h2" />
      </div>
      <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {oversight.map((o) => (
          <Item key={o.eyebrow}>
            <article className="flex h-full flex-col justify-between rounded-3xl border border-forest/5 bg-white p-8 shadow-sm transition-shadow hover:shadow-md sm:p-10">
              <div>
                <span className="mb-4 block text-[0.6875rem] font-bold uppercase tracking-wider text-forest/75">
                  <ContentText>{o.eyebrow}</ContentText>
                </span>
                <h3 className="mb-4 text-lead font-bold leading-snug text-forest">
                  <ContentText>{o.title}</ContentText>
                </h3>
                <p className="text-small text-forest/75">
                  <ContentText>{o.body}</ContentText>
                </p>
              </div>
            </article>
          </Item>
        ))}
      </Stagger>
    </section>
  );
}

export function MetricOwnership() {
  return (
    <section className={`${sec} py-12 sm:py-16`}>
      <Reveal>
        <div className="rounded-3xl border border-forest/10 bg-white/80 p-8 shadow-sm backdrop-blur-sm md:p-14 lg:p-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className={`${eyebrow} mb-3 block text-green`}>
                <ContentText>Metric Ownership</ContentText>
              </span>
              <Heading
                text="Every number {has a home.}"
                tone="leaf"
                className="mb-6 text-h2 text-forest"
              />
              <div className="max-w-xl space-y-5 text-small text-forest/80">
                <p>
                  <ContentText>
                    Credibility begins with knowing exactly what a number means, where it comes
                    from, and who is responsible for it.
                  </ContentText>
                </p>
                <p className="font-bold text-forest">
                  <ContentText>
                    Because every number should mean the same thing, wherever it appears.
                  </ContentText>
                </p>
              </div>
              <div className="mt-8">
                <Link href="/impact" className={arrowLink}>
                  <span>
                    <ContentText>How we measure</ContentText>
                  </span>
                  {arrow}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-forest/10 bg-cream/50 p-6 sm:p-8">
                <span className="mb-5 block border-b border-forest/10 pb-4 text-[0.6875rem] font-bold uppercase tracking-wider text-forest/75">
                  <ContentText>Every published figure has</ContentText>
                </span>
                <ul className="space-y-4 text-small font-medium text-forest/90">
                  {metricRules.map((r) => (
                    <li key={r} className="flex items-start">
                      <span
                        className="mr-3 mt-2.5 inline-block h-[1.5px] w-3.5 shrink-0 bg-green"
                        aria-hidden
                      />
                      <span>
                        <ContentText>{r}</ContentText>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Doctrine() {
  return (
    <section className={`${sec} py-12 sm:py-20`}>
      <div className="mb-12 max-w-3xl">
        <span className={`${eyebrow} mb-3 block text-green`}>
          <ContentText>Doctrine-Based Tests</ContentText>
        </span>
        <Heading
          text="When principles conflict, {the order is explicit.}"
          tone="leaf"
          className="mb-6 text-h2 text-forest"
        />
        <Reveal>
          <p className="text-small text-forest/80">
            <ContentText>
              The doctrine is a framework for making decisions. It defines how Zeebaran resolves
              situations in which two desirable outcomes cannot both be maximised. Its purpose is
              not to display values, but to guide judgement consistently over time.
            </ContentText>
          </p>
        </Reveal>
      </div>
      <Stagger gap={0.06} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
        {principles.map((p, i) => (
          <Item key={p.t}>
            <article className="h-full rounded-2xl border border-forest/5 bg-white p-7 shadow-sm sm:p-8">
              <span className="mb-3 block text-[0.6875rem] font-bold tracking-wider text-green">
                <ContentText>{String(i + 1).padStart(2, "0")}</ContentText>
              </span>
              <h3 className="mb-2 text-body font-bold text-forest">
                <ContentText>{p.t}</ContentText>
              </h3>
              <p className="text-small text-forest/70">
                <ContentText>{p.d}</ContentText>
              </p>
            </article>
          </Item>
        ))}
      </Stagger>
    </section>
  );
}

export function RaisingConcerns() {
  return (
    <section className={`${sec} py-12 sm:py-20`}>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-6 lg:col-span-6">
          <span className={`${eyebrow} mb-2 block text-green`}>
            <ContentText>Raising Concerns</ContentText>
          </span>
          <Heading
            text="Good institutions need a way {to hear difficult things.}"
            tone="leaf"
            className="text-h2 text-forest"
          />
          <Reveal className="space-y-4 text-small text-forest/80">
            <p>
              <ContentText>
                Every institution benefits from feedback it would not otherwise receive. Zeebaran
                provides clear and accessible channels for growers, employees, partners, and other
                stakeholders to raise concerns, ask difficult questions, and report issues in good
                faith.
              </ContentText>
            </p>
            <p>
              <ContentText>
                The purpose is not to eliminate disagreement. It is to ensure that important
                concerns are heard, considered, and responded to - and that they cannot simply
                disappear within the institution.
              </ContentText>
            </p>
          </Reveal>
          <div className="pt-4">
            <Link href="/contact" className={arrowLink}>
              <span>
                <ContentText>Raise a concern</ContentText>
              </span>
              {arrow}
            </Link>
          </div>
        </div>
        <Reveal className="lg:col-span-6">
          <Photo
            src="asset:galleries/field-work/community-consultation-and-field-engagement-meeting-with-b3ed6-webp"
            variant="canopy"
            seed={4}
            alt="Community consultation and field engagement meeting with farmers and growers"
            className="mx-auto aspect-[4/5] max-w-md rounded-3xl shadow-md lg:max-w-none"
          />
        </Reveal>
      </div>
    </section>
  );
}

export function Standard() {
  return (
    <section className={`${sec} py-16 sm:py-24`}>
      <Reveal>
        <div className="flex items-center justify-center rounded-3xl bg-leaf/15 p-6 sm:p-12 md:p-16">
          <div className="w-full max-w-2xl rounded-2xl border border-forest/5 bg-white/60 p-8 text-center shadow-sm sm:p-14">
            <Heading
              text="The Standard {Zeebaran holds itself to.}"
              tone="leaf"
              className="mb-8 text-h2 text-forest"
            />
            <div className="mx-auto mb-10 max-w-lg space-y-5 text-small text-forest/80">
              <p>
                <ContentText>
                  Zeebaran&apos;s work should leave people with greater freedom, capability, and
                  opportunity than it found them. That is the standard against which the institution
                  should ultimately be judged.
                </ContentText>
              </p>
              <p>
                <ContentText>
                  The doctrine defines the standard. Governance ensures that Zeebaran continues to
                  measure itself against it, decision by decision, year after year.
                </ContentText>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[0.8125rem] font-medium sm:gap-4">
              <Link
                href="/about"
                className="flex items-center rounded-full bg-green px-6 py-2.5 text-white shadow-sm transition-colors hover:bg-forest"
              >
                <span>
                  <ContentText>About Zeebaran</ContentText>
                </span>
                <span className="ml-1.5" aria-hidden>
                  <ContentText>→</ContentText>
                </span>
              </Link>
              <Link
                href="/contact"
                className="btn-orange flex items-center rounded-full bg-orange px-6 py-2.5 text-white shadow-sm transition-colors hover:bg-[#e05d00]"
              >
                <span>
                  <ContentText>Contact Zeebaran</ContentText>
                </span>
                <span className="ml-1.5" aria-hidden>
                  <ContentText>→</ContentText>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
