import { ContentText } from "@/features/cms/Content";
import { Eyebrow, Button } from "./ui";
import { Heading, Reveal, Stagger, Item } from "./Motion";
import { Photo } from "./Photo";
import type { SceneVariant } from "./Scene";
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const delay = (d: number) => ({ "--d": `${d}s` }) as React.CSSProperties;
  return (
    <section className="hero-wash relative overflow-hidden pb-14 pt-[4.5rem] sm:pt-[6.5rem] md:pb-20">
      <div className="wrap">
        <div className="hero-rise">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <Heading
          as="h1"
          immediate
          delay={0.1}
          text={title}
          className="mt-6 max-w-[16ch] text-display sm:max-w-[18ch] lg:max-w-[20ch]"
        />
        <ContentText>
          {children && (
            <div
              className="hero-rise mt-7 max-w-[38rem] space-y-4 text-lead text-muted"
              style={delay(0.35)}
            >
              <ContentText>{children}</ContentText>
            </div>
          )}
        </ContentText>
        <ContentText>
          {actions && (
            <div className="hero-rise mt-9 flex flex-wrap gap-3" style={delay(0.5)}>
              <ContentText>{actions}</ContentText>
            </div>
          )}
        </ContentText>
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[44rem] ${className}`}>
      <ContentText>
        {eyebrow && (
          <Reveal y={8}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
        )}
      </ContentText>
      <Heading text={title} className="mt-5 text-h2" />
      <ContentText>
        {children && (
          <Reveal delay={0.15} className="mt-5 space-y-4 text-body text-muted">
            {children}
          </Reveal>
        )}
      </ContentText>
    </div>
  );
}

/** Image + copy row, with a small key/value table, as in Qul's capability sections. */
export function FeatureRow({
  eyebrow,
  title,
  body,
  rows,
  variant,
  seed,
  flip = false,
  src,
}: {
  eyebrow: string;
  title: string;
  body: string;
  rows?: string[][];
  variant: SceneVariant;
  seed: number;
  flip?: boolean;
  src?: string;
}) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14 lg:gap-20">
      <Reveal className={flip ? "md:order-2" : ""}>
        <Photo
          variant={variant}
          seed={seed}
          src={src}
          className="aspect-[4/3] rounded-card shadow-card md:rounded-[1.25rem]"
        />
      </Reveal>
      <div className={flip ? "md:order-1" : ""}>
        <Reveal y={8}>
          <span className="micro">
            <ContentText>{eyebrow}</ContentText>
          </span>
        </Reveal>
        <Heading
          as="h3"
          text={title}
          className="mt-3 text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] leading-[1.1] tracking-[-0.02em]"
        />
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-[34rem] text-body">
            <ContentText>{body}</ContentText>
          </p>
        </Reveal>
        <ContentText>
          {rows && (
            <Reveal delay={0.2}>
              <dl className="mt-6 border-b border-line">
                {rows.map(([k, v]) => (
                  <div key={k} className="kv">
                    <dt>
                      <ContentText>{k}</ContentText>
                    </dt>
                    <dd>
                      <ContentText>{v}</ContentText>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </ContentText>
      </div>
    </div>
  );
}

export function CardGrid({
  items,
  cols = 4,
}: {
  items: {
    n?: string;
    title: string;
    body: string;
    foot?: string;
    footLabel?: string;
    tag?: string;
  }[];
  cols?: 2 | 3 | 4;
}) {
  const c = { 2: "sm:grid-cols-2", 3: "md:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <Stagger className={`grid gap-4 ${c}`}>
      {items.map((it) => (
        <Item key={it.title}>
          <article className="card card-hover flex h-full flex-col p-6">
            <div className="flex items-start justify-between">
              <ContentText>
                {it.n && (
                  <span className="micro">
                    <ContentText>{it.n}</ContentText>
                  </span>
                )}
              </ContentText>
              <ContentText>
                {it.tag && (
                  <span className="rounded-full bg-leaf/20 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-green">
                    <ContentText>{it.tag}</ContentText>
                  </span>
                )}
              </ContentText>
            </div>
            <h3 className="mt-4 text-[1.0625rem] font-semibold leading-snug tracking-tight">
              <ContentText>{it.title}</ContentText>
            </h3>
            <p className="mt-2 text-small">
              <ContentText>{it.body}</ContentText>
            </p>
            {it.foot && (
              <p className="mt-auto border-t border-line pt-4 text-[0.75rem] leading-snug text-forest/80">
                <ContentText>
                  {it.footLabel && (
                    <span className="micro mr-2">
                      <ContentText>{it.footLabel}</ContentText>
                    </span>
                  )}
                </ContentText>
                <span className="mt-1 block">
                  <ContentText>{it.foot}</ContentText>
                </span>
              </p>
            )}
          </article>
        </Item>
      ))}
    </Stagger>
  );
}

export function CtaBand({
  title,
  body,
  primary,
  secondary,
  variant = "hills",
  tone = "photo",
  src,
  className = "",
}: {
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  variant?: SceneVariant;
  tone?: "photo" | "sage";
  src?: string;
  className?: string;
}) {
  const inner = (
    <div className="mx-auto max-w-[42rem] rounded-[1.5rem] bg-cream/85 p-7 text-center shadow-lift backdrop-blur-md sm:p-12">
      <Heading
        text={title}
        className="text-[clamp(1.9rem,1.4rem+1.8vw,2.75rem)] leading-[1.1] tracking-[-0.02em]"
      />
      <Reveal delay={0.15}>
        <p className="mx-auto mt-5 max-w-[34rem] text-body">
          <ContentText>{body}</ContentText>
        </p>
      </Reveal>
      <Reveal delay={0.25} className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href={primary.href}>{primary.label}</Button>
        {secondary && (
          <Button href={secondary.href} variant="ghost">
            {secondary.label}
          </Button>
        )}
      </Reveal>
    </div>
  );
  if (tone === "sage") {
    return (
      <section
        className={`mx-2.5 mb-16 rounded-[1.5rem] bg-[#c3d1b1] px-4 py-16 sm:mx-4 sm:mb-24 sm:rounded-panel sm:px-8 sm:py-24 lg:mx-6 lg:mb-32 ${className}`}
      >
        {inner}
      </section>
    );
  }
  return (
    <section
      className={`relative mx-2.5 mb-16 overflow-hidden rounded-[1.5rem] sm:mx-4 sm:mb-24 sm:rounded-panel lg:mx-6 lg:mb-32 ${className}`}
    >
      <Photo src={src} variant={variant} seed={11} className="absolute inset-0" />
      <div className="absolute inset-0 bg-forest/35" />
      <div className="relative px-4 py-16 sm:px-8 sm:py-28">
        <ContentText>{inner}</ContentText>
      </div>
    </section>
  );
}

/** Numbered principle cards, shared by Platform and Governance. */
export function PrincipleGrid({
  items,
  cols = "lg:grid-cols-3",
}: {
  items: readonly { t: string; d: string }[];
  cols?: string;
}) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${cols}`}>
      <ContentText>
        {items.map((p, i) => (
          <Reveal key={p.t} delay={(i % 3) * 0.08} className="h-full">
            <article className="card card-hover h-full p-6">
              <span className="micro">
                <ContentText>{String(i + 1).padStart(2, "0")}</ContentText>
              </span>
              <h3 className="mt-3 text-[1.0625rem] font-semibold">
                <ContentText>{p.t}</ContentText>
              </h3>
              <p className="mt-2 text-small">
                <ContentText>{p.d}</ContentText>
              </p>
            </article>
          </Reveal>
        ))}
      </ContentText>
    </div>
  );
}
