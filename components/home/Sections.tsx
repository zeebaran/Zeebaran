import { ContentSvgText } from "@/features/cms/Content";
import { ContentText } from "@/features/cms/Content";
import { CapabilityExplorer } from "@/components/CapabilityExplorer";
import { ContentImage as Image } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { Heading, Reveal, Stagger, Item, CountUp } from "@/components/Motion";
import { adoption, homeStats, outcomes, thumbs } from "@/lib/home-content";
import { AbilityTabs } from "./AbilityTabs";
import { HubBackdrop } from "./HubBackdrop";

const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em]";
const arrowLink =
  "group inline-flex items-center gap-2 text-eyebrow font-bold uppercase tracking-[0.14em] text-green transition-colors hover:text-orange";

/* ───────── Roots & Continuity + thumbnail strip ───────── */
export function Vision() {
  return (
    <section id="vision" className="border-t border-green/10 py-16 sm:py-24">
      <div className="home-wrap">
        <div className="mb-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Reveal y={8}>
              <span className={`${eyebrow} block text-green`}>
                <ContentText>Roots &amp; Continuity</ContentText>
              </span>
            </Reveal>
            <Heading
              text="Every orchard is a conversation {with the future.}"
              tone="leaf"
              className="text-h2"
            />
            <Reveal delay={0.1} className="space-y-6">
              <p className="max-w-2xl text-body text-forest/80">
                <ContentText>
                  In Kashmir, a harvest depends on much more than a tree. It depends on the soil
                  beneath it, the people who tend it, the knowledge available to them, and the
                  integrated networks that carry its true value forward.
                </ContentText>
              </p>
              <p className="max-w-2xl text-small text-forest/70">
                <ContentText>
                  Zeebaran works across these conditions to establish systematic horticultural
                  viability for multigenerational growers.
                </ContentText>
              </p>
              <Link
                href="/platform"
                className={`${arrowLink} !text-[0.8125rem] !normal-case !tracking-normal`}
              >
                <span>
                  <ContentText>Explore Zeebaran</ContentText>
                </span>
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                  <ContentText>→</ContentText>
                </span>
              </Link>
            </Reveal>
          </div>
        </div>

        <Stagger
          gap={0.07}
          className="grid grid-cols-2 gap-1 overflow-hidden rounded-3xl sm:grid-cols-3 lg:grid-cols-6"
        >
          {thumbs.map((t, i) => {
            const first = i === 0;
            const last = i === thumbs.length - 1;
            const secondLast = i === thumbs.length - 2;
            // On desktop (6-col): only col-1 is first, only col-6 is last
            // On sm (3-col): first row left=0, last row right=last
            // On mobile (2-col): top-left=0, top-right=1, bottom-left=even-last, bottom-right=last
            const radiusClass = [
              first ? "rounded-tl-3xl" : "",
              i === 1 ? "rounded-tr-3xl sm:rounded-tr-none" : "",
              i === 2 ? "sm:rounded-tr-3xl lg:rounded-tr-none" : "",
              i === 5 ? "lg:rounded-tr-3xl" : "",
              secondLast ? "rounded-bl-3xl sm:rounded-bl-none" : "",
              last ? "rounded-br-3xl" : "",
              i === thumbs.length - 3 ? "sm:rounded-bl-3xl lg:rounded-bl-none" : "",
              i === thumbs.length - 4 ? "sm:rounded-bl-none" : "",
              i === 0 ? "lg:rounded-bl-3xl" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <Item key={t.label}>
                <div
                  className={`group relative aspect-[4/5] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg ${radiusClass}`}
                >
                  <Image
                    src={t.src}
                    alt={t.alt}
                    fill
                    sizes="(min-width: 1024px) 190px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-forest/20 transition-colors group-hover:bg-transparent" />
                  <span className="absolute bottom-2.5 left-2.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white drop-shadow-md">
                    <ContentText>{t.label}</ContentText>
                  </span>
                </div>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ───────── Ability is widely distributed ───────── */
export function Ability() {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="home-wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <Reveal y={8}>
              <span className={`${eyebrow} text-green`}>
                <ContentText>The Conditions Around the Orchard</ContentText>
              </span>
            </Reveal>
            <Heading
              text="Ability is widely distributed. {The means to act on it are not.}"
              tone="leaf"
              className="text-h2"
            />
            <Reveal delay={0.1} className="space-y-6">
              <AbilityTabs />
            </Reveal>
          </div>
          <Reveal className="flex justify-center lg:col-span-6" y={30}>
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <Image
                src="asset:orchards/orchard-grower-webp"
                alt="Himalayan grower harvesting red apples from a trellis"
                fill
                sizes="(min-width: 1024px) 448px, 90vw"
                className="img-slide-reveal object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent" />
              <p className="absolute inset-x-6 bottom-6 text-small font-medium text-white">
                <ContentText>
                  Targeted high-density orchard management yielding grade-A produce in Anantnag.
                </ContentText>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────── The System (value chain) ───────── */
export function System() {
  return (
    <section id="system" className="border-y border-green/10 bg-white py-16 sm:py-24">
      <div className="home-wrap">
        <div className="mb-14 max-w-3xl space-y-4">
          <Reveal y={8}>
            <span className={`${eyebrow} text-green`}>
              <ContentText>The System</ContentText>
            </span>
          </Reveal>
          <Heading text="A harvest is never {only a harvest.}" tone="leaf" className="text-h2" />
          <Reveal delay={0.1}>
            <p className="text-body text-forest/80">
              <ContentText>
                Advice without the means to act on it is incomplete. Inputs without guidance are
                difficult to use effectively. A productive orchard loses value when storage is
                unavailable, just as storage cannot compensate for an orchard that was poorly
                established.
              </ContentText>
            </p>
          </Reveal>
        </div>

        <CapabilityExplorer />
        <Reveal>
          <div className="mx-auto my-16 max-w-2xl text-center">
            <div className="mx-auto mb-6 h-0.5 w-12 bg-green/30" />
            <p className="font-serif text-[clamp(1.25rem,1rem+1vw,1.5rem)] italic text-forest">
              <ContentText>
                “No stage is the whole business. The connection between them is.”
              </ContentText>
            </p>
            <div className="mx-auto mt-6 h-0.5 w-12 bg-green/30" />
          </div>
        </Reveal>

        <Stagger gap={0.12} className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-2">
          {[
            {
              eb: "Beneath the Chain",
              ebc: "text-green",
              t: "The digital & AI layer",
              b: "Orchard records, diagnostic models, micro-weather intelligence, and agronomic guidance help field teams reach more growers, respond faster, and make better-informed decisions. Technology extends the reach and effectiveness of the field team; it does not replace human insight.",
              href: "/innovation",
              cta: "How it is built",
              side: "Cloud & ML Diagnostics",
            },
            {
              eb: "At the Field Edge",
              ebc: "text-[#fe6901]",
              t: "Zeebaran Hub — the field layer",
              b: "Zeebaran Hub Centres bring advisory services, diagnostics, demonstration orchards, digital tools, and quality inputs closer to growers. Just as importantly, they channel observations and grower experience directly back into research and continuous improvement.",
              href: "/zeebaran-hub",
              cta: "Visit Zeebaran Hub",
              side: "Physical Community Centres",
            },
          ].map((c) => (
            <Item key={c.t}>
              <article className="flex h-full flex-col justify-between rounded-3xl border border-green/15 bg-cream/40 p-8 transition-all duration-300 hover:shadow-lg">
                <div>
                  <span
                    className={`mb-2 block text-[0.6875rem] font-bold uppercase tracking-[0.18em] ${c.ebc}`}
                  >
                    <ContentText>{c.eb}</ContentText>
                  </span>
                  <h3 className="mb-4 font-serif text-[1.5rem] font-normal leading-tight text-forest">
                    <ContentText>{c.t}</ContentText>
                  </h3>
                  <p className="mb-6 text-small text-forest/80">
                    <ContentText>{c.b}</ContentText>
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-green/10 pt-4">
                  <Link href={c.href} className={arrowLink}>
                    <span>
                      <ContentText>{c.cta}</ContentText>
                    </span>
                    <span aria-hidden>
                      <ContentText>→</ContentText>
                    </span>
                  </Link>
                  <span className="text-xs font-medium text-forest/75">
                    <ContentText>{c.side}</ContentText>
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

/* ───────── Metrics ───────── */
export function Metrics() {
  return (
    <section id="metrics" className="bg-cream py-16 sm:py-24">
      <div className="home-wrap">
        <div className="mb-12 max-w-3xl">
          <Reveal y={8}>
            <span className={`${eyebrow} mb-2 block text-green`}>
              <ContentText>Built Over Time, In The Field</ContentText>
            </span>
          </Reveal>
          <Heading
            text={"What has been built is visible.\n{What it makes possible takes longer to see.}"}
            tone="leaf"
            className="text-h2"
          />
        </div>
        <Stagger gap={0.08} className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {homeStats.map((s) => (
            <Item key={s.label}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-green/10 bg-white p-6 shadow-sm">
                <div>
                  <div className="mb-2 text-[2.5rem] font-medium leading-none tracking-[-0.03em] text-green">
                    <CountUp to={s.to} suffix={s.suffix} />
                    <ContentText>
                      {s.unit && (
                        <span className="ml-1.5 text-lg font-normal tracking-normal text-forest/75">
                          <ContentText>{s.unit}</ContentText>
                        </span>
                      )}
                    </ContentText>
                  </div>
                  <div className="mb-2 mt-3 text-[0.75rem] font-bold uppercase tracking-wider text-forest">
                    <ContentText>{s.label}</ContentText>
                  </div>
                  <p className="text-[0.75rem] leading-normal text-forest/70">
                    <ContentText>{s.body}</ContentText>
                  </p>
                </div>
                <div className="mt-6 border-t border-green/10 pt-3 text-[0.625rem] font-bold uppercase tracking-widest text-forest/75">
                  <ContentText>{s.foot}</ContentText>
                </div>
              </div>
            </Item>
          ))}
        </Stagger>
        <div className="flex flex-col justify-between gap-2 pt-2 text-xs text-forest/75 sm:flex-row sm:items-center">
          <span>
            <ContentText>
              All figures are audited, data-backed and supported by documented methodology.
            </ContentText>
          </span>
          <Link href="/impact" className="font-bold text-green hover:underline">
            <ContentText>How we measure →</ContentText>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────── Himalayas map ───────── */
export function Himalayas() {
  return (
    <section id="himalayas" className="border-t border-green/10 bg-white py-16 sm:py-24">
      <div className="home-wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Reveal y={8}>
              <span className={`${eyebrow} text-green`}>
                <ContentText>Where The Work Happens</ContentText>
              </span>
            </Reveal>
            <Heading
              text="Born in Kashmir. {Working across the Himalayas.}"
              tone="leaf"
              className="text-h2"
            />
            <Reveal delay={0.1} className="space-y-6">
              <p className="text-body text-forest/80">
                <ContentText>
                  Zeebaran’s operations are rooted in the Kashmir Valley, where it is operating
                  high-density mother nurseries, orchards, field teams, biological research labs,
                  processing centers, and cold chain post-harvest infrastructure within one of the
                  world&apos;s most demanding horticultural environments.
                </ContentText>
              </p>
              <p className="text-body text-forest/80">
                <ContentText>
                  The experience continues to inform Zeebaran&apos;s work across the wider Himalayan
                  fruit growing region, bringing modern orchard principles to alpine farming
                  communities.
                </ContentText>
              </p>
              <p className="inline-flex items-center gap-2 pt-2 text-eyebrow font-bold uppercase tracking-[0.14em] text-forest">
                <span
                  className="himalayas-location-dot size-2.5 shrink-0 rounded-full bg-leaf"
                  aria-hidden="true"
                />
                <ContentText>Srinagar · Pulwama · Shopian · Baramulla · Anantnag</ContentText>
              </p>
            </Reveal>
          </div>
          <Reveal className="relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-green/10 bg-cream/60 p-8 lg:col-span-7">
            <svg
              className="h-full w-full max-w-lg drop-shadow-sm"
              fill="none"
              viewBox="0 0 600 300"
              role="img"
              aria-label="Stylised map of the Himalayan belt with Kashmir marked"
            >
              <path
                d="M50 240 C 150 180, 220 120, 310 90 C 400 60, 490 80, 560 130"
                stroke="#123B25"
                strokeDasharray="4 4"
                strokeOpacity="0.3"
                strokeWidth="2"
              />
              <path
                d="M30 260 C 160 210, 260 140, 360 110 C 450 85, 520 100, 580 160"
                stroke="#123B25"
                strokeOpacity="0.2"
                strokeWidth="1.5"
              />
              <ContentSvgText
                fill="#123B25"
                fillOpacity="0.4"
                fontSize="11"
                fontWeight="700"
                letterSpacing="2"
                x="360"
                y="64"
              >
                THE HIMALAYAN BELT
              </ContentSvgText>
              <circle
                className="himalayas-marker-ripple"
                cx="210"
                cy="160"
                fill="#8CC63F"
                fillOpacity="0.2"
                r="28"
              />
              <circle
                className="himalayas-marker-breath"
                cx="210"
                cy="160"
                fill="#06642D"
                fillOpacity="0.3"
                r="14"
              />
              <circle cx="210" cy="160" fill="#06642D" r="6" />
              <line stroke="#06642D" strokeWidth="1.5" x1="210" x2="210" y1="160" y2="205" />
              <rect fill="#06642D" height="26" rx="13" width="90" x="165" y="205" />
              <ContentSvgText
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="700"
                letterSpacing="1"
                textAnchor="middle"
                x="210"
                y="222"
              >
                KASHMIR
              </ContentSvgText>
            </svg>
            <p className="mt-4 w-full text-center text-[0.6875rem] font-bold uppercase tracking-widest text-forest/70">
              <ContentText>
                Elevation: 1,500m – 2,700m AMSL · High Altitude Horticulture
              </ContentText>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────── Zeebaran Hub (dark panel) ───────── */
export function HubPanel() {
  return (
    <section id="zeebaran-hub" className="bg-cream py-16 sm:py-24">
      <div className="home-wrap">
        <div className="relative overflow-hidden rounded-3xl bg-forest p-6 text-white shadow-2xl sm:p-12 lg:p-16">
          <HubBackdrop />
          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <Reveal y={8}>
                <span className={`${eyebrow} block text-leaf`}>
                  <ContentText>Zeebaran Hub · The Field Layer</ContentText>
                </span>
              </Reveal>
              <Heading
                text="The final harvest {is not fruit.}"
                tone="leaf"
                className="text-h2 !text-white"
              />
              <Reveal delay={0.1} className="space-y-6">
                <p className="text-body text-white/80">
                  <ContentText>
                    <ContentText>
                      Zeebaran Hub is built around a simple principle: every improvement in
                      horticulture passes through three distinct steps. A grower must be able to
                    </ContentText>
                    <ContentText></ContentText>{" "}
                  </ContentText>
                  <strong>
                    <ContentText>access knowledge</ContentText>
                  </strong>{" "}
                  <ContentText>
                    <ContentText>and capability, receive the right</ContentText>
                    <ContentText></ContentText>{" "}
                  </ContentText>
                  <strong>
                    <ContentText>advice</ContentText>
                  </strong>{" "}
                  <ContentText>at the right time, and ultimately </ContentText>
                  <strong>
                    <ContentText>adopt</ContentText>
                  </strong>
                  <ContentText> </ContentText>
                  <ContentText>better practice in the orchard.</ContentText>
                </p>
                <p className="border-l border-leaf/40 pl-4 font-serif text-small italic text-white/70">
                  <ContentText>
                    “The gap isn’t effort. It’s access to advice to adoption — so low technical
                    knowledge becomes better decisions, healthier orchards, and more resilient
                    livelihoods.”
                  </ContentText>
                </p>
                <Link
                  href="/zeebaran-hub"
                  className="group inline-flex items-center gap-2 pt-2 text-eyebrow font-bold uppercase tracking-[0.18em] text-leaf transition-colors hover:text-white"
                >
                  <span>
                    <ContentText>Visit Zeebaran Hub Locations</ContentText>
                  </span>
                  <span aria-hidden>
                    <ContentText>→</ContentText>
                  </span>
                </Link>
              </Reveal>
            </div>
            <Stagger gap={0.12} className="space-y-4 lg:col-span-6">
              {adoption.map((a) => (
                <Item key={a.tag}>
                  <div
                    className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
                      a.active
                        ? "border-leaf/50 bg-white/15"
                        : "border-white/10 bg-white/10 hover:border-leaf/50"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase ${a.active ? "btn-orange bg-orange text-white" : "bg-leaf text-forest"}`}
                      >
                        <ContentText>{a.tag}</ContentText>
                      </span>
                      <h3 className="text-small font-bold uppercase tracking-wider !text-white">
                        <ContentText>{a.title}</ContentText>
                      </h3>
                    </div>
                    <p
                      className={`pl-10 text-small leading-relaxed ${a.active ? "text-white/90" : "text-white/80"}`}
                    >
                      <ContentText>{a.body}</ContentText>
                    </p>
                  </div>
                </Item>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Final harvest ───────── */
export function FinalHarvest() {
  return (
    <section className="border-t border-green/10 bg-cream py-16 sm:py-24">
      <div className="home-wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6" y={30}>
            <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-white shadow-xl sm:aspect-[4/3]">
              <Image
                src="asset:orchards/pampore-valley-jpg"
                alt="Himalayan valley settlements and orchards"
                fill
                sizes="(min-width: 1024px) 590px, 100vw"
                className="img-pan-up object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-xs font-semibold text-white/90">
                <ContentText>Pampore &amp; South Kashmir Valley Canopy</ContentText>
              </span>
            </div>
          </Reveal>
          <div className="space-y-6 lg:col-span-6">
            <Heading text="The final harvest {is not fruit.}" className="text-h2" />
            <Reveal delay={0.1} className="space-y-6">
              <p className="text-body text-forest/80">
                <ContentText>
                  It is what remains with the people, the land, and the generations that follow.
                </ContentText>
              </p>
              <p className="text-small text-forest/80">
                <ContentText>
                  Zeebaran’s purpose extends beyond the harvest. The aim is to leave growers with
                  greater knowledge, stronger choices, and a lasting ability to make better
                  decisions — so that each season builds consistently on the one before it.
                </ContentText>
              </p>
              <ul className="grid grid-cols-1 gap-4 border-t border-green/10 pt-4 sm:grid-cols-2">
                {outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2.5">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-green" />
                    <span className="text-small font-semibold text-forest">
                      <ContentText>{o}</ContentText>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link href="/impact" className={arrowLink}>
                  <span>
                    <ContentText>See what has changed</ContentText>
                  </span>
                  <span aria-hidden>
                    <ContentText>→</ContentText>
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Legacy CTA ───────── */
export function Legacy() {
  return (
    <section id="legacy" className="py-16 sm:py-24">
      <div className="home-wrap">
        <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-3xl border border-green/10 p-8 shadow-2xl sm:p-16">
          <Image
            src="asset:banners/home/legacy-sunset-jpg"
            alt="Himalayan valley orchards at sunset"
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="img-breathe object-cover"
          />
          <Reveal className="relative z-10 w-full max-w-2xl">
            <div className="rounded-3xl border border-white bg-white/[0.93] p-8 text-center shadow-xl sm:p-12">
              <Heading
                text="Some things are grown {for those who come after us.}"
                tone="leaf"
                className="mb-4 text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] leading-[1.12] tracking-[-0.02em]"
              />
              <p className="mb-6 text-body text-forest/80">
                <ContentText>
                  Zeebaran is building for the long term. Working alongside growers, researchers,
                  institutions, technology partners, and long-term capital to strengthen
                  horticulture across the Himalayas.
                </ContentText>
              </p>
              <p className="mb-8 text-small italic text-forest/70">
                <ContentText>
                  If your work can contribute to that shared endeavor, we would be pleased to hear
                  from you.
                </ContentText>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/partnerships"
                  className="action-motion btn-orange rounded-full bg-orange px-6 py-3 text-[0.6875rem] font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-forest"
                >
                  <ContentText>Explore Partnership</ContentText>
                </Link>
                <Link
                  href="/contact"
                  className="action-motion rounded-full border border-green/20 bg-cream px-6 py-3 text-[0.6875rem] font-bold uppercase tracking-widest text-forest transition-colors hover:bg-cream/80"
                >
                  <ContentText>Contact Zeebaran</ContentText>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
