import { RegionMap } from "@/features/contact/RegionMap";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { conversations, firstMessage, hubs } from "@/lib/content";
import { SITE } from "@/lib/site";
import type { CSSProperties } from "react";

const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em] text-green";
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const wrap = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export function ContactHero() {
  return (
    <section className="pb-16 pt-16 sm:pb-24 sm:pt-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="hero-rise mb-6 flex items-center gap-3">
          <span aria-hidden className="h-[1.5px] w-8 bg-green" />
          <span className={eyebrow}>Contact Zeebaran</span>
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
            Zeebaran works with growers, researchers, institutions, technology partners, long-term
            capital, and others committed to strengthening horticultural systems across the
            Himalayas.
          </p>
          <p className="font-medium text-forest">
            Whether you have a question, an idea, a proposal, or the beginning of a partnership,
            we&apos;d welcome the opportunity to understand what you&apos;re working on - and
            explore where a useful connection might exist.
          </p>
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
            Where to write · Institutional channels
          </span>
          <span className="rounded-full border border-line bg-white px-3 py-1 text-[0.75rem] text-forest/75">
            Dedicated triage across 5 Himalayan working disciplines
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
                      {c.n}
                    </span>
                    <span className="rounded-full bg-green/10 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-green">
                      {c.note}
                    </span>
                  </div>
                  <h3 className="mb-2.5 mt-1 text-[1.0625rem] font-bold text-forest">{c.title}</h3>
                  <p className="mb-4 text-small text-forest/75">{c.body}</p>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Focus areas">
                    {c.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded border border-line bg-cream/60 px-2 py-0.5 text-[0.6875rem] font-medium text-forest/80"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-4">
                  <Link
                    href={`/contact?reason=${c.reason}#write`}
                    className="inline-flex items-center gap-1.5 text-small font-semibold text-green transition-colors hover:text-forest"
                  >
                    {c.cta}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    className="font-mono text-[0.6875rem] text-forest/75 underline-offset-4 hover:underline"
                    href={`mailto:${c.mail}`}
                  >
                    {c.mail}
                  </a>
                </div>
              </article>
            </Item>
          ))}
          <Item className="h-full">
            <article className="flex h-full flex-col justify-between rounded-3xl border border-line/60 bg-white p-7 shadow-sm sm:p-9">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-green">
                    Where we are
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/70 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-forest">
                    <span className="size-1.5 animate-pulse rounded-full bg-leaf" />
                    IST 09:00–18:30
                  </span>
                </div>
                <h3 className="mb-3 mt-1 text-[1.0625rem] font-bold text-forest">
                  Srinagar &amp; New Delhi
                </h3>
                <dl>
                  <div className="kv">
                    <dt>Email</dt>
                    <dd>
                      <a
                        className="font-semibold text-green underline-offset-4 hover:underline"
                        href={`mailto:${SITE.email}`}
                      >
                        {SITE.email}
                      </a>
                    </dd>
                  </div>
                  {SITE.addresses.map((a) => (
                    <div className="kv" key={a.label}>
                      <dt>{a.label}</dt>
                      <dd>
                        <span className="block font-medium text-forest">{a.lines.join(", ")}</span>
                        <span className="mt-0.5 block text-[0.75rem] text-forest/75">{a.note}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
                <span className="flex items-center gap-1.5 text-[0.75rem] font-medium text-forest/80">
                  <span aria-hidden className="size-2 rounded-full bg-orange" />
                  Emergency grower desk: <strong className="text-forest">{SITE.phone}</strong>
                </span>
                <a
                  href="#map-section"
                  className="text-[0.75rem] font-semibold text-green hover:underline"
                >
                  Explore Field Hubs ↓
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
  const accents = ["text-green", "text-green", "text-green", "text-green"];
  return (
    <section id="map-section" className="scroll-mt-24 pb-16 sm:pb-24">
      <div className={wrap}>
        <div className="overflow-hidden rounded-3xl border border-line/60 bg-white p-6 shadow-sm sm:p-12">
          <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
            <div>
              <Reveal y={8}>
                <span className={`${eyebrow} mb-3 inline-flex items-center gap-2`}>
                  <span aria-hidden className="size-2 rounded-full bg-green" />
                  Operational topography
                </span>
              </Reveal>
              <Heading
                tone="leaf"
                text="Himalayan corridor {& regional hubs.}"
                className="text-h2"
              />
              <p className="mt-3 max-w-2xl text-small text-forest/75">
                From high-density apple terraces in Baramulla to Lassipora&apos;s industrial CA cold
                storages and New Delhi&apos;s terminal market corridors, our operational presence
                spans critical points of the mountain value chain.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line bg-cream px-3 py-1.5 text-[0.6875rem] font-bold text-forest">
                5 Regional Hubs
              </span>
              <span className="rounded-full border border-green/20 bg-green/10 px-3 py-1.5 text-[0.6875rem] font-bold text-green">
                1,580m – 2,250m AMSL
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 items-center gap-8 pt-8 lg:grid-cols-12">
            <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-2xl border border-line/60 bg-cream p-5 sm:p-8 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-x-3 font-mono text-[0.6875rem] text-forest/75">
                <span>KASHMIR BASIN &amp; TRANS-HIMALAYAN TRANSIT</span>
                <span>34.0837° N, 74.7973° E</span>
              </div>
              <div className="my-6 flex w-full items-center justify-center">
                <RegionMap />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-3 text-[0.6875rem] text-forest/80">
                {[
                  ["bg-orange", "HQ Command"],
                  ["bg-green", "Cold-Chain & Aggregation"],
                  ["bg-leaf", "Field Validation"],
                ].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span aria-hidden className={`size-2 rounded-full ${c}`} /> {l}
                  </span>
                ))}
              </div>
            </div>
            <Stagger gap={0.07} className="space-y-3 lg:col-span-5">
              {hubs.map((h, i) => (
                <Item key={h.title}>
                  <div className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-colors hover:border-green/40">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[0.8125rem] font-bold text-forest">{h.title}</h3>
                      <span className="shrink-0 rounded bg-cream px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-green">
                        {h.place}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.75rem] text-forest/75">{h.body}</p>
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 font-mono text-[0.625rem] text-forest/75">
                      <span>{h.facts[0]}</span>
                      <span className={`font-bold ${accents[i]}`}>{h.facts[1]}</span>
                    </div>
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

export function WriteIntro() {
  return (
    <div className="lg:pr-6">
      <Reveal y={8}>
        <span className={eyebrow}>Write to us</span>
      </Reveal>
      <Heading tone="leaf" text="A useful {first message.}" className="mb-6 mt-3 text-h2" />
      <Reveal delay={0.1}>
        <p className="mb-8 text-body font-medium text-forest/80">
          To help us understand your enquiry, it is helpful to include:
        </p>
        <ul className="divide-y divide-line text-small text-forest/80">
          {firstMessage.map((m) => (
            <li key={m} className="flex items-start gap-3 py-3 first:pt-0">
              <span aria-hidden className="select-none font-bold leading-snug text-green">
                —
              </span>
              <span>{m}</span>
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
            src="/images/himalayan-valley-settlements-and-orchards-30d80.webp"
            variant="hills"
            seed={14}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
          <Reveal className="relative z-10 max-w-3xl">
            <h2 className="font-serif text-[clamp(1.9rem,1.3rem+2.4vw,3.25rem)] font-normal leading-[1.12] text-white">
              Born in Kashmir.
              <br />
              <span className="italic text-leaf">Working across the Himalayas.</span>
            </h2>
            <p
              aria-hidden
              className="mt-6 font-serif text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-bold italic tracking-tight text-white/90"
            >
              zeebaran
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
