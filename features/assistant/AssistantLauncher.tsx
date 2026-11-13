"use client";
import dynamic from "next/dynamic";
import { AssistantMark } from "./AssistantMark";
import { useEffect, useRef, useState } from "react";
import { useComparison } from "@/features/catalog/ComparisonProvider";
const AssistantPanel = dynamic(() => import("./AssistantPanel"), { ssr: false });
export function AssistantLauncher() {
  const [opened, setOpened] = useState(false),
    [mounted, setMounted] = useState(false),
    [offset, setOffset] = useState(0);
  const button = useRef<HTMLButtonElement>(null),
    symbol = useRef<HTMLSpanElement>(null),
    rotation = useRef<Animation | null>(null),
    { selected } = useComparison();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => rotation.current?.cancel();
    const visibility = () => {
      button.current?.setAttribute("data-motion-paused", String(document.hidden));
      if (document.hidden) stop();
    };
    const motion = () => {
      if (preference.matches) stop();
    };
    visibility();
    preference.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stop();
      preference.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  function revolve() {
    const mark = symbol.current;
    if (!mark || rotation.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    mark.setAttribute("data-spinning", "true");
    const animation = mark.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      { duration: 1400, easing: "cubic-bezier(0.45, 0, 0.2, 1)" },
    );
    rotation.current = animation;
    void animation.finished
      .catch(() => {})
      .then(() => {
        if (rotation.current !== animation) return;
        rotation.current = null;
        mark.removeAttribute("data-spinning");
      });
  }
  useEffect(() => {
    if (mounted && !opened) button.current?.focus();
  }, [mounted, opened]);
  useEffect(() => {
    if (!selected.length) return;
    const dock = document.querySelector(".compare-dock");
    if (!dock) return;
    const update = () =>
      setOffset(Math.max(0, window.innerHeight - dock.getBoundingClientRect().top));
    const observer = new ResizeObserver(update);
    observer.observe(dock);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [selected.length]);
  return (
    <>
      <button
        ref={button}
        className="orchard-launcher"
        style={{
          bottom: `calc(${(selected.length ? offset : 0) + 20}px + env(safe-area-inset-bottom, 0px))`,
        }}
        aria-label="Open Zeebaran assistant"
        aria-haspopup="dialog"
        aria-expanded={opened}
        aria-controls={mounted ? "orchard-assistant" : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") revolve();
        }}
        onFocus={revolve}
        onClick={() => {
          setMounted(true);
          setOpened(true);
        }}
      >
        <span ref={symbol} className="orchard-launcher-symbol" aria-hidden="true">
          <AssistantMark />
        </span>
        <span className="orchard-launcher-label">Ask Zeebaran</span>
      </button>
      {mounted && (
        <AssistantPanel
          opened={opened}
          clearance={(selected.length ? offset : 0) + 20}
          onClose={() => {
            setOpened(false);
          }}
        />
      )}
    </>
  );
}
