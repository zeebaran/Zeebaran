"use client";
import { useEffect, useRef, useState } from "react";
import { ContentImage, ContentText, useCardVideo, useContentString } from "./Content";
import { videoPoster, youtubeUrl } from "./video";
import type { MissionVideoCardDefinition } from "./mission-videos";
import { AssetImage } from "@/features/media/AssetImage";
import { YouTubeVideo, type YouTubeController } from "./YouTubeVideo";

function PlayIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

function VideoPreview({ src }: { src: string }) {
  return (
    <AssetImage
      src={src}
      alt=""
      fill
      sizes="(max-width:640px) 90vw, 640px"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

/** The authored card stays in place; no player or media request exists before a visitor chooses Watch. */
export function MissionVideoCard({
  id,
  title,
  subtitle,
  tag,
  tagColor = "text-green",
  thumb,
  featured,
  video,
  managed,
  section,
}: MissionVideoCardDefinition) {
  const legacySource = useCardVideo(id),
    legacyHeading = useContentString(title),
    source = managed ? video : legacySource,
    heading = managed ? title : legacyHeading,
    [activeSrc, setActiveSrc] = useState<string | null>(null),
    [failedSrc, setFailedSrc] = useState<string | null>(null),
    player = useRef<HTMLVideoElement | null>(null),
    youtubePlayer = useRef<YouTubeController | null>(null),
    [paused, setPaused] = useState(false),
    [ready, setReady] = useState(false);
  const youtube = source?.kind === "youtube" ? youtubeUrl(source.src) : null;
  const poster = videoPoster(source);
  const src = youtube || (source?.kind === "cloudinary" ? source.src : null),
    playing = !!src && activeSrc === src,
    failed = !!src && failedSrc === src,
    playerId = id + "-player";
  useEffect(() => {
    if (playing && !failed) player.current?.focus();
  }, [playing, failed, src]);
  function watch() {
    if (src) {
      setFailedSrc(null);
      setPaused(false);
      setReady(false);
      setActiveSrc(src);
    }
  }
  function togglePlayback() {
    if (!playing || failed) {
      watch();
      return;
    }
    if (youtube) {
      if (paused) youtubePlayer.current?.playVideo();
      else youtubePlayer.current?.pauseVideo();
      setPaused(!paused);
    } else if (player.current) {
      if (player.current.paused) void player.current.play().catch(() => setPaused(true));
      else player.current.pause();
    }
  }
  const isPlaying = playing && !failed && !paused;
  return (
    <article
      data-video-card={id}
      data-video-section={section}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-green/10 bg-white shadow-card transition-all duration-300 hover:shadow-lift ${featured ? "lg:col-span-2" : ""}`}
    >
      <div id={playerId} className="relative aspect-video w-full overflow-hidden bg-forest/10">
        {playing && !failed ? (
          youtube ? (
            <YouTubeVideo
              key={youtube}
              src={youtube}
              title={heading}
              descriptionId={id + "-description"}
              onReady={(controller) => {
                youtubePlayer.current = controller;
                setReady(!!controller);
                if (controller) setPaused(![1, 3].includes(controller.getPlayerState()));
              }}
              onStateChange={(state) => {
                if (state === 1) setPaused(false);
                else if ([0, 2, 5].includes(state)) setPaused(true);
              }}
              onError={() => setFailedSrc(src)}
            />
          ) : (
            <video
              ref={(node) => {
                player.current = node;
              }}
              tabIndex={0}
              className="absolute inset-0 h-full w-full object-contain"
              src={src!}
              controls
              autoPlay
              playsInline
              preload="none"
              onPlay={() => {
                setReady(true);
                setPaused(false);
              }}
              onPause={() => setPaused(true)}
              onEnded={() => setPaused(true)}
              aria-label={heading}
              aria-describedby={id + "-description"}
              onError={() => setFailedSrc(src)}
            />
          )
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-forest via-green/90 to-forest/80" />
            {poster ? (
              <VideoPreview key={poster} src={poster} />
            ) : thumb ? (
              <ContentImage
                src={thumb}
                alt={heading}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : null}
            {src && <div className="pointer-events-none absolute inset-0 bg-black/20" />}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              {src ? (
                <button
                  type="button"
                  onClick={watch}
                  aria-label={"Play " + heading}
                  aria-controls={playerId}
                  className="flex size-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <PlayIcon className="size-7 translate-x-0.5 text-white" />
                </button>
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                  <PlayIcon className="size-7 translate-x-0.5 text-white" />
                </div>
              )}
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-white/60">
                {src ? (
                  failed ? (
                    "Video unavailable"
                  ) : (
                    "Watch the film"
                  )
                ) : (
                  <ContentText>Video Coming Soon</ContentText>
                )}
              </span>
              {failed && (
                <p role="alert" className="px-4 text-center text-small text-white">
                  The video could not load. Please try again.
                </p>
              )}
            </div>
          </>
        )}
        {!playing && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-forest/80 px-2 py-0.5 text-[0.625rem] font-semibold text-white/90 backdrop-blur-sm">
            <ContentText>{id}</ContentText>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <span
            className={`mb-2 block text-eyebrow font-bold uppercase tracking-[0.16em] ${tagColor}`}
          >
            <ContentText>{tag}</ContentText>
          </span>
          <h3 className="mb-2 text-h3 font-medium leading-snug text-forest">
            {managed ? title : <ContentText>{title}</ContentText>}
          </h3>
          <p id={id + "-description"} className="text-small text-forest/70">
            {managed ? subtitle : <ContentText>{subtitle}</ContentText>}
          </p>
        </div>
        <button
          type="button"
          disabled={!src || (playing && !failed && !!youtube && !ready)}
          aria-label={(playing && !failed ? (paused ? "Resume " : "Pause ") : "Watch ") + heading}
          aria-controls={playerId}
          onClick={togglePlayback}
          className="mt-4 flex w-full items-center gap-2 border-t border-green/10 pt-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green disabled:cursor-default"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-orange/10">
            {isPlaying ? (
              <svg
                className="size-3.5 text-orange"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                data-video-action="pause"
              >
                <rect x="5" y="4" width="3.5" height="12" rx="0.8" />
                <rect x="11.5" y="4" width="3.5" height="12" rx="0.8" />
              </svg>
            ) : (
              <PlayIcon className="size-3.5 translate-x-px text-orange" />
            )}
          </span>
          <span className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-forest/60">
            {playing && !failed ? paused ? "Resume" : "Pause" : <ContentText>Watch</ContentText>}
          </span>
        </button>
      </div>
    </article>
  );
}
