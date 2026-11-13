"use client";
import { useAdminFeedback } from "./notifications";
import { MediaThumbnail } from "@/features/media/MediaThumbnail";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Save,
  Send,
  Eye,
  Search,
  Type,
  Images,
  ImageOff,
  History,
  Check,
  RotateCcw,
  X,
  AlertCircle,
  PanelTop,
  Film,
  Users,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { AdminLink as Link } from "@/features/admin/AdminLink";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  type ContentValue,
  type PageDefinition,
  type PageRecord,
  type MediaValue,
  type VideoSource,
} from "@/features/cms/model";
import { adminRequest, AdminRequestError } from "./client";
import { sameContent } from "@/features/cms/equal-content";
const MediaLibrary = dynamic(() => import("./MediaLibrary").then((m) => m.MediaLibrary));
import { Dialog } from "./Dialog";
import { MissionVideoFields } from "./MissionVideoFields";
import { MissionHeroFields } from "./MissionHeroFields";
import { missionSections } from "@/features/cms/mission-content";
import { teamIssue } from "@/features/team/schema";
const TeamFields = dynamic(() => import("@/features/team/TeamFields").then((m) => m.TeamFields));
const PodcastFields = dynamic(() =>
  import("@/features/podcast/PodcastFields").then((m) => m.PodcastFields),
);
import { partnerIssue } from "@/features/cms/partners";
import { RegionalHubFields } from "./RegionalHubFields";
import { regionalHubIssue } from "@/features/cms/regional-hubs";
import { PartnerFields } from "./PartnerFields";
import { VisualEditor } from "./VisualEditor";
type Revision = {
  id: string;
  action: string;
  actor: string;
  createdAt: string | null;
  revision: number;
};
const tabs: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "visual", label: "Page preview", Icon: PanelTop },
  { id: "text", label: "Words & story", Icon: Type },
  { id: "images", label: "Images", Icon: Images },
  { id: "history", label: "Revision history", Icon: History },
];
export function PageEditor({
  page,
  title,
  url,
  description,
  definition,
  visualDefinition,
  initial,
  initialHistory,
  canPublish = true,
}: {
  page: string;
  title: string;
  url: string;
  description: string;
  definition: PageDefinition;
  visualDefinition: PageDefinition;
  initial: PageRecord;
  initialHistory?: Revision[];
  canPublish?: boolean;
}) {
  const router = useRouter();
  const loadedAt = initial.fetchedAt;
  const [record, setRecord] = useState(initial),
    [content, setContent] = useState<ContentValue>(initial.draft),
    [history, setHistory] = useState(initialHistory),
    [historyFailed, setHistoryFailed] = useState(false);
  const [tab, setTab] = useState("visual"),
    [group, setGroup] = useState("All sections"),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(""),
    [error, setError] = useAdminFeedback("error"),
    [notice, setNotice] = useAdminFeedback("success"),
    [picker, setPicker] = useState<string | null>(null),
    [confirm, setConfirm] = useState(false);
  const dirty = useMemo(() => !sameContent(content, record.draft), [content, record.draft]);
  const needsPublish = useMemo(
    () => !record.publishedAt || dirty || !sameContent(content, record.published),
    [content, record.published, record.publishedAt, dirty],
  );
  useEffect(() => {
    if (tab !== "history" || history !== undefined || historyFailed) return;
    let active = true;
    adminRequest<{ history: Revision[] }>(
      "/api/admin/content/" + page + "?view=history&revision=" + record.revision,
    )
      .then((data) => {
        if (active) setHistory(data.history);
      })
      .catch((error) => {
        if (active) {
          setError(error.message);
          setHistoryFailed(true);
        }
      });
    return () => {
      active = false;
    };
  }, [tab, history, historyFailed, page, record.revision, setError]);
  const historyLoading = tab === "history" && history === undefined && !historyFailed;
  const dirtyRef = useRef(dirty);
  const mutationPending = useRef(false);
  // Intent-prefetched route snapshots render immediately; revalidate older
  // snapshots privately in the background. Never overwrite edits made meanwhile.
  const currentRecord = useRef(record);
  useEffect(() => {
    currentRecord.current = record;
  }, [record]);
  useEffect(() => {
    const incoming = initial.revision > currentRecord.current.revision;
    if (!incoming && (!loadedAt || Date.now() - loadedAt < 1000)) return;
    let active = true;
    const refresh = incoming
      ? Promise.resolve({ record: initial })
      : adminRequest<{ record: PageRecord }>("/api/admin/content/" + page + "?view=record");
    refresh
      .then(({ record: latest }) => {
        if (!active || latest.revision <= currentRecord.current.revision) return;
        if (dirtyRef.current) {
          setError(
            "A newer revision was saved elsewhere. Your unsaved edits are preserved; reload before saving.",
          );
          return;
        }
        setRecord(latest);
        setContent(latest.draft);
        setHistory(undefined);
        setHistoryFailed(false);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof AdminRequestError && (error.status === 401 || error.status === 403)) {
          router.replace("/admin/login");
          router.refresh();
        } else
          setError(
            "Could not refresh this workspace. Save operations still check the latest revision. Please retry or reload.",
          );
      });
    return () => {
      active = false;
    };
  }, [page, initial, loadedAt, router, setError]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    const navigate = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a");
      if (
        dirtyRef.current &&
        a &&
        !a.target &&
        a.href &&
        !a.href.endsWith("#") &&
        !window.confirm("Leave this workspace and discard unsaved changes?")
      )
        e.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", leave);
      document.removeEventListener("click", navigate, true);
    };
  }, []);
  const pageTabs = tabs
    .filter((item) => page !== "podcast" || item.id !== "images")
    .flatMap((item) =>
      page === "podcast" && item.id === "history"
        ? [{ id: "episodes", label: "Podcast episodes", Icon: Film }, item]
        : page === "mission" && item.id === "history"
          ? [{ id: "videos", label: "Video upload", Icon: Film }, item]
          : page === "about" && item.id === "history"
            ? [{ id: "team", label: "Team", Icon: Users }, item]
            : page === "partnerships" && item.id === "history"
              ? [{ id: "partners", label: "Partners", Icon: Users }, item]
              : page === "contact" && item.id === "history"
                ? [{ id: "hubs", label: "Regional hubs", Icon: MapPin }, item]
                : [item],
    );
  const groups = Array.from(new Set(definition.fields.map((f) => f.group)));
  async function mutate(action: "save" | "publish" | "restore", version?: string) {
    if (
      mutationPending.current ||
      (action === "save" && !dirty) ||
      (action === "publish" && !needsPublish)
    )
      return;
    setError("");
    setNotice("");
    if (action !== "restore" && page === "about" && content.team !== undefined) {
      const issue = teamIssue(content.team);
      if (issue) {
        setError(issue);
        setConfirm(false);
        setTab("team");
        return;
      }
    }
    if (action !== "restore" && page === "partnerships" && content.partners !== undefined) {
      const issue = partnerIssue(content.partners);
      if (issue) {
        setError(issue);
        setConfirm(false);
        setTab("partners");
        return;
      }
    }
    if (action !== "restore" && page === "contact" && content.regionalHubs !== undefined) {
      const issue = regionalHubIssue(content.regionalHubs);
      if (issue) {
        setError(issue);
        setConfirm(false);
        setTab("hubs");
        return;
      }
    }
    mutationPending.current = true;
    setBusy(action);
    try {
      const d = await adminRequest<{ record: PageRecord }>("/api/admin/content/" + page, {
        action,
        revision: record.revision,
        ...(action === "restore" ? { version } : { content }),
      });
      setRecord(d.record);
      setContent(d.record.draft);
      currentRecord.current = d.record;
      setHistory(undefined);
      setHistoryFailed(false);
      setNotice(
        action === "publish"
          ? "Published. The website now uses this revision."
          : action === "restore"
            ? "The revision is restored as a draft. Preview it before publishing."
            : "Draft saved.",
      );
      setConfirm(false);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The operation could not complete. Your edits are still here.",
      );
    } finally {
      mutationPending.current = false;
      setBusy("");
    }
  }
  const text = useCallback((key: string, value: string, fallback: string) => {
    setContent((old) => {
      const next = { ...old, text: { ...old.text } };
      if (value === fallback) delete next.text[key];
      else next.text[key] = value;
      return next;
    });
  }, []);
  const image = useCallback((key: string, value: MediaValue | null) => {
    setContent((old) => ({ ...old, images: { ...old.images, [key]: value } }));
  }, []);
  const resetImage = useCallback((key: string) => {
    setContent((old) => {
      const images = { ...old.images };
      delete images[key];
      return { ...old, images };
    });
  }, []);
  function video(id: string, source?: VideoSource) {
    setContent((old) => ({
      ...old,
      missionSections: Object.fromEntries(
        Object.entries(missionSections(old)).map(([section, cards]) => [
          section,
          cards.map((card) => (card.id === id ? { ...card, video: source } : card)),
        ]),
      ) as ReturnType<typeof missionSections>,
    }));
  }
  const fields = definition.fields.filter(
    (f) =>
      (group === "All sections" || f.group === group) &&
      (f.value + " " + f.group).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className={"admin-page admin-editor " + (tab === "visual" ? "is-visual" : "")}>
      <Link href="/admin" className="admin-back">
        <ArrowLeft size={14} /> Editorial index
      </Link>
      <div className="admin-page-heading admin-editor-heading">
        <div>
          <p className="admin-eyebrow">{description.toUpperCase()}</p>
          <h1>
            {title}
            <em> workspace.</em>
          </h1>
          <p>
            {url} <span className="admin-separator">/</span>{" "}
            <span>
              {record.publishedAt ? "A published revision is live" : "The original website is live"}
            </span>
          </p>
        </div>
        <div className="admin-editor-actions">
          <a
            className="admin-btn admin-outline"
            href={"/api/admin/preview?page=" + page}
            target="_blank"
            rel="noreferrer"
            aria-disabled={dirty}
            onClick={(e) => {
              if (dirty) {
                e.preventDefault();
                setError("Save your draft before previewing it.");
              }
            }}
          >
            <Eye size={16} />
            Preview draft
          </a>
          <button
            className="admin-btn admin-outline"
            disabled={!!busy || !dirty}
            onClick={() => void mutate("save")}
          >
            <Save size={16} />
            {busy === "save" ? "Saving…" : "Save draft"}
          </button>
          {canPublish && (
            <button
              className="admin-btn admin-primary"
              disabled={!!busy || !needsPublish}
              onClick={() => setConfirm(true)}
            >
              <Send size={15} />
              Publish
            </button>
          )}
        </div>
      </div>
      <div className="admin-editor-status">
        <span>
          <i className={dirty ? "unsaved" : ""} />
          {dirty ? "Unsaved changes" : notice || "Your workspace is up to date"}
        </span>
        <span>
          Revision {record.revision}{" "}
          {record.updatedAt &&
            "· " +
              new Date(record.updatedAt).toLocaleDateString("en-GB", {
                dateStyle: "medium",
                timeZone: "UTC",
              })}
        </span>
      </div>
      {error && (
        <div className="admin-notice admin-notice-error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      <div className="admin-editor-tabs" role="tablist" aria-label="Editing areas">
        {pageTabs.map(({ id, label, Icon }, i) => (
          <button
            type="button"
            key={id}
            role="tab"
            tabIndex={tab === id ? 0 : -1}
            aria-selected={tab === id}
            aria-controls={"editor-" + id}
            id={"editor-tab-" + id}
            onClick={() => setTab(id)}
            onKeyDown={(e) => {
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % pageTabs.length
                  : e.key === "ArrowLeft"
                    ? (i + pageTabs.length - 1) % pageTabs.length
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? pageTabs.length - 1
                        : null;
              if (next !== null) {
                e.preventDefault();
                setTab(pageTabs[next].id);
                document.getElementById("editor-tab-" + pageTabs[next].id)?.focus();
              }
            }}
          >
            <Icon size={16} />
            {label}
            {id === "images" && <small>{definition.images.length}</small>}
          </button>
        ))}
      </div>
      <fieldset className="contents" disabled={!!busy}>
        <section
          role="tabpanel"
          id="editor-visual"
          aria-labelledby="editor-tab-visual"
          hidden={tab !== "visual"}
          style={tab !== "visual" ? { display: "none" } : undefined}
        >
          <VisualEditor
            active={tab === "visual"}
            page={page}
            title={title}
            definition={visualDefinition}
            content={content}
            onText={text}
            onImage={image}
            onResetImage={resetImage}
            onChoose={setPicker}
            onContent={setContent}
          />
        </section>
        {tab !== "visual" && (
          <section role="tabpanel" id={"editor-" + tab} aria-labelledby={"editor-tab-" + tab}>
            {tab === "episodes" && page === "podcast" && (
              <PodcastFields
                content={content}
                onChange={(podcast) => setContent((old) => ({ ...old, podcast }))}
              />
            )}
            {tab === "hubs" && page === "contact" && (
              <RegionalHubFields
                content={content}
                onChange={(regionalHubs) => setContent((old) => ({ ...old, regionalHubs }))}
              />
            )}
            {tab === "team" && page === "about" && (
              <TeamFields
                content={content}
                onChange={(team) => setContent((old) => ({ ...old, team }))}
              />
            )}
            {tab === "partners" && page === "partnerships" && (
              <PartnerFields
                content={content}
                onChange={(partners) => setContent((old) => ({ ...old, partners }))}
              />
            )}
            {tab === "videos" && page === "mission" && (
              <MissionVideoFields
                content={content}
                onChange={(sections) =>
                  setContent((old) => ({ ...old, missionSections: sections }))
                }
                onChoose={(id) => setPicker("video:" + id)}
              />
            )}
            {tab === "text" && (
              <>
                {page === "mission" && (
                  <MissionHeroFields fields={definition.fields} content={content} onText={text} />
                )}
                {page !== "mission" && (
                  <div>
                    <div className="admin-edit-toolbar">
                      <label className="admin-search">
                        <Search size={16} />
                        <input
                          placeholder="Find a phrase, headline or section…"
                          aria-label="Find editable text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </label>
                      <label className="admin-section-select">
                        <span className="sr-only">Section</span>
                        <select value={group} onChange={(e) => setGroup(e.target.value)}>
                          <option>All sections</option>
                          {groups.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="admin-edit-columns">
                      <div className="admin-field-list">
                        {fields.map((f, i) => (
                          <label className="admin-copy-field" key={f.key}>
                            <span>
                              <small>{f.label || f.group}</small>
                              {content.text[f.key] !== undefined && (
                                <i>
                                  <Check size={12} /> Edited
                                </i>
                              )}
                            </span>
                            <textarea
                              rows={f.value.length > 180 ? 5 : f.value.length > 80 ? 3 : 2}
                              inputMode={f.numeric ? "decimal" : undefined}
                              value={content.text[f.key] ?? f.value}
                              onChange={(e) => text(f.key, e.target.value, f.value)}
                              maxLength={12000}
                              aria-label={f.group + " text " + (i + 1)}
                            />
                            <small className="admin-field-meta">
                              {f.numeric ? "Statistic" : null}
                              <button
                                type="button"
                                disabled={content.text[f.key] === undefined}
                                onClick={() => text(f.key, f.value, f.value)}
                              >
                                Restore original
                              </button>
                            </small>
                          </label>
                        ))}
                        {!fields.length && (
                          <p className="admin-empty">No fields match this search.</p>
                        )}
                      </div>
                      <aside className="admin-editor-guide">
                        <span className="admin-eyebrow">A NOTE FROM THE DESK</span>
                        <h3>
                          Let the story
                          <br />
                          <em>breathe.</em>
                        </h3>
                        <p>
                          Keep the page’s hierarchy in mind. Clear, specific language carries
                          further than a longer sentence.
                        </p>
                        <hr />
                        <strong>Editorial accents</strong>
                        <p>
                          Words inside &#123;braces&#125; keep their existing accent styling and
                          motion. Preserve the braces around the phrase you want to emphasise.
                        </p>
                        <hr />
                        <strong>Review before publishing</strong>
                        <p>
                          Save your changes, open the draft preview, and check the page on a narrow
                          screen too.
                        </p>
                        <a href={url} target="_blank" rel="noreferrer">
                          View the public page <ArrowUpRight size={15} />
                        </a>
                      </aside>
                    </div>
                  </div>
                )}
              </>
            )}
            {tab === "images" && (
              <>
                <div className="admin-tab-intro">
                  <h2>Photographs with a place.</h2>
                  <p>
                    Each image below is connected to a placement on this page. Replacements keep the
                    existing layout and responsive framing.
                  </p>
                </div>
                <div className="admin-image-slots">
                  {definition.images.map((slot, i) => {
                    const override = content.images[slot.key];
                    const value =
                      override === undefined ? { src: slot.src, alt: slot.alt } : override;
                    return (
                      <article className="admin-image-slot" key={slot.key}>
                        <div className="admin-slot-preview">
                          {value && (
                            <MediaThumbnail
                              width={value.width}
                              height={value.height}
                              src={value.src}
                              alt={value.alt}
                              loading="lazy"
                            />
                          )}
                          <span>
                            {String(i + 1).padStart(2, "0")} ·{" "}
                            {override === null
                              ? "Removed from page"
                              : override
                                ? "Draft replacement"
                                : "Original asset"}
                          </span>
                        </div>
                        <div>
                          <small className="admin-eyebrow">{slot.group}</small>
                          <h3>{slot.alt || "Page photograph"}</h3>
                          {value && (
                            <label>
                              Alternative text
                              <textarea
                                rows={2}
                                value={value.alt}
                                onChange={(e) => image(slot.key, { ...value, alt: e.target.value })}
                                maxLength={300}
                              />
                            </label>
                          )}
                          <div className="admin-slot-actions admin-image-actions">
                            <button
                              className="admin-btn admin-outline"
                              onClick={() => setPicker(slot.key)}
                            >
                              <Images size={15} />
                              Choose or upload
                            </button>
                            <button
                              className="admin-text-button"
                              disabled={override === undefined}
                              onClick={() => resetImage(slot.key)}
                            >
                              <RotateCcw size={13} />
                              Original
                            </button>
                            {value && (
                              <button
                                type="button"
                                className="admin-text-button"
                                onClick={() => image(slot.key, null)}
                              >
                                <ImageOff size={13} /> Remove from page
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {!definition.images.length && (
                  <p className="admin-empty">No image placements on this page.</p>
                )}
              </>
            )}
            {tab === "history" && (
              <>
                <div className="admin-tab-intro">
                  <h2>A careful record.</h2>
                  <p>
                    Restoring a revision creates a draft. The public page changes only when you
                    publish it. The latest 20 revisions and current/previous publication snapshots
                    are retained.
                  </p>
                </div>
                <div className="admin-history">
                  {historyLoading && <p role="status">Opening revision history…</p>}
                  {historyFailed && (
                    <button
                      className="admin-btn admin-outline"
                      onClick={() => setHistoryFailed(false)}
                    >
                      Retry revision history
                    </button>
                  )}
                  {(history || []).map((h) => (
                    <article key={h.id}>
                      <span className="admin-history-dot" />
                      <div>
                        <strong>
                          {h.action === "publish"
                            ? "Published"
                            : h.action === "restore"
                              ? "Restored as draft"
                              : "Draft saved"}{" "}
                          · revision {h.revision}
                        </strong>
                        <p>
                          {h.actor}{" "}
                          {h.createdAt &&
                            "· " +
                              new Date(h.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })}
                        </p>
                      </div>
                      <button
                        className="admin-btn admin-outline"
                        disabled={!!busy || dirty}
                        onClick={() => void mutate("restore", h.id)}
                      >
                        Restore as draft
                      </button>
                    </article>
                  ))}
                </div>
                {!historyLoading && history?.length === 0 && (
                  <p className="admin-empty">The first saved revision will appear here.</p>
                )}
              </>
            )}
          </section>
        )}
      </fieldset>
      {picker && (
        <Dialog
          label={picker.startsWith("video:") ? "Choose a film" : "Choose a photograph"}
          className="admin-media-dialog"
          onClose={() => setPicker(null)}
        >
          <div className="admin-dialog-heading">
            <div>
              <p className="admin-eyebrow">THE SHARED COLLECTION</p>
              <h2>
                {picker.startsWith("video:") ? "Choose a field film." : "Choose a photograph."}
              </h2>
            </div>
            <button
              className="admin-icon-button"
              aria-label="Close media library"
              onClick={() => setPicker(null)}
            >
              <X />
            </button>
          </div>
          <MediaLibrary
            kind={picker.startsWith("video:") ? "video" : "image"}
            onSelect={(m) => {
              if (picker.startsWith("video:"))
                video(picker.slice(6), { kind: "cloudinary", src: m.src });
              else
                image(picker, {
                  src: m.src,
                  alt: m.alt,
                  publicId: m.publicId,
                  resourceType: "image",
                  width: m.width,
                  height: m.height,
                });
              setPicker(null);
            }}
          />
        </Dialog>
      )}
      {confirm && (
        <Dialog
          label="Publish this page"
          className="admin-confirm-dialog"
          onClose={() => {
            if (!busy) setConfirm(false);
          }}
        >
          <span className="admin-kicker">
            <Send size={16} /> READY TO GO LIVE
          </span>
          <h2>Publish this chapter?</h2>
          <p>
            Your current page content will replace the live content on <strong>{title}</strong>. The
            previous revision stays in history.
          </p>
          <div>
            <button
              className="admin-btn admin-outline"
              disabled={!!busy}
              onClick={() => setConfirm(false)}
            >
              Keep editing
            </button>
            <button
              className="admin-btn admin-primary"
              disabled={!!busy}
              onClick={() => void mutate("publish")}
            >
              {busy === "publish" ? "Publishing…" : "Publish changes"}
              <ArrowUpRight size={15} />
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
