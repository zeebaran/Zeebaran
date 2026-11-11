"use client";
import { ContentRawImage } from "@/features/cms/Content";

import { useState, useEffect, useRef } from "react";

export function VintageTVFallback() {
  const [pulse, setPulse] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frames = useRef<number[]>([]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      frames.current.forEach(cancelAnimationFrame);
    },
    [],
  );
  function handlePlay() {
    setPulse(false);
    if (timer.current) clearTimeout(timer.current);
    frames.current.forEach(cancelAnimationFrame);
    frames.current = [
      requestAnimationFrame(() => {
        frames.current.push(requestAnimationFrame(() => setPulse(true)));
      }),
    ];
    timer.current = setTimeout(() => setPulse(false), 900);
  }

  return (
    <div className="relative flex items-center justify-center py-10">
      <div className="absolute bottom-4 left-1/2 h-5 w-56 -translate-x-1/2 rounded-full bg-black/10 blur-md" />
      <svg
        viewBox="0 0 400 390"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[420px]"
        aria-label="Retro TV with play button"
      >
        <defs>
          <linearGradient id="bodyTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a8dd3f" />
            <stop offset="40%" stopColor="#8CC63F" />
            <stop offset="100%" stopColor="#5e9018" />
          </linearGradient>
          <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a7a12" />
            <stop offset="100%" stopColor="#3a620e" />
          </linearGradient>
          <radialGradient id="screenBg" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1c2e1a" />
            <stop offset="100%" stopColor="#060a05" />
          </radialGradient>
          <radialGradient id="playHalo" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#c84a00" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#8b2800" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="playBtn" cx="38%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ff8c2a" />
            <stop offset="100%" stopColor="#e55500" />
          </radialGradient>
          <radialGradient id="gloss" cx="30%" cy="10%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="0.38" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="antennaG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6a9e1a" />
            <stop offset="50%" stopColor="#aad430" />
            <stop offset="100%" stopColor="#6a9e1a" />
          </linearGradient>
        </defs>

        {/* Antennas */}
        <line
          x1="168"
          y1="52"
          x2="128"
          y2="12"
          stroke="url(#antennaG)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="128" cy="12" r="8" fill="#8CC63F" />
        <circle cx="128" cy="12" r="4" fill="#c8f060" />
        <line
          x1="232"
          y1="52"
          x2="272"
          y2="12"
          stroke="url(#antennaG)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="272" cy="12" r="8" fill="#8CC63F" />
        <circle cx="272" cy="12" r="4" fill="#c8f060" />

        {/* Body */}
        <rect x="20" y="44" width="360" height="288" rx="72" fill="url(#bodyTop)" />
        <rect x="20" y="44" width="360" height="288" rx="72" fill="url(#gloss)" />

        {/* Bezel */}
        <rect x="38" y="62" width="324" height="252" rx="56" fill="url(#bezelGrad)" />

        {/* Screen */}
        <rect x="52" y="76" width="296" height="224" rx="44" fill="url(#screenBg)" />

        {/* Scanlines */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect
            key={i}
            x="52"
            y={82 + i * 15}
            width="296"
            height="1.5"
            fill="white"
            fillOpacity="0.025"
            rx="1"
          />
        ))}

        {/* Play halo */}
        <circle cx="200" cy="188" r="66" fill="url(#playHalo)" />
        <circle
          cx="200"
          cy="188"
          r="52"
          fill="none"
          stroke="#c84a00"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        <circle
          cx="200"
          cy="188"
          r="42"
          fill="none"
          stroke="#e55500"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Play button */}
        <g
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handlePlay();
            }
          }}
          onClick={handlePlay}
          style={{ cursor: "pointer" }}
          aria-label="Play"
          role="button"
        >
          <circle cx="200" cy="188" r="34" fill="url(#playBtn)" />
          <ellipse cx="192" cy="176" rx="13" ry="8" fill="white" fillOpacity="0.22" />
          <path d="M191 172 L191 204 L222 188 Z" fill="white" />
          {pulse && (
            <>
              <circle
                cx="200"
                cy="188"
                r="34"
                fill="none"
                stroke="#FE6901"
                strokeWidth="3"
                style={{ animation: "tv-pulse 0.9s ease-out forwards" }}
              />
              <circle
                cx="200"
                cy="188"
                r="34"
                fill="none"
                stroke="#FE6901"
                strokeWidth="2"
                strokeOpacity="0.5"
                style={{ animation: "tv-pulse 0.9s ease-out 0.15s forwards" }}
              />
            </>
          )}
        </g>

        {/* Feet */}
        <rect x="128" y="328" width="58" height="22" rx="11" fill="#6a9e18" />
        <rect x="134" y="346" width="46" height="10" rx="5" fill="#5a8810" />
        <rect x="214" y="328" width="58" height="22" rx="11" fill="#6a9e18" />
        <rect x="220" y="346" width="46" height="10" rx="5" fill="#5a8810" />
      </svg>
      <style>{`
        @keyframes tv-pulse {
          0%   { r: 34; opacity: 1; }
          100% { r: 72; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function VintageTV() {
  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Floor shadow */}
      <div className="absolute bottom-2 left-1/2 h-5 w-64 -translate-x-1/2 rounded-full bg-black/10 blur-md" />
      <ContentRawImage
        src="asset:banners/mission/tv-orchard-webp"
        alt="Orchard TV"
        sizes="(max-width: 440px) calc(100vw - 32px), 400px"
        loading="eager"
        fetchPriority="high"
        className="w-full max-w-[400px] drop-shadow-2xl"
      />
    </div>
  );
}
