"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Mic2,
  Play,
  Search,
  Headphones,
  Radio,
  X,
} from "lucide-react";
import { ContentText, usePodcast } from "@/features/cms/Content";
import { AssetImage } from "@/features/media/AssetImage";
import { videoPoster, youtubeUrl } from "@/features/cms/video";
import { newestEpisodes, podcastCopy, type PodcastEpisode } from "./model";
import styles from "./podcast.module.css";
const YouTubeVideo = dynamic(
  () => import("@/features/cms/YouTubeVideo").then((m) => m.YouTubeVideo),
  { ssr: false },
);
export function PodcastSketch() {
  return (
    <svg viewBox="0 0 360 300" fill="none" aria-hidden="true" className={styles.sketch}>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <g className={styles.draw}>
          <rect x="141" y="39" width="78" height="137" rx="39" />
          <path d="M151 76h58m-58 10h58m-58 10h58m-58 10h58m-58 10h58m-53 11h48M128 134v8c0 31 23 54 52 54s52-23 52-54v-8M180 196v44m-32 0h64m-82 14h100" />
          <path d="M175 154h10m-5-5v10" />
        </g>
        <g className={styles.wave} data-podcast-wave>
          <path d="M109 87c-13 17-13 40 0 57M251 87c13 17 13 40 0 57" />
        </g>
        <g className={`${styles.wave} ${styles.outerWave}`} data-podcast-wave>
          <path d="M92 76c-20 24-20 55 0 79M268 76c20 24 20 55 0 79" />
        </g>
        <g opacity=".55">
          <g className={`${styles.sprig} ${styles.leftSprig}`}>
            <path d="M61 257c36-22 58-52 63-87M79 242c-17-1-29-10-33-26 18 0 28 9 33 26Zm20-23c-2-20 7-32 25-36 0 19-8 30-25 36Z" />
          </g>
          <g className={`${styles.sprig} ${styles.rightSprig}`}>
            <path d="M260 245c-2-30 7-58 24-81m-12 48c-17-5-24-16-22-32 17 5 24 16 22 32Zm4-15c2-21 12-31 29-31-3 19-12 29-29 31Z" />
          </g>
          <path d="M52 267c76-5 178-5 256 0" />
        </g>
      </g>
    </svg>
  );
}
function PodcastArtwork() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={styles.art} data-motion-paused={paused}>
      <div className={styles.sketchFrame}>
        <PodcastSketch />
        <button
          type="button"
          className={styles.motionToggle}
          aria-label="Pause sketch animation"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        />
      </div>
      <span>Ideas take root in conversation.</span>
    </div>
  );
}
function EpisodePoster({ episode, large = false }: { episode: PodcastEpisode; large?: boolean }) {
  const src = videoPoster({ kind: "youtube", src: episode.url });
  const [failedSource, setFailedSource] = useState("");
  if (large && failedSource === src)
    return <span className={styles.posterFallback} aria-hidden="true" />;
  return src ? (
    <AssetImage
      key={src}
      src={src}
      alt=""
      fill
      sizes={large ? "(max-width: 760px) 94vw, 900px" : "(max-width: 600px) 90vw, 340px"}
      style={{ objectFit: "cover" }}
      onError={() => setFailedSource(src)}
    />
  ) : (
    <Mic2 aria-hidden size={32} />
  );
}
export function PodcastPage() {
  const content = usePodcast();
  const episodes = newestEpisodes(content.episodes).filter(
    (episode) => episode.enabled && episode.title.trim() && youtubeUrl(episode.url),
  );
  const [selected, setSelected] = useState(""),
    [playing, setPlaying] = useState(false),
    [failed, setFailed] = useState(false),
    [topic, setTopic] = useState("All conversations"),
    [query, setQuery] = useState("");
  const stage = useRef<HTMLElement>(null);
  const episodeRow = useRef<HTMLDivElement>(null);
  const [scrollEdges, setScrollEdges] = useState({ previous: false, next: false });
  const current = episodes.find((e) => e.id === selected) || episodes[0];
  const topics = ["All conversations", ...new Set(episodes.map((e) => e.topic).filter(Boolean))];
  const filtered = episodes.filter(
    (e) =>
      (topic === "All conversations" || topic === e.topic) &&
      `${e.title} ${e.guest} ${e.topic} ${e.description}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  const hasResults = filtered.length > 0;

  useEffect(() => {
    const row = episodeRow.current;
    if (!row) return;
    function updateEdges() {
      if (!row) return;
      const previous = row.scrollLeft > 1;
      const next = row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
      setScrollEdges((edges) =>
        edges.previous === previous && edges.next === next ? edges : { previous, next },
      );
    }
    const observer = new ResizeObserver(updateEdges);
    observer.observe(row);
    row.addEventListener("scroll", updateEdges, { passive: true });
    updateEdges();
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", updateEdges);
    };
  }, [hasResults, filtered.length]);

  function scrollEpisodes(direction: -1 | 1) {
    const row = episodeRow.current;
    const card = row?.firstElementChild;
    if (!row || !card) return;
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap);
    row.scrollBy({ left: step * direction });
  }

  function select(episode: PodcastEpisode) {
    setSelected(episode.id);
    setPlaying(false);
    setFailed(false);
    stage.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    stage.current?.focus({ preventScroll: true });
  }
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            <ContentText>{podcastCopy.eyebrow}</ContentText>
          </p>
          <h1>
            Bazm-e-Khayal
            <span className={styles.titleLine} />
          </h1>
          <h2>
            <ContentText>{podcastCopy.heading.replace(/[{}]/g, "")}</ContentText>
          </h2>
          <p className={styles.intro}>
            <ContentText>{podcastCopy.intro}</ContentText>
          </p>
          <div className={styles.heroLinks}>
            <a href="#podcast-library">
              Explore the conversations <ArrowDown size={14} />
            </a>
            <a href={content.channelUrl} target="_blank" rel="noopener noreferrer">
              On YouTube <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <PodcastArtwork />
      </section>
      <section
        ref={stage}
        tabIndex={-1}
        className={styles.stage}
        aria-label="Featured podcast"
        data-podcast-section
      >
        <div className={styles.stageTop}>
          <span>
            <Radio size={14} /> THE LISTENING ROOM
          </span>
          <span>{current ? "SELECTED CONVERSATION" : "A NEW CONVERSATION IS COMING"}</span>
        </div>
        <div className={styles.player} key={current?.id || "empty"}>
          {current && playing && !failed ? (
            <YouTubeVideo
              key={current.id}
              src={youtubeUrl(current.url)!}
              title={current.title}
              descriptionId="podcast-description"
              onReady={() => {}}
              onStateChange={() => {}}
              onError={() => setFailed(true)}
            />
          ) : current ? (
            <button
              type="button"
              className={styles.playPoster}
              onClick={() => {
                setFailed(false);
                setPlaying(true);
              }}
              aria-label={"Play " + current.title}
            >
              <EpisodePoster episode={current} large />
              <span className={styles.posterShade} />
              <span className={styles.playIcon}>
                <Play size={23} fill="currentColor" />
              </span>
              <span className={styles.playHint}>
                {failed ? "Try playing again" : "Play conversation"}
              </span>
            </button>
          ) : (
            <div className={styles.emptyStage}>
              <Mic2 size={40} strokeWidth={1} />
              <p>
                The next good question
                <br />
                <em>starts here.</em>
              </p>
              <span>Our first episode is on its way.</span>
            </div>
          )}
        </div>
        <div className={styles.featureInfo}>
          <div>
            <p className={styles.eyebrow}>{current?.topic || "BAZM-E-KHAYAL"}</p>
            <h2>{current?.title || "A space for thoughtful agricultural conversations."}</h2>
            <p id="podcast-description">
              {current?.description ||
                "Bringing voices from the orchard, the laboratory and the wider agricultural community to one table."}
            </p>
          </div>
          <aside>
            {current?.guest && (
              <p>
                <span>IN CONVERSATION WITH</span>
                {current.guest}
              </p>
            )}
            {current && (
              <a
                href={
                  "https://www.youtube.com/watch?v=" + youtubeUrl(current.url)!.split("/").at(-1)
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on YouTube <ArrowUpRight size={14} />
              </a>
            )}
            {failed && (
              <p role="status">Playback is unavailable here. You can watch directly on YouTube.</p>
            )}
          </aside>
        </div>
      </section>
      <section
        id="podcast-library"
        className={styles.library}
        aria-label="Podcast episodes"
        data-podcast-section
      >
        <div className={styles.libraryHead}>
          <div>
            <p className={styles.eyebrow}>THE EPISODE LIBRARY</p>
            <h2>
              <ContentText>{podcastCopy.library}</ContentText>
            </h2>
          </div>
          <span>
            {episodes.length
              ? `${episodes.length} ${episodes.length === 1 ? "episode" : "episodes"}`
              : "Thoughtful voices. Shared knowledge."}
          </span>
        </div>
        {episodes.length > 0 && (
          <>
            <div className={styles.tools}>
              <div className={styles.filters} aria-label="Filter by topic">
                {topics.map((t) => (
                  <button
                    key={t}
                    aria-pressed={topic === t}
                    onClick={() => {
                      setTopic(t);
                      if (episodeRow.current) episodeRow.current.scrollLeft = 0;
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className={styles.searchTools}>
                <label className={styles.search}>
                  <Search size={15} />
                  <input
                    aria-label="Search podcast episodes"
                    placeholder="Find a conversation…"
                    value={query}
                    maxLength={200}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (episodeRow.current) episodeRow.current.scrollLeft = 0;
                    }}
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label="Clear episode search"
                      onClick={() => {
                        setQuery("");
                        if (episodeRow.current) episodeRow.current.scrollLeft = 0;
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
                {hasResults && (scrollEdges.previous || scrollEdges.next) && (
                  <div className={styles.episodeControls}>
                    <button
                      type="button"
                      aria-label="Previous episode cards"
                      aria-controls="podcast-episode-row"
                      aria-disabled={!scrollEdges.previous}
                      onClick={() => scrollEdges.previous && scrollEpisodes(-1)}
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next episode cards"
                      aria-controls="podcast-episode-row"
                      aria-disabled={!scrollEdges.next}
                      onClick={() => scrollEdges.next && scrollEpisodes(1)}
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="sr-only" role="status">
              {filtered.length} episodes found
            </p>
          </>
        )}
        {episodes.length === 0 ? (
          <div className={styles.emptyLibrary}>
            <Headphones size={24} strokeWidth={1.3} />
            <div>
              <h3>Pull up a chair.</h3>
              <p>
                Our episode library will grow with each conversation. Come back for fresh
                perspectives from agriculture.
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyLibrary}>
            <Search size={22} />
            <p>No matching conversations. Try another topic or search.</p>
            <button
              onClick={() => {
                setTopic("All conversations");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            id="podcast-episode-row"
            role="group"
            aria-label="Episode cards"
            className={styles.episodeRow}
            ref={episodeRow}
          >
            {filtered.map((episode, i) => (
              <button
                key={episode.id}
                className={styles.episode}
                aria-label={"Select " + episode.title}
                aria-pressed={current?.id === episode.id}
                onClick={() => select(episode)}
                style={{ "--episode-delay": `${Math.min(i, 7) * 45}ms` } as React.CSSProperties}
              >
                <div className={styles.thumb}>
                  <EpisodePoster episode={episode} />
                  <span className={styles.smallPlay}>
                    <Play size={14} fill="currentColor" />
                  </span>
                  {current?.id === episode.id && <span className={styles.selected}>Selected</span>}
                </div>
                <div className={styles.episodeCopy}>
                  <span>{episode.topic || "CONVERSATION"}</span>
                  <h3>{episode.title}</h3>
                  {episode.guest && <p>{episode.guest}</p>}
                  <span className={styles.episodeFoot}>
                    Take a seat. Press play.
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
      <div className={styles.closing}>
        <Mic2 size={18} />
        <p>
          From a question in the field.
          <br />
          <em>To a conversation that moves us forward.</em>
        </p>
        <a href="/contact" className="action-motion">
          Suggest a conversation <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  );
}
