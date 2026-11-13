import {
  DeskEmailLink,
  OfficeAddresses,
  SiteEmailLink,
  SitePhoneLink,
} from "@/features/site/ContactDetails";
import { ContentText } from "@/features/cms/Content";
import { RegionMap, RegionalHubReference } from "@/features/contact/RegionMap";
import { RegionalHubDisplay, RegionalHubCount } from "@/features/contact/RegionalHubDisplay";
import { ContentLink as Link } from "@/features/cms/Content";
import { ArrowRight } from "lucide-react";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { conversations, firstMessage } from "@/lib/content";
import type { CSSProperties } from "react";
import { ContactIllustration } from "@/components/contact/ContactIllustration";
import heroStyles from "@/components/contact/contact-hero.module.css";

const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em] text-green";
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const wrap = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export function ContactHero() {
  return (
    <section className="pb-16 pt-16 sm:pb-24 sm:pt-24">
      <div className={heroStyles.layout + " mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8"}>
        <div className="hero-rise mb-6 flex items-center gap-3">
          <span aria-hidden className="h-[1.5px] w-8 bg-green" />
          <span className={eyebrow}>
            <ContentText>Contact Zeebaran</ContentText>
          </span>
        </div>
        <Heading
          as="h1"
          immediate
          delay={0.1}
          tone="leaf"
          text="Begin {a conversation.}"
          className="text-display"
        />
        <div className="hero-rise mt-8 max-w-2xl space-y-4 text-lead text-forest/80" style={d(0.3)}>
          <p>
            <ContentText>
              Zeebaran works with growers, researchers, institutions, technology partners, long-term
              capital, and others committed to strengthening horticultural systems across the
              Himalayas.
            </ContentText>
          </p>
          <p className="font-medium text-forest">
            <ContentText>
              Whether you have a question, an idea, a proposal, or the beginning of a partnership,
              we&apos;d welcome the opportunity to understand what you&apos;re working on - and
              explore where a useful connection might exist.
            </ContentText>
          </p>
        </div>
        <div className={heroStyles.illustration} data-contact-illustration>
          <ContactIllustration />
        </div>
      </div>
    </section>
  );
}

export function Channels() {
  return (
    <section className="pb-16 sm:pb-24">
      <div className={wrap}>
        <Reveal y={8} className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className={`${eyebrow} inline-flex items-center gap-2`}>
            <span aria-hidden className="size-2 rounded-full bg-leaf" />
            <ContentText>Where to write · Institutional channels</ContentText>
          </span>
          <span className="rounded-full border border-line bg-white px-3 py-1 text-[0.75rem] text-forest/75">
            <ContentText>Dedicated triage across 5 Himalayan working disciplines</ContentText>
          </span>
        </Reveal>
        <Heading
          tone="leaf"
          text="Five conversations. {One institution.}"
          className="mb-10 text-h2 sm:mb-12"
        />
        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {conversations.map((c) => (
            <Item key={c.n} className="h-full">
              <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line/60 bg-white p-7 shadow-sm transition-shadow hover:shadow-md sm:p-9">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green to-leaf opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-[0.6875rem] font-bold tracking-wider text-forest/75">
                      <ContentText>{c.n}</ContentText>
                    </span>
                    <span className="rounded-full bg-green/10 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-green">
                      <ContentText>{c.note}</ContentText>
                    </span>
                  </div>
                  <h3 className="mb-2.5 mt-1 text-[1.0625rem] font-bold text-forest">
                    <ContentText>{c.title}</ContentText>
                  </h3>
                  <p className="mb-4 text-small text-forest/75">
                    <ContentText>{c.body}</ContentText>
                  </p>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Focus areas">
                    {c.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded border border-line bg-cream/60 px-2 py-0.5 text-[0.6875rem] font-medium text-forest/80"
                      >
                        <ContentText>{t}</ContentText>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-4">
                  <Link
                    href={`/contact?reason=${c.reason}#write`}
                    className="inline-flex items-center gap-1.5 text-small font-semibold text-green transition-colors hover:text-forest"
                  >
                    <ContentText>{c.cta}</ContentText>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <DeskEmailLink
                    className="font-mono text-[0.6875rem] text-forest/75 underline-offset-4 hover:underline"
                    channel={c.reason}
                  />
                </div>
              </article>
            </Item>
          ))}
          <Item className="h-full">
            <article className="flex h-full flex-col justify-between rounded-3xl border border-line/60 bg-white p-7 shadow-sm sm:p-9">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-green">
                    <ContentText>Where we are</ContentText>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/70 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-forest">
                    <span className="size-1.5 animate-pulse rounded-full bg-leaf" />
                    <ContentText>IST 09:00–18:30</ContentText>
                  </span>
                </div>
                <h3 className="mb-3 mt-1 text-[1.0625rem] font-bold text-forest">
                  <ContentText>Srinagar &amp; New Delhi</ContentText>
                </h3>
                <dl>
                  <div className="kv">
                    <dt>
                      <ContentText>Email</ContentText>
                    </dt>
                    <dd>
                      <SiteEmailLink className="font-semibold text-green underline-offset-4 hover:underline" />
                    </dd>
                  </div>
                  <OfficeAddresses />
                </dl>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
                <span className="flex items-center gap-1.5 text-[0.75rem] font-medium text-forest/80">
                  <span aria-hidden className="size-2 rounded-full bg-orange" />
                  <ContentText>Emergency grower desk: </ContentText>
                  <strong className="text-forest">
                    <SitePhoneLink />
                  </strong>
                </span>
                <a
                  href="#map-section"
                  className="text-[0.75rem] font-semibold text-green hover:underline"
                >
                  <ContentText>Explore Field Hubs ↓</ContentText>
                </a>
              </div>
            </article>
          </Item>
        </Stagger>
      </div>
    </section>
  );
}

export function Topography() {
  return (
    <section id="map-section" className="scroll-mt-24 pb-16 sm:pb-24">
      <div className={wrap}>
        <div className="overflow-hidden rounded-3xl border border-line/60 bg-white p-6 shadow-sm sm:p-12">
          <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
            <div>
              <Reveal y={8}>
                <span className={`${eyebrow} mb-3 inline-flex items-center gap-2`}>
                  <span aria-hidden className="size-2 rounded-full bg-green" />
                  <ContentText>Operational topography</ContentText>
                </span>
              </Reveal>
              <Heading
                tone="leaf"
                text="Himalayan corridor {& regional hubs.}"
                className="text-h2"
              />
              <p className="mt-3 max-w-2xl text-small text-forest/75">
                <ContentText>
                  From high-density apple terraces in Baramulla to Lassipora&apos;s industrial CA
                  cold storages and New Delhi&apos;s terminal market corridors, our operational
                  presence spans critical points of the mountain value chain.
                </ContentText>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line bg-cream px-3 py-1.5 text-[0.6875rem] font-bold text-forest">
                <RegionalHubCount />
              </span>
              <span className="rounded-full border border-green/20 bg-green/10 px-3 py-1.5 text-[0.6875rem] font-bold text-green">
                <ContentText>1,580m – 2,250m AMSL</ContentText>
              </span>
            </div>
          </div>
          <RegionalHubDisplay />
        </div>
      </div>
    </section>
  );
}

export function CorridorMapCard() {
  return (
    <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-2xl border border-line/60 bg-cream p-5 sm:p-8 lg:p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 font-mono text-[0.6875rem] text-forest/75">
        <span>
          <ContentText>KASHMIR BASIN &amp; TRANS-HIMALAYAN TRANSIT</ContentText>
        </span>
        <span>
          <RegionalHubReference />
        </span>
      </div>
      <div className="my-6 flex w-full items-center justify-center lg:my-1">
        <div className="w-full lg:max-w-[390px]">
          <RegionMap />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-3 text-[0.6875rem] text-forest/80 lg:pt-2">
        <ContentText>
          {[
            ["bg-orange", "HQ Command"],
            ["bg-green", "Cold-Chain & Aggregation"],
            ["bg-leaf", "Field Validation"],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span aria-hidden className={`size-2 rounded-full ${c}`} />{" "}
              <ContentText>{l}</ContentText>
            </span>
          ))}
        </ContentText>
      </div>
    </div>
  );
}

export function WriteIntro() {
  return (
    <div className="lg:pr-6">
      <Reveal y={8}>
        <span className={eyebrow}>
          <ContentText>Write to us</ContentText>
        </span>
      </Reveal>
      <Heading tone="leaf" text="A useful {first message.}" className="mb-6 mt-3 text-h2" />
      <Reveal delay={0.1}>
        <p className="mb-8 text-body font-medium text-forest/80">
          <ContentText>To help us understand your enquiry, it is helpful to include:</ContentText>
        </p>
        <ul className="divide-y divide-line text-small text-forest/80">
          {firstMessage.map((m) => (
            <li key={m} className="flex items-start gap-3 py-3 first:pt-0">
              <span aria-hidden className="select-none font-bold leading-snug text-green">
                <ContentText>—</ContentText>
              </span>
              <span>
                <ContentText>{m}</ContentText>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

export function BornInKashmir() {
  return (
    <section className="pb-16 sm:pb-24">
      <div className="home-wrap">
        <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl p-8 shadow-2xl sm:min-h-[540px] sm:p-14 lg:min-h-[600px] lg:p-16">
          <Photo
            src="asset:orchards/himalayan-valley-settlements-and-orchards-30d80-webp"
            variant="hills"
            seed={14}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
          <Reveal className="relative z-10 max-w-3xl">
            <h2 className="font-serif text-[clamp(1.9rem,1.3rem+2.4vw,3.25rem)] font-normal leading-[1.12] text-white">
              <ContentText>Born in Kashmir.</ContentText>
              <br />
              <span className="italic text-leaf">
                <ContentText>Working across the Himalayas.</ContentText>
              </span>
            </h2>
            <p
              aria-hidden
              className="mt-6 font-serif text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-bold italic tracking-tight text-white/90"
            >
              <ContentText>zeebaran</ContentText>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
