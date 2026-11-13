"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ComparisonProvider } from "@/features/catalog/ComparisonProvider";
import { ContentProvider } from "@/features/cms/Content";
import { VisualContentProvider } from "@/features/cms/visual-context";
import type { ContentValue, PageDefinition } from "@/features/cms/model";
import {
  isVisualMessage,
  isVisualContent,
  visualChannel,
  type VisualSelection,
} from "./visual-protocol";
import "./visual-canvas.css";

type Highlight = { left: number; top: number; width: number; height: number; label: string };
export function VisualCanvas({
  page,
  path,
  initial,
  site,
  definition,
  children,
}: {
  page: string;
  path: string;
  initial: ContentValue;
  site: ContentValue;
  definition: PageDefinition;
  children: ReactNode;
}) {
  const [content, setContent] = useState(initial),
    [editing, setEditing] = useState(true),
    [active, setActive] = useState(true),
    [highlight, setHighlight] = useState<Highlight | null>(null),
    root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== window.parent ||
        !isVisualMessage(event.data) ||
        event.data.page !== page ||
        event.data.type !== "sync"
      )
        return;
      const message = event.data as { content?: ContentValue; editing?: boolean; active?: boolean };
      if (!isVisualContent(message.content) || typeof message.editing !== "boolean") return;
      setContent(message.content);
      setEditing(message.editing);
      setActive(message.active !== false);
      if (message.active === false) {
        root.current
          ?.querySelectorAll("video,audio")
          .forEach((media) => (media as HTMLMediaElement).pause());
        root.current
          ?.querySelectorAll("iframe")
          .forEach((frame) =>
            frame.contentWindow?.postMessage(
              JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
              "https://www.youtube-nocookie.com",
            ),
          );
      }
      setHighlight(null);
      window.parent.postMessage({ channel: visualChannel, type: "synced", page }, location.origin);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ channel: visualChannel, type: "ready", page }, location.origin);
    return () => window.removeEventListener("message", receive);
  }, [page]);
  useEffect(() => {
    let pending = 0,
      previous = "";
    const report = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        const keys = [
          ...new Set(
            Array.from(
              root.current?.querySelectorAll<HTMLElement>("[data-cms-field],[data-cms-image]") ||
                [],
            )
              .filter((node) => node.dataset.cmsPage === page)
              .map((node) => node.dataset.cmsField || node.dataset.cmsImage || ""),
          ),
        ].filter(Boolean);
        const signature = keys.join("|");
        if (signature === previous) return;
        previous = signature;
        window.parent.postMessage(
          { channel: visualChannel, type: "inventory", page, keys },
          location.origin,
        );
      });
    };
    const observer = new MutationObserver(report);
    if (root.current) observer.observe(root.current, { subtree: true, childList: true });
    report();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(pending);
    };
  }, [page]);
  useEffect(() => {
    const fields = new Set(definition.fields.map((field) => field.key)),
      images = new Set(definition.images.map((image) => image.key));
    let hovered: HTMLElement | null = null,
      frame = 0;
    function selection(
      target: Element,
      x?: number,
      y?: number,
    ): { element: HTMLElement; value: VisualSelection; label: string } | null {
      const hubs = target.closest<HTMLElement>("[data-regional-hubs]");
      const podcast = target.closest<HTMLElement>("[data-podcast-section]");
      if (page === "podcast" && podcast)
        return {
          element: podcast,
          value: { kind: "podcast", page: "podcast" },
          label: "Edit podcast episodes",
        };
      if (page === "contact" && hubs)
        return {
          element: hubs,
          value: { kind: "hubs", page: "contact" },
          label: "Edit regional hubs",
        };
      const team = target.closest<HTMLElement>("[data-team-section]");
      if (page === "about" && team)
        return {
          element: team,
          value: { kind: "team", page: "about" },
          label: "Edit team profiles",
        };
      const partners = target.closest<HTMLElement>("[data-partner-strip]");
      if (page === "partnerships" && partners)
        return {
          element: partners,
          value: { kind: "partners", page: "partnerships" },
          label: "Edit partners",
        };
      const marker = target.closest<HTMLElement>("[data-cms-field],[data-cms-image]");
      if (marker) {
        const owner = marker.dataset.cmsPage || "";
        if (owner === "site" && page !== "site")
          return {
            element: marker,
            value: { kind: "shared", page: "site" },
            label: "Shared navigation & footer",
          };
        if (owner === page) {
          if (marker.dataset.cmsImage && images.has(marker.dataset.cmsImage))
            return {
              element: marker,
              value: { kind: "image", page, key: marker.dataset.cmsImage },
              label: "Edit image",
            };
          if (marker.dataset.cmsField && fields.has(marker.dataset.cmsField))
            return {
              element: marker,
              value: { kind: "text", page, key: marker.dataset.cmsField },
              label: "Edit text",
            };
        }
      }
      const card = target.closest<HTMLElement>("[data-video-card][data-video-section]");
      if (
        page === "mission" &&
        card &&
        ["orchard", "process", "demos"].includes(card.dataset.videoSection || "")
      )
        return {
          element: card,
          value: {
            kind: "mission",
            page: "mission",
            id: card.dataset.videoCard!,
            section: card.dataset.videoSection as "orchard" | "process" | "demos",
          },
          label: "Edit video card",
        };
      const product = target.closest<HTMLElement>("[data-catalog-entry]");
      if (product && /^[a-z0-9-]{1,80}$/.test(product.dataset.catalogEntry || ""))
        return {
          element: product,
          value: { kind: "catalog", page, id: product.dataset.catalogEntry! },
          label: "Edit catalog entry",
        };
      if (
        x !== undefined &&
        y !== undefined &&
        !target.closest("p,h1,h2,h3,h4,span,a,button,input,textarea,select,label")
      ) {
        const photos = Array.from(
          root.current?.querySelectorAll<HTMLImageElement>("img[data-cms-image]") || [],
        ).reverse();
        const photo = photos.find((image) => {
          const r = image.getBoundingClientRect();
          return (
            image.dataset.cmsPage === page &&
            images.has(image.dataset.cmsImage || "") &&
            r.width > 1 &&
            r.height > 1 &&
            x >= r.left &&
            x <= r.right &&
            y >= r.top &&
            y <= r.bottom &&
            getComputedStyle(image).visibility !== "hidden"
          );
        });
        if (photo)
          return {
            element: photo,
            value: { kind: "image", page, key: photo.dataset.cmsImage! },
            label: "Edit image",
          };
      }
      return null;
    }
    function bounds(element: HTMLElement) {
      let rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        const range = document.createRange();
        range.selectNodeContents(element);
        rect = range.getBoundingClientRect();
      }
      return rect;
    }
    const move = (event: PointerEvent) => {
      if (!editing || !(event.target instanceof Element)) return;
      const picked = selection(event.target, event.clientX, event.clientY);
      if ((picked?.element || null) === hovered) return;
      hovered = picked?.element || null;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!picked) {
          setHighlight(null);
          return;
        }
        const rect = bounds(picked.element);
        setHighlight({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          label: picked.label,
        });
      });
    };
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !root.current?.contains(event.target)) return;
      const picked = editing ? selection(event.target, event.clientX, event.clientY) : null;
      if (picked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.parent.postMessage(
          { channel: visualChannel, type: "select", page, selection: picked.value },
          location.origin,
        );
        return;
      }
      const link = event.target.closest("a[href]");
      if (link && !(link.getAttribute("href") || "").startsWith("#")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const submit = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const clear = () => {
      hovered = null;
      setHighlight(null);
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("click", click, true);
    document.addEventListener("submit", submit, true);
    window.addEventListener("scroll", clear, { passive: true });
    window.addEventListener("resize", clear);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("click", click, true);
      document.removeEventListener("submit", submit, true);
      window.removeEventListener("scroll", clear);
      window.removeEventListener("resize", clear);
    };
  }, [page, editing, definition]);
  const overrides = useMemo(() => ({ [page]: content }), [page, content]);
  return (
    <VisualContentProvider value={overrides} editing={editing}>
      <div
        ref={root}
        className="visual-canvas-public"
        data-editor-mode={editing ? "edit" : "interact"}
        data-editor-active={active}
      >
        <ContentProvider page="site" value={site}>
          <ComparisonProvider>
            <Nav pathOverride={path} />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <Footer preview />
          </ComparisonProvider>
        </ContentProvider>
        {editing && highlight && (
          <div
            className="visual-canvas-highlight"
            style={{
              left: highlight.left - 3,
              top: highlight.top - 3,
              width: highlight.width + 6,
              height: highlight.height + 6,
            }}
          >
            <span>{highlight.label}</span>
          </div>
        )}
      </div>
    </VisualContentProvider>
  );
}
