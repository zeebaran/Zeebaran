"use client";
import { m } from "framer-motion";
import { seasons } from "@/lib/content";
import { ease } from "./Motion";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function Seasons() {
  return (
    <div
      className="card overflow-hidden p-5 sm:p-8"
      role="figure"
      aria-label="Capabilities across the crop calendar"
    >
      <div
        className="overflow-x-auto [scrollbar-width:thin]"
        role="region"
        aria-label="Crop calendar, scrollable"
        tabIndex={0}
      >
        <div className="min-w-[44rem]">
          <div className="grid grid-cols-[10rem_1fr] gap-4 sm:grid-cols-[13rem_1fr]">
            <span />
            <div className="grid grid-cols-12 text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
              {MONTHS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
          {seasons.map((s, i) => (
            <div
              key={s.label}
              className="grid grid-cols-[10rem_1fr] items-center gap-4 border-t border-line py-4 sm:grid-cols-[13rem_1fr]"
            >
              <div>
                <p className="text-small font-semibold text-forest">{s.label}</p>
                <p className="mt-0.5 text-[0.6875rem] leading-snug text-muted">{s.note}</p>
              </div>
              <div className="relative grid h-3 grid-cols-12 rounded-full bg-cream">
                <m.div
                  className="h-full origin-left rounded-full"
                  style={{
                    gridColumn: `${s.start + 1} / ${s.end + 1}`,
                    background: i === 3 ? "var(--orange)" : i % 2 ? "var(--green)" : "var(--leaf)",
                  }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 1.1, delay: i * 0.12, ease }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[0.6875rem] text-muted">
        Indicative Kashmiri apple calendar. Exact timing varies by district, elevation, variety and
        season.
      </p>
    </div>
  );
}
