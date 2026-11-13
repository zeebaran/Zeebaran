import { ContentLink as Link } from "@/features/cms/Content";
import { AssetImage as Image } from "@/features/media/AssetImage";
import { ArrowRight, Leaf } from "lucide-react";
import { SectionHead } from "@/components/sections";
import { Heading, Reveal } from "@/components/Motion";
import { ContentText } from "@/features/cms/Content";
import { CatalogSearch } from "./CatalogSearch";
import type { CatalogSearchEntry } from "./search";
import { CompareButton } from "./ComparisonProvider";
import { catalogHref, type CatalogItem } from "./model";
import { NurseryEnquiryLink } from "@/features/site/NurseryEnquiryLink";
export function CatalogUnavailable() {
  return (
    <section className="wrap catalog-empty catalog-unavailable">
      <Leaf size={28} />
      <p className="eyebrow">The planting collection</p>
      <h1>
        A little care.
        <br />
        <em>Behind the scenes.</em>
      </h1>
      <p>
        The planting catalog could not be loaded. Please retry or contact our horticultural team for
        current availability.
      </p>
      <div>
        <Link className="catalog-action" href="/products">
          Try again <ArrowRight size={16} />
        </Link>
        <Link className="catalog-text-button" href="/contact">
          Talk to the nursery team
        </Link>
      </div>
    </section>
  );
}
export function RootstockSection({
  items,
  nextHref,
  search,
  suggestions,
  complete,
}: {
  items: CatalogItem[];
  nextHref?: string;
  search: string;
  suggestions: CatalogSearchEntry[];
  complete: boolean;
}) {
  return (
    <section className="section bg-cream/50" id="rootstock-selection">
      <div className="wrap">
        <SectionHead
          eyebrow="Rootstock selection"
          title="The right root makes {every difference.}"
          className="mb-10"
        >
          <p>
            <ContentText>
              {
                "Rootstock determines planting density, yield potential, orchard life, and infrastructure requirement. Zeebaran's horticultural team recommends rootstock based on your elevation, soil profile, water availability, and market plan — not one-size-fits-all."
              }
            </ContentText>
          </p>
        </SectionHead>
        <div className="mb-6">
          <CatalogSearch kind="rootstock" term={search} entries={suggestions} complete={complete} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((r, i) => (
            <Reveal key={r.id} delay={(i % 2) * 0.08}>
              <article
                data-catalog-entry={r.id}
                className="card flex h-full flex-col overflow-hidden"
              >
                <div className="catalog-rootstock-photo">
                  {
                    <Image
                      src={r.images[0]?.src || ""}
                      alt={r.images[0]?.alt || r.name}
                      fill
                      sizes="(max-width:640px) 90vw, 550px"
                    />
                  }
                </div>
                <div className="flex h-full flex-col p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="micro block">{r.code}</span>
                      <h3 className="mt-1 text-[1.0625rem] font-semibold text-forest">{r.name}</h3>
                    </div>
                    {r.yield && (
                      <span className="shrink-0 rounded-full border border-green/20 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-green">
                        {r.yield}
                      </span>
                    )}
                  </div>
                  <dl className="mt-4 border-t border-line pt-4 text-small">
                    <div className="kv">
                      <dt>Spacing</dt>
                      <dd>{r.spacing || "Discuss with our team"}</dd>
                    </div>
                    <div className="kv">
                      <dt>Best for</dt>
                      <dd>{r.bestFor || r.system}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-small text-muted">{r.intro}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                    <Link className="catalog-text-button" prefetch={false} href={catalogHref(r)}>
                      Rootstock profile <ArrowRight size={14} />
                    </Link>
                    <CompareButton item={{ id: r.id, name: r.name, kind: r.kind }} />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        {search && items.length > 0 && (
          <p role="status" className="mt-4 text-small text-muted">
            {items.length}
            {nextHref ? "+" : ""} {items.length === 1 ? "rootstock" : "rootstocks"}
          </p>
        )}
        {!items.length && (
          <p className="catalog-empty" role="status">
            {search
              ? `No rootstocks match “${search}”. Try another name or code, or clear the search.`
              : "Rootstock profiles will appear here when published. Our nursery team can advise on current availability."}
          </p>
        )}
        {nextHref && (
          <Link className="catalog-action mt-8" href={nextHref}>
            More rootstocks <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </section>
  );
}
export function RootstockDetail({ item }: { item: CatalogItem }) {
  return (
    <>
      <section className="hero-wash section">
        <div className="wrap">
          <Link className="catalog-text-button" href="/products#rootstock-selection">
            ← Rootstock selection
          </Link>
          <div className="catalog-root-detail-hero">
            <div>
              <p className="eyebrow">{item.eyebrow || "Rootstock selection"}</p>
              <Heading
                as="h1"
                immediate
                className="text-display"
                text={item.headline || item.name}
              />
              <p className="mt-6 text-lead text-muted">{item.intro}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <CompareButton item={{ id: item.id, name: item.name, kind: item.kind }} />
                <NurseryEnquiryLink className="catalog-action" rootstock={item.code}>
                  Enquire about {item.code} <ArrowRight size={15} />
                </NurseryEnquiryLink>
              </div>
            </div>
            <div className="catalog-root-detail-photo">
              {
                <Image
                  src={item.images[0]?.src || ""}
                  alt={item.images[0]?.alt || item.name}
                  fill
                  sizes="(max-width:800px) 90vw, 480px"
                  priority
                />
              }
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap catalog-root-detail-body">
          <div>
            <h2 className="text-h2">A foundation that fits.</h2>
            <dl className="mt-6">
              {[
                ["Code", item.code],
                ["Origin", item.origin],
                ["Planting system", item.system],
                ["Spacing", item.spacing],
                ["Yield potential", item.yield],
                ["Best suited to", item.bestFor],
                ...item.specifications.map((s) => [s.label, s.value]),
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div className="kv" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
          <div>
            <h2 className="text-h3">In the field.</h2>
            <p className="mt-4 whitespace-pre-line text-body text-muted">
              {item.note || item.agronomyNotes}
            </p>
            <ul className="mt-5 space-y-3">
              {item.highlights.map((h) => (
                <li key={h} className="catalog-advantage">
                  <Leaf size={16} />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <CatalogGallery item={item} />
    </>
  );
}
export function CatalogGallery({ item }: { item: CatalogItem }) {
  if (item.images.length < 2) return null;
  return (
    <section className="section wrap">
      <h2 className="text-h2">A closer look.</h2>
      <div className="catalog-gallery">
        {item.images.slice(1).map((m, i) => (
          <figure key={i}>
            <div>
              <Image src={m.src} alt={m.alt} fill sizes="(max-width:640px) 90vw, 45vw" />
            </div>
            <figcaption>{m.alt}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
