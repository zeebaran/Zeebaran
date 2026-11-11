"use client";
import { AdminLink as Link } from "@/features/admin/AdminLink";
import { useState, useEffect, useRef } from "react";
import { Plus, ArrowUpRight, RotateCcw, Leaf, Search } from "lucide-react";
import { adminRequest } from "@/features/admin/client";
import type { CatalogIndexEntry, CatalogKind, CatalogPage } from "../model";
export function CatalogIndex({
  initial,
  kind,
  deleted,
}: {
  initial: CatalogPage<CatalogIndexEntry>;
  kind: CatalogKind;
  deleted: boolean;
}) {
  const [rows, setRows] = useState(initial.items),
    [cursor, setCursor] = useState(initial.nextCursor),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [q, setQ] = useState("");
  const hasSearched = useRef(false),
    requestVersion = useRef(0),
    paging = useRef(false);
  useEffect(() => {
    if (!hasSearched.current && q === "") return;
    const version = ++requestVersion.current;
    let active = true;
    const timer = setTimeout(() => {
      adminRequest<CatalogPage<CatalogIndexEntry>>(
        "/api/admin/catalog?" + new URLSearchParams({ kind, deleted: deleted ? "1" : "0", q }),
      )
        .then((d) => {
          if (active && version === requestVersion.current) {
            setRows(d.items);
            setCursor(d.nextCursor);
            setError("");
          }
        })
        .catch((e) => {
          if (active && version === requestVersion.current) setError(e.message);
        })
        .finally(() => {
          if (active && version === requestVersion.current) setBusy("");
        });
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
      if (requestVersion.current === version) requestVersion.current = version + 1;
    };
  }, [q, kind, deleted]);
  function search(value: string) {
    hasSearched.current = true;
    requestVersion.current++;
    paging.current = false;
    setCursor(null);
    setBusy("search");
    setQ(value);
  }
  async function more() {
    if (!cursor || paging.current || busy) return;
    const version = requestVersion.current;
    paging.current = true;
    setBusy("more");
    setError("");
    try {
      const d = await adminRequest<CatalogPage<CatalogIndexEntry>>(
        "/api/admin/catalog?" +
          new URLSearchParams({ kind, deleted: deleted ? "1" : "0", cursor, q }),
      );
      if (version !== requestVersion.current) return;
      setRows((old) => [...new Map([...old, ...d.items].map((item) => [item.id, item])).values()]);
      setCursor(d.nextCursor);
    } catch (e) {
      if (version === requestVersion.current) setError((e as Error).message);
    } finally {
      if (version === requestVersion.current) {
        paging.current = false;
        setBusy("");
      }
    }
  }
  async function restore(entry: CatalogIndexEntry) {
    setBusy(entry.id);
    setError("");
    try {
      await adminRequest("/api/admin/catalog/" + entry.id, {
        action: "restore",
        revision: entry.revision,
      });
      setRows((old) => old.filter((i) => i.id !== entry.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">THE PLANTING COLLECTION</p>
          <h1>
            {kind === "rootstock" ? "Strong foundations." : "A living portfolio."}
            <br />
            <em>{deleted ? "Ready for another season." : "Carefully cultivated."}</em>
          </h1>
          <p>
            {deleted
              ? "Deleted entries are kept privately. Restore as a draft before publishing again."
              : "Manage the entries, specifications and photographs behind every public comparison."}
          </p>
        </div>
        <Link className="admin-btn admin-primary" href={"/admin/catalog/new?kind=" + kind}>
          <Plus size={16} />
          Add {kind}
        </Link>
      </div>
      <nav className="catalog-admin-tabs" aria-label="Catalog views">
        <Link
          aria-current={kind === "variety" && !deleted ? "page" : undefined}
          href="/admin/catalog?kind=variety"
        >
          Varieties
        </Link>
        <Link
          aria-current={kind === "rootstock" && !deleted ? "page" : undefined}
          href="/admin/catalog?kind=rootstock"
        >
          Rootstocks
        </Link>
        <Link
          aria-current={deleted ? "page" : undefined}
          href={"/admin/catalog?kind=" + kind + "&deleted=1"}
        >
          Deleted {kind === "variety" ? "varieties" : "rootstocks"}
        </Link>
      </nav>
      {error && (
        <p className="admin-notice admin-notice-error" role="alert">
          {error}
        </p>
      )}
      <label className="admin-search">
        <Search size={16} />
        <input
          aria-label="Search catalog entries"
          placeholder="Search by name…"
          value={q}
          maxLength={80}
          onChange={(e) => search(e.target.value)}
        />
      </label>
      <div className="catalog-admin-list" aria-busy={busy === "search"}>
        {rows.map((entry) => (
          <article key={entry.id}>
            <span className="catalog-entry-icon">
              <Leaf size={22} />
            </span>
            <div>
              <span className="admin-eyebrow">
                {entry.draft.kind} · /{entry.id}
              </span>
              <h2>{entry.draft.name}</h2>
              <p>
                {entry.published ? "Published" : "Private draft"} · Revision {entry.revision}
              </p>
            </div>
            {deleted ? (
              <button
                disabled={!!busy}
                className="admin-btn admin-outline"
                onClick={() => void restore(entry)}
              >
                <RotateCcw size={14} />
                {busy === entry.id ? "Restoring…" : "Restore as draft"}
              </button>
            ) : (
              <Link className="admin-btn admin-outline" href={"/admin/catalog/" + entry.id}>
                Edit entry <ArrowUpRight size={15} />
              </Link>
            )}
          </article>
        ))}
      </div>
      {!rows.length && busy !== "search" && (
        <div className="catalog-empty">
          <Leaf size={28} />
          <h2>
            {q.trim()
              ? "No matching entries."
              : deleted
                ? "Nothing has been deleted."
                : "Room to grow."}
          </h2>
          <p>
            {q.trim()
              ? "Try a different name or clear the search to see all entries."
              : deleted
                ? "Removed entries will appear here."
                : "Add your first entry or migrate the existing authored portfolio. Only published database entries appear on the website."}
          </p>
        </div>
      )}
      {cursor && (
        <button disabled={!!busy} className="admin-btn admin-outline" onClick={() => void more()}>
          {busy === "more" ? "Loading…" : "Load more entries"}
        </button>
      )}
    </div>
  );
}
