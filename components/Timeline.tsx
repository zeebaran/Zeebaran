"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { platformPhases } from "@/lib/content";

/** Vertical timeline; the centre line draws as you scroll (GSAP ScrollTrigger). Static if reduced motion. */
export function Timeline({
  items = platformPhases,
}: {
  items?: readonly { phase: string; title: string; constraint: string; response: string }[];
}) {
  const root = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current || !line.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(line.current, { scaleY: 1 });
        return;
      }
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
        gsap.from(el.querySelector("[data-card]"), {
          opacity: 0,
          y: 28,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        });
        gsap.from(el.querySelector("[data-dot]"), {
          scale: 0,
          duration: 0.5,
          ease: "back.out(2)",
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <ol ref={root} className="relative mx-auto max-w-4xl">
      <div className="absolute bottom-0 left-4 top-0 w-px bg-line md:left-1/2" aria-hidden />
      <div
        ref={line}
        className="absolute bottom-0 left-4 top-0 w-px origin-top bg-green md:left-1/2"
        aria-hidden
      />
      {items.map((p, i) => (
        <li
          key={`${p.phase}-${p.title}`}
          data-step
          className={`relative grid gap-4 py-5 pl-12 md:grid-cols-2 md:gap-16 md:pl-0`}
        >
          <span
            data-dot
            className="absolute left-4 top-9 z-10 grid size-4 -translate-x-1/2 place-items-center rounded-full bg-green ring-4 ring-white md:left-1/2"
            aria-hidden
          />
          <article
            data-card
            className={`card p-6 ${i % 2 ? "md:col-start-2" : "md:col-start-1 md:text-right"}`}
          >
            <span className="micro">{p.phase}</span>
            <h3 className="mt-2 text-[1.125rem] font-semibold tracking-tight">{p.title}</h3>
            <dl className={`mt-3 space-y-2 text-small ${i % 2 ? "" : "md:ml-auto"}`}>
              <div>
                <dt className="micro text-muted">The constraint</dt>
                <dd className="mt-0.5">{p.constraint}</dd>
              </div>
              <div>
                <dt className="micro text-muted">What we built</dt>
                <dd className="mt-0.5 text-forest/90">{p.response}</dd>
              </div>
            </dl>
          </article>
        </li>
      ))}
    </ol>
  );
}
