"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTransition, type ReactNode } from "react";
import { harvestSeasons, harvestHref, normalizeHarvestSeason } from "./harvest";
import { ContentText } from "@/features/cms/Content";
import styles from "./harvest-filters.module.css";

export function HarvestFilters({
  entries,
  complete,
  serverSeason,
  next,
  heading,
  searchBar,
  search,
}: {
  entries: { id: string; season: string; card: ReactNode }[];
  complete: boolean;
  serverSeason: string | null;
  next?: ReactNode;
  heading: ReactNode;
  searchBar: ReactNode;
  search: string;
}) {
  const query = useSearchParams();
  const router = useRouter();
  const selected = normalizeHarvestSeason(query.get("season"));
  const [pending, startTransition] = useTransition();
  // Only use local filtering when ALL published results for this search are present.
  const shown = complete
    ? entries.filter((entry) => !selected || normalizeHarvestSeason(entry.season) === selected)
    : entries;
  const active = complete ? selected : normalizeHarvestSeason(serverSeason);
  return (
    <>
      {heading}
      <div className="mb-6 mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="w-full max-w-[19rem]">{searchBar}</div>
        <div className={styles.filters} role="group" aria-label="Harvest windows">
          <span className="micro mr-1 text-muted">
            <ContentText>Harvest windows:</ContentText>
          </span>
          {harvestSeasons.map((season) => {
            const pressed = active === season.value;
            const href = harvestHref(
              new URLSearchParams(query.toString()),
              pressed ? null : season.value,
            );
            return (
              <Link
                key={season.key}
                href={href}
                prefetch={false}
                scroll={false}
                role="button"
                aria-pressed={pressed}
                aria-controls="harvest-results"
                className={`${styles.option} ${season.colour}`}
                onKeyDown={(event) => {
                  if (event.key === " ") {
                    event.preventDefault();
                    event.currentTarget.click();
                  }
                }}
                onClick={(event) => {
                  if (
                    !event.metaKey &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey &&
                    event.button === 0
                  ) {
                    event.preventDefault();
                    startTransition(() => {
                      if (complete) window.history.pushState(null, "", href);
                      else router.push(href, { scroll: false });
                    });
                  }
                }}
              >
                <ContentText>{season.value}</ContentText> <ContentText>Season</ContentText>
              </Link>
            );
          })}
          {active && (
            <Link
              href={harvestHref(new URLSearchParams(query.toString()), null)}
              prefetch={false}
              scroll={false}
              className={styles.clear}
              onClick={(event) => {
                if (
                  !event.metaKey &&
                  !event.ctrlKey &&
                  !event.shiftKey &&
                  !event.altKey &&
                  event.button === 0
                ) {
                  event.preventDefault();
                  const href = event.currentTarget.href;
                  startTransition(() => {
                    if (complete) window.history.pushState(null, "", href);
                    else router.push(href, { scroll: false });
                  });
                }
              }}
            >
              Show all
            </Link>
          )}
        </div>
      </div>
      <div id="harvest-results" className={styles.results} aria-busy={pending}>
        {shown.map((entry) => (
          <div key={entry.id}>{entry.card}</div>
        ))}
      </div>
      <p className={styles.status} role="status" aria-live="polite">
        {pending
          ? "Updating varieties…"
          : active || search
            ? `${shown.length}${next ? "+" : ""} ${shown.length === 1 ? "variety" : "varieties"}${active ? ` · ${active} Season` : ""}`
            : ""}
      </p>
      {!shown.length && (
        <p className="catalog-empty">
          {active
            ? `No ${active.toLowerCase()} season varieties ${search ? `match “${search}”.` : "are currently published."} Try another harvest window or search.`
            : search
              ? `No varieties match “${search}”. Try a different name or clear the search.`
              : "No varieties are published yet. Contact our nursery team for planting advice."}
        </p>
      )}
      {next}
    </>
  );
}
