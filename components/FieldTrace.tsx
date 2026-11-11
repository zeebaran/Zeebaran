"use client";

import { useEffect, useRef } from "react";

/** A transparent instrument over the photograph or the history spine. The scene never moves. */
export function FieldTrace({ kind }: { kind: "orchard" | "history" }) {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = layer.current;
    const scene = element?.parentElement;
    if (!scene || !element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function paint() {
      frame = 0;
      if (!scene || !element) return;
      const box = scene.getBoundingClientRect();
      const progress =
        kind === "history"
          ? (innerHeight * 0.58 - box.top) / Math.max(1, box.height)
          : (innerHeight * 0.93 - box.top) / Math.max(1, box.height + innerHeight * 0.25);
      element.style.setProperty("--field-progress", String(Math.max(0, Math.min(1, progress))));
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const detach = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      detach();
      if (!entry.isIntersecting || preference.matches) return;
      schedule();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    });
    const configure = () => {
      detach();
      observer.disconnect();
      if (!preference.matches) observer.observe(scene);
    };
    configure();
    preference.addEventListener("change", configure);
    return () => {
      detach();
      observer.disconnect();
      preference.removeEventListener("change", configure);
    };
  }, [kind]);
  return (
    <div ref={layer} aria-hidden="true" className={"field-trace trace-" + kind}>
      {kind === "orchard" && (
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" fill="none">
          <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path
              pathLength="1"
              d="M-20 211 C87 204 117 156 219 159 S366 195 428 159 S539 98 611 116 S734 156 805 107 S927 68 1020 39"
            />
            <path
              pathLength="1"
              d="M-20 222 C85 218 121 170 216 172 S364 210 434 171 S541 111 615 129 S734 172 810 119 S935 84 1020 55"
            />
            <path
              pathLength="1"
              d="M-20 236 C85 232 122 185 218 186 S365 226 441 184 S541 128 618 142 S736 184 815 132 S940 97 1020 67"
            />
          </g>
        </svg>
      )}
    </div>
  );
}
