"use client";

import { useState } from "react";
import { ContentRawImage, RemovedContentImage, useContentImage } from "@/features/cms/Content";
import styles from "./mission-tv.module.css";

function OrchardTVSketch() {
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 360 340"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Antennas, curved cabinet and feet. */}
      <path
        pathLength="1"
        d="M158 92 117 37m85 55 40-51M119 33a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm131 4a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM45 146q4-45 53-53 83-11 163 0 51 8 55 53l3 78q-1 44-44 53-96 15-192 0-43-9-42-53Zm42 132-9 22h14l15-19m145 1 15 18h14l-9-21"
      />
      {/* Rounded glass, tuning dials and speaker grille. */}
      <path
        pathLength="1"
        d="M65 149q4-31 36-37 58-10 119 0 29 6 32 37l2 66q0 29-29 35-62 12-125 0-32-6-34-35Zm232 5a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-4-6-5 6m9 27a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-5-6-5 6m-12 28h23m-23 6h23m-23 6h23m-23 6h23"
      />
      {/* The orchard rows converge toward the valley floor inside the screen. */}
      <path
        pathLength="1"
        d="M76 178q18-18 32-23l19 10 20-20 16-10 22 16 16-6 18 12 24 11m-166 44q34-21 80-21 49 0 86 19m-160 22 67-37m-25 53 31-52m28 52-20-52m72 34-68-35"
        strokeWidth="1.05"
      />
      <path
        pathLength="1"
        d="M96 213v-38m0 12q-10 0-13-9 9-2 13 7m0 12q10-1 14-10-9-1-14 7m23 8v-28m0 9q-7-1-10-7 7-1 10 5m0 10q7-1 10-7-7-1-10 5m17 8v-18m85 34v-38m0 12q10 0 13-9-9-2-13 7m0 12q-10-1-14-10 9-1 14 7m-24 8v-28m0 9q7-1 10-7-7-1-10 5m0 10q-7-1-10-7 7-1 10 5m-17 8v-18"
        strokeWidth="1.1"
      />
      <path
        pathLength="1"
        d="M57 309q118 8 245 0M77 146q8-20 29-24m-2 137q49 8 98 3m-48-38 3-10m17 10-4-10"
        strokeWidth=".85"
        strokeOpacity=".55"
      />
    </svg>
  );
}

const source = "asset:banners/mission/tv-orchard-webp";

export function VintageTV() {
  const { removed } = useContentImage(source);
  const [loaded, setLoaded] = useState(false);
  if (removed) return <RemovedContentImage source={source} alt="Orchard TV" />;
  return (
    <div className={styles.scene} data-loaded={loaded || undefined}>
      <span className={styles.shadow} aria-hidden="true" />
      <div className={styles.artwork}>
        <ContentRawImage
          src={source}
          alt="Orchard TV"
          sizes="(max-width: 440px) calc(100vw - 32px), 400px"
          loading="eager"
          fetchPriority="high"
          className={styles.image}
          onLoad={() => setLoaded(true)}
        />
        <OrchardTVSketch />
      </div>
    </div>
  );
}
