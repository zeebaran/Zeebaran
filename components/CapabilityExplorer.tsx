"use client";

import { ContentText } from "@/features/cms/Content";

import { useRef, useState } from "react";
import { capabilities } from "@/lib/capabilities";
import { ArrowUpRight } from "lucide-react";
import { ContentLink as Link } from "@/features/cms/Content";

import { Stagger, Item, Reveal } from "./Motion";

export function CapabilityExplorer() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = capabilities[selected];
  return (
    <div>
      <div role="tablist" aria-label="Value chain capabilities">
        <Stagger gap={0.06} className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {capabilities.map((item, i) => (
            <Item key={item.id}>
              <button
                className={
                  "h-full w-full rounded-xl p-4 text-left text-xs font-semibold uppercase tracking-wide text-forest transition-colors " +
                  (selected === i
                    ? "border-2 border-orange bg-cream/80 font-bold shadow-sm"
                    : "border border-green/20 bg-white hover:border-leaf")
                }
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={"tab-" + item.id}
                type="button"
                aria-selected={selected === i}
                tabIndex={i === selected ? 0 : -1}
                aria-controls="capability-panel"
                onKeyDown={(e) => {
                  const targets: Record<string, number> = {
                    ArrowRight: (i + 1) % capabilities.length,
                    ArrowLeft: (i + capabilities.length - 1) % capabilities.length,
                    Home: 0,
                    End: capabilities.length - 1,
                  };
                  if (e.key in targets) {
                    e.preventDefault();
                    setSelected(targets[e.key]);
                    tabs.current[targets[e.key]]?.focus();
                  }
                }}
                onClick={() => setSelected(i)}
              >
                <span
                  className={
                    "mb-1 block text-[0.6875rem] font-bold " +
                    (selected === i ? "text-[#fe6901]" : "text-forest/75")
                  }
                >
                  <ContentText>{String(i + 1).padStart(2, "0")}</ContentText>
                </span>
                <ContentText>{item.label}</ContentText>
              </button>
            </Item>
          ))}
        </Stagger>
      </div>
      <Reveal>
        <div
          role="tabpanel"
          id="capability-panel"
          aria-labelledby={"tab-" + current.id}
          tabIndex={0}
          className="rounded-2xl border border-green/20 bg-cream/80 p-6 sm:p-10"
        >
          <div className="graft-register" aria-hidden="true">
            <ContentText>
              {capabilities.map((stage, i) => (
                <i key={stage.id} data-current={i === selected} data-passed={i < selected} />
              ))}
            </ContentText>
          </div>
          <dl key={current.id} className="chain-reading divide-y divide-green/10">
            {[
              ["What Zeebaran operates", current.overview[0]],
              ["Constraint answered", current.overview[1]],
              ["What it makes possible", current.overview[2]],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-1 gap-4 py-6 first:pt-0 md:grid-cols-3 md:gap-6"
              >
                <dt
                  className={
                    "text-eyebrow font-bold uppercase tracking-[0.16em] " +
                    (label === "Constraint answered" ? "text-[#fe6901]" : "text-green")
                  }
                >
                  <ContentText>{label}</ContentText>
                </dt>
                <dd className="text-small text-forest/90 sm:text-body md:col-span-2">
                  <ContentText>{value}</ContentText>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <Link
          className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-green underline-offset-4 hover:underline"
          href={"/platform#" + current.id}
        >
          <ContentText>Explore this capability </ContentText>
          <ArrowUpRight size={14} />
        </Link>
      </Reveal>
    </div>
  );
}
