import { PartnerStrip } from "@/components/partners/PartnerStrip";
import { ContentText } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { partnerCards, criteria } from "@/lib/partnerships-content";
import { PartnershipIllustration } from "@/components/partnerships/PartnershipIllustration";
import heroStyles from "@/components/partnerships/partnership-hero.module.css";

const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em]";
const arrowLink =
  "group inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-green transition-colors hover:text-forest";
const arrow = (
  <span className="transition-transform group-hover:translate-x-1" aria-hidden>
    <ContentText>→</ContentText>
  </span>
);
const wrap = "mx-auto max-w-6xl px-6 lg:px-8";
const cardLabel = "text-[0.6875rem] font-bold uppercase tracking-wider text-forest/75";

export function PartnershipsHero() {
  return (
    <section className="pb-16 pt-16 sm:pb-20 sm:pt-24 md:pb-28">
      <div className={heroStyles.layout + " mx-auto max-w-4xl px-6 lg:px-8"}>
        <div className="hero-rise mb-6 flex items-center gap-2">
          <span className="inline-block h-px w-5 bg-green" />
          <span className={`${eyebrow} text-green`}>
            <ContentText>Partnerships</ContentText>
          </span>
        </div>
        <Heading
          as="h1"
          immediate
          delay={0.1}
          tone="leaf"
          text="Better systems are built {in partnership.}"
          className="mb-8 text-display text-forest"
        />
        <div
          className="hero-rise max-w-3xl space-y-6 text-lead text-forest/80"
          style={{ "--d": "0.3s" } as React.CSSProperties}
        >
          <p>
            <ContentText>
              No single entity can strengthen horticulture alone. Progress depends on growers,
              researchers, technology developers, public institutions, financial partners, and
              industry working together around shared challenges.
            </ContentText>
          </p>
          <p>
            <ContentText>
              Zeebaran builds partnerships with organisations that contribute distinct capabilities
              - knowledge, research, technology, infrastructure, finance, or market access. The
              purpose of each partnership is practical: to strengthen the horticulture system in
              ways that improve long-term outcomes for smallholder growers across the Himalayas.
            </ContentText>
          </p>
        </div>
        <div className={heroStyles.illustration} data-partnership-illustration>
          <PartnershipIllustration />
        </div>
      </div>
    </section>
  );
}

export function ResearchPartners() {
  return (
    <section className="border-t border-forest/10 py-16 sm:py-24">
      <div className={wrap}>
        <div className="mb-14 max-w-3xl">
          <Reveal y={8}>
            <span className={`${eyebrow} mb-4 block text-green`}>
              <ContentText>Research &amp; Innovation</ContentText>
            </span>
          </Reveal>
          <Heading
            text="Research should {reach the field.}"
            tone="leaf"
            className="mb-7 text-h2 text-forest"
          />
          <Reveal className="space-y-4 text-body text-forest/80">
            <p>
              <ContentText>
                Research creates value when it helps answer the questions growers face in the
                orchard. Zeebaran works with research institutions, universities, and technical
                partners to develop, validate, and apply knowledge under Himalayan conditions.
              </ContentText>
            </p>
            <p>
              <ContentText>
                The purpose is not to build a list of affiliations. It is to connect scientific
                research with field questions, operating infrastructure, and practical use.
              </ContentText>
            </p>
          </Reveal>
        </div>
        <Stagger className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {partnerCards.map((g) => (
            <Item key={g.title} className="h-full">
              <article className="h-full rounded-2xl border border-forest/10 bg-white p-7 shadow-sm">
                <h3 className={`${cardLabel} mb-6`}>
                  <ContentText>{g.title}</ContentText>
                </h3>
                <ul className="space-y-6">
                  {g.items.map((p) => (
                    <li key={p.name} className="flex items-center gap-4">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-leaf/30 bg-cream/60 text-[0.6875rem] font-bold text-green"
                        aria-hidden
                      >
                        <ContentText>{p.mark}</ContentText>
                      </span>
                      <div>
                        <h4 className="text-small font-semibold text-forest">
                          <ContentText>{p.name}</ContentText>
                        </h4>
                        <ContentText>
                          {p.note && (
                            <p className="text-[0.75rem] text-forest/75">
                              <ContentText>{p.note}</ContentText>
                            </p>
                          )}
                        </ContentText>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </Item>
          ))}
        </Stagger>
        <p className="max-w-3xl text-[0.75rem] leading-relaxed text-forest/75">
          <ContentText>
            Partnerships are presented according to the nature of the work they support. Partner
            names, descriptions, and the scope of each relationship are published only with the
            appropriate approvals and are described precisely, without implying activities beyond
            those agreed.
          </ContentText>
        </p>
      </div>
    </section>
  );
}

export function TechCapital() {
  const cards = [
    {
      eyebrow: "Technology & Applied Capability",
      title: "Technology is useful when it improves a decision.",
      body: "Technology creates value only when it helps growers and field teams make better decisions in the orchard. Zeebaran works with technical partners across biological crop protection, planting material, diagnostics, digital extension, and post-harvest quality to adapt specialised capability to Himalayan conditions and practical field use.",
      href: "/innovation",
      link: "How capability is tested",
    },
    {
      eyebrow: "Capital & Institutional Governance",
      title: "Long-term work requires long-term discipline.",
      body: "Capital supports more than growth. It enables the governance, reporting, technical standards, and institutional discipline required to build capability over time. Zeebaran works with long-term capital partners who share this perspective, recognising that resilient institutions are built through responsible governance, transparent measurement, and sustained commitment—not finance alone.",
      href: "/governance",
      link: "Governance",
    },
  ];
  return (
    <section className="py-16 sm:py-24">
      <div className={wrap}>
        <Reveal>
          <div className="rounded-3xl border border-forest/10 bg-leaf/10 p-8 md:p-14">
            <div className="mb-12">
              <span className={`${eyebrow} mb-3 block text-green`}>
                <ContentText>Technology &amp; Capital</ContentText>
              </span>
              <Heading
                text="Specialised capability, {connected to the people who use it.}"
                tone="leaf"
                className="text-h2 text-forest"
              />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <ContentText>
                {cards.map((c) => (
                  <article
                    key={c.eyebrow}
                    className="flex flex-col justify-between rounded-2xl border border-forest/10 bg-white p-8 shadow-sm"
                  >
                    <div>
                      <span className={`${cardLabel} mb-3 block`}>
                        <ContentText>{c.eyebrow}</ContentText>
                      </span>
                      <h3 className="mb-4 text-lead font-bold leading-snug text-forest">
                        <ContentText>{c.title}</ContentText>
                      </h3>
                      <p className="mb-6 text-small text-forest/80">
                        <ContentText>{c.body}</ContentText>
                      </p>
                    </div>
                    <div>
                      <Link href={c.href} className={arrowLink}>
                        <span>
                          <ContentText>{c.link}</ContentText>
                        </span>
                        {arrow}
                      </Link>
                    </div>
                  </article>
                ))}
              </ContentText>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const collage = [
  {
    src: "asset:galleries/field-work/field-inspection-0a509-webp",
    alt: "Field inspection",
    cls: "-rotate-2",
    h: "h-24 sm:h-28",
    v: "canopy",
    s: 3,
  },
  {
    src: "asset:galleries/field-work/field-session-a893a-webp",
    alt: "Field session",
    cls: "rotate-3",
    h: "h-28 sm:h-32",
    v: "rows",
    s: 5,
  },
  {
    src: "asset:galleries/field-work/field-team-portrait-6ac70-webp",
    alt: "Field team portrait",
    cls: "-rotate-[4deg] col-span-2",
    h: "h-32 sm:h-36",
    v: "hills",
    s: 8,
  },
  {
    src: "asset:orchards/demonstration-23ec7-webp",
    alt: "Demonstration",
    cls: "rotate-1",
    h: "h-24 sm:h-28",
    v: "centre",
    s: 2,
  },
  {
    src: "asset:orchards/soil-telemetry-92cc6-webp",
    alt: "Soil telemetry",
    cls: "-rotate-2",
    h: "h-28 sm:h-32",
    v: "rows",
    s: 9,
  },
] as const;

export function FieldPartnerships() {
  return (
    <section className="py-16 sm:py-24">
      <div className={wrap}>
        <div className="mb-12 max-w-3xl">
          <Reveal y={8}>
            <span className={`${eyebrow} mb-3 block text-green`}>
              <ContentText>Field Partnerships</ContentText>
            </span>
          </Reveal>
          <Heading
            text="The field is where the work {is tested.}"
            tone="leaf"
            className="mb-6 text-h2 text-forest"
          />
          <Reveal className="space-y-4 text-body text-forest/80">
            <p>
              <ContentText>
                Zeebaran works with growers, field teams, government agencies, and local
                institutions to understand what can be adopted, sustained, and improved under real
                orchard conditions.
              </ContentText>
            </p>
            <p>
              <ContentText>
                Field partnerships are more than a route for delivering knowledge. They are how
                knowledge is tested. Partners contribute expertise, experience, and technical
                capability; the field provides the evidence that determines whether an idea is
                practical, scalable, and worth adopting.
              </ContentText>
            </p>
            <p className="font-medium text-forest">
              <ContentText>
                Learning moves in both directions. The platform supports the field, and the field
                continually strengthens the platform.
              </ContentText>
            </p>
          </Reveal>
        </div>
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-forest/10 bg-gradient-to-r from-[#D9E3D8] via-[#E7EDE4] to-[#C9DAC5] p-6 sm:p-10">
            <div className="mx-auto grid max-w-4xl grid-cols-2 items-center justify-center gap-3 sm:grid-cols-4 md:grid-cols-6">
              <ContentText>
                {collage.map((c) => (
                  <div
                    key={c.alt}
                    className={`rounded border border-forest/10 bg-white p-1 shadow-md transition-transform duration-300 hover:scale-105 ${c.cls}`}
                  >
                    <Photo
                      src={c.src}
                      variant={c.v}
                      seed={c.s}
                      alt={c.alt}
                      className={`w-full rounded-sm ${c.h}`}
                      sizes="(min-width:768px) 25vw, 50vw"
                    />
                  </div>
                ))}
              </ContentText>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HowWeWork() {
  return (
    <section className="border-t border-forest/10 py-16 sm:py-24">
      <div className={wrap}>
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal y={8}>
              <span className={`${eyebrow} mb-3 block text-green`}>
                <ContentText>How We Work</ContentText>
              </span>
            </Reveal>
            <Heading
              text="Zeebaran does not seek to replace public research, extension systems {or private enterprise.}"
              tone="leaf"
              className="mb-8 text-h2 text-forest"
            />
            <Reveal className="space-y-5 text-body text-forest/80">
              <p>
                <ContentText>
                  It works to connect their strengths into a more coherent horticultural system -
                  one in which knowledge, infrastructure, technology, finance, and markets are more
                  accessible to smallholder growers.
                </ContentText>
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-6">
            <div className="rounded-2xl border border-forest/10 bg-white p-8 shadow-sm sm:p-9">
              <h3 className={`${cardLabel} mb-6 leading-relaxed`}>
                <ContentText>
                  A partnership is valuable when it makes at least one of the following possible:
                </ContentText>
              </h3>
              <ul className="divide-y divide-forest/10">
                {criteria.map((c) => (
                  <li key={c} className="flex items-start gap-3 py-3.5">
                    <span
                      className="select-none text-lg font-bold leading-none text-leaf"
                      aria-hidden
                    >
                      <ContentText>—</ContentText>
                    </span>
                    <span className="text-small font-medium text-forest/90">
                      <ContentText>{c}</ContentText>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function PartnerWordmarks() {
  return (
    <section className="border-t border-forest/10 py-14 sm:py-20">
      <div className={wrap}>
        <span className={`${eyebrow} mb-10 block text-center text-green sm:text-left`}>
          <ContentText>Partners</ContentText>
        </span>
        <PartnerStrip />
      </div>
    </section>
  );
}

export function PartnerCta() {
  return (
    <section className="py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate flex min-h-[480px] items-center justify-center overflow-hidden rounded-[2rem] p-6 sm:p-16 md:p-20">
          <Photo
            src="asset:orchards/zeebaran-high-density-orchard-3f108-webp"
            variant="rows"
            seed={11}
            alt="Zeebaran high-density orchard"
            className="absolute inset-0 -z-10"
            sizes="(min-width:1152px) 1152px, 100vw"
          />
          <div className="absolute inset-0 -z-10 bg-forest/40 backdrop-blur-[1px]" />
          <Reveal className="w-full max-w-2xl">
            <div className="rounded-3xl border border-cream bg-cream/60 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
              <Heading
                text="Bring an idea {to the orchard.}"
                tone="leaf"
                className="mb-5 text-h2 text-forest"
              />
              <p className="mb-8 text-small text-forest/80">
                <ContentText>
                  Better horticultural systems are built through complementary capabilities. If your
                  institution, technology, research, or long-term capital can help strengthen
                  horticulture across the Himalayas, we would welcome the opportunity to understand
                  your work - and explore where Zeebaran can contribute.
                </ContentText>
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="group inline-flex w-full items-center justify-center rounded-full bg-green px-7 py-3 text-[0.8125rem] font-medium tracking-wide text-white shadow-md transition-colors hover:bg-forest sm:w-auto"
                >
                  <span>
                    <ContentText>Contact Zeebaran</ContentText>
                  </span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden>
                    <ContentText>→</ContentText>
                  </span>
                </Link>
                <Link
                  href="/about"
                  className="group inline-flex w-full items-center justify-center rounded-full bg-[#EDE8DB] px-7 py-3 text-[0.8125rem] font-medium tracking-wide text-forest transition-colors hover:bg-[#E2DDCF] sm:w-auto"
                >
                  <span>
                    <ContentText>About Zeebaran</ContentText>
                  </span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden>
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
