"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ContentLink as Link } from "@/features/cms/Content";
import { ArrowRight, ArrowLeftRight, Check, X } from "lucide-react";
import { Dialog } from "@/features/admin/Dialog";
import type { CatalogItem, CatalogSummary } from "./model";
const storage = "zeebaran.compare.v1";
type Choice = Pick<CatalogSummary, "id" | "name" | "kind">;
const Context = createContext<{
  selected: Choice[];
  choose: (item: Choice, index?: number) => void;
  clear: () => void;
  ready: boolean;
}>({ selected: [], choose: () => {}, clear: () => {}, ready: false });
export function useComparison() {
  return useContext(Context);
}
export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Choice[]>([]),
    [ready, setReady] = useState(false),
    [pending, setPending] = useState<Choice | null>(null);
  const restoration = useRef(0),
    request = useRef<AbortController | null>(null),
    persist = useRef(false);
  useEffect(() => {
    let active = true;
    const restore = async (event?: StorageEvent) => {
      if (event && event.key !== null && event.key !== storage) return;
      const version = ++restoration.current;
      request.current?.abort();
      const abort = new AbortController();
      request.current = abort;
      await Promise.resolve();
      try {
        const url = new URL(location.href),
          shared =
            url.pathname === "/products/compare" && !event
              ? [url.searchParams.get("left"), url.searchParams.get("right")].filter(Boolean)
              : [];
        const ids = shared.length
          ? shared
          : JSON.parse(event?.newValue || localStorage.getItem(storage) || "[]");
        if (
          !Array.isArray(ids) ||
          ids.length > 2 ||
          ids.some((id) => typeof id !== "string" || !/^[a-z0-9-]{1,80}$/.test(id))
        )
          return;
        if (!ids.length) {
          persist.current = true;
          if (active && version === restoration.current) setSelected([]);
          return;
        }
        await fetch("/api/catalog/resolve?ids=" + ids.join(","), {
          cache: "no-store",
          signal: abort.signal,
        })
          .then(async (r) => {
            if (!r.ok) throw Error();
            const d = await r.json();
            if (active && version === restoration.current) {
              persist.current = true;
              setSelected(
                d.items.map((i: CatalogItem) => ({ id: i.id, name: i.name, kind: i.kind })),
              );
            }
          })
          .catch(() => {});
      } catch {
      } finally {
        if (active && version === restoration.current) setReady(true);
      }
    };
    void restore();
    window.addEventListener("storage", restore);
    return () => {
      active = false;
      request.current?.abort();
      window.removeEventListener("storage", restore);
    };
  }, []);
  useEffect(() => {
    if (ready && persist.current)
      try {
        localStorage.setItem(storage, JSON.stringify(selected.map((s) => s.id)));
      } catch {}
  }, [selected, ready]);
  function choose(value: Choice, index?: number) {
    restoration.current++;
    request.current?.abort();
    persist.current = true;
    setReady(true);
    setSelected((old) => {
      if (index !== undefined) {
        const next = [...old];
        if (next.some((x, i) => x.id === value.id && i !== index)) return old;
        next[index] = value;
        return next.filter(Boolean);
      }
      if (old.some((x) => x.id === value.id)) return old.filter((x) => x.id !== value.id);
      if (old.length < 2) return [...old, value];
      return old;
    });
    if (index === undefined && selected.length === 2 && !selected.some((x) => x.id === value.id))
      setPending(value);
  }
  function clear() {
    restoration.current++;
    request.current?.abort();
    persist.current = true;
    setReady(true);
    setSelected([]);
    setPending(null);
  }
  useEffect(() => {
    if (!ready || !persist.current || location.pathname !== "/products/compare") return;
    const url = new URL(location.href);
    url.searchParams.delete("left");
    url.searchParams.delete("right");
    if (selected[0]) url.searchParams.set("left", selected[0].id);
    if (selected[1]) url.searchParams.set("right", selected[1].id);
    if (url.href !== location.href) history.replaceState(null, "", url);
  }, [selected, ready]);
  return (
    <Context.Provider value={{ selected, choose, clear, ready }}>
      {children}
      {selected.length > 0 && (
        <>
          <div className="compare-clearance" />
          <aside className="compare-dock" aria-label="Your comparison">
            <span className="compare-dock-label">
              <ArrowLeftRight size={17} />
              Compare
            </span>
            <div className="compare-dock-choices">
              {selected.map((item) => (
                <button
                  key={item.id}
                  onClick={() => choose(item)}
                  aria-label={"Remove " + item.name + " from comparison"}
                >
                  {item.name}
                  <X size={13} />
                </button>
              ))}
              {selected.length < 2 && <span>Choose one more</span>}
            </div>
            <Link
              prefetch={false}
              href={
                "/products/compare?left=" +
                selected[0].id +
                (selected[1] ? "&right=" + selected[1].id : "")
              }
              className="compare-go"
            >
              Compare <ArrowRight size={15} />
            </Link>
            <button className="compare-clear" onClick={clear} aria-label="Clear comparison">
              <X size={17} />
            </button>
          </aside>
        </>
      )}
      {pending && (
        <Dialog
          label="Replace a comparison selection"
          className="catalog-replace-dialog"
          onClose={() => setPending(null)}
        >
          <h2>Make room for {pending.name}.</h2>
          <p>Choose which selection to replace.</p>
          {selected.map((s, i) => (
            <button
              key={s.id}
              className="catalog-action"
              onClick={() => {
                choose(pending, i);
                setPending(null);
              }}
            >
              Replace {s.name}
              <ArrowRight size={15} />
            </button>
          ))}
          <button className="catalog-text-button" onClick={() => setPending(null)}>
            Keep current selections
          </button>
        </Dialog>
      )}
    </Context.Provider>
  );
}
export function CompareButton({ item }: { item: Choice }) {
  const { selected, choose } = useComparison(),
    on = selected.some((s) => s.id === item.id);
  return (
    <button
      type="button"
      className={"catalog-compare-button " + (on ? "is-selected" : "")}
      aria-pressed={on}
      onClick={() => choose(item)}
    >
      {on ? <Check size={14} /> : <ArrowLeftRight size={14} />}
      <span>{on ? "Selected" : "Compare"}</span>
      <span className="sr-only"> {item.name}</span>
    </button>
  );
}
