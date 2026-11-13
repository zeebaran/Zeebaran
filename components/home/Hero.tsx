import { imageDelivery } from "@/features/media/delivery";
import { ContentPicture, ContentPreload } from "@/features/cms/Content";
import { ContentText } from "@/features/cms/Content";
import { ContentImage as Image } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { Heading, Reveal } from "@/components/Motion";
import type { CSSProperties } from "react";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function Hero() {
  return (
    <section
      id="hero-intro"
      className="relative mx-auto flex min-h-[calc(100dvh-4.625rem)] max-w-7xl flex-col px-4 pb-[clamp(3rem,6.5dvh,5rem)] pt-12 sm:block sm:min-h-0 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8"
    >
      <ContentPreload
        rel="preload"
        as="image"
        type="image/avif"
        media="(max-width: 639px)"
        imageSizes="calc(100vw - 32px)"
      />
      <div className="mx-auto flex max-w-4xl grow-[4] flex-col items-center justify-between text-center">
        <div className="hero-rise mb-7 inline-flex items-center gap-1 rounded-full border border-green/20 bg-green/10 px-2 py-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.1em] text-green shadow-sm sm:mb-8 sm:gap-2.5 sm:px-4 sm:py-1.5 sm:text-eyebrow sm:tracking-[0.18em]">
          <span className="whitespace-nowrap">
            <ContentText>Zeebaran · Himalayan Horticulture Platform</ContentText>
          </span>
        </div>

        <Heading
          as="h1"
          immediate
          delay={0.1}
          tone="leaf"
          text={"Rooted in the valley.\n{Grown for the future.}"}
          className="mb-7 text-display sm:mb-6"
        />

        <p
          className="hero-rise mb-7 max-w-3xl text-[0.9rem] leading-relaxed text-forest/80 sm:mb-10 sm:text-lead"
          style={d(0.3)}
        >
          <ContentText>
            Transforming high-altitude horticulture across Kashmir through precision canopy
            architecture, cold-chain science, and grower empowerment.
          </ContentText>
        </p>

        <div
          className="hero-rise mb-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:mb-12 sm:gap-y-4"
          style={d(0.4)}
        >
          <Link
            href="/platform"
            className="action-motion btn-orange inline-flex items-center justify-center gap-1.5 rounded-full bg-orange px-5 py-2.5 text-[0.75rem] font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#e05d00] hover:shadow-lg sm:gap-2 sm:px-8 sm:py-3.5 sm:text-[0.8125rem]"
          >
            <span>
              <ContentText>Explore Platform</ContentText>
            </span>
            <span className="btn-arrow-nudge text-base leading-none" aria-hidden>
              <ContentText>→</ContentText>
            </span>
          </Link>
          <Link
            href="/mission"
            className="action-motion inline-flex items-center justify-center gap-1.5 rounded-full border border-green/20 bg-white/90 px-5 py-2.5 text-[0.75rem] font-semibold text-forest shadow-sm transition-all duration-300 hover:border-leaf hover:bg-white sm:gap-2 sm:px-7 sm:py-3.5 sm:text-[0.8125rem]"
          >
            <svg
              className="size-3 text-green sm:size-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            <span>
              <ContentText>Our Mission</ContentText>
            </span>
          </Link>
        </div>
      </div>

      {/* Hero image card */}
      <div
        className="hero-frame group relative w-full overflow-hidden rounded-3xl border border-green/15 shadow-2xl"
        style={d(0.5)}
      >
        <div className="hero-landscape relative aspect-[4/3] w-full overflow-hidden bg-forest/20 sm:aspect-[16/7]">
          <ContentPicture source="asset:banners/home/home-desktop-2400x1140-new-webp">
            <source
              media="(max-width: 639px)"
              srcSet={
                imageDelivery("asset:banners/home/hero-mobile-480-avif", 480) +
                " 480w, " +
                imageDelivery("asset:banners/home/hero-mobile-720-avif", 720) +
                " 720w"
              }
              sizes="calc(100vw - 32px)"
            />
            <Image
              src="asset:banners/home/home-desktop-2400x1140-new-webp"
              alt="High-altitude Himalayan apple orchards in the Kashmir valley with snow-capped mountains"
              fill
              fetchPriority="high"
              loading="eager"
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover transition-transform duration-1000 ease-out"
            />
          </ContentPicture>
          {/* Morning light shimmer sweep — plays once on load */}
          <div className="hero-shimmer" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/65 via-transparent to-black/10" />
        </div>

        {/* Mobile: caption + badges stacked bottom-left. Desktop: caption left, badges right */}
        <div className="hero-caption absolute inset-x-3 bottom-3 flex flex-col items-start gap-2 sm:inset-x-8 sm:bottom-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="max-w-[16rem] rounded-xl border border-white/30 bg-white/60 p-2.5 shadow-lg backdrop-blur-md sm:max-w-sm sm:rounded-2xl sm:p-5">
            <div className="mb-0.5 flex items-center gap-1 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-green sm:mb-1 sm:gap-2 sm:text-eyebrow sm:tracking-[0.14em]">
              <span className="size-1 rounded-full bg-leaf sm:size-2" />
              <span>
                <ContentText>High-Altitude Canopy</ContentText>
              </span>
            </div>
            <p className="text-[0.62rem] font-medium leading-snug text-forest sm:text-small">
              <ContentText>
                High-density rootstocks flourishing under Himalayan morning sunlight across the
                Kashmir valley floor.
              </ContentText>
            </p>
          </div>
          <div className="flex flex-row gap-1.5 sm:flex-nowrap sm:gap-3">
            <ContentText>
              {[
                ["18,000+", "Growers Empowered"],
                ["30,000 MT", "Cold-Chain Network"],
              ].map(([n, l]) => (
                <div
                  key={l}
                  className="flex items-center gap-1 rounded-full border border-white/20 bg-forest/80 px-2.5 py-1 text-[0.58rem] font-medium text-white backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                >
                  <span className="font-bold text-[#d5f39c]">
                    <ContentText>{n}</ContentText>
                  </span>{" "}
                  <ContentText>{l}</ContentText>
                </div>
              ))}
            </ContentText>
          </div>
        </div>
      </div>

      <div className="flex grow flex-col items-center justify-end pb-2 pt-7 sm:justify-center text-forest/75 transition-colors hover:text-green sm:pb-4 sm:pt-10">
        <a
          href="#query-section"
          className="inline-flex flex-col items-center gap-1 text-eyebrow font-semibold uppercase tracking-[0.18em] sm:gap-2"
        >
          <span>
            <ContentText>Scroll to explore</ContentText>
          </span>
          <svg
            className="size-5 animate-bounce text-leaf"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

export function Query() {
  return (
    <section
      id="query-section"
      className="mx-auto max-w-5xl px-4 pb-12 pt-6 text-center sm:pb-16 sm:pt-16"
    >
      <Reveal y={10}>
        <div className="mb-6 inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.1em] text-green sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-eyebrow sm:tracking-[0.18em]">
          <span className="whitespace-nowrap">
            <ContentText>Born in Kashmir · Working across the Himalayas</ContentText>
          </span>
        </div>
      </Reveal>
      <Heading
        as="h2"
        tone="leaf"
        text="Can a valley raise {a generation?}"
        className="mb-6 text-display"
      />
      <Reveal delay={0.15}>
        <p className="mx-auto max-w-2xl font-serif text-[clamp(1.25rem,1rem+1vw,1.5rem)] italic text-forest/70">
          <ContentText>What do we really grow when we grow fruit?</ContentText>
        </p>
      </Reveal>
      <Reveal delay={0.2} y={30}>
        <div className="group valley-reveal relative mt-12 h-80 w-full overflow-hidden rounded-3xl border border-green/10 shadow-2xl sm:h-[420px]">
          <Image
            src="asset:orchards/valley-webp"
            alt="Expansive high-density apple orchard in Kashmir"
            fill
            sizes="(min-width: 1024px) 990px, 100vw"
            className="img-far-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-black/20" />
          <div className="absolute bottom-6 left-6 max-w-lg text-left sm:bottom-10 sm:left-10">
            <p className="mb-1 text-eyebrow font-semibold uppercase tracking-[0.18em] text-white/80">
              <ContentText>High-Density Horticulture System</ContentText>
            </p>
            <p className="font-serif text-[clamp(1.4rem,1.1rem+1vw,1.875rem)] leading-snug text-white">
              <ContentText>Precision canopy architecture &amp; rootstock excellence.</ContentText>
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
