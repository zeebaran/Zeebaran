"use client";
import { useAdminFeedback } from "./notifications";
import { MediaThumbnail } from "@/features/media/MediaThumbnail";
import type { MediaCategory } from "@/features/media/categories";
import { DeleteMediaDialog } from "./DeleteMediaDialog";
import { useEffect, useRef, useState } from "react";
import { Search, ImageIcon, Film, Trash2 } from "lucide-react";
import { adminRequest } from "./client";
import { MediaUpload, type LibraryMedia } from "./MediaUpload";
export function MediaLibrary({
  onSelect,
  kind,
  category,
  canDelete = false,
}: {
  onSelect?: (m: LibraryMedia) => void;
  kind?: "image" | "video";
  category?: MediaCategory;
  canDelete?: boolean;
}) {
  const [media, setMedia] = useState<LibraryMedia[]>([]),
    [error, setError] = useAdminFeedback("error"),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [nextCursor, setNextCursor] = useState<string | null>(null),
    [mode, setMode] = useState<"image" | "video">(kind || "image");
  const [deleting, setDeleting] = useState<LibraryMedia | null>(null),
    [, setNotice] = useAdminFeedback("success");
  const paging = useRef(false);
  useEffect(() => {
    let active = true;
    adminRequest<{ media: LibraryMedia[]; nextCursor: string | null }>("/api/admin/media")
      .then((d) => {
        if (active) {
          setMedia(d.media);
          setNextCursor(d.nextCursor);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setError]);
  async function loadMore() {
    if (!nextCursor || loading || paging.current) return;
    paging.current = true;
    setLoading(true);
    setError("");
    try {
      const data = await adminRequest<{ media: LibraryMedia[]; nextCursor: string | null }>(
        "/api/admin/media?cursor=" + encodeURIComponent(nextCursor),
      );
      setMedia((current) => [
        ...new Map([...current, ...data.media].map((item) => [item.publicId, item])).values(),
      ]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load more media.");
    } finally {
      paging.current = false;
      setLoading(false);
    }
  }
  const selected = kind || mode;
  const visibleMedia = media.filter(
    (m) =>
      m.resourceType === selected &&
      (m.name + " " + m.alt).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="admin-library">
      <div className="admin-library-toolbar">
        <label className="admin-search">
          <Search size={16} />
          <input
            aria-label="Search media"
            placeholder="Find a photograph or film…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {!kind && (
          <div className="admin-toggle">
            <button type="button" aria-pressed={mode === "image"} onClick={() => setMode("image")}>
              <ImageIcon size={15} /> Images
            </button>
            <button type="button" aria-pressed={mode === "video"} onClick={() => setMode("video")}>
              <Film size={15} /> Films
            </button>
          </div>
        )}
      </div>
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-library-grid">
        <MediaUpload
          kind={selected}
          category={category}
          onUploaded={(m) => {
            setMedia((a) => [m, ...a.filter((x) => x.publicId !== m.publicId)]);
            onSelect?.(m);
          }}
        />
        {visibleMedia.map((m) => {
          const Preview = onSelect ? "button" : "div";
          return (
            <article key={m.publicId} className="admin-media-card">
              <Preview
                className="admin-media-preview"
                {...(onSelect
                  ? {
                      type: "button" as const,
                      onClick: () => onSelect(m),
                      disabled: m.state === "deleting",
                    }
                  : {})}
                data-pending={m.state === "deleting"}
              >
                {m.resourceType === "image" ? (
                  <MediaThumbnail
                    width={m.width}
                    height={m.height}
                    src={m.src}
                    alt={m.alt}
                    loading="lazy"
                  />
                ) : (
                  <div className="admin-film-thumb">
                    <Film size={28} />
                  </div>
                )}
                <span>
                  <strong>{m.name}</strong>
                  <small>
                    {m.width} × {m.height} · {(m.bytes / 1024 / 1024).toFixed(1)} MB
                    {m.state === "deleting" ? " · Deletion pending" : ""}
                  </small>
                </span>
              </Preview>
              {canDelete && (
                <div className="admin-media-actions">
                  <button
                    type="button"
                    aria-label={
                      (m.state === "deleting" ? "Retry deletion of " : "Delete ") + m.name
                    }
                    onClick={() => setDeleting(m)}
                  >
                    <Trash2 size={14} />
                    {m.state === "deleting" ? "Retry deletion" : "Delete"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {nextCursor && (
        <button
          type="button"
          className="admin-btn admin-outline"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load more media"}
        </button>
      )}
      {loading && (
        <p className="admin-empty" role="status">
          Opening the media library…
        </p>
      )}
      {!loading && !visibleMedia.length && (
        <p className="admin-empty">
          {query.trim()
            ? nextCursor
              ? "No matches in the loaded media. Load more or try a different name."
              : "No media matches this search. Try a different name."
            : nextCursor
              ? `No ${selected === "image" ? "photographs" : "films"} in the loaded media. Load more to check the rest of your library.`
              : `Your library is ready for its first ${selected === "image" ? "photograph" : "film"}. Verified website photographs remain available in each page workspace.`}
        </p>
      )}
      {deleting && (
        <DeleteMediaDialog
          key={deleting.publicId}
          media={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setMedia((items) => items.filter((item) => item.publicId !== deleting.publicId));
            setNotice("File deleted from Cloudinary and the media library.");
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
