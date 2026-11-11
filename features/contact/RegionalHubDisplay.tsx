"use client";
import { Stagger, Item } from "@/components/Motion";
import { useRegionalHubs } from "@/features/cms/Content";
import { mappedHubs } from "@/features/cms/regional-hubs";
import { GeographicMap } from "./GeographicMap";
export function RegionalHubCount() {
  const hubs = useRegionalHubs(),
    count = hubs.filter((hub) => hub.enabled).length;
  return (
    <span data-regional-hubs>
      {count} {count === 1 ? "Regional Hub" : "Regional Hubs"} · {mappedHubs(hubs).length} map
      locations
    </span>
  );
}
export function RegionalHubDisplay() {
  const hubs = useRegionalHubs().filter((hub) => hub.enabled);
  return (
    <div className="grid grid-cols-1 items-center gap-8 pt-8 lg:grid-cols-12" data-regional-hubs>
      <div
        className="relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-line/60 bg-cream p-5 sm:p-8 lg:col-span-7"
        data-geographic-card
      >
        <div className="geographic-card-heading mb-3 flex flex-wrap items-center justify-between gap-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-forest/75">
          <span>Regional hubs · geographic map</span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-1.5 rounded-full bg-green" />
            OpenStreetMap
          </span>
        </div>
        <GeographicMap />
      </div>
      <Stagger gap={0.07} className="space-y-3 lg:col-span-5">
        {hubs.map((hub) => (
          <Item key={hub.id}>
            <div
              data-regional-hub={hub.id}
              className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-colors hover:border-green/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 break-words text-[0.8125rem] font-bold text-forest">
                  {hub.title}
                </h3>
                {hub.place && (
                  <span className="max-w-[45%] shrink-0 break-words rounded bg-cream px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-green">
                    {hub.place}
                  </span>
                )}
              </div>
              <p className="mt-1 break-words text-[0.75rem] text-forest/75">{hub.body}</p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 font-mono text-[0.625rem] text-forest/75">
                <span className="break-words">{hub.facts[0]}</span>
                <span className="break-words font-bold text-green">{hub.facts[1]}</span>
              </div>
            </div>
          </Item>
        ))}
        {!hubs.length && (
          <p className="text-small text-muted">Contact our team for current regional support.</p>
        )}
      </Stagger>
    </div>
  );
}
