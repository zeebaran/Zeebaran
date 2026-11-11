"use client";
import { useEffect, useRef } from "react";

export type YouTubeController = {
  playVideo(): void;
  pauseVideo(): void;
  getPlayerState(): number;
  destroy(): void;
};
type YouTubeApi = {
  Player: new (
    frame: HTMLIFrameElement,
    options: {
      events: {
        onReady(event: { target: YouTubeController }): void;
        onStateChange(event: { data: number }): void;
        onError(): void;
      };
    },
  ) => YouTubeController;
};
type ApiWindow = Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
let loading: Promise<YouTubeApi> | null = null;

/** Shared provider script, requested only after a visitor opens a YouTube film. */
function loadApi() {
  const host = window as ApiWindow;
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (loading) return loading;
  loading = new Promise<YouTubeApi>((resolve, reject) => {
    const previous = host.onYouTubeIframeAPIReady,
      script = document.createElement("script");
    const finish = () => {
      clearTimeout(timer);
      if (host.onYouTubeIframeAPIReady === ready) host.onYouTubeIframeAPIReady = previous;
    };
    const fail = () => {
      finish();
      script.remove();
      loading = null;
      reject(Error("Video controls unavailable."));
    };
    const ready = () => {
      finish();
      try {
        previous?.();
      } finally {
        if (host.YT?.Player) resolve(host.YT);
        else fail();
      }
    };
    const timer = setTimeout(fail, 15000);
    host.onYouTubeIframeAPIReady = ready;
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}

export function YouTubeVideo({
  src,
  title,
  descriptionId,
  onReady,
  onStateChange,
  onError,
}: {
  src: string;
  title: string;
  descriptionId: string;
  onReady: (controller: YouTubeController | null) => void;
  onStateChange: (state: number) => void;
  onError: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null),
    callbacks = useRef({ onReady, onStateChange, onError });
  useEffect(() => {
    callbacks.current = { onReady, onStateChange, onError };
  }, [onReady, onStateChange, onError]);
  useEffect(() => {
    let active = true,
      controller: YouTubeController | undefined;
    loadApi()
      .then((api) => {
        if (!active || !frame.current) return;
        controller = new api.Player(frame.current, {
          events: {
            onReady: (event) => {
              if (active) callbacks.current.onReady(event.target);
            },
            onStateChange: (event) => {
              if (active) callbacks.current.onStateChange(event.data);
            },
            onError: () => {
              if (active) callbacks.current.onError();
            },
          },
        });
        frame.current.focus();
      })
      .catch(() => {
        if (active) callbacks.current.onError();
      });
    return () => {
      active = false;
      callbacks.current.onReady(null);
      controller?.destroy();
    };
  }, [src]);
  return (
    <iframe
      ref={frame}
      tabIndex={0}
      className="absolute inset-0 h-full w-full border-0"
      title={title}
      src={
        src +
        "?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=" +
        encodeURIComponent(window.location.origin)
      }
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      aria-describedby={descriptionId}
    />
  );
}
