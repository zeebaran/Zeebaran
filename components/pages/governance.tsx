import { ContentText } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { principles } from "@/lib/content";
import { governanceCopy as copy } from "@/lib/governance-content";
import { TeamIllustration } from "@/components/governance/TeamIllustration";
import heroStyles from "@/components/governance/governance-hero.module.css";

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
      <div className={heroStyles.layout}>
        <div className={heroStyles.copy}>
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
            text={copy.hero.title}
            className="mb-10 text-display text-forest"
          />
          <div
            className="hero-rise max-w-2xl space-y-6 text-lead text-forest/80"
            style={{ "--d": "0.3s" } as React.CSSProperties}
          >
            <p>
              <ContentText>{copy.hero.body}</ContentText>
            </p>
            <p className="pt-2 text-small text-forest/70">
              <ContentText>{copy.hero.note}</ContentText>
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/about#team" className={arrowLink}>
              <ContentText>{copy.hero.peopleLink}</ContentText>
              {arrow}
            </Link>
            <Link href="/contact?reason=careers#write" className={arrowLink}>
              <ContentText>{copy.hero.careersLink}</ContentText>
              {arrow}
            </Link>
          </div>
        </div>
        <div className={heroStyles.illustration}>
          <TeamIllustration />
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
            <ContentText>{copy.working.eyebrow}</ContentText>
          </span>
        </Reveal>
        <Heading text={copy.working.title} tone="leaf" className="text-h2" />
      </div>
      <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {copy.working.cards.map((o) => (
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
                <ContentText>{copy.responsibilities.eyebrow}</ContentText>
              </span>
              <Heading
                text={copy.responsibilities.title}
                tone="leaf"
                className="mb-6 text-h2 text-forest"
              />
              <div className="max-w-xl space-y-5 text-small text-forest/80">
                <p>
                  <ContentText>{copy.responsibilities.body}</ContentText>
                </p>
                <p className="font-bold text-forest">
                  <ContentText>{copy.responsibilities.emphasis}</ContentText>
                </p>
              </div>
              <div className="mt-8">
                <Link href="/platform" className={arrowLink}>
                  <span>
                    <ContentText>{copy.responsibilities.link}</ContentText>
                  </span>
                  {arrow}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-forest/10 bg-cream/50 p-6 sm:p-8">
                <span className="mb-5 block border-b border-forest/10 pb-4 text-[0.6875rem] font-bold uppercase tracking-wider text-forest/75">
                  <ContentText>{copy.responsibilities.listTitle}</ContentText>
                </span>
                <ul className="space-y-4 text-small font-medium text-forest/90">
                  {copy.responsibilities.items.map((r) => (
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
          <ContentText>{copy.principles.eyebrow}</ContentText>
        </span>
        <Heading text={copy.principles.title} tone="leaf" className="mb-6 text-h2 text-forest" />
        <Reveal>
          <p className="text-small text-forest/80">
            <ContentText>{copy.principles.body}</ContentText>
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
            <ContentText>{copy.concerns.eyebrow}</ContentText>
          </span>
          <Heading text={copy.concerns.title} tone="leaf" className="text-h2 text-forest" />
          <Reveal className="space-y-4 text-small text-forest/80">
            <p>
              <ContentText>{copy.concerns.body}</ContentText>
            </p>
            <p>
              <ContentText>{copy.concerns.note}</ContentText>
            </p>
          </Reveal>
          <div className="pt-4">
            <Link href="/contact" className={arrowLink}>
              <span>
                <ContentText>{copy.concerns.link}</ContentText>
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
              text={copy.invitation.title}
              tone="leaf"
              className="mb-8 text-h2 text-forest"
            />
            <div className="mx-auto mb-10 max-w-lg space-y-5 text-small text-forest/80">
              <p>
                <ContentText>{copy.invitation.body}</ContentText>
              </p>
              <p>
                <ContentText>{copy.invitation.note}</ContentText>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[0.8125rem] font-medium sm:gap-4">
              <Link
                href="/about#team"
                className="action-motion flex items-center rounded-full bg-green px-6 py-2.5 text-white shadow-sm transition-colors hover:bg-forest"
              >
                <span>
                  <ContentText>{copy.invitation.peopleLink}</ContentText>
                </span>
                <span className="ml-1.5" aria-hidden>
                  <ContentText>→</ContentText>
                </span>
              </Link>
              <Link
                href="/contact?reason=careers#write"
                className="action-motion btn-orange flex items-center rounded-full bg-orange px-6 py-2.5 text-white shadow-sm transition-colors hover:bg-[#e05d00]"
              >
                <span>
                  <ContentText>{copy.invitation.careersLink}</ContentText>
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
