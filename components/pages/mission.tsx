import { ContentText } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { MissionVideoCard as VideoCard } from "@/features/cms/MissionVideoCard";
import type { MissionVideoCardDefinition as VideoCardProps } from "@/features/cms/mission-videos";
import { MissionVideoList } from "@/features/cms/MissionVideoList";
import { Heading, Reveal, Stagger, Item } from "@/components/Motion";
import { VintageTV } from "@/components/pages/MissionTV";
import type { CSSProperties } from "react";

const eyebrow = "text-eyebrow font-bold uppercase tracking-[0.18em] text-green";
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/* ───────── Hero ───────── */
export function MissionHero() {
  return (
    <section className="border-b border-green/10 pb-16 pt-16 sm:pb-24 sm:pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — text */}
          <div>
            <p className={`hero-rise ${eyebrow} mb-6`}>
              <ContentText>Our Mission · In The Field</ContentText>
            </p>
            <Heading
              as="h1"
              immediate
              delay={0.1}
              tone="leaf"
              text={"Work that speaks\n{for itself.}"}
              className="text-display"
            />
            <div className="hero-rise mt-8 space-y-5 text-lead text-forest/80" style={d(0.3)}>
              <p>
                <ContentText>
                  Every claim Zeebaran makes is backed by work you can see. Below is a live record
                  of orchard installations, transformation processes, grower testimonials, and
                  demonstrations — documented as the work happens.
                </ContentText>
              </p>
            </div>
          </div>

          {/* Right — vintage TV */}
          <Reveal y={24} delay={0.2}>
            <VintageTV />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────── Video card ───────── */
/* ───────── Orchard Installations ───────── */
export function OrchardInstallations() {
  return (
    <section className="border-t border-green/10 bg-white py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal y={8}>
          <span className={eyebrow}>
            <ContentText>Orchard Installations</ContentText>
          </span>
        </Reveal>
        <Heading
          tone="leaf"
          text={"Documented from the ground up."}
          className="mb-4 mt-4 text-h2"
        />
        <Reveal delay={0.1}>
          <p className="mb-12 max-w-2xl text-body text-forest/70">
            <ContentText>
              Every installation is filmed from soil preparation through to canopy close, creating a
              permanent record of the work and the results.
            </ContentText>
          </p>
        </Reveal>
        <MissionVideoList section="orchard" />
      </div>
    </section>
  );
}

/* ───────── Installation Process ───────── */
export function InstallationProcess() {
  const steps = [
    {
      num: "01",
      title: "Site Assessment",
      body: "Soil sampling, elevation mapping, water access, sun-angle analysis, and frost-pocket identification across the proposed block.",
    },
    {
      num: "02",
      title: "Rootstock & Variety Selection",
      body: "Matching certified rootstock to site altitude, soil type, and target variety — drawing from Zeebaran's certified nursery stock.",
    },
    {
      num: "03",
      title: "Layout & Infrastructure",
      body: "Row orientation, spacing, trellis design, irrigation layout, and frost protection planning completed before a single hole is dug.",
    },
    {
      num: "04",
      title: "Planting & Initial Training",
      body: "In-ground planting under field team supervision followed by first-season canopy training to establish the permanent framework.",
    },
    {
      num: "05",
      title: "Advisory Programme",
      body: "Seasonal field visits, digital diagnostics, and remote advisory support across the first three growing seasons.",
    },
    {
      num: "06",
      title: "Yield Assessment",
      body: "Third and fourth year yield assessment, quality grading, and market linkage to close-chain post-harvest infrastructure.",
    },
  ];

  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal y={8}>
          <span className={`${eyebrow} !text-[#fe6901]`}>
            <ContentText>Installation Process</ContentText>
          </span>
        </Reveal>
        <Heading
          tone="leaf"
          text={"How an orchard is {properly built.}"}
          className="mb-4 mt-4 text-h2"
        />
        <Reveal delay={0.1}>
          <p className="mb-14 max-w-2xl text-body text-forest/70">
            <ContentText>
              The process behind every Zeebaran installation — documented step by step so growers,
              partners, and investors can see exactly what is being built and why.
            </ContentText>
          </p>
        </Reveal>
        <Stagger gap={0.08} className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <Item key={s.num}>
              <div className="flex h-full flex-col rounded-2xl border border-green/10 bg-white p-6 shadow-card">
                <span className="mb-3 font-mono text-[2rem] font-light leading-none text-leaf">
                  <ContentText>{s.num}</ContentText>
                </span>
                <h3 className="mb-2 text-h3 font-semibold text-forest">
                  <ContentText>{s.title}</ContentText>
                </h3>
                <p className="text-small text-forest/70">
                  <ContentText>{s.body}</ContentText>
                </p>
              </div>
            </Item>
          ))}
        </Stagger>
        <MissionVideoList section="process" />
      </div>
    </section>
  );
}

/* ───────── Customer Reviews ───────── */
const reviews = [
  {
    name: "Mohammad Yusuf Bhat",
    location: "Pulwama · 1.8 acres",
    year: "2022",
    quote:
      "Before Zeebaran, I was getting maybe 40 kg per tree at best. Last season my high-density block yielded over 90 kg per tree. The difference is in the rootstock and the training — things I never knew before.",
    rating: 5,
    crop: "Royal Gala · High Density",
  },
  {
    name: "Ghulam Nabi Lone",
    location: "Shopian · 2.4 acres",
    year: "2023",
    quote:
      "The Zeebaran team came to my field seven times in the first season. They did not just sell me material — they stayed until the work was done correctly. That is a different kind of business.",
    rating: 5,
    crop: "Fuji · Trellis System",
  },
  {
    name: "Abdul Rashid Dar",
    location: "Sopore · 3.1 acres",
    year: "2022",
    quote:
      "I was sceptical about spending more on certified rootstock. Three years later I understand why it matters. Uniform trees, predictable fruiting, and the cold chain connection means my Grade A fruit actually reaches a Grade A price.",
    rating: 5,
    crop: "Golden Delicious · Mixed Block",
  },
  {
    name: "Fayaz Ahmad Wani",
    location: "Anantnag · 1.2 acres",
    year: "2023",
    quote:
      "The digital record they kept of my orchard — soil, weather, spray logs — helped me make better decisions this season. I can see what worked and what did not. That knowledge stays with me.",
    rating: 5,
    crop: "Red Delicious · Conversion",
  },
  {
    name: "Nazir Ahmad Rather",
    location: "Baramulla · 2.0 acres",
    year: "2024",
    quote:
      "My orchard was 25 years old and struggling. Zeebaran helped me understand what high-density conversion could look like for my specific land. It is a 10-year commitment, but I can see the trajectory clearly now.",
    rating: 5,
    crop: "Ambri Apple · Rejuvenation",
  },
  {
    name: "Bilal Ahmad Shah",
    location: "Kupwara · 1.5 acres",
    year: "2024",
    quote:
      "What impressed me most is that they were honest about what year one would look like — not perfect, but building toward something. That honesty is rare and it built trust that everything else followed from.",
    rating: 5,
    crop: "Pink Lady · New Planting",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      <ContentText>
        {Array.from({ length: count }).map((_, i) => (
          <svg key={i} className="size-3.5 text-orange" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </ContentText>
    </div>
  );
}

export function CustomerReviews() {
  const videos: VideoCardProps[] = [
    {
      id: "ZB-CR-01",
      title: "Yusuf Bhat — Three Seasons In",
      subtitle:
        "Pulwama grower Mohammad Yusuf walks through his high-density block after three full growing seasons, showing yield comparison against his traditional orchard.",
      tag: "Grower Story",
      tagColor: "text-green",
    },
    {
      id: "ZB-CR-02",
      title: "Shopian Growers — Collective Review",
      subtitle:
        "Four neighbouring growers in Shopian district share their experience across two seasons working with the Zeebaran field team.",
      tag: "Grower Story",
      tagColor: "text-green",
    },
  ];

  return (
    <section className="border-t border-green/10 bg-white py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal y={8}>
          <span className={eyebrow}>
            <ContentText>Grower Reviews</ContentText>
          </span>
        </Reveal>
        <Heading
          tone="leaf"
          text={"Measured by what {growers say.}"}
          className="mb-4 mt-4 text-h2"
        />
        <Reveal delay={0.1}>
          <p className="mb-14 max-w-2xl text-body text-forest/70">
            <ContentText>
              Unedited accounts from growers working with Zeebaran across the Kashmir Valley. Names,
              locations, and crop details are published with grower consent.
            </ContentText>
          </p>
        </Reveal>
        <Stagger gap={0.08} className="mb-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <Item key={r.name}>
              <blockquote className="flex h-full flex-col justify-between rounded-2xl border border-green/10 bg-cream p-6 shadow-card">
                <div>
                  <StarRating count={r.rating} />
                  <p className="mt-4 font-serif text-[1.0625rem] italic leading-relaxed text-forest">
                    <ContentText>
                      &ldquo;<ContentText></ContentText>
                      {r.quote}
                      <ContentText></ContentText>&rdquo;
                    </ContentText>
                  </p>
                </div>
                <footer className="mt-5 border-t border-green/10 pt-4">
                  <p className="text-small font-semibold text-forest">
                    <ContentText>{r.name}</ContentText>
                  </p>
                  <p className="text-eyebrow text-muted">
                    <ContentText>{r.location}</ContentText>{" "}
                    <ContentText>
                      · <ContentText></ContentText>
                      {r.year}
                    </ContentText>
                  </p>
                  <p className="mt-1 text-eyebrow font-bold uppercase tracking-widest text-leaf">
                    <ContentText>{r.crop}</ContentText>
                  </p>
                </footer>
              </blockquote>
            </Item>
          ))}
        </Stagger>
        <Stagger gap={0.1} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {videos.map((v) => (
            <Item key={v.id} className="h-full [&:only-child]:col-span-full">
              <VideoCard {...v} />
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ───────── Demos ───────── */
export function FieldDemos() {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal y={8}>
          <span className={eyebrow}>
            <ContentText>Demonstrations & Proof</ContentText>
          </span>
        </Reveal>
        <Heading tone="leaf" text={"Proof is {in the field.}"} className="mb-4 mt-4 text-h2" />
        <Reveal delay={0.1}>
          <p className="mb-12 max-w-2xl text-body text-forest/70">
            <ContentText>
              Practical demonstrations shot in real orchards, with real equipment, showing real
              results. No studio. No actors. Just work.
            </ContentText>
          </p>
        </Reveal>
        <MissionVideoList section="demos" />
      </div>
    </section>
  );
}

/* ───────── Orchard Gallery ───────── */
export { OrchardGallery } from "@/components/pages/OrchardGallery";

/* ───────── CTA ───────── */
export function MissionCta() {
  return (
    <section className="border-t border-green/10 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal y={10}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green/20 bg-white px-4 py-1.5">
            <span className="size-2 rounded-full bg-leaf" />
            <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-green">
              <ContentText>New footage added regularly</ContentText>
            </span>
          </div>
        </Reveal>
        <Heading
          tone="leaf"
          text={"Ready to build {something that lasts?}"}
          className="mb-6 text-h2"
        />
        <Reveal delay={0.1}>
          <p className="mb-10 text-body text-forest/70">
            <ContentText>
              Explore the platform in detail, visit Zeebaran Hub, or get in touch directly to
              discuss your orchard.
            </ContentText>
          </p>
        </Reveal>
        <Reveal delay={0.15} className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/platform"
            className="btn-orange rounded-full bg-orange px-7 py-3.5 text-[0.8125rem] font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#e05d00] hover:shadow-lg"
          >
            <ContentText>Explore the Platform</ContentText>
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-green/20 bg-white px-7 py-3.5 text-[0.8125rem] font-semibold text-forest shadow-sm transition-all duration-300 hover:border-leaf"
          >
            <ContentText>Contact Zeebaran</ContentText>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
