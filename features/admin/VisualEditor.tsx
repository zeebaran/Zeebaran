"use client";
import { MediaThumbnail } from "@/features/media/MediaThumbnail";
import dynamic from "next/dynamic";
const TeamFields = dynamic(() => import("@/features/team/TeamFields").then((m) => m.TeamFields));
const PodcastFields = dynamic(() =>
  import("@/features/podcast/PodcastFields").then((m) => m.PodcastFields),
);
import { memo, useEffect, useRef, useState } from "react";
import { AdminLink as Link } from "@/features/admin/AdminLink";
import {
  Monitor,
  Tablet,
  Smartphone,
  MousePointer2,
  Hand,
  X,
  Images,
  ImageOff,
  RotateCcw,
  ArrowUpRight,
  Search,
} from "lucide-react";
import type { ContentValue, MediaValue, PageDefinition } from "@/features/cms/model";
import { Dialog } from "./Dialog";
import { RegionalHubFields } from "./RegionalHubFields";
import { PartnerFields } from "./PartnerFields";
import { MissionVideoFields } from "./MissionVideoFields";
import { visualChannel, isVisualMessage, type VisualSelection } from "./visual-protocol";
import { missionSections } from "@/features/cms/mission-content";

export const VisualEditor = memo(function VisualEditor({
  page,
  active = true,
  title,
  definition,
  content,
  onText,
  onImage,
  onResetImage,
  onChoose,
  onContent,
}: {
  page: string;
  active?: boolean;
  title: string;
  definition: PageDefinition;
  content: ContentValue;
  onText: (key: string, value: string, fallback: string) => void;
  onImage: (key: string, value: MediaValue | null) => void;
  onResetImage: (key: string) => void;
  onChoose: (key: string) => void;
  onContent: (content: ContentValue) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null),
    [ready, setReady] = useState(false),
    [mode, setMode] = useState(true),
    [width, setWidth] = useState("full"),
    [selection, setSelection] = useState<VisualSelection | null>(null),
    [unavailable, setUnavailable] = useState(false);
  const [available, setAvailable] = useState<string[] | null>(null),
    [query, setQuery] = useState(""),
    [retry, setRetry] = useState(0),
    find = useRef<HTMLDetailsElement>(null);
  const current = useRef({ content, mode, active });
  useEffect(() => {
    current.current = { content, mode, active };
  }, [content, mode, active]);
  function sync() {
    frame.current?.contentWindow?.postMessage(
      {
        channel: visualChannel,
        type: "sync",
        page,
        content: current.current.content,
        editing: current.current.mode,
        active: current.current.active,
      },
      location.origin,
    );
  }
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow ||
        !isVisualMessage(event.data) ||
        event.data.page !== page
      )
        return;
      if (event.data.type === "ready") {
        setUnavailable(false);
        frame.current?.contentWindow?.postMessage(
          {
            channel: visualChannel,
            type: "sync",
            page,
            content: current.current.content,
            editing: current.current.mode,
            active: current.current.active,
          },
          location.origin,
        );
      }
      if (event.data.type === "synced") {
        setReady(true);
        setUnavailable(false);
      }
      if (event.data.type === "inventory" && "keys" in event.data && Array.isArray(event.data.keys))
        setAvailable(
          event.data.keys
            .filter((key): key is string => typeof key === "string" && key.length < 100)
            .slice(0, 3000),
        );
      if (event.data.type === "select" && "selection" in event.data) {
        const selected = event.data.selection as VisualSelection;
        if (!selected || typeof selected !== "object") return;
        if ((selected.kind === "text" || selected.kind === "image") && selected.page !== page)
          return;
        if (
          selected.kind === "text" &&
          !definition.fields.some((field) => field.key === selected.key)
        )
          return;
        if (
          selected.kind === "image" &&
          !definition.images.some((image) => image.key === selected.key)
        )
          return;
        if (
          selected.kind === "mission" &&
          (page !== "mission" ||
            !Object.values(missionSections(current.current.content))
              .flat()
              .some((card) => card.id === selected.id))
        )
          return;
        if (
          selected.kind === "catalog" &&
          (typeof selected.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(selected.id))
        )
          return;
        if (selected.kind === "team" && (page !== "about" || selected.page !== page)) return;
        if (selected.kind === "podcast" && (page !== "podcast" || selected.page !== page)) return;
        if (selected.kind === "hubs" && (page !== "contact" || selected.page !== page)) return;
        if (selected.kind === "partners" && (page !== "partnerships" || selected.page !== page))
          return;
        if (
          ![
            "text",
            "image",
            "mission",
            "partners",
            "hubs",
            "team",
            "podcast",
            "catalog",
            "shared",
          ].includes(selected.kind)
        )
          return;
        setSelection(selected);
      }
    };
    window.addEventListener("message", receive);
    const timeout = setTimeout(() => setUnavailable(true), 20000);
    return () => {
      window.removeEventListener("message", receive);
      clearTimeout(timeout);
    };
  }, [page, definition, retry]);
  useEffect(() => {
    if (!ready) return;
    // Interaction mode changes must not wait for the typing debounce.
    frame.current?.contentWindow?.postMessage(
      {
        channel: visualChannel,
        type: "sync",
        page,
        content: current.current.content,
        editing: mode,
        active,
      },
      location.origin,
    );
  }, [mode, page, ready, active]);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      frame.current?.contentWindow?.postMessage(
        {
          channel: visualChannel,
          type: "sync",
          page,
          content,
          editing: current.current.mode,
          active: current.current.active,
        },
        location.origin,
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [content, page, ready]);
  const field =
    selection?.kind === "text"
      ? definition.fields.find((item) => item.key === selection.key)
      : null;
  const image =
    selection?.kind === "image"
      ? definition.images.find((item) => item.key === selection.key)
      : null;
  const imageOverride = image ? content.images[image.key] : undefined;
  const media = image
    ? imageOverride === undefined
      ? { src: image.src, alt: image.alt }
      : imageOverride
    : null;
  return (
    <div className="admin-visual-editor">
      <div className="admin-visual-toolbar">
        <div className="admin-visual-mode" role="group" aria-label="Preview interaction">
          <button type="button" aria-pressed={mode} onClick={() => setMode(true)}>
            <MousePointer2 size={15} /> Edit page
          </button>
          <button type="button" aria-pressed={!mode} onClick={() => setMode(false)}>
            <Hand size={15} /> Interact
          </button>
        </div>
        <details className="admin-visual-find" ref={find}>
          <summary>
            <Search size={15} /> Find content
          </summary>
          <div>
            <input
              aria-label="Find page content"
              placeholder="Search text or photographs…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ul>
              {[
                ...definition.fields
                  .filter(
                    (field) =>
                      (!available || available.includes(field.key)) &&
                      ((content.text[field.key] || field.value) + field.group)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  )
                  .map((field) => ({
                    key: field.key,
                    label: content.text[field.key] || field.value,
                    kind: "text" as const,
                  })),
                ...definition.images
                  .filter(
                    (image) =>
                      (!available ||
                        available.includes(image.key) ||
                        content.images[image.key] === null) &&
                      ((content.images[image.key]?.alt || image.alt) + image.group)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  )
                  .map((image) => ({
                    key: image.key,
                    label: image.alt || "Page photograph",
                    kind: "image" as const,
                  })),
              ]
                .slice(0, 60)
                .map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelection({ kind: item.kind, page, key: item.key });
                        if (find.current) find.current.open = false;
                      }}
                    >
                      {item.kind === "image" ? <Images size={14} /> : null}
                      <span>{item.label.replace(/[{}]/g, "")}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </details>
        <span>
          {mode
            ? "Click text, a photograph or a video card to edit it."
            : "Try menus, galleries and playback. Form submissions stay disabled."}
        </span>
        <div className="admin-visual-devices" role="group" aria-label="Preview width">
          {[
            ["full", "Full width", Monitor],
            ["820", "Tablet", Tablet],
            ["390", "Mobile", Smartphone],
          ].map(([value, label, Icon]) => {
            const Device = Icon as typeof Monitor;
            return (
              <button
                key={value as string}
                type="button"
                aria-label={label as string}
                aria-pressed={width === value}
                onClick={() => setWidth(value as string)}
              >
                <Device size={17} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="admin-visual-stage">
        <div
          className="admin-visual-device"
          style={{ width: width === "full" ? "100%" : width + "px" }}
        >
          <iframe
            ref={frame}
            title={title + " — editable website preview"}
            src={"/admin/canvas/" + page}
            onLoad={sync}
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
          {!ready && (
            <div className="admin-visual-loading" role="status">
              <div>
                <p>
                  {unavailable ? "The preview could not connect." : "Opening the live page layout…"}
                </p>
                {unavailable && (
                  <button
                    type="button"
                    className="admin-btn admin-outline"
                    onClick={() => {
                      setReady(false);
                      setUnavailable(false);
                      setRetry((value) => value + 1);
                      if (frame.current) frame.current.src = "/admin/canvas/" + page;
                    }}
                  >
                    Reload preview
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {selection && (
        <Dialog
          label={
            field
              ? "Edit page text"
              : image
                ? "Edit page image"
                : selection.kind === "mission"
                  ? "Edit Mission section"
                  : "Edit website content"
          }
          onClose={() => setSelection(null)}
          trapFocus={selection.kind === "podcast"}
          className={
            selection.kind === "team" ||
            selection.kind === "mission" ||
            selection.kind === "partners" ||
            selection.kind === "podcast" ||
            selection.kind === "hubs"
              ? "admin-visual-section-dialog"
              : "admin-visual-inspector"
          }
        >
          <div className="admin-dialog-heading">
            <div>
              <p className="admin-eyebrow">{title}</p>
              <h2>
                {field
                  ? "Edit text."
                  : image
                    ? "Edit photograph."
                    : selection.kind === "mission"
                      ? "Field films."
                      : "Connected content."}
              </h2>
            </div>
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Close content editor"
              onClick={() => setSelection(null)}
            >
              <X />
            </button>
          </div>
          {field && (
            <VisualTextControl
              key={field.key}
              value={content.text[field.key] ?? field.value}
              numeric={field.numeric}
              onChange={(value) => onText(field.key, value, field.value)}
            />
          )}
          {image && (
            <div className="admin-visual-image-edit">
              {media ? (
                <>
                  <MediaThumbnail
                    width={media.width}
                    height={media.height}
                    src={media.src}
                    alt=""
                  />
                  <label>
                    Image description
                    <textarea
                      aria-label="Image description"
                      rows={3}
                      maxLength={300}
                      value={media.alt}
                      onChange={(event) =>
                        onImage(image.key, { ...media, alt: event.target.value })
                      }
                    />
                  </label>
                </>
              ) : (
                <p className="admin-image-removed" role="status">
                  Image removed from this page.
                </p>
              )}
              <button
                type="button"
                className="admin-btn admin-primary"
                onClick={() => onChoose(image.key)}
              >
                <Images size={15} /> Choose or upload image
              </button>
              <button
                type="button"
                className="admin-text-button"
                disabled={imageOverride === undefined}
                onClick={() => onResetImage(image.key)}
              >
                <RotateCcw size={14} /> Use original image
              </button>
              {media && (
                <button
                  type="button"
                  className="admin-text-button"
                  onClick={() => onImage(image.key, null)}
                >
                  <ImageOff size={14} /> Remove from page
                </button>
              )}
            </div>
          )}
          {selection.kind === "hubs" && (
            <RegionalHubFields
              content={content}
              onChange={(regionalHubs) => onContent({ ...content, regionalHubs })}
            />
          )}
          {selection.kind === "team" && (
            <TeamFields content={content} onChange={(team) => onContent({ ...content, team })} />
          )}
          {selection.kind === "partners" && (
            <PartnerFields
              content={content}
              onChange={(partners) => onContent({ ...content, partners })}
            />
          )}
          {selection.kind === "mission" && (
            <MissionVideoFields
              key={selection.section}
              initialSection={selection.section}
              content={content}
              onChange={(sections) => onContent({ ...content, missionSections: sections })}
              onChoose={(id) => onChoose("video:" + id)}
            />
          )}
          {field && (
            <button
              type="button"
              className="admin-text-button"
              onClick={() => {
                onText(field.key, field.value, field.value);
                setSelection(null);
              }}
            >
              <RotateCcw size={14} /> Use original wording
            </button>
          )}
          {selection.kind === "shared" && (
            <>
              <p>
                Navigation and footer are shared across the website. Edit them in Site settings.
              </p>
              <Link className="admin-btn admin-primary" href="/admin/pages/site">
                Open site settings <ArrowUpRight size={15} />
              </Link>
            </>
          )}
          {selection.kind === "catalog" && (
            <>
              <p>
                This entry is managed in the product catalog so its details stay consistent across
                listings and comparisons.
              </p>
              <Link className="admin-btn admin-primary" href={"/admin/catalog/" + selection.id}>
                Edit catalog entry <ArrowUpRight size={15} />
              </Link>
            </>
          )}
          {selection.kind === "podcast" && (
            <PodcastFields
              content={content}
              onChange={(podcast) => onContent({ ...content, podcast })}
            />
          )}
          <div className="admin-visual-inspector-footer">
            <p>Changes stay private until you publish.</p>
            <button
              type="button"
              className="admin-btn admin-primary"
              onClick={() => setSelection(null)}
            >
              Done
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
});
function VisualTextControl({
  value,
  numeric,
  onChange,
}: {
  value: string;
  numeric?: boolean;
  onChange: (value: string) => void;
}) {
  const [plain, setPlain] = useState(value.replace(/[{}]/g, "")),
    [accent, setAccent] = useState(value.match(/\{([^}]+)\}/)?.[1] || "");
  function update(text: string, highlight: string) {
    setPlain(text);
    setAccent(highlight);
    onChange(
      highlight && text.includes(highlight) ? text.replace(highlight, "{" + highlight + "}") : text,
    );
  }
  return (
    <div className="admin-visual-text-edit">
      <label>
        {numeric ? "Value" : "Text"}
        {numeric ? (
          <input
            aria-label="Value"
            autoFocus
            type="number"
            min="0"
            step="any"
            value={plain}
            onChange={(event) => update(event.target.value, "")}
          />
        ) : (
          <textarea
            aria-label="Text"
            autoFocus
            rows={value.length > 150 ? 7 : 4}
            maxLength={12000}
            value={plain}
            onChange={(event) => update(event.target.value, accent)}
          />
        )}
      </label>
      {value.includes("{") || accent ? (
        <label>
          Highlighted words
          <input
            aria-label="Highlighted words"
            value={accent}
            maxLength={200}
            onChange={(event) => update(plain, event.target.value)}
          />
          <small>Choose words from the text above to keep the page’s existing accent.</small>
        </label>
      ) : null}
    </div>
  );
}
