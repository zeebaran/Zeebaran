"use client";
import { useEffect, useRef, useState } from "react";
import { ContentLink as Link } from "@/features/cms/Content";
import { AssetImage as Image } from "@/features/media/AssetImage";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { useComparison } from "./ComparisonProvider";
import {
  catalogHref,
  type CatalogData,
  type CatalogItem,
  type CatalogSummary,
  type CatalogKind,
  type CatalogPage,
} from "./model";
export function CatalogPicker({
  value,
  onSelect,
  exclude,
  initial,
  label,
}: {
  value: CatalogItem | null;
  onSelect: (v: CatalogItem) => void;
  exclude?: string;
  initial: CatalogSummary[];
  label: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null),
    input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false),
    [kind, setKind] = useState<CatalogKind>(value?.kind || "variety"),
    [q, setQ] = useState(""),
    [page, setPage] = useState<CatalogPage<CatalogSummary>>({ items: initial, nextCursor: null }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const listVersion = useRef(0);
  useEffect(() => {
    const version = ++listVersion.current;
    if (!open) return;
    const abort = new AbortController(),
      timer = setTimeout(() => {
        setBusy(true);
        setError("");
        fetch("/api/catalog?" + new URLSearchParams({ kind, q }), {
          signal: abort.signal,
          cache: "no-store",
        })
          .then(async (r) => {
            if (!r.ok) throw Error("The selection list could not load.");
            const data = await r.json();
            if (!abort.signal.aborted && version === listVersion.current) setPage(data);
          })
          .catch((e) => {
            if (!abort.signal.aborted) setError(e.message);
          })
          .finally(() => {
            if (!abort.signal.aborted) setBusy(false);
          });
      }, 180);
    return () => {
      clearTimeout(timer);
      abort.abort();
      listVersion.current = version + 1;
    };
  }, [q, kind, open]);
  async function pick(id: string) {
    const version = listVersion.current;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/catalog/resolve?ids=" + encodeURIComponent(id), {
        cache: "no-store",
      });
      if (!r.ok) throw Error();
      const d = await r.json();
      if (version !== listVersion.current) return;
      if (!d.items[0]) throw Error();
      onSelect(d.items[0]);
      if (ref.current) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    } catch {
      if (version === listVersion.current)
        setError("This selection is no longer available. Choose another.");
    } finally {
      if (version === listVersion.current) setBusy(false);
    }
  }
  async function more() {
    if (!page.nextCursor || busy) return;
    const version = listVersion.current;
    setBusy(true);
    try {
      const r = await fetch(
        "/api/catalog?" + new URLSearchParams({ kind, q, cursor: page.nextCursor }),
        { cache: "no-store" },
      );
      if (!r.ok) throw Error();
      const next = await r.json();
      if (version === listVersion.current)
        setPage((old) => ({
          items: [
            ...new Map([...old.items, ...next.items].map((item) => [item.id, item])).values(),
          ],
          nextCursor: next.nextCursor,
        }));
    } catch {
      if (version === listVersion.current) setError("More selections could not load.");
    } finally {
      if (version === listVersion.current) setBusy(false);
    }
  }
  return (
    <details
      ref={ref}
      className="catalog-picker"
      onToggle={(e) => {
        setOpen(e.currentTarget.open);
        if (e.currentTarget.open) input.current?.focus();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current) {
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary aria-label={label}>
        {value?.name || "Choose a selection"}
        <ChevronDown size={18} />
      </summary>
      <div className="catalog-picker-panel">
        <div className="catalog-kind-toggle">
          <button aria-pressed={kind === "variety"} onClick={() => setKind("variety")}>
            Varieties
          </button>
          <button aria-pressed={kind === "rootstock"} onClick={() => setKind("rootstock")}>
            Rootstocks
          </button>
        </div>
        <label className="catalog-picker-search">
          <Search size={15} />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={80}
            placeholder="Search by name…"
            aria-label={label + " search"}
          />
        </label>
        <select
          size={Math.min(6, Math.max(2, page.items.length))}
          value=""
          aria-label={label + " options"}
          disabled={busy}
          onChange={(e) => void pick(e.target.value)}
        >
          <option value="" disabled>
            {busy ? "Loading…" : "Choose from the catalog"}
          </option>
          {page.items.map((i) => (
            <option key={i.id} value={i.id} disabled={i.id === exclude}>
              {i.name}
            </option>
          ))}
        </select>
        {!busy && !page.items.length && <p>No published entries match this search.</p>}
        {page.nextCursor && (
          <button className="catalog-text-button" disabled={busy} onClick={() => void more()}>
            More selections
          </button>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
    </details>
  );
}

export function CompareExperience({
  initial,
  options,
}: {
  initial: CatalogItem[];
  options: CatalogSummary[];
}) {
  const { selected, choose, ready } = useComparison(),
    [items, setItems] = useState<CatalogItem[]>(initial),
    [onlyDifferences, setOnlyDifferences] = useState(false),
    [error, setError] = useState(""),
    [resolvedFor, setResolvedFor] = useState(initial.map((i) => i.id).join(","));
  const seeded = useRef(false),
    signature = selected.map((s) => s.id).join(",");
  const busy = !!signature && resolvedFor !== signature;
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      initial.forEach((item, i) => choose(item, i));
    }
  }, [initial, choose]);
  useEffect(() => {
    if (!signature) return;
    let active = true;
    fetch("/api/catalog/resolve?ids=" + signature, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d = await r.json();
        if (active) {
          setItems(d.items);
          setError(
            d.items.length < signature.split(",").length
              ? "A selection is no longer published. Please choose a replacement."
              : "",
          );
        }
      })
      .catch(() => {
        if (active) setError("The comparison could not refresh. Please retry.");
      })
      .finally(() => {
        if (active) setResolvedFor(signature);
      });
    return () => {
      active = false;
    };
  }, [signature]);
  const displayed = ready
    ? selected.map(
        (s) =>
          items.find((i) => i.id === s.id) ||
          (resolvedFor !== signature ? initial.find((i) => i.id === s.id) : null) ||
          null,
      )
    : initial;
  function change(item: CatalogItem, index: number) {
    setItems((old) => [...old.filter((i) => i.id !== item.id), item]);
    choose(item, index);
  }
  const columns = [displayed[0] || null, displayed[1] || null];
  const fixed: [string, string, keyof CatalogData][] = [
    ["Overview", "Type", "kind"],
    ["Overview", "Origin", "origin"],
    ["Orchard & harvest", "Harvest season", "season"],
    ["Orchard & harvest", "Harvest window", "seasonMonths"],
    ["Fruit characteristics", "Colour", "colour"],
    ["Fruit characteristics", "Flavour", "flavour"],
    ["Fruit characteristics", "Sugar content", "brix"],
    ["Fruit characteristics", "Firmness", "firmness"],
    ["Storage & market", "Ambient shelf life", "shelfLife"],
    ["Storage & market", "Controlled atmosphere storage", "storageLife"],
    ["Storage & market", "Market class", "marketClass"],
    ["Rootstock characteristics", "Planting system", "system"],
    ["Rootstock characteristics", "Spacing", "spacing"],
    ["Rootstock characteristics", "Yield potential", "yield"],
    ["Rootstock characteristics", "Best suited to", "bestFor"],
  ];
  const rows = fixed.map(([group, label, key]) => ({
    group,
    label,
    values: columns.map((i) => (i ? String(i[key] || "") : "")),
  }));
  for (const c of columns)
    for (const spec of c?.specifications || []) {
      if (
        rows.some(
          (r) =>
            r.group.toLowerCase() === spec.group.toLowerCase() &&
            r.label.toLowerCase() === spec.label.toLowerCase(),
        )
      )
        continue;
      rows.push({
        group: spec.group,
        label: spec.label,
        values: columns.map(
          (i) =>
            i?.specifications.find(
              (s) =>
                s.group.toLowerCase() === spec.group.toLowerCase() &&
                s.label.toLowerCase() === spec.label.toLowerCase(),
            )?.value || "",
        ),
      });
    }
  rows.push(
    {
      group: "Advantages & field guidance",
      label: "Advantages",
      values: columns.map((i) => i?.highlights.join("\n") || ""),
    },
    {
      group: "Advantages & field guidance",
      label: "Agronomy & care",
      values: columns.map((i) => i?.agronomyNotes || i?.note || ""),
    },
  );
  const visible = rows.filter(
      (r) =>
        r.values.some(Boolean) &&
        (!onlyDifferences || r.values[0].trim().toLowerCase() !== r.values[1].trim().toLowerCase()),
    ),
    groups = [...new Set(visible.map((r) => r.group))];
  return (
    <section className="catalog-comparison wrap" aria-busy={busy}>
      <div className="catalog-compare-heading">
        <div>
          <p className="eyebrow">A considered choice</p>
          <h1>
            Every detail.
            <br />
            <em>Side by side.</em>
          </h1>
          <p>Compare varieties and rootstocks using their current published specifications.</p>
        </div>
        <Link href="/products" className="catalog-text-button">
          Explore the planting portfolio <ArrowRight size={16} />
        </Link>
      </div>
      {error && (
        <p className="catalog-notice" role="alert">
          {error}
        </p>
      )}
      <div className="catalog-compare-picks">
        {columns.map((item, i) => (
          <div key={i}>
            <span className="eyebrow">Selection {i + 1}</span>
            <CatalogPicker
              label={"Change selection " + (i + 1)}
              value={item}
              exclude={columns[1 - i]?.id}
              initial={options}
              onSelect={(v) => change(v, i)}
            />
            <div className="catalog-compare-photo">
              {item?.images[0] ? (
                <Image
                  src={item.images[0].src}
                  alt={item.images[0].alt}
                  fill
                  sizes="(max-width:640px) 40vw, 400px"
                />
              ) : (
                <span>A place for your next choice.</span>
              )}
            </div>
            {item && (
              <>
                <p className="catalog-item-kind">
                  {item.kind === "rootstock" ? "Rootstock" : "Apple variety"}
                </p>
                <h2>{item.name}</h2>
                <p>{item.intro}</p>
                <Link className="catalog-text-button" prefetch={false} href={catalogHref(item)}>
                  Full profile <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="catalog-diff-control">
        <label>
          <input
            type="checkbox"
            checked={onlyDifferences}
            onChange={(e) => setOnlyDifferences(e.target.checked)}
          />
          Show differences only
        </label>
        <span>Differences are softly highlighted.</span>
      </div>
      {onlyDifferences && columns.every(Boolean) && !visible.length && (
        <p role="status" className="catalog-empty">
          These selections have no differences in their published specifications.
        </p>
      )}
      {columns.some(Boolean) ? (
        <table className="catalog-comparison-table">
          <caption className="sr-only">Variety and rootstock specifications</caption>
          <colgroup>
            <col className="catalog-spec-label" />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Characteristic</th>
              {columns.map((i, k) => (
                <th scope="col" key={k}>
                  {i?.name || "Choose a selection"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Rows key={group} group={group} rows={visible.filter((r) => r.group === group)} />
            ))}
          </tbody>
        </table>
      ) : (
        <p className="catalog-empty">Choose a variety or rootstock above to begin.</p>
      )}
    </section>
  );
}
function Rows({ group, rows }: { group: string; rows: { label: string; values: string[] }[] }) {
  return (
    <>
      <tr className="catalog-spec-group">
        <th colSpan={3}>{group}</th>
      </tr>
      {rows.map((r) => (
        <tr
          key={r.label}
          className={
            r.values[0].trim().toLowerCase() !== r.values[1].trim().toLowerCase()
              ? "is-different"
              : ""
          }
        >
          <th scope="row">{r.label}</th>
          {r.values.map((v, i) => (
            <td key={i}>{v || "Not specified"}</td>
          ))}
        </tr>
      ))}
    </>
  );
}
