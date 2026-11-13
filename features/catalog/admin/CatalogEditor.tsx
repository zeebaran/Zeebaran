"use client";
import { useAdminFeedback } from "@/features/admin/notifications";
import { MediaThumbnail } from "@/features/media/MediaThumbnail";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLink as Link } from "@/features/admin/AdminLink";
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  X,
  Images,
  Trash2,
  ArrowUp,
  ArrowDown,
  EyeOff,
} from "lucide-react";
import { Dialog } from "@/features/admin/Dialog";
import { MediaLibrary } from "@/features/admin/MediaLibrary";
import { adminRequest } from "@/features/admin/client";
import {
  emptyCatalog,
  catalogHref,
  type CatalogData,
  type CatalogEntry,
  type CatalogKind,
  type CatalogImage,
  type CatalogIndexEntry,
} from "../model";
import { harvestSeasons, normalizeHarvestSeason } from "../harvest";

const varietyFields: [keyof CatalogData, string][] = [
  ["origin", "Origin"],
  ["localName", "Local or trade name"],
  ["seasonMonths", "Harvest window"],
  ["colour", "Colour"],
  ["flavour", "Flavour"],
  ["brix", "Sugar content (°Bx)"],
  ["firmness", "Firmness"],
  ["shelfLife", "Ambient shelf life"],
  ["storageLife", "Controlled atmosphere storage"],
  ["marketClass", "Market class"],
];
const rootFields: [keyof CatalogData, string][] = [
  ["code", "Rootstock code"],
  ["origin", "Origin"],
  ["system", "Planting system / vigour"],
  ["spacing", "Recommended spacing"],
  ["yield", "Yield potential"],
  ["bestFor", "Best suited to"],
  ["note", "Rootstock guidance"],
];
export function CatalogEditor({
  initial,
  kind,
  role,
}: {
  initial: CatalogEntry | null;
  kind: CatalogKind;
  role: "admin" | "editor";
}) {
  const router = useRouter();
  const mutationPending = useRef(false);
  const [record, setRecord] = useState(initial),
    [data, setData] = useState<CatalogData>(initial?.draft || emptyCatalog(kind)),
    [error, setError] = useAdminFeedback("error"),
    [, setNotice] = useAdminFeedback("success"),
    [busy, setBusy] = useState(""),
    [picker, setPicker] = useState(false),
    [confirm, setConfirm] = useState<"publish" | "unpublish" | "delete" | null>(null),
    [confirmation, setConfirmation] = useState("");
  const dirty = JSON.stringify(data) !== JSON.stringify(record?.draft || emptyCatalog(kind)),
    dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    const navigate = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a");
      if (dirtyRef.current && a && !a.target && !window.confirm("Discard unsaved catalog changes?"))
        e.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, []);
  function field<K extends keyof CatalogData>(key: K, value: CatalogData[K]) {
    setData((old) => ({ ...old, [key]: value }));
  }
  async function save(action: "save" | "publish" | "unpublish" | "delete") {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setError("");
    setNotice("");
    setBusy(action);
    try {
      const d = await adminRequest<{ record: CatalogEntry }>(
        record ? "/api/admin/catalog/" + record.id : "/api/admin/catalog",
        record
          ? {
              action,
              revision: record.revision,
              ...(action === "save" || action === "publish" ? { content: data } : {}),
              ...(action === "delete" ? { confirmation } : {}),
            }
          : { content: data },
      );
      setRecord(d.record);
      setData(d.record.draft);
      setConfirm(null);
      setNotice(
        action === "publish"
          ? "Published. The catalog and comparisons now use this revision."
          : action === "unpublish"
            ? "Unpublished. This entry is private."
            : action === "delete"
              ? "Entry moved to deleted items. You can restore it as a draft."
              : "Draft saved.",
      );
      if (action === "delete") {
        dirtyRef.current = false;
        router.push("/admin/catalog?kind=" + kind + "&deleted=1");
        router.refresh();
      } else if (!record) {
        dirtyRef.current = false;
        router.replace("/admin/catalog/" + d.record.id);
        router.refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      mutationPending.current = false;
      setBusy("");
    }
  }
  const input = (key: keyof CatalogData, label: string, large = false) => (
    <label key={key}>
      {label}
      {large ? (
        <textarea
          rows={key === "intro" ? 5 : 3}
          value={String(data[key])}
          maxLength={key === "intro" || key === "agronomyNotes" ? 12000 : 4000}
          onChange={(e) => field(key, e.target.value as never)}
        />
      ) : (
        <input
          value={String(data[key])}
          maxLength={key === "name" ? 120 : 500}
          onChange={(e) => {
            if (key === "name" && !record) {
              const auto = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              setData((old) => ({
                ...old,
                name: e.target.value,
                slug:
                  !old.slug || old.slug === auto
                    ? e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    : old.slug,
              }));
            } else field(key, e.target.value as never);
          }}
        />
      )}
    </label>
  );
  return (
    <div className="admin-page catalog-editor">
      <Link className="admin-back" href={"/admin/catalog?kind=" + kind}>
        <ArrowLeft size={14} />
        Planting collection
      </Link>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">
            {kind.toUpperCase()} / {record ? "THE LIVING RECORD" : "A NEW CHAPTER"}
          </p>
          <h1>
            {record ? data.name : "Room to grow."}
            <br />
            <em>{record ? "Every detail matters." : "Start with strong roots."}</em>
          </h1>
          <p>
            {record?.published ? "A published version is live" : "Private draft"}{" "}
            {record && "· Revision " + record.revision} {dirty && "· Unsaved changes"}
          </p>
        </div>
        <div className="catalog-editor-controls">
          <button
            disabled={!!busy || !dirty}
            className="admin-btn admin-outline"
            onClick={() => void save("save")}
          >
            <Save size={15} />
            {busy === "save" ? "Saving…" : "Save draft"}
          </button>
          {role === "admin" && (
            <button
              disabled={!!busy || !record}
              className="admin-btn admin-primary"
              onClick={() => setConfirm("publish")}
            >
              <Send size={14} />
              Publish
            </button>
          )}
          {record?.published && (
            <a
              className="admin-btn admin-outline"
              href={catalogHref(data)}
              target="_blank"
              rel="noreferrer"
            >
              View live
            </a>
          )}
        </div>
      </div>
      {error && <p className="admin-notice admin-notice-error">{error}</p>}
      {role === "editor" && (
        <p className="admin-notice">
          You can prepare drafts. An administrator reviews and publishes them.
        </p>
      )}
      <fieldset className="contents" disabled={!!busy}>
        <section className="catalog-edit-section">
          <header>
            <span>01</span>
            <div>
              <h2>Identity & story</h2>
              <p>The words that introduce this planting choice.</p>
            </div>
          </header>
          <div className="catalog-form-grid">
            {input("name", "Name")}
            <label>
              Permanent URL
              <input
                value={data.slug}
                disabled={!!record}
                maxLength={80}
                onChange={(e) => field("slug", e.target.value)}
              />
              <small>
                Lowercase words separated by hyphens. Fixed after creation to preserve links.
              </small>
            </label>
            {input("eyebrow", "Eyebrow")}
            {input("headline", "Headline · use {braces} for an editorial accent")}
            {input("badge", "Optional badge")}
            <label>
              Display order
              <input
                type="number"
                value={data.sortOrder}
                min={-100000}
                max={100000}
                onChange={(e) => field("sortOrder", Number(e.target.value))}
              />
            </label>
            <div className="catalog-full-field">{input("intro", "Description", true)}</div>
          </div>
        </section>
        <section className="catalog-edit-section">
          <header>
            <span>02</span>
            <div>
              <h2>{kind === "variety" ? "Variety profile" : "Rootstock profile"}</h2>
              <p>Precise, owner-verified specifications feed both the profile and comparison.</p>
            </div>
          </header>
          <div className="catalog-form-grid">
            {kind === "variety" && (
              <label>
                Harvest season
                <select
                  value={normalizeHarvestSeason(data.season) || ""}
                  onChange={(event) => field("season", event.target.value)}
                >
                  <option value="">Choose a harvest season</option>
                  {harvestSeasons.map((season) => (
                    <option key={season.key} value={season.value}>
                      {season.label}
                    </option>
                  ))}
                </select>
                <small>
                  Controls the harvest filter on the website. Publish to make changes live.
                </small>
              </label>
            )}
            {(kind === "variety" ? varietyFields : rootFields).map(([key, label]) =>
              input(key, label, key === "note" || key === "bestFor"),
            )}
          </div>
        </section>
        {kind === "variety" && (
          <section className="catalog-edit-section">
            <header>
              <span>03</span>
              <div>
                <h2>Compatible rootstocks</h2>
                <p>
                  Link independent rootstock entries. Only published choices are offered to
                  visitors.
                </p>
              </div>
            </header>
            <RootstockLinks value={data.rootstockIds} onChange={(v) => field("rootstockIds", v)} />
          </section>
        )}
        <section className="catalog-edit-section">
          <header>
            <span>04</span>
            <div>
              <h2>Advantages & care</h2>
              <p>Practical benefits and the details a grower should consider.</p>
            </div>
          </header>
          <div className="catalog-form-grid">
            <label>
              Advantages · one per line
              <textarea
                rows={6}
                value={data.highlights.join("\n")}
                onChange={(e) => field("highlights", e.target.value.split("\n"))}
                onBlur={() =>
                  field("highlights", data.highlights.map((s) => s.trim()).filter(Boolean))
                }
              />
            </label>
            {input("agronomyNotes", "Agronomy and care guidance", true)}
          </div>
        </section>
        <section className="catalog-edit-section">
          <header>
            <span>05</span>
            <div>
              <h2>Photographs with a place</h2>
              <p>
                The first image is the cover. Shared media stays in the library when an entry is
                deleted.
              </p>
            </div>
          </header>
          <div className="catalog-image-list">
            {data.images.map((image, i) => (
              <article key={i}>
                <MediaThumbnail
                  width={image.width}
                  height={image.height}
                  src={image.src}
                  alt={image.alt}
                />
                <label>
                  Image description
                  <input
                    value={image.alt}
                    maxLength={300}
                    onChange={(e) =>
                      field(
                        "images",
                        data.images.map((m, j) => (j === i ? { ...m, alt: e.target.value } : m)),
                      )
                    }
                  />
                </label>
                <div>
                  <button
                    className="admin-icon-button"
                    disabled={i === 0}
                    aria-label={"Move image " + (i + 1) + " up"}
                    onClick={() => {
                      const a = [...data.images];
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                      field("images", a);
                    }}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    className="admin-icon-button"
                    disabled={i === data.images.length - 1}
                    aria-label={"Move image " + (i + 1) + " down"}
                    onClick={() => {
                      const a = [...data.images];
                      [a[i + 1], a[i]] = [a[i], a[i + 1]];
                      field("images", a);
                    }}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    className="admin-icon-button"
                    aria-label={"Remove image " + (i + 1)}
                    onClick={() =>
                      field(
                        "images",
                        data.images.filter((_, j) => j !== i),
                      )
                    }
                  >
                    <X size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <button
            className="admin-btn admin-outline"
            disabled={data.images.length >= 12}
            onClick={() => setPicker(true)}
          >
            <Images size={15} />
            Choose or upload a photograph
          </button>
        </section>
        <section className="catalog-edit-section">
          <header>
            <span>06</span>
            <div>
              <h2>Additional specifications</h2>
              <p>
                Add your own groups and characteristics. Matching group and label names align
                automatically in comparisons.
              </p>
            </div>
          </header>
          {data.specifications.map((spec, i) => (
            <div key={i} className="catalog-spec-editor">
              {(["group", "label", "value"] as const).map((key) => (
                <label key={key}>
                  {key}
                  <input
                    value={spec[key]}
                    maxLength={key === "value" ? 2000 : 100}
                    onChange={(e) =>
                      field(
                        "specifications",
                        data.specifications.map((s, j) =>
                          j === i ? { ...s, [key]: e.target.value } : s,
                        ),
                      )
                    }
                  />
                </label>
              ))}
              <button
                className="admin-icon-button"
                aria-label={"Remove specification " + (i + 1)}
                onClick={() =>
                  field(
                    "specifications",
                    data.specifications.filter((_, j) => j !== i),
                  )
                }
              >
                <X size={15} />
              </button>
            </div>
          ))}
          <button
            className="admin-btn admin-outline"
            disabled={data.specifications.length >= 80}
            onClick={() =>
              field("specifications", [...data.specifications, { group: "", label: "", value: "" }])
            }
          >
            <Plus size={15} />
            Add specification
          </button>
        </section>
        {record && role === "admin" && (
          <section className="catalog-edit-section catalog-sensitive">
            <h2>Publication & removal</h2>
            <p>
              Save or discard unsaved edits before changing availability. Removing an entry never
              deletes shared photographs.
            </p>
            <div>
              {record.published && (
                <button
                  disabled={!!busy || dirty}
                  className="admin-btn admin-outline"
                  onClick={() => setConfirm("unpublish")}
                >
                  <EyeOff size={15} />
                  Unpublish
                </button>
              )}
              <button
                disabled={!!busy || dirty}
                className="admin-btn admin-outline"
                onClick={() => {
                  setConfirmation("");
                  setConfirm("delete");
                }}
              >
                <Trash2 size={15} />
                Delete entry
              </button>
            </div>
          </section>
        )}
      </fieldset>
      {picker && (
        <Dialog
          label="Choose a catalog photograph"
          className="admin-media-dialog"
          onClose={() => setPicker(false)}
        >
          <div className="admin-dialog-heading">
            <h2>Choose a photograph.</h2>
            <button
              className="admin-icon-button"
              aria-label="Close photo library"
              onClick={() => setPicker(false)}
            >
              <X />
            </button>
          </div>
          <OriginalImages
            onChoose={(image) => {
              field("images", [...data.images, image]);
              setPicker(false);
            }}
          />
          <MediaLibrary
            category={kind === "rootstock" ? "rootstocks" : "apple-varieties"}
            kind="image"
            onSelect={(m) => {
              field("images", [
                ...data.images,
                { src: m.src, alt: m.alt, publicId: m.publicId, width: m.width, height: m.height },
              ]);
              setPicker(false);
            }}
          />
        </Dialog>
      )}
      {confirm && (
        <Dialog
          label={confirm + " catalog entry"}
          className="admin-confirm-dialog"
          onClose={() => {
            if (!busy) setConfirm(null);
          }}
        >
          <h2>
            {confirm === "publish"
              ? "Ready to grow?"
              : confirm === "unpublish"
                ? "Make this entry private?"
                : "Remove this entry?"}
          </h2>
          <p>
            {confirm === "publish"
              ? "The current details will become available on the website and in comparisons."
              : confirm === "unpublish"
                ? "The entry will disappear from public listings, profiles and comparisons. Its draft stays here."
                : "This removes the entry from the website and keeps a recoverable copy in Deleted entries. Linked rootstocks cannot be removed until their variety relationships are cleared."}
          </p>
          {confirm === "delete" && (
            <label>
              Type {data.name} to confirm
              <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            </label>
          )}
          <div>
            <button
              disabled={!!busy}
              className="admin-btn admin-outline"
              onClick={() => setConfirm(null)}
            >
              Keep editing
            </button>
            <button
              disabled={!!busy || (confirm === "delete" && confirmation !== data.name)}
              className="admin-btn admin-primary"
              onClick={() => void save(confirm)}
            >
              {busy
                ? "Working…"
                : confirm === "publish"
                  ? "Publish entry"
                  : confirm === "unpublish"
                    ? "Unpublish entry"
                    : "Delete entry"}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
function RootstockLinks({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [q, setQ] = useState(""),
    [items, setItems] = useState<CatalogIndexEntry[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [error, setError] = useAdminFeedback("error"),
    [loadingMore, setLoadingMore] = useState(false);
  const requestVersion = useRef(0),
    paging = useRef(false);
  useEffect(() => {
    const version = ++requestVersion.current;
    let active = true;
    const timer = setTimeout(() => {
      adminRequest<{ items: CatalogIndexEntry[]; nextCursor: string | null }>(
        "/api/admin/catalog?kind=rootstock&q=" + encodeURIComponent(q),
      )
        .then((d) => {
          if (active && version === requestVersion.current) {
            setItems(d.items);
            setCursor(d.nextCursor);
            setError("");
          }
        })
        .catch((e) => {
          if (active && version === requestVersion.current) setError(e.message);
        });
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
      if (requestVersion.current === version) requestVersion.current = version + 1;
    };
  }, [q, setError]);
  async function more() {
    if (!cursor || paging.current) return;
    const version = requestVersion.current;
    paging.current = true;
    setLoadingMore(true);
    setError("");
    try {
      const next = await adminRequest<{ items: CatalogIndexEntry[]; nextCursor: string | null }>(
        "/api/admin/catalog?" + new URLSearchParams({ kind: "rootstock", q, cursor }),
      );
      if (version !== requestVersion.current) return;
      setItems((old) => [
        ...new Map([...old, ...next.items].map((item) => [item.id, item])).values(),
      ]);
      setCursor(next.nextCursor);
    } catch (e) {
      if (version === requestVersion.current) setError((e as Error).message);
    } finally {
      if (version === requestVersion.current) {
        paging.current = false;
        setLoadingMore(false);
      }
    }
  }

  return (
    <div className="catalog-root-links">
      <label>
        Find a rootstock
        <input
          value={q}
          maxLength={80}
          onChange={(e) => {
            requestVersion.current++;
            paging.current = false;
            setLoadingMore(false);
            setCursor(null);
            setQ(e.target.value);
          }}
          placeholder="Search by name…"
        />
      </label>
      <div>
        {value.map((id) => (
          <button
            key={id}
            className="catalog-root-chip"
            onClick={() => onChange(value.filter((v) => v !== id))}
          >
            {items.find((i) => i.id === id)?.draft.name || id}
            <X size={13} />
          </button>
        ))}
      </div>
      <div className="catalog-root-options">
        {items.map((item) => (
          <label key={item.id}>
            <input
              type="checkbox"
              checked={value.includes(item.id)}
              disabled={!value.includes(item.id) && value.length >= 24}
              onChange={(e) =>
                onChange(
                  e.target.checked ? [...value, item.id] : value.filter((v) => v !== item.id),
                )
              }
            />
            {item.draft.name}
            <small>{item.published ? "Published" : "Draft"}</small>
          </label>
        ))}
      </div>
      {cursor && (
        <button
          className="admin-btn admin-outline"
          disabled={loadingMore}
          onClick={() => void more()}
        >
          {loadingMore ? "Loading rootstocks…" : "More rootstocks"}
        </button>
      )}
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

function OriginalImages({ onChoose }: { onChoose: (image: CatalogImage) => void }) {
  const [items, setItems] = useState<(CatalogImage & { name: string })[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [error, setError] = useAdminFeedback("error"),
    [loadingMore, setLoadingMore] = useState(false);
  const paging = useRef(false);
  useEffect(() => {
    let active = true;
    adminRequest<{ items: (CatalogImage & { name: string })[]; nextCursor: string | null }>(
      "/api/admin/catalog/assets",
    )
      .then((d) => {
        if (active) {
          setItems(d.items);
          setCursor(d.nextCursor);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [setError]);
  return (
    <section className="catalog-originals">
      <h3>Original site photographs</h3>
      <p>Reuse the photographs already registered by the authored-content migration.</p>
      <div>
        {items.map((m) => (
          <button
            key={m.src}
            onClick={() =>
              onChoose({ src: m.src, alt: m.alt, ...(m.publicId ? { publicId: m.publicId } : {}) })
            }
          >
            <MediaThumbnail
              width={m.width}
              height={m.height}
              src={m.src}
              alt={m.alt}
              loading="lazy"
            />
            <span>{m.name}</span>
          </button>
        ))}
      </div>
      {cursor && (
        <button
          className="admin-btn admin-outline"
          disabled={loadingMore}
          onClick={async () => {
            if (paging.current || !cursor) return;
            paging.current = true;
            setLoadingMore(true);
            setError("");
            try {
              const d = await adminRequest<{
                items: (CatalogImage & { name: string })[];
                nextCursor: string | null;
              }>("/api/admin/catalog/assets?cursor=" + encodeURIComponent(cursor));
              setItems((old) => [
                ...new Map([...old, ...d.items].map((item) => [item.src, item])).values(),
              ]);
              setCursor(d.nextCursor);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              paging.current = false;
              setLoadingMore(false);
            }
          }}
        >
          {loadingMore ? "Loading photographs…" : "More original photographs"}
        </button>
      )}
      {error && <p>{error}</p>}
      <h3>Cloudinary collection</h3>
    </section>
  );
}
