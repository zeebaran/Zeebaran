"use client";

import { ContentText, useContentImageOverrides } from "@/features/cms/Content";
import { imageKey } from "@/features/cms/model";
import { useVisualEditing } from "@/features/cms/visual-context";

import { ContentImage as Image } from "@/features/cms/Content";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Heading, Reveal } from "@/components/Motion";

const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em] text-green";

const PHOTOS = [
  {
    src: "asset:orchards/zeebaran-high-density-orchard-3f108-webp",
    caption: "High-Density Orchard · Pulwama Valley",
  },
  {
    src: "asset:orchards/high-density-trellis-orchard-rows-under-hail-df766-webp",
    caption: "Trellis Rows · Hail Protection System",
  },
  {
    src: "asset:orchards/lush-green-apple-orchard-in-himalayan-valley-7ab59-webp",
    caption: "Apple Orchard · Himalayan Valley",
  },
  {
    src: "asset:orchards/editorial-documentary-photography-of-kashmiri-apple-orchard-1c8bf-webp",
    caption: "Kashmiri Apple Orchard · Documentary",
  },
  {
    src: "asset:galleries/field-work/agronomists-and-farmers-inspecting-orchard-branches-c648b-webp",
    caption: "Field Team · Branch Inspection",
  },
  {
    src: "asset:orchards/nurseries/nursery-development-and-hillside-mother-block-orchards-11ecd-webp",
    caption: "Nursery & Mother Block · Hillside",
  },
  {
    src: "asset:orchards/himalayan-valley-settlements-and-orchards-30d80-webp",
    caption: "Himalayan Valley · Orchard Settlements",
  },
  {
    src: "asset:orchards/mountain-orchards-in-kashmir-valley-1c555-webp",
    caption: "Mountain Orchards · Kashmir Valley",
  },
  {
    src: "asset:galleries/field-work/field-inspection-0a509-webp",
    caption: "Field Inspection · Zeebaran Team",
  },
  { src: "asset:orchards/demonstration-23ec7-webp", caption: "On-Site Demonstration" },
];

export function OrchardGallery() {
  const overrides = useContentImageOverrides();
  const editing = useVisualEditing();
  const photos = PHOTOS.filter((photo) => editing || overrides[imageKey(photo.src)] !== null);
  const [selected, setSelected] = useState("");
  const current = Math.max(
    0,
    photos.findIndex((photo) => photo.src === selected),
  );
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const container = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const advancing =
    photos.length > 1 &&
    !paused &&
    reduced === false &&
    visible &&
    pageVisible &&
    !hovered &&
    !focused;
  const hasPhotos = photos.length > 0;
  useEffect(() => {
    if (!hasPhotos) return;
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    const visibility = () => setPageVisible(document.visibilityState === "visible");
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [hasPhotos]);
  const nextPhoto = photos[current + 1]?.src ?? photos[0]?.src ?? "";
  useEffect(() => {
    if (!advancing) return;
    const timer = setTimeout(() => setSelected(nextPhoto), 3800);
    return () => clearTimeout(timer);
  }, [advancing, nextPhoto]);
  function go(idx: number) {
    setPaused(true);
    setSelected(photos[idx].src);
  }

  if (!hasPhotos) return null;
  return (
    <section
      ref={container}
      aria-label="Orchard photographs"
      aria-roledescription="carousel"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className="border-t border-green/10 bg-white py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal y={8}>
          <span className={eyebrow}>
            <ContentText>Orchard Gallery</ContentText>
          </span>
        </Reveal>
        <Heading tone="leaf" text={"Proof from {the field.}"} className="mb-4 mt-4 text-h2" />
        <Reveal delay={0.1}>
          <p className="mb-10 max-w-2xl text-body text-forest/70">
            <ContentText>
              Every photograph is taken on-site during active installations, field sessions, and
              agronomic visits across the Kashmir Valley.
            </ContentText>
          </p>
        </Reveal>

        {/* ── Main slideshow ── */}
        <div
          className="relative w-full overflow-hidden rounded-3xl shadow-xl"
          style={{ aspectRatio: "16/9" }}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setHovered(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setHovered(false);
          }}
        >
          <ContentText>
            {photos.map((photo, i) => (
              <div
                key={photo.src}
                aria-hidden={i !== current}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
              >
                <ContentText>
                  {(i === current ||
                    i === (current + 1) % photos.length ||
                    i === (current - 1 + photos.length) % photos.length) && (
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 1152px"
                    />
                  )}
                </ContentText>
                {/* Caption gradient bar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/80 via-forest/30 to-transparent px-6 pb-5 pt-16">
                  <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-white/70">
                    <ContentText>Zeebaran · In The Field</ContentText>
                  </p>
                  <p className="mt-1 font-serif text-[1.0625rem] italic text-white">
                    <ContentText>{photo.caption}</ContentText>
                  </p>
                </div>
              </div>
            ))}
          </ContentText>

          {/* Prev arrow */}
          <button
            onClick={() => go((current - 1 + photos.length) % photos.length)}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition hover:bg-black/50"
          >
            <svg
              className="size-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            onClick={() => go((current + 1) % photos.length)}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition hover:bg-black/50"
          >
            <svg
              className="size-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Counter badge */}
          <span className="absolute left-4 top-4 z-10 rounded-full bg-black/30 px-3 py-1 text-[0.65rem] font-semibold text-white/90 backdrop-blur-sm">
            <ContentText>{current + 1}</ContentText>{" "}
            <ContentText>
              / <ContentText></ContentText>
              {photos.length}
            </ContentText>
          </span>

          <button
            type="button"
            onClick={() => {
              if (paused) {
                setFocused(false);
                setHovered(false);
              }
              setPaused(!paused);
            }}
            aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
            aria-pressed={paused}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white backdrop-blur-sm"
          >
            <ContentText>{paused ? "Resume" : "Pause"}</ContentText>
          </button>
        </div>

        {/* ── Dot nav ── */}
        <div className="mt-5 flex items-center justify-center gap-0.5">
          <ContentText>
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Photo ${i + 1}`}
                aria-pressed={i === current}
                className="flex size-6 shrink-0 items-center justify-center rounded-full"
              >
                <span
                  aria-hidden="true"
                  className={`rounded-full transition-all duration-300 ${i === current ? "h-2.5 w-6 bg-green" : "size-2.5 bg-green/25"}`}
                />
              </button>
            ))}
          </ContentText>
        </div>

        {/* ── Thumbnail strip ── */}
        <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <ContentText>
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                onClick={() => go(i)}
                aria-label={photo.caption}
                aria-pressed={i === current}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                  i === current
                    ? "ring-2 ring-green ring-offset-2 opacity-100"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <Image src={photo.src} alt="" fill className="object-cover" sizes="96px" />
              </button>
            ))}
          </ContentText>
        </div>
      </div>
    </section>
  );
}
