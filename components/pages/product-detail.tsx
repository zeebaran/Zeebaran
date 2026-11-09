import { NurseryEnquiry } from "./NurseryEnquiry";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Eyebrow } from "@/components/ui";
import { Photo } from "@/components/Photo";
import { PRODUCTS, type Product } from "@/lib/products-content";
import type { SceneVariant } from "@/components/Scene";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* ─── Metric tile ──────────────────────────────────────────────────────────── */
function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <span className="block font-serif text-[1.5rem] font-semibold leading-none tracking-tight text-green">
        {value}
      </span>
      <span className="mt-1.5 block text-[0.6875rem] uppercase tracking-wider text-muted">
        {label}
      </span>
    </div>
  );
}

/* ─── Detail Page ──────────────────────────────────────────────────────────── */
export function ProductDetailPage({ product }: { product: Product }) {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="hero-wash relative overflow-hidden pb-10 pt-[4.5rem] sm:pt-[6.5rem]">
        <div className="wrap">
          {/* back nav */}
          <div className="hero-rise mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[0.75rem] font-medium text-muted transition hover:text-green"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              All Varieties
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
            {/* left: headline */}
            <div>
              <div className="hero-rise mb-5 flex flex-wrap items-center gap-2">
                <Eyebrow>{product.eyebrow}</Eyebrow>
                {product.badge && (
                  <span className="rounded-full bg-orange/15 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-[#FE6901]">
                    {product.badge}
                  </span>
                )}
              </div>
              <Heading
                as="h1"
                immediate
                delay={0.1}
                text={product.headline}
                className="text-display max-w-[16ch]"
              />
              <div
                className="hero-rise mt-6 max-w-2xl space-y-3 text-lead text-muted"
                style={{ "--d": "0.35s" } as React.CSSProperties}
              >
                <p>{product.intro}</p>
              </div>

              {/* quick metric grid */}
              <Reveal delay={0.4} className="mt-8">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetricTile label="Origin" value={product.origin.split(" ")[0]} />
                  <MetricTile label="Season" value={product.season} />
                  <MetricTile label="Sugar (°Bx)" value={product.brix} />
                  <MetricTile label="CA Storage" value={product.storageLife} />
                </div>
              </Reveal>
            </div>

            {/* right: image */}
            <Reveal className="order-first lg:order-none">
              <div className="relative overflow-hidden rounded-[1.25rem] shadow-lift lg:rounded-[1.5rem]">
                <Photo
                  src={product.image}
                  alt={product.name + " apples"}
                  variant={(product.sceneVariant as SceneVariant) ?? "orchard"}
                  seed={product.sceneSeed ?? 3}
                  className="aspect-[4/3] lg:aspect-[3/4]"
                  sizes="(min-width:1024px) 420px, 100vw"
                  priority
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SPECS TABLE ──────────────────────────────────────────── */}
      <section className="section border-t border-line">
        <div className="wrap">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
            {/* left: full detail */}
            <div>
              {/* key-value spec table */}
              <Reveal>
                <h2 className="text-h3 font-semibold text-forest">Variety Profile</h2>
              </Reveal>
              <Reveal delay={0.05}>
                <dl className="mt-5 border-b border-line">
                  {[
                    ["Origin", product.origin],
                    ["Local Name", product.localName ?? "—"],
                    ["Season", `${product.season} (${product.seasonMonths})`],
                    ["Colour", product.colour],
                    ["Flavour", product.flavour],
                    ["Sugar Content", product.brix],
                    ["Firmness", product.firmness],
                    ["Ambient Shelf Life", product.shelfLife],
                    ["CA Storage Life", product.storageLife],
                    ["Market Class", product.marketClass],
                  ].map(([k, v]) => (
                    <div key={k} className="kv">
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              {/* highlights */}
              <Reveal delay={0.1} className="mt-10">
                <h2 className="text-h3 font-semibold text-forest">Why Growers Choose It</h2>
                <ul className="mt-5 space-y-3">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-body text-forest/85">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-green" />
                      {h}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* agronomy */}
              <Reveal delay={0.15} className="mt-10">
                <h2 className="text-h3 font-semibold text-forest">Agronomy Notes</h2>
                <p className="mt-4 text-body leading-relaxed text-muted">{product.agronomyNotes}</p>
              </Reveal>
            </div>

            {/* right: sticky enquiry panel */}
            <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
              <NurseryEnquiry product={{ name: product.name, rootstocks: product.rootstocks }} />

              {/* rootstock detail cards */}
              <div className="mt-6">
                <h3 className="mb-4 text-[0.875rem] font-semibold text-forest">
                  Rootstock options for {product.name}
                </h3>
                <Stagger className="space-y-3">
                  {product.rootstocks.map((r) => (
                    <Item key={r.code}>
                      <div className="rounded-xl border border-line bg-white p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="micro block">{r.system}</span>
                            <span className="mt-0.5 block text-[0.875rem] font-semibold text-forest">
                              {r.code}
                            </span>
                          </div>
                          <span className="shrink-0 rounded-full bg-leaf/15 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-green">
                            {r.yield}
                          </span>
                        </div>
                        <dl className="mt-2 space-y-0.5 text-[0.75rem] text-muted">
                          <div className="flex gap-2">
                            <dt className="shrink-0 font-medium text-forest/70">Spacing:</dt>
                            <dd>{r.spacing}</dd>
                          </div>
                        </dl>
                        <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">{r.note}</p>
                      </div>
                    </Item>
                  ))}
                </Stagger>
              </div>

              {/* contact fallback */}
              <div className="mt-5 rounded-xl border border-line bg-cream/80 p-4 text-center">
                <p className="text-[0.75rem] text-muted">
                  Prefer a detailed conversation?{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-green underline underline-offset-2"
                  >
                    Use our inquiry form
                  </Link>{" "}
                  for a written response from our horticultural team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED VARIETIES ──────────────────────────────────── */}
      <RelatedVarieties current={product.slug} season={product.season} />
    </>
  );
}

/* ─── Related Varieties strip ──────────────────────────────────────────────── */
function RelatedVarieties({ current, season }: { current: string; season: Product["season"] }) {
  const related = PRODUCTS.filter((p) => p.slug !== current)
    .sort((a, b) => Number(b.season === season) - Number(a.season === season))
    .slice(0, 3);

  return (
    <section className="section border-t border-line bg-cream/40">
      <div className="wrap">
        <SectionHead eyebrow="Explore more" title="Other {varieties} in our portfolio" />
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-3">
          {related.map((p) => (
            <Item key={p.slug}>
              <Link
                href={`/products/${p.slug}`}
                className="card card-hover group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Photo
                    src={p.image}
                    alt={p.name + " apples"}
                    variant={(p.sceneVariant as SceneVariant) ?? "orchard"}
                    seed={p.sceneSeed ?? 3}
                    className="absolute inset-0 transition-transform duration-500 "
                    sizes="(min-width:1024px) 30vw, 100vw"
                  />
                </div>
                <div className="p-4">
                  <span className="micro block">{p.origin}</span>
                  <span className="mt-1 block font-semibold text-forest group-hover:text-green">
                    {p.name}
                  </span>
                  <span className="mt-1 block text-[0.75rem] text-muted">{p.seasonMonths}</span>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[44rem] ${className}`}>
      {eyebrow && (
        <Reveal y={8}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Heading text={title} className="mt-5 text-h2" />
      {children && (
        <Reveal delay={0.15} className="mt-5 space-y-4 text-body text-muted">
          {children}
        </Reveal>
      )}
    </div>
  );
}
