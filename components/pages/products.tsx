import { ContentText } from "@/features/cms/Content";
import { NurseryEnquiryLink } from "@/features/site/NurseryEnquiryLink";
import { MessageCircle } from "lucide-react";
import { ContentImage as Image } from "@/features/cms/Content";
import { Heading, Stagger, Item } from "@/components/Motion";
import { TextLink } from "@/components/ui";
import { SectionHead, CtaBand } from "@/components/sections";
import { Photo } from "@/components/Photo";
import type { Product, CatalogItem } from "@/features/catalog/model";
import { CompareButton } from "@/features/catalog/ComparisonProvider";
import { RootstockSection } from "@/features/catalog/PublicSections";
import { ContentProvider } from "@/features/cms/Content";
import { emptyContent } from "@/features/cms/model";
import { ContentLink as Link } from "@/features/cms/Content";
import type { CSSProperties } from "react";
import { CatalogSearch } from "@/features/catalog/CatalogSearch";
import type { CatalogSearchEntry } from "@/features/catalog/search";
import { HarvestFilters } from "@/features/catalog/HarvestFilters";
import { harvestSeasons, normalizeHarvestSeason } from "@/features/catalog/harvest";

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-orange/15 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-[#a34404]">
      <ContentText>{label}</ContentText>
    </span>
  );
}

function SeasonPip({ season }: { season: Product["season"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider ${harvestSeasons.find((entry) => entry.value === normalizeHarvestSeason(season))?.colour || "bg-forest/10 text-forest"}`}
    >
      <ContentText>{season}</ContentText> <ContentText>Season</ContentText>
    </span>
  );
}

/* ─── Product Card (listing page) ─────────────────────────────────────────── */
function ProductCard({ p }: { p: Product }) {
  return (
    <article
      data-catalog-entry={p.slug}
      className="card card-hover group flex h-full flex-col overflow-hidden"
    >
      {/* image / scene */}
      <div className="relative aspect-[7/5] overflow-hidden">
        <Photo
          src={p.image}
          alt={p.images[0]?.alt || p.name}
          className="absolute inset-0 transition-transform duration-700 "
          sizes="(min-width:1280px) 25vw,(min-width:768px) 33vw, 100vw"
        />
        {/* season pip overlay */}
        <div className="absolute left-3 top-3">
          <SeasonPip season={p.season} />
        </div>
        <ContentText>
          {p.badge && (
            <div className="absolute right-3 top-3">
              <Badge label={p.badge} />
            </div>
          )}
        </ContentText>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="micro mb-1 block !text-[0.625rem]">
          <ContentText>{p.origin}</ContentText>
        </span>
        <h3 className="text-[1.375rem] font-semibold leading-tight text-forest">
          <ContentText>{p.name}</ContentText>
          <ContentText>
            {p.localName && p.localName !== p.name && (
              <span className="ml-1.5 font-serif text-[0.95em] font-normal italic text-muted">
                <ContentText>{p.localName}</ContentText>
              </span>
            )}
          </ContentText>
        </h3>

        <p className="mt-2.5 line-clamp-3 text-[0.8125rem] leading-[1.65] text-muted">
          <ContentText>{p.intro.replace(/\s*—\s*/g, " ")}</ContentText>
        </p>

        {/* key metrics strip */}
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-3 text-[0.6875rem] leading-[1.65]">
          <div>
            <dt className="eyebrow mb-0.5 block text-[0.575rem]">
              <ContentText>Harvest</ContentText>
            </dt>
            <dd className="text-forest/80">
              <ContentText>{p.seasonMonths}</ContentText>
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-0.5 block text-[0.575rem]">
              <ContentText>Sugar (°Bx)</ContentText>
            </dt>
            <dd className="text-forest/80">
              <ContentText>{p.brix}</ContentText>
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-0.5 block text-[0.575rem]">
              <ContentText>CA Storage</ContentText>
            </dt>
            <dd className="text-forest/80">
              <ContentText>{p.storageLife}</ContentText>
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-0.5 block text-[0.575rem]">
              <ContentText>Rootstocks</ContentText>
            </dt>
            <dd className="text-forest/80">
              <ContentText>{p.rootstocks.map((r) => r.code).join(", ")}</ContentText>
            </dd>
          </div>
        </dl>

        {/* actions — mt-auto pins this to the card bottom regardless of content height */}
        <div className="mt-auto flex flex-col gap-2.5 pt-4" data-product-actions>
          <div className="flex items-center justify-between gap-3 [&>a]:text-[0.8125rem] [&>button]:px-3 [&>button]:text-[0.6875rem]">
            <TextLink prefetch={false} href={`/products/${p.slug}`}>
              Full details
            </TextLink>
            <CompareButton item={{ id: p.id, name: p.name, kind: p.kind }} />
          </div>
          <NurseryEnquiryLink
            variety={p.name}
            className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#25d366] px-4 py-1.5 text-[0.6875rem] font-semibold text-white shadow-sm transition hover:bg-[#20c05c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green active:scale-[0.98]"
            aria-label={`Enquire about ${p.name} `}
          >
            {/* WhatsApp icon inline SVG */}
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            <ContentText>Enquire</ContentText>
          </NurseryEnquiryLink>
        </div>
      </div>
    </article>
  );
}

/* ─── Scattered photo collage for hero right side ─────────────────────────── */
// Order: top-left, top-right, CENTRE (Red Delicious — largest, z:3), bottom-left, bottom-right
const COLLAGE_TILES: {
  rotate: number;
  top: string;
  left: string;
  w: string;
  radius: string;
  z: number;
}[] = [
  {
    rotate: -8,
    top: "2%",
    left: "4%",
    w: "46%",
    radius: "62% 38% 52% 48% / 55% 48% 52% 45%",
    z: 2,
  },
  {
    rotate: 6,
    top: "0%",
    left: "50%",
    w: "44%",
    radius: "40% 60% 45% 55% / 50% 42% 58% 50%",
    z: 1,
  },
  {
    // Red Delicious — centre, largest, highest z
    rotate: -3,
    top: "30%",
    left: "20%",
    w: "58%",
    radius: "50% 50% 60% 40% / 45% 55% 45% 55%",
    z: 4,
  },
  {
    rotate: 9,
    top: "60%",
    left: "2%",
    w: "40%",
    radius: "35% 65% 55% 45% / 55% 40% 60% 45%",
    z: 2,
  },
  {
    rotate: -5,
    top: "58%",
    left: "50%",
    w: "46%",
    radius: "55% 45% 38% 62% / 48% 60% 40% 52%",
    z: 1,
  },
];

function PhotoCollage({ products }: { products: CatalogItem[] }) {
  return (
    // Keep the mobile composition compact; rotated lower prints need visible overflow.
    <div
      className="pointer-events-none relative mx-auto aspect-square w-[86%] max-w-[340px] select-none overflow-visible sm:aspect-auto sm:h-[clamp(260px,60vw,480px)] sm:w-full sm:max-w-[480px]"
      aria-hidden
    >
      <ContentText>
        {COLLAGE_TILES.map((tile, i) => ({
          ...tile,
          src: products[([0, 2, 1, 3, 4][i] ?? i) % products.length]?.images[0]?.src,
          alt: products[([0, 2, 1, 3, 4][i] ?? i) % products.length]?.images[0]?.alt,
        }))
          .filter((t) => t.src)
          .map((t, i) => (
            <div
              key={i}
              className="variety-print absolute"
              style={{
                animationDelay: 90 + i * 76 + "ms",
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
                  src={t.src!}
                  alt={t.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width:640px) 280px, 50vw"
                  /* only the centre tile (index 2) is likely above-fold on desktop */
                  priority={i === 2}
                />
              </div>
            </div>
          ))}
      </ContentText>
    </div>
  );
}

/* ─── Page Sections ────────────────────────────────────────────────────────── */
function ProductsHero({ products }: { products: CatalogItem[] }) {
  return (
    <section className="hero-wash relative -mt-[4.5rem] overflow-hidden pb-8 pt-[8.5rem] sm:-mt-20 sm:pb-20 sm:pt-[7.5rem] lg:pt-[10rem]">
      <div className="home-wrap">
        <div className="grid items-center gap-6 sm:gap-10 lg:grid-cols-[1fr_480px] lg:gap-12">
          {/* ── left: text ── */}
          <div>
            <div className="hero-rise mb-6 flex items-center gap-2">
              <span className="h-[1.5px] w-7 bg-green" aria-hidden />
              <span className="text-eyebrow font-bold uppercase tracking-[0.18em] text-green">
                <ContentText>Plant Material &amp; Varieties</ContentText>
              </span>
            </div>
            <Heading
              as="h1"
              immediate
              delay={0.1}
              tone="leaf"
              text="International {varieties.} Himalayan roots."
              className="text-display max-w-[16ch]"
            />
            <div
              className="hero-rise mt-7 max-w-[36rem] space-y-4 text-lead text-forest/80"
              style={{ "--d": "0.35s" } as CSSProperties}
            >
              <p>
                <ContentText>
                  Every variety Zeebaran supplies comes from certified, virus-indexed clonal mother
                  blocks. We match rootstock to elevation, soil type, and market destination not
                  just what is available.
                </ContentText>
              </p>
              <p>
                <ContentText>
                  Select any variety to explore its agronomy profile, rootstock options, and harvest
                  calendar. Enquire about a variety to reach our horticultural team.
                </ContentText>
              </p>
            </div>
          </div>

          {/* ── right: scattered photo collage ── */}
          <ContentProvider page="catalog" value={emptyContent()}>
            <PhotoCollage products={products} />
          </ContentProvider>
        </div>
      </div>
    </section>
  );
}

function IntroStrip({ counts }: { counts: { variety: number; rootstock: number } }) {
  const stats = [
    { n: String(counts.variety), label: "Varieties available" },
    { n: String(counts.rootstock), label: "Rootstock profiles" },
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
                  {s.label === "Varieties available" || s.label === "Rootstock profiles" ? (
                    s.n
                  ) : (
                    <ContentText>{s.n}</ContentText>
                  )}
                </span>
                <span className="mt-1 block text-[0.75rem] text-muted">
                  <ContentText>{s.label}</ContentText>
                </span>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function ProductGrid({
  products,
  nextHref,
  complete,
  season,
  search,
  suggestions,
}: {
  products: Product[];
  nextHref?: string;
  complete: boolean;
  season: string | null;
  search: string;
  suggestions: CatalogSearchEntry[];
}) {
  return (
    <section className="section" id="variety-portfolio">
      <div className="wrap">
        <HarvestFilters
          heading={<SectionHead eyebrow="Our variety portfolio" title="Choose your {variety.}" />}
          searchBar={
            <CatalogSearch kind="variety" term={search} entries={suggestions} complete={complete} />
          }
          search={search}
          complete={complete}
          serverSeason={season}
          entries={products.map((p) => ({
            id: p.id,
            season: p.season,
            card: (
              <ContentProvider value={emptyContent()} page="catalog">
                <ProductCard p={p} />
              </ContentProvider>
            ),
          }))}
          next={
            nextHref ? (
              <Link prefetch={false} className="catalog-action mt-8" href={nextHref}>
                More varieties →
              </Link>
            ) : undefined
          }
        />
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
      src="asset:banners/varieties/varrient-banner-webp"
      variant="hills"
    />
  );
}

/* ─── Page Export ──────────────────────────────────────────────────────────── */
export function ProductsPage({
  products,
  rootstocks,
  counts,
  varietyNext,
  rootstockNext,
  heroProducts,
  harvestSeason = null,
  completeVarieties,
  completeRootstocks,
  varietySuggestions,
  rootstockSuggestions,
  varietySearch = "",
  rootstockSearch = "",
}: {
  products: Product[];
  rootstocks: CatalogItem[];
  counts: { variety: number; rootstock: number };
  varietyNext?: string;
  rootstockNext?: string;
  heroProducts: Product[];
  harvestSeason?: string | null;
  completeVarieties: boolean;
  completeRootstocks: boolean;
  varietySuggestions: CatalogSearchEntry[];
  rootstockSuggestions: CatalogSearchEntry[];
  varietySearch?: string;
  rootstockSearch?: string;
}) {
  return (
    <>
      <ProductsHero products={heroProducts} />
      <IntroStrip counts={counts} />
      <ProductGrid
        products={products}
        nextHref={varietyNext}
        complete={completeVarieties}
        season={harvestSeason}
        search={varietySearch}
        suggestions={varietySuggestions}
      />
      <RootstockSection
        items={rootstocks}
        nextHref={rootstockNext}
        search={rootstockSearch}
        suggestions={rootstockSuggestions}
        complete={completeRootstocks}
      />
      <div className="py-8 sm:py-12" />
      <ProductsCta />
    </>
  );
}
