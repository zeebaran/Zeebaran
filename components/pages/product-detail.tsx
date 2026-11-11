import { ContentText } from "@/features/cms/Content";
import { NurseryEnquiry } from "./NurseryEnquiry";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Eyebrow } from "@/components/ui";
import { Photo } from "@/components/Photo";
import type { Product } from "@/features/catalog/model";
import { CompareButton } from "@/features/catalog/ComparisonProvider";
import { CatalogGallery } from "@/features/catalog/PublicSections";
import { ContentLink as Link } from "@/features/cms/Content";
import { ArrowLeft } from "lucide-react";

/* ─── Metric tile ──────────────────────────────────────────────────────────── */
function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <span className="block font-serif text-[1.25rem] font-semibold leading-tight tracking-tight text-green">
        <ContentText>{value}</ContentText>
      </span>
      <span className="mt-1.5 block text-[0.625rem] uppercase tracking-wider text-muted">
        <ContentText>{label}</ContentText>
      </span>
    </div>
  );
}

/* ─── Detail Page ──────────────────────────────────────────────────────────── */
export function ProductDetailPage({
  product,
  related = [],
}: {
  product: Product;
  related?: Product[];
}) {
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
              <div className="hero-rise mb-5 flex flex-wrap items-center gap-2 [&>.eyebrow]:text-[0.625rem]">
                <Eyebrow>{product.eyebrow}</Eyebrow>
                <ContentText>
                  {product.badge && (
                    <span className="rounded-full bg-orange/15 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-[#a34404]">
                      <ContentText>{product.badge}</ContentText>
                    </span>
                  )}
                </ContentText>
              </div>
              <Heading
                as="h1"
                immediate
                delay={0.1}
                text={product.headline}
                className="max-w-[18ch] text-[clamp(2rem,1.3rem+2.6vw,3.5rem)] leading-[1.08] tracking-[-0.025em]"
              />
              <div
                className="hero-rise mt-5 max-w-2xl space-y-3 text-[0.9375rem] leading-[1.7] text-muted sm:text-[1.0625rem]"
                style={{ "--d": "0.35s" } as React.CSSProperties}
              >
                <p>
                  <ContentText>{product.intro.replace(/\s*—\s*/g, " ")}</ContentText>
                </p>
              </div>

              <div className="mt-5 [&>button]:text-[0.6875rem]">
                <CompareButton item={{ id: product.id, name: product.name, kind: product.kind }} />
              </div>
              {/* quick metric grid */}
              <Reveal delay={0.4} className="mt-8">
                <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(11rem,1.5fr)]">
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
                  alt={product.images[0]?.alt || product.name}
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
                <h2 className="text-h3 font-semibold text-forest">
                  <ContentText>Variety Profile</ContentText>
                </h2>
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
                    ...product.specifications.map((s) => [s.label, s.value]),
                  ].map(([k, v]) => (
                    <div key={k} className="kv">
                      <dt>
                        <ContentText>{k}</ContentText>
                      </dt>
                      <dd>
                        <ContentText>{v}</ContentText>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              {/* highlights */}
              <Reveal delay={0.1} className="mt-10">
                <h2 className="text-h3 font-semibold text-forest">
                  <ContentText>Why Growers Choose It</ContentText>
                </h2>
                <ul className="mt-5 space-y-3">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-body text-forest/85">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-green" />
                      <ContentText>{h}</ContentText>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* agronomy */}
              <Reveal delay={0.15} className="mt-10">
                <h2 className="text-h3 font-semibold text-forest">
                  <ContentText>Agronomy Notes</ContentText>
                </h2>
                <p className="mt-4 text-body leading-relaxed text-muted">
                  <ContentText>{product.agronomyNotes}</ContentText>
                </p>
              </Reveal>
            </div>

            {/* right: sticky enquiry panel */}
            <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
              <NurseryEnquiry product={{ name: product.name, rootstocks: product.rootstocks }} />

              {/* rootstock detail cards */}
              <div className="mt-6">
                <h3 className="mb-4 text-[0.875rem] font-semibold text-forest">
                  <ContentText>
                    Rootstock options for <ContentText></ContentText>
                    {product.name}
                  </ContentText>
                </h3>
                <Stagger className="space-y-3">
                  {product.rootstocks.map((r) => (
                    <Item key={r.code}>
                      <div className="rounded-xl border border-line bg-white p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="micro block">
                              <ContentText>{r.system}</ContentText>
                            </span>
                            <span className="mt-0.5 block text-[0.875rem] font-semibold text-forest">
                              <ContentText>{r.code}</ContentText>
                            </span>
                          </div>
                          <span className="shrink-0 rounded-full bg-leaf/15 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-green">
                            <ContentText>{r.yield}</ContentText>
                          </span>
                        </div>
                        <dl className="mt-2 space-y-0.5 text-[0.75rem] text-muted">
                          <div className="flex gap-2">
                            <dt className="shrink-0 font-medium text-forest/70">
                              <ContentText>Spacing:</ContentText>
                            </dt>
                            <dd>
                              <ContentText>{r.spacing}</ContentText>
                            </dd>
                          </div>
                        </dl>
                        <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
                          <ContentText>{r.note}</ContentText>
                        </p>
                      </div>
                    </Item>
                  ))}
                </Stagger>
              </div>

              {/* contact fallback */}
              <div className="mt-5 rounded-xl border border-line bg-cream/80 p-4 text-center">
                <p className="text-[0.75rem] text-muted">
                  <ContentText>
                    Prefer a detailed conversation?<ContentText></ContentText>{" "}
                  </ContentText>
                  <Link
                    href="/contact"
                    className="font-semibold text-green underline underline-offset-2"
                  >
                    Use our inquiry form
                  </Link>
                  <ContentText> </ContentText>
                  <ContentText>for a written response from our horticultural team.</ContentText>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED VARIETIES ──────────────────────────────────── */}
      <CatalogGallery item={product} />
      <RelatedVarieties current={product.slug} season={product.season} products={related} />
    </>
  );
}

/* ─── Related Varieties strip ──────────────────────────────────────────────── */
function RelatedVarieties({
  current,
  season,
  products,
}: {
  current: string;
  season: Product["season"];
  products: Product[];
}) {
  const related = products
    .filter((p) => p.slug !== current)
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
                prefetch={false}
                href={`/products/${p.slug}`}
                className="card card-hover group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Photo
                    src={p.image}
                    alt={p.name + " apples"}
                    className="absolute inset-0 transition-transform duration-500 "
                    sizes="(min-width:1024px) 30vw, 100vw"
                  />
                </div>
                <div className="p-4">
                  <span className="micro block">
                    <ContentText>{p.origin}</ContentText>
                  </span>
                  <span className="mt-1 block font-semibold text-forest group-hover:text-green">
                    <ContentText>{p.name}</ContentText>
                  </span>
                  <span className="mt-1 block text-[0.75rem] text-muted">
                    <ContentText>{p.seasonMonths}</ContentText>
                  </span>
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
      <ContentText>
        {eyebrow && (
          <Reveal y={8}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
        )}
      </ContentText>
      <Heading text={title} className="mt-5 text-h2" />
      <ContentText>
        {children && (
          <Reveal delay={0.15} className="mt-5 space-y-4 text-body text-muted">
            {children}
          </Reveal>
        )}
      </ContentText>
    </div>
  );
}
