import { ContentText } from "@/features/cms/Content";
import { FieldTrace } from "@/components/FieldTrace";
import { Reveal } from "@/components/Motion";

type Entry = { phase: string; title: string; constraint: string; response: string };

function Constraint({ text }: { text: string }) {
  return (
    <>
      <span className="mb-1 block text-[0.625rem] font-bold uppercase tracking-widest text-green">
        <ContentText>Constraint Addressed</ContentText>
      </span>
      <p className="text-[0.75rem] leading-relaxed text-forest/75">
        <ContentText>{text}</ContentText>
      </p>
    </>
  );
}

/** Alternating dated vertical timeline (Stitch "operating history"). Single column below md. */
export function HistoryTimeline({ items }: { items: readonly Entry[] }) {
  return (
    <div className="relative mx-auto max-w-5xl">
      <FieldTrace kind="history" />
      <ol className="history-line relative space-y-12 pb-6 pt-2 sm:space-y-16">
        {items.map((e, i) => {
          const right = i % 2 === 0;
          return (
            <li
              key={`${e.phase}-${i}`}
              className={`relative flex flex-col items-center md:flex-row ${
                right ? "md:justify-end" : "md:justify-start"
              }`}
            >
              <div className="z-10 mb-4 md:absolute md:left-1/2 md:mb-0 md:-translate-x-1/2">
                <span className="rounded-full bg-green px-3.5 py-1 text-[0.75rem] font-bold tracking-wider text-white shadow-sm">
                  <ContentText>{e.phase}</ContentText>
                </span>
              </div>
              <Reveal
                y={18}
                className={`w-full text-left md:w-[45%] ${right ? "md:pl-10" : "md:pr-10 md:text-right"}`}
              >
                <div className="rounded-xl border border-line bg-cream/60 p-6 shadow-sm transition-colors hover:border-leaf/60">
                  <ContentText>{right && <Constraint text={e.constraint} />}</ContentText>
                  <h3
                    className={`font-serif text-[1.0625rem] font-bold leading-snug text-forest ${
                      right ? "mt-3" : ""
                    }`}
                  >
                    <ContentText>{e.title}</ContentText>
                  </h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-forest/75">
                    <ContentText>{e.response}</ContentText>
                  </p>
                  <ContentText>
                    {!right && (
                      <div className="mt-4 border-t border-line pt-3">
                        <Constraint text={e.constraint} />
                      </div>
                    )}
                  </ContentText>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
