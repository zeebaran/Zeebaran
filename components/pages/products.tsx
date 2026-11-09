import { nurseryEnquiry, whatsappAvailable } from "@/lib/nursery-enquiry";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Eyebrow, TextLink } from "@/components/ui";
import { SectionHead, CtaBand } from "@/components/sections";
import { Photo } from "@/components/Photo";
import { PRODUCTS, type Product } from "@/lib/products-content";
import type { SceneVariant } from "@/components/Scene";
import type { CSSProperties } from "react";

const seasonColour: Record<string, string> = {
  Early: "bg-leaf/20 text-green",
  Mid: "bg-orange/15 text-[#a34404]",
  Late: "bg-forest/10 text-forest",
  "Very Late": "bg-green/10 text-green",
};

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-orange/15 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-[#a34404]">
      {label}
    </span>
  );
}

function SeasonPip({ season }: { season: Product["season"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider ${seasonColour[season]}`}
    >
      {season} Season
    </span>
  );
}

/* ─── Product Card (listing page) ─────────────────────────────────────────── */
function ProductCard({ p }: { p: Product }) {
  const whatsapp = nurseryEnquiry(p.name);
  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      {/* image / scene */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Photo
          src={p.image}
          alt={p.name + " apples"}
          variant={(p.sceneVariant as SceneVariant) ?? "orchard"}
          seed={p.sceneSeed ?? 3}
          className="absolute inset-0 transition-transform duration-700 "
          sizes="(min-width:1280px) 25vw,(min-width:768px) 33vw, 100vw"
        />
        {/* season pip overlay */}
        <div className="absolute left-3 top-3">
          <SeasonPip season={p.season} />
        </div>
        {p.badge && (
          <div className="absolute right-3 top-3">
            <Badge label={p.badge} />
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="micro mb-1 block">{p.origin}</span>
        <h3 className="text-h3 font-semibold leading-tight text-forest">
          {p.name}
          {p.localName && p.localName !== p.name && (
            <span className="ml-1.5 font-serif text-[0.95em] font-normal italic text-muted">
              {p.localName}
            </span>
          )}
        </h3>

        <p className="mt-3 line-clamp-3 text-small text-muted">{p.intro}</p>

        {/* key metrics strip */}
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-[0.75rem]">
          <div>
            <dt className="eyebrow mb-0.5 block text-[0.6rem]">Harvest</dt>
            <dd className="text-forest/80">{p.seasonMonths}</dd>
          </div>
          <div>
            <dt className="eyebrow mb-0.5 block text-[0.6rem]">Sugar (°Bx)</dt>
            <dd className="text-forest/80">{p.brix}</dd>
          </div>
          <div>
            <dt className="eyebrow mb-0.5 block text-[0.6rem]">CA Storage</dt>
            <dd className="text-forest/80">{p.storageLife}</dd>
          </div>
          <div>
            <dt className="eyebrow mb-0.5 block text-[0.6rem]">Rootstocks</dt>
            <dd className="text-forest/80">{p.rootstocks.map((r) => r.code).join(", ")}</dd>
          </div>
        </dl>

        {/* actions — mt-auto pins this to the card bottom regardless of content height */}
        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-5">
          <TextLink href={`/products/${p.slug}`}>Full details</TextLink>
          <a
            href={whatsapp}
            target={whatsappAvailable ? "_blank" : undefined}
            rel={whatsappAvailable ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 rounded-full bg-green px-4 py-2 text-[0.75rem] font-semibold text-white shadow-sm transition hover:bg-forest active:scale-[0.98]"
            aria-label={`Enquire about ${p.name} `}
          >
            {/* WhatsApp icon inline SVG */}
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            Enquire
          </a>
        </div>
      </div>
    </article>
  );
}

/* ─── Season Filter Legend ─────────────────────────────────────────────────── */
function SeasonLegend() {
  return (
    <Reveal className="flex flex-wrap items-center gap-3">
      <span className="micro mr-1 text-muted">Harvest windows:</span>
      {(["Early", "Mid", "Late", "Very Late"] as const).map((s) => (
        <SeasonPip key={s} season={s} />
      ))}
    </Reveal>
  );
}

/* ─── Scattered photo collage for hero right side ─────────────────────────── */
// Order: top-left, top-right, CENTRE (Red Delicious — largest, z:3), bottom-left, bottom-right
const COLLAGE_TILES: {
  src: string;
  alt: string;
  rotate: number;
  top: string;
  left: string;
  w: string;
  radius: string;
  z: number;
}[] = [
  {
    src: "/images/Varrients/Apples/Royal Gala.webp",
    alt: "Royal Gala apples",
    rotate: -8,
    top: "2%",
    left: "4%",
    w: "46%",
    radius: "62% 38% 52% 48% / 55% 48% 52% 45%",
    z: 2,
  },
  {
    src: "/images/Varrients/Apples/Fuji Apple.webp",
    alt: "Fuji apples",
    rotate: 6,
    top: "0%",
    left: "50%",
    w: "44%",
    radius: "40% 60% 45% 55% / 50% 42% 58% 50%",
    z: 1,
  },
  {
    // Red Delicious — centre, largest, highest z
    src: "/images/Varrients/Apples/Red Delicious.webp",
    alt: "Red Delicious apples",
    rotate: -3,
    top: "30%",
    left: "20%",
    w: "58%",
    radius: "50% 50% 60% 40% / 45% 55% 45% 55%",
    z: 4,
  },
  {
    src: "/images/Varrients/Apples/Golden Delicious.webp",
    alt: "Golden Delicious apples",
    rotate: 9,
    top: "60%",
    left: "2%",
    w: "40%",
    radius: "35% 65% 55% 45% / 55% 40% 60% 45%",
    z: 2,
  },
  {
    src: "/images/Varrients/Apples/Granny Smith.webp",
    alt: "Granny Smith apples",
    rotate: -5,
    top: "58%",
    left: "50%",
    w: "46%",
    radius: "55% 45% 38% 62% / 48% 60% 40% 52%",
    z: 1,
  },
];

function PhotoCollage() {
  return (
    /*
     * Responsive container:
     * – mobile  : full wrap width, capped at 480 px, height scales via clamp
     * – desktop : fixed 480 px column beside the text (set by parent grid)
     * overflow-hidden clips tiles that escape the boundary at the edges;
     * paddingBottom gives shadow room before the clip.
     */
    <div
      className="pointer-events-none relative mx-auto w-full select-none"
      style={{
        maxWidth: 480,
        height: "clamp(260px, 60vw, 480px)",
        paddingBottom: 20,
        overflow: "hidden",
      }}
      aria-hidden
    >
      {COLLAGE_TILES.map((t, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: t.top,
            left: t.left,
            width: t.w,
            zIndex: t.z,
            borderRadius: t.radius,
            transform: `rotate(${t.rotate}deg)`,
            /* white photo-print border — responsive thickness */
            padding: "clamp(5px,1.2vw,8px) clamp(5px,1.2vw,8px) clamp(14px,3.5vw,22px)",
            background: "#fff",
            boxShadow: "0 4px 24px -6px rgba(18,59,37,0.22), 0 1px 4px rgba(18,59,37,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "4/3",
              borderRadius: "inherit",
              overflow: "hidden",
            }}
          >
            <Image
              src={t.src}
              alt={t.alt}
              fill
              className="object-cover"
              sizes="(min-width:1024px) 220px, 45vw"
              /* only the centre tile (index 2) is likely above-fold on desktop */
              priority={i === 2}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page Sections ────────────────────────────────────────────────────────── */
function ProductsHero() {
  return (
    <section className="hero-wash relative overflow-hidden pb-14 pt-[4.5rem] sm:pt-[6.5rem] md:pb-20">
      <div className="wrap">
        <div className="grid items-center gap-6 sm:gap-10 lg:grid-cols-[1fr_480px] lg:gap-12">
          {/* ── left: text ── */}
          <div>
            <div className="hero-rise mb-5">
              <Eyebrow>Plant Material &amp; Varieties</Eyebrow>
            </div>
            <Heading
              as="h1"
              immediate
              delay={0.1}
              text="International {varieties.} Himalayan roots."
              className="text-display max-w-[16ch]"
            />
            <div
              className="hero-rise mt-7 max-w-[36rem] space-y-4 text-lead text-muted"
              style={{ "--d": "0.35s" } as CSSProperties}
            >
              <p>
                Every variety Zeebaran supplies comes from certified, virus-indexed clonal mother
                blocks. We match rootstock to elevation, soil type, and market destination — not
                just what is available.
              </p>
              <p>
                Select any variety to explore its agronomy profile, rootstock options, and harvest
                calendar. Enquire about a variety to reach our horticultural team.
              </p>
            </div>
          </div>

          {/* ── right: scattered photo collage ── */}
          <PhotoCollage />
        </div>
      </div>
    </section>
  );
}

function IntroStrip() {
  const stats = [
    { n: "8", label: "Varieties available" },
    { n: "4", label: "Certified rootstocks" },
    { n: "100%", label: "Virus-indexed stock" },
    { n: "GI", label: "Ambri certification" },
  ];
  return (
    <section className="border-t border-line bg-white py-8">
      <div className="wrap">
        <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <Item key={s.label}>
              <div className="text-center">
                <span className="block font-serif text-[2.25rem] font-semibold leading-none tracking-tight text-green">
                  {s.n}
                </span>
                <span className="mt-1 block text-[0.75rem] text-muted">{s.label}</span>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function ProductGrid() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHead eyebrow="Our variety portfolio" title="Choose your {variety.}" />
          <SeasonLegend />
        </div>
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRODUCTS.map((p) => (
            <Item key={p.slug} className="h-full">
              <ProductCard p={p} />
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function RootstockGuide() {
  const rootstocks = [
    {
      code: "M9",
      title: "M9 — High Density",
      system: "1.0–1.5 m × 3.5 m",
      yield: "40–60 MT/ha",
      best: "Export orchards, premium growers with drip irrigation",
      desc: "Industry benchmark for high-density orchards worldwide. Requires permanent support but delivers the highest return per hectare.",
    },
    {
      code: "M26",
      title: "M26 — Medium-High Density",
      system: "1.5–2.0 m × 3.5 m",
      yield: "30–45 MT/ha",
      best: "Transition orchards, growers moving from traditional to intensive",
      desc: "Better anchorage than M9. Ideal for growers upgrading their system without full support infrastructure investment.",
    },
    {
      code: "MM106",
      title: "MM106 — Semi-Vigorous",
      system: "2.5–3.5 m × 4.5 m",
      yield: "20–35 MT/ha",
      best: "Sloped terrain, rain-fed plots, traditional grower contexts",
      desc: "Deeper rooting and drought tolerance. Suits J&K's diverse terrain and growers without irrigation infrastructure.",
    },
    {
      code: "M7",
      title: "M7 — Semi-Dwarfing",
      system: "2.0–2.5 m × 4.0 m",
      yield: "25–40 MT/ha",
      best: "Traditional orchard upgrades, medium-density systems",
      desc: "A reliable workhorse for J&K conditions. Good for growers upgrading from seedling rootstock without infrastructure change.",
    },
  ];
  return (
    <section className="section bg-cream/50">
      <div className="wrap">
        <SectionHead
          eyebrow="Rootstock selection"
          title="The right root makes {every difference.}"
          className="mb-10"
        >
          <p>
            Rootstock determines planting density, yield potential, orchard life, and infrastructure
            requirement. Zeebaran&apos;s horticultural team recommends rootstock based on your
            elevation, soil profile, water availability, and market plan — not one-size-fits-all.
          </p>
        </SectionHead>
        <div className="grid gap-4 sm:grid-cols-2">
          {rootstocks.map((r, i) => {
            const delay = (i % 2) * 0.08;
            return (
              <Reveal key={r.code} delay={delay}>
                <div className="card flex h-full flex-col p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="micro block">{r.code}</span>
                      <h3 className="mt-1 text-[1.0625rem] font-semibold text-forest">{r.title}</h3>
                    </div>
                    <span className="shrink-0 rounded-full border border-green/20 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-green">
                      {r.yield}
                    </span>
                  </div>
                  <dl className="mt-4 border-t border-line pt-4 text-small">
                    <div className="kv">
                      <dt>Spacing</dt>
                      <dd>{r.system}</dd>
                    </div>
                    <div className="kv">
                      <dt>Best for</dt>
                      <dd className="text-muted">{r.best}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-small text-muted">{r.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* WhatsApp rootstock advice CTA */}
        <Reveal delay={0.15} className="mt-10">
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="micro block">Not sure which rootstock?</span>
                <p className="mt-1 max-w-xl text-body font-medium text-forest">
                  Our horticultural team will assess your plot, elevation, and market plan and
                  recommend the right rootstock before you invest.
                </p>
              </div>
              <a
                href={nurseryEnquiry()}
                target={whatsappAvailable ? "_blank" : undefined}
                rel={whatsappAvailable ? "noopener noreferrer" : undefined}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-green px-6 py-3 text-[0.8125rem] font-semibold text-white shadow transition hover:bg-forest active:scale-[0.98]"
              >
                <MessageCircle className="size-4 shrink-0" aria-hidden />
                Get Rootstock Advice
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ProductsCta() {
  return (
    <CtaBand
      title="Ready to plant? {Let's talk varieties.}"
      body="Our horticultural team works with each grower on variety selection, planting schedules, and rootstock matching based on your elevation, soil, and market plan."
      primary={{ href: "/contact", label: "Talk to our team" }}
      secondary={{ href: "/platform", label: "Our full platform" }}
      src="/images/Varrients/Apples/varrient banner.webp"
      variant="hills"
    />
  );
}

/* ─── Page Export ──────────────────────────────────────────────────────────── */
export function ProductsPage() {
  return (
    <>
      <ProductsHero />
      <IntroStrip />
      <ProductGrid />
      <RootstockGuide />
      <div className="py-8 sm:py-12" />
      <ProductsCta />
    </>
  );
}
