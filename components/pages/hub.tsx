import { ContentText } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { Photo } from "@/components/Photo";
import { aaa, carries, loop, visit } from "@/lib/hub-content";
import type { CSSProperties } from "react";
import { HubIllustration } from "@/components/hub/HubIllustration";
import heroStyles from "@/components/hub/hub-hero.module.css";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em] text-forest/75";
const wrap = "mx-auto w-full max-w-6xl px-4 sm:px-6";
const numDot =
  "mb-4 flex size-6 items-center justify-center rounded-full bg-[#f2efe4] text-[0.6875rem] font-bold text-forest";

export function HubHero() {
  return (
    <section className={`${wrap} ${heroStyles.layout} pb-16 pt-16 sm:pb-20 sm:pt-24`}>
      <div className="hero-rise mb-6 flex items-center gap-2">
        <span className="inline-block h-px w-5 bg-forest/60" aria-hidden />
        <span className={eyebrow}>
          <ContentText>{"Zeebaran Hub · The Field Layer"}</ContentText>
        </span>
      </div>
      <Heading
        as="h1"
        immediate
        delay={0.1}
        text={"Where the platform\n{meets the orchard.}"}
        className="mb-10 max-w-3xl text-display"
      />
      <div className="hero-rise max-w-2xl space-y-5" style={d(0.3)}>
        <p className="text-lead text-forest/80">
          <ContentText>
            {
              "Zeebaran Hub is the field expression of the Zeebaran platform. It connects growers with the knowledge, people, technology, infrastructure, and services that support better decisions throughout the orchard year."
            }
          </ContentText>
        </p>
        <p className="text-small text-forest/75">
          <ContentText>
            <ContentText>{"Working through the"}</ContentText>
            <ContentText></ContentText>{" "}
          </ContentText>
          <strong className="font-semibold text-forest">
            <ContentText>{"Triple A Model · Access, Advice, and Adoption"}</ContentText>
          </strong>
          <ContentText> </ContentText>
          <ContentText>
            {
              "— Zeebaran Hub ensures that technical capability does not remain within an institution, but becomes part of everyday orchard practice."
            }
          </ContentText>
        </p>
      </div>
      <div className={heroStyles.illustration}>
        <HubIllustration />
      </div>
    </section>
  );
}

export function WhyHub() {
  return (
    <section className={`${wrap} border-t border-green/10 py-16`}>
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-6 pt-2 lg:col-span-6">
          <Reveal y={8}>
            <p className={eyebrow}>
              <ContentText>{"Why Zeebaran Hub Exists"}</ContentText>
            </p>
          </Reveal>
          <Heading
            text="Better practice is only useful {when it can be used.}"
            className="text-h2"
          />
          <Reveal delay={0.1} className="space-y-5 pt-3 text-small text-forest/80 sm:text-body">
            <p>
              <ContentText>
                {
                  "Zeebaran has built capabilities across the horticulture value chain. But capability alone does not improve things, unless it reaches the grower at the right time, in the right place, and in a form that can be applied with confidence."
                }
              </ContentText>
            </p>
            <p>
              <ContentText>
                {
                  "Zeebaran Hub extends the platform into the field. It provides a permanent local presence where growers can learn, seek advice, diagnose problems, test new practices, and return whenever the orchard demands it."
                }
              </ContentText>
            </p>
            <p>
              <ContentText>
                {
                  "A Zeebaran Hub is not a seasonal programme or a service point. It is the continuing relationship between the grower, and the wider Zeebaran platform."
                }
              </ContentText>
            </p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-6" y={30}>
          <div className="relative overflow-hidden rounded-3xl border border-green/15 bg-white shadow-lg">
            <Photo
              src="asset:galleries/field-work/zeebaran-hub-gathering-and-consultation-space-with-8c605-webp"
              alt="Growers meeting the field team at a Zeebaran Hub"
              variant="centre"
              seed={4}
              className="h-80 w-full sm:h-[460px]"
            />
            <span className="sr-only">
              <ContentText>
                {"Zeebaran Hub gathering and consultation space with growers and specialists"}
              </ContentText>
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function AaaModel() {
  return (
    <section className={`${wrap} py-16 sm:py-20`}>
      <div className="rounded-[2rem] border border-green/10 bg-white p-6 shadow-sm sm:p-12 md:p-16">
        <Reveal y={8}>
          <p className={`${eyebrow} mb-3`}>
            <ContentText>{"The AAA Model"}</ContentText>
          </p>
        </Reveal>
        <Heading
          text="Three conditions for a practice {to take root.}"
          className="mb-4 max-w-xl text-h2"
        />
        <Reveal delay={0.1}>
          <p className="mb-12 max-w-2xl text-small text-forest/80 sm:text-body">
            <ContentText>
              {
                "Better practice is not adopted because it exists. It is adopted when three conditions are present: growers can "
              }
            </ContentText>
            <strong className="font-medium text-forest">
              <ContentText>{"access"}</ContentText>
            </strong>{" "}
            <ContentText>{"it, understand it through timely "}</ContentText>
            <strong className="font-medium text-forest">
              <ContentText>{"advice"}</ContentText>
            </strong>
            <ContentText>
              <ContentText>{", and receive enough support to turn it into lasting"}</ContentText>
              <ContentText></ContentText>{" "}
            </ContentText>
            <strong className="font-medium text-forest">
              <ContentText>{"adoption"}</ContentText>
            </strong>
            <ContentText>{"."}</ContentText>
            <br className="hidden sm:inline" />{" "}
            <ContentText>
              {"Zeebaran Hub brings all three together at the field level."}
            </ContentText>
          </p>
        </Reveal>
        <Stagger className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {aaa.map((a) => (
            <Item key={a.tag} className="h-full">
              <article className="flex h-full flex-col justify-between rounded-2xl border border-green/15 bg-[#fcfbfa] p-6 transition-all hover:border-leaf">
                <div>
                  <span className="mb-3 block text-[0.6875rem] font-bold uppercase tracking-wider text-forest/75">
                    <ContentText>{a.tag}</ContentText>
                  </span>
                  <h3 className="mb-3 text-body font-semibold text-forest">
                    <ContentText>{a.title}</ContentText>
                  </h3>
                  <p className="mb-8 text-xs leading-relaxed text-forest/75 sm:text-small">
                    <ContentText>{a.body}</ContentText>
                  </p>
                </div>
                <div className="border-t border-green/10 pt-4">
                  <span className="mb-1 block text-[0.625rem] font-bold uppercase tracking-wider text-green">
                    <ContentText>{"Enables"}</ContentText>
                  </span>
                  <p className="text-[0.6875rem] font-medium text-forest">
                    <ContentText>{a.enables}</ContentText>
                  </p>
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
        <Reveal className="mx-auto max-w-xl space-y-2 border-t border-green/10 pt-4 text-center">
          <div className="mx-auto mb-6 h-px w-12 bg-[#d5ceba]" aria-hidden />
          {[
            ["Access", "makes capability available."],
            ["Advice", "makes capability understandable."],
            ["Adoption", "makes capability enduring."],
          ].map(([k, v]) => (
            <p key={k} className="text-lead text-forest">
              <strong className="font-serif text-[1.5rem] font-normal italic text-green">
                <ContentText>{k}</ContentText>
              </strong>
              <ContentText> </ContentText>
              <ContentText>{v}</ContentText>
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function VisitSteps() {
  return (
    <section className={`${wrap} py-16`}>
      <Reveal y={8}>
        <p className={`${eyebrow} mb-3`}>
          <ContentText>{"How a visit works"}</ContentText>
        </p>
      </Reveal>
      <Heading
        text={"A grower arrives with a question.\n{The orchard gets an answer.}"}
        className="mb-12 text-h2"
      />
      <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visit.map((s) => (
          <Item key={s.n} className="h-full">
            <article className="flex h-full flex-col justify-between rounded-2xl border border-green/15 bg-white p-6 shadow-sm">
              <div>
                <span className={numDot}>
                  <ContentText>{s.n}</ContentText>
                </span>
                <h3 className="mb-2 text-small font-semibold text-forest">
                  <ContentText>{s.title}</ContentText>
                </h3>
                <p className="mb-6 text-xs leading-relaxed text-forest/75">
                  <ContentText>{s.body}</ContentText>
                </p>
              </div>
              <div className="border-t border-green/10 pt-3">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-forest/75">
                  <ContentText>{s.foot}</ContentText>
                </span>
              </div>
            </article>
          </Item>
        ))}
      </Stagger>
    </section>
  );
}

export function Carries() {
  return (
    <section className={`${wrap} border-t border-green/10 py-16`}>
      <Reveal y={8}>
        <p className={`${eyebrow} mb-3`}>
          <ContentText>{"What a centre carries"}</ContentText>
        </p>
      </Reveal>
      <Heading
        text={"Digital tools extend the field team.\n{They do not replace the field relationship.}"}
        className="mb-8 text-h2"
      />
      <Reveal
        delay={0.1}
        className="mb-12 max-w-3xl space-y-4 text-small text-forest/80 sm:text-body"
      >
        <p>
          <ContentText>
            {
              "A Zeebaran Hub carries more than services. It carries the Zeebaran platform into the orchards, and the orchards back into the platform."
            }
          </ContentText>
        </p>
        <p>
          <ContentText>
            {
              "Throughout the year, growers are connected to people, knowledge, diagnostics, demonstrations, digital tools, and practical support. At the same time, every question, observation, and outcome from the field helps shape Zeebaran's technical priorities, research, and future work."
            }
          </ContentText>
        </p>
        <p className="pt-2 font-medium text-forest">
          <ContentText>{"Where the platform meets the field."}</ContentText>
        </p>
      </Reveal>
      <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {carries.map((c) => (
          <Item key={c.n} className="h-full">
            <article className="flex h-full flex-col justify-between rounded-2xl border border-green/15 bg-white p-6 shadow-sm">
              <div>
                <span className="mb-2 block text-[0.6875rem] font-bold uppercase tracking-wider text-forest/75">
                  <ContentText>{c.n}</ContentText>
                </span>
                <h3 className="mb-2 text-body font-semibold text-forest">
                  <ContentText>{c.title}</ContentText>
                </h3>
                <p className="mb-6 text-xs leading-relaxed text-forest/75 sm:text-small">
                  <ContentText>{c.body}</ContentText>
                </p>
              </div>
              <div className="border-t border-green/10 pt-3">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-green">
                  <ContentText>{"Carries"}</ContentText>
                </span>
                <p className="text-xs font-medium text-forest">
                  <ContentText>{c.carries}</ContentText>
                </p>
              </div>
            </article>
          </Item>
        ))}
      </Stagger>
    </section>
  );
}

export function FieldLoop() {
  return (
    <section className={`${wrap} py-16 sm:py-20`}>
      <div className="rounded-[2rem] border border-green/10 bg-white p-6 shadow-sm sm:p-12 md:p-16">
        <Heading
          text="What happens in the field should change {what the institution does next.}"
          className="mb-12 max-w-3xl text-h2"
        />
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loop.map((l) => (
            <Item key={l.n} className="h-full">
              <article className="flex h-full flex-col justify-between rounded-2xl border border-green/15 bg-[#fcfbfa] p-5">
                <div>
                  <span className={`${numDot} !mb-3 bg-[#f0ede1]`}>
                    <ContentText>{l.n}</ContentText>
                  </span>
                  <h3 className="mb-2 text-small font-semibold text-forest">
                    <ContentText>{l.title}</ContentText>
                  </h3>
                  <p className="mb-6 text-xs leading-relaxed text-forest/75">
                    <ContentText>{l.body}</ContentText>
                  </p>
                </div>
                <div className="border-t border-green/10 pt-3">
                  <span className="block text-[0.625rem] font-bold uppercase tracking-wider text-forest/75">
                    <ContentText>{"Where it happens"}</ContentText>
                  </span>
                  <span className="text-xs font-semibold text-forest">
                    <ContentText>{l.where}</ContentText>
                  </span>
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function HubCta() {
  return (
    <section className={`${wrap} py-12`}>
      <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-[2.25rem] border border-green/10 bg-forest px-4 py-16 shadow-xl">
        <Photo
          src="asset:orchards/himalayan-orchard-backdrop-356f6-webp"
          variant="canopy"
          seed={11}
          className="absolute inset-0 h-full w-full opacity-80"
        />
        <div className="absolute inset-0 bg-forest/20 backdrop-blur-[1px]" />
        <Reveal className="relative z-10 w-full max-w-xl">
          <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
            <Heading text="Work {with Zeebaran.}" className="mb-4 text-h2" />
            <p className="mb-8 text-small leading-relaxed text-forest/80">
              <ContentText>
                {
                  "Every capability on the platform exists because someone solved an important constraint. If your work can help strengthen Himalayan horticulture by bringing better knowledge, technology, infrastructure, or market access within reach of growers, we would welcome a conversation."
                }
              </ContentText>
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/partnerships"
                className="action-motion inline-flex w-full items-center justify-center rounded-full bg-green px-6 py-3 text-[0.8125rem] font-semibold text-white shadow-sm transition-all hover:bg-forest sm:w-auto"
              >
                <ContentText>{"Explore partnership →"}</ContentText>
              </Link>
              <Link
                href="/contact"
                className="action-motion inline-flex w-full items-center justify-center rounded-full border border-[#d6cfbc] bg-white px-6 py-3 text-[0.8125rem] font-semibold text-forest transition-all hover:bg-stone-50 sm:w-auto"
              >
                <ContentText>{"Contact Zeebaran →"}</ContentText>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
