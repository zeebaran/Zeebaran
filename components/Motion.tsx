"use client";

import { useContentString, useContentPage } from "@/features/cms/Content";
import { textKey } from "@/features/cms/model";
import { animate, LazyMotion, MotionConfig, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Framer is only used for Nav (presence) and the season bars, so features load lazily. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={() => import("./motion-features").then((r) => r.default)} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

/**
 * Progressive-enhancement scroll reveal.
 * Server HTML is fully visible. After hydration, only elements that are BELOW the fold are hidden
 * (data-attr = "hidden") and then revealed (= "in") by an IntersectionObserver. Anything already in
 * view at load is never hidden, so it paints immediately (good LCP, no-JS safe, reduced-motion safe).
 */
function useScrollReveal<T extends HTMLElement>(attr: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.setAttribute(attr, "hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // two frames so the hidden state is committed before transitioning to "in"
          requestAnimationFrame(() => requestAnimationFrame(() => el.setAttribute(attr, "in")));
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [attr]);
  return ref;
}

type RevealProps = { children: ReactNode; delay?: number; y?: number; className?: string };

/** Fade-and-rise on scroll. */
export function Reveal({ children, delay = 0, y = 22, className }: RevealProps) {
  const ref = useScrollReveal<HTMLDivElement>("data-reveal");
  const style = { "--d": `${delay}s`, "--y": `${y}px` } as CSSProperties;
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/** Group whose direct children (<Item/>) rise in sequence. */
export function Stagger({
  children,
  className,
  gap = 0.09,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const ref = useScrollReveal<HTMLDivElement>("data-reveal-group");
  return (
    <div ref={ref} className={className} style={{ "--gap": `${gap}s` } as CSSProperties}>
      {children}
    </div>
  );
}
export function Item({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`stagger-item ${className}`}>{children}</div>;
}

/**
 * Heading with {accent} markup. Words rise out of a mask. Real text in one element, so SEO and
 * screen readers are unaffected. `immediate` (hero) is pure CSS and paints before JS loads.
 */
export function Heading({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  immediate = false,
  tone = "underline",
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  immediate?: boolean;
  tone?: "underline" | "leaf";
}) {
  const ref = useScrollReveal<HTMLHeadingElement>("data-reveal-words");
  const copy = useContentString(text);
  const contentPage = useContentPage();
  const words = copy
    .split(/(\{[^}]+\})/g)
    .filter(Boolean)
    .flatMap((p) => {
      const accent = p.startsWith("{");
      return (accent ? p.slice(1, -1) : p)
        .split(/(\s+)/)
        .filter((w) => w.length)
        .map((w) => ({ w, accent }));
    });

  const accentCls = tone === "leaf" ? "accent-leaf" : "accent";
  let n = 0;
  return (
    <Tag
      data-cms-field={textKey(text)}
      data-cms-default={text}
      data-cms-page={contentPage}
      ref={immediate ? undefined : ref}
      className={className}
    >
      {words.map(({ w, accent }, k) =>
        /^\s+$/.test(w) ? (
          <span key={k} className={accent ? accentCls : undefined}>
            {" "}
            {w.includes("\n") && <br className="hidden sm:inline" />}
          </span>
        ) : (
          <span
            key={k}
            className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom"
          >
            <span
              className={`word inline-block ${accent ? accentCls : ""} ${immediate ? "word-rise" : ""}`}
              style={{ "--d": `${delay + 0.045 * n++}s` } as CSSProperties}
            >
              {w}
            </span>
          </span>
        ),
      )}
    </Tag>
  );
}

const fmt = (n: number, to: number) =>
  to >= 1000 ? n.toLocaleString("en-IN") : String(n).padStart(2, "0");

export function CountUp({
  to,
  suffix = "",
  className,
}: {
  to: number;
  suffix?: string;
  className?: string;
}) {
  const copy = useContentString(String(to));
  const contentPage = useContentPage();
  const target = Number.isFinite(Number(copy)) ? Number(copy) : to;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!inView || reduce || target === 0 || !el) return;
    const c = animate(0, target, {
      duration: 1.6,
      ease,
      onUpdate: (n) => {
        el.textContent = fmt(Math.round(n), target);
      },
    });
    return () => {
      c.stop();
      el.textContent = fmt(target, target);
    };
  }, [inView, reduce, target]);
  return (
    <span
      data-cms-field={textKey(String(to))}
      data-cms-default={String(to)}
      data-cms-numeric="true"
      data-cms-page={contentPage}
      className={className}
    >
      <span ref={ref}>{fmt(target, target)}</span>
      {suffix}
    </span>
  );
}
