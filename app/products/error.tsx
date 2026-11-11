"use client";
import { ContentLink as Link } from "@/features/cms/Content";
export default function CatalogError({ reset }: { reset: () => void }) {
  return (
    <section className="wrap catalog-empty catalog-unavailable">
      <p className="eyebrow">The planting collection</p>
      <h1>
        A little care.
        <br />
        <em>Behind the scenes.</em>
      </h1>
      <p>The catalog could not load. Your selections are still stored on this device.</p>
      <div>
        <button className="catalog-action" onClick={reset}>
          Try again
        </button>
        <Link className="catalog-text-button" href="/contact">
          Talk to the nursery team
        </Link>
      </div>
    </section>
  );
}
