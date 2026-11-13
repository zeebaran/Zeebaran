"use client";
import Form from "next/form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { catalogHref, type CatalogKind, type CatalogPage, type CatalogSummary } from "./model";
import { harvestKey, normalizeHarvestSeason } from "./harvest";
import { matchesCatalogSearch, normalizeSearch, type CatalogSearchEntry } from "./search";
import styles from "./catalog-search.module.css";

const suggestionLimit = 6;
type Suggestion = Pick<CatalogSearchEntry, "id" | "slug" | "name"> & { detail?: string };
type SearchProps = {
  kind: CatalogKind;
  term: string;
  entries: CatalogSearchEntry[];
  complete: boolean;
};

export function CatalogSearch(props: SearchProps) {
  return <CatalogSearchForm key={props.term} {...props} />;
}

function CatalogSearchForm({ kind, term, entries, complete }: SearchProps) {
  const query = useSearchParams();
  const router = useRouter();
  const inputId = useId();
  const listId = `${inputId}-matches`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(term);
  const [show, setShow] = useState(false);
  const [activeId, setActiveId] = useState<string>();
  const [remote, setRemote] = useState<{ url: string; items: Suggestion[]; failed?: boolean }>();
  const variety = kind === "variety";
  const name = variety ? "q" : "rootQ";
  const anchor = variety ? "variety-portfolio" : "rootstock-selection";
  const label = variety ? "Search varieties" : "Search rootstocks";
  const season = variety ? normalizeHarvestSeason(query.get("season")) : null;
  const typed = normalizeSearch(value);
  const open = show && Boolean(typed);
  const local = typed
    ? entries
        .filter(
          (item) =>
            (!season || normalizeHarvestSeason(item.season) === season) &&
            matchesCatalogSearch(item, typed),
        )
        .map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          detail: variety ? item.localName : item.code,
        }))
    : [];
  const remoteUrl =
    open && !complete && typed.length >= 2 && local.length < suggestionLimit
      ? "/api/catalog?" +
        new URLSearchParams({
          kind,
          q: value.trim(),
          ...(season ? { season: harvestKey(season) } : {}),
        })
      : "";
  const currentRemote = remote?.url === remoteUrl ? remote : undefined;
  const suggestions = [
    ...local,
    ...(currentRemote?.items ?? []).filter((item) => !local.some((entry) => entry.id === item.id)),
  ].slice(0, suggestionLimit);
  const activeIndex = suggestions.findIndex((item) => item.id === activeId);
  const retained = new URLSearchParams();
  for (const key of variety ? ["rootQ", "rootstocks", "season"] : ["q", "varieties", "season"]) {
    const value = query.get(key);
    if (value) retained.set(key, value);
  }
  const clearQuery = retained.toString();

  useEffect(() => {
    if (!remoteUrl) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(remoteUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Catalog suggestions unavailable");
        const { items } = (await response.json()) as CatalogPage<CatalogSummary>;
        if (!controller.signal.aborted) setRemote({ url: remoteUrl, items });
      } catch {
        if (!controller.signal.aborted) setRemote({ url: remoteUrl, items: [], failed: true });
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [remoteUrl]);

  function close() {
    setShow(false);
    setActiveId(undefined);
  }

  function select(item: Suggestion) {
    close();
    router.push(catalogHref({ kind, slug: item.slug }));
  }

  return (
    <Form
      action={`/products#${anchor}`}
      prefetch={false}
      role="search"
      aria-label={label}
      onSubmit={close}
    >
      {Array.from(retained, ([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.control}>
        <div className={styles.field}>
          <Search size={15} aria-hidden="true" />
          <input
            ref={inputRef}
            id={inputId}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={
              open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
            }
            type="search"
            name={name}
            value={value}
            maxLength={80}
            autoComplete="off"
            placeholder={variety ? "e.g. Gala or Fuji" : "e.g. M9 or MM106"}
            onChange={(event) => {
              setValue(event.target.value);
              setActiveId(undefined);
              setShow(true);
            }}
            onFocus={() => setShow(true)}
            onBlur={close}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Escape" && open) {
                event.preventDefault();
                close();
              }
              if ((event.key === "ArrowDown" || event.key === "ArrowUp") && typed) {
                event.preventDefault();
                setShow(true);
                if (!suggestions.length) return;
                const step = event.key === "ArrowDown" ? 1 : -1;
                const start = activeIndex < 0 && step < 0 ? 0 : activeIndex;
                const next = (start + step + suggestions.length) % suggestions.length;
                setActiveId(suggestions[next].id);
              }
              if (event.key === "Enter" && open && activeIndex >= 0) {
                event.preventDefault();
                select(suggestions[activeIndex]);
              }
            }}
          />
          {(value || term) &&
            (term ? (
              <Link
                href={`/products${clearQuery ? `?${clearQuery}` : ""}#${anchor}`}
                prefetch={false}
                aria-label={`Clear ${variety ? "variety" : "rootstock"} search`}
                className={styles.clear}
                onClick={close}
              >
                <X size={15} aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                aria-label={`Clear ${variety ? "variety" : "rootstock"} search`}
                className={styles.clear}
                onClick={() => {
                  setValue("");
                  close();
                  inputRef.current?.focus();
                }}
              >
                <X size={15} aria-hidden="true" />
              </button>
            ))}
          <button type="submit" className={styles.submit}>
            Search
          </button>
        </div>
        {open && (
          <div className={styles.popup}>
            <ul id={listId} role="listbox" aria-label={`${label} suggestions`}>
              {suggestions.map((item, index) => (
                <li
                  key={item.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={styles.option}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => select(item)}
                >
                  <span>
                    <span className={styles.optionName}>{item.name}</span>
                    {item.detail && item.detail !== item.name && (
                      <span className={styles.optionDetail}>{item.detail}</span>
                    )}
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </li>
              ))}
            </ul>
            {!suggestions.length && (
              <p className={styles.status} role="status">
                {remoteUrl && !currentRemote
                  ? "Finding matches…"
                  : currentRemote?.failed
                    ? "Suggestions unavailable. Press Enter to search."
                    : !complete && typed.length < 2
                      ? "Type another character to search the full catalog."
                      : "No matching suggestions."}
              </p>
            )}
          </div>
        )}
      </div>
    </Form>
  );
}
