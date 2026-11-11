"use client";

import { ContentText } from "@/features/cms/Content";

import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/Motion";
import type { Product } from "@/features/catalog/model";
import { nurseryEnquiry, whatsappAvailable } from "@/lib/nursery-enquiry";
/* ─── WhatsApp rootstock selector ─────────────────────────────────────────── */
export function NurseryEnquiry({ product }: { product: Pick<Product, "name" | "rootstocks"> }) {
  const [selected, setSelected] = useState<string>("");

  const link = nurseryEnquiry(product.name, selected || undefined);

  return (
    <div className="rounded-2xl border border-line bg-cream/60 p-5 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <span className="text-[0.625rem] font-bold uppercase tracking-wider text-green">
            <ContentText>Direct Enquiry</ContentText>
          </span>
          <h3 className="text-small font-bold text-forest">
            <ContentText>
              {whatsappAvailable ? "WhatsApp Inquiry Console" : "Nursery enquiry"}
            </ContentText>
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#25D366]/30 bg-white px-2.5 py-1 text-[0.6875rem] font-medium text-green">
          <span className="size-1.5 rounded-full bg-[#25D366]" />
          <ContentText>{whatsappAvailable ? "WhatsApp Direct" : "Nursery desk"}</ContentText>
        </span>
      </div>

      {/* rootstock picker */}
      <div>
        <span className="micro mb-2 block">
          <ContentText>Select rootstock (optional)</ContentText>
        </span>
        <div className="flex flex-wrap gap-2">
          <ContentText>
            {product.rootstocks.map((r) => {
              const on = selected === r.code;
              return (
                <button
                  key={r.code}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(on ? "" : r.code)}
                  className={`rounded-full border px-4 py-1.5 text-[0.75rem] font-semibold transition-colors ${
                    on
                      ? "border-green bg-green text-white"
                      : "border-line bg-white text-forest hover:border-green"
                  }`}
                >
                  <ContentText>{r.code}</ContentText>
                  <ContentText>
                    {on && <Check className="ml-1.5 inline size-3" aria-hidden />}
                  </ContentText>
                </button>
              );
            })}
          </ContentText>
        </div>
        <ContentText>
          {selected && (
            <Reveal key={selected} className="rootstock-slip mt-3">
              <p className="rounded-xl border border-line bg-white p-3 text-[0.75rem] text-muted">
                <span className="font-semibold text-forest">
                  <ContentText>
                    {selected}
                    <ContentText></ContentText>:
                  </ContentText>
                </span>
                <ContentText> </ContentText>
                <ContentText>
                  {product.rootstocks.find((r) => r.code === selected)?.note}
                </ContentText>
              </p>
            </Reveal>
          )}
        </ContentText>
      </div>

      <a
        href={link}
        target={whatsappAvailable ? "_blank" : undefined}
        rel={whatsappAvailable ? "noopener noreferrer" : undefined}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green px-6 py-3.5 text-[0.875rem] font-semibold text-white shadow transition hover:bg-forest active:scale-[0.98]"
        aria-label={`Enquire about ${product.name}${selected ? ` on ${selected}` : ""} `}
      >
        <MessageCircle className="size-4 shrink-0" aria-hidden />
        <ContentText>
          {selected ? `Enquire: ${product.name} on ${selected}` : `Enquire about ${product.name}`}
        </ContentText>
      </a>
      <p className="mt-2.5 text-center text-[0.6875rem] text-muted">
        <ContentText>
          {whatsappAvailable
            ? "Opens WhatsApp with your variety and rootstock selected."
            : "Opens the enquiry form with your variety and rootstock filled in."}
        </ContentText>
      </p>
    </div>
  );
}
