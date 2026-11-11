import { useId } from "react";
import styles from "./apple-illustration.module.css";

/** An original, monochrome orchard-to-brand motion study, rendered entirely in SVG. */
export function AppleIllustration() {
  const id = useId().replace(/:/g, "");
  const drawing = id + "-apple",
    leftHalf = id + "-leftHalf",
    rightHalf = id + "-rightHalf",
    word = id + "-word",
    top = id + "-top",
    bottom = id + "-bottom",
    horizontalWord = id + "-horizontal-word",
    knife = id + "-knife";
  return (
    <svg
      className={styles.sketch}
      viewBox="-32 -22 392 340"
      fill="none"
      stroke="#171717"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <g id={drawing}>
          {/* An irregular silhouette keeps the fruit organic rather than icon-like. */}
          <path
            d="M190 88c-22-10-39-15-55-10-45 12-65 48-56 86 7 37 29 88 63 107 17 10 29 2 42 1 14-2 30 8 47-2 33-22 57-64 65-104 8-38-12-67-42-79-21-8-40-6-64 1Z"
            strokeWidth="1.8"
          />
          <path
            d="M180 89c6-16 16-31 35-46l7-12q2-3 6 0l9 6q2 4-3 7c-19 5-35 26-40 44q-7 6-14 1Z"
            strokeWidth="1.5"
          />
          <path d="m224 32 10 7m-60 47q14 12 34-1" strokeWidth="1.1" />

          {/* The broad, left-reaching leaf echoes the supplied sketch. */}
          <path
            d="M208 48c-32-1-42-17-65-30-23-15-40-9-58 3-23 16-37 47-73 61 18 22 38 26 61 19 21-6 40-24 62-26 27-1 55 7 73-27Z"
            strokeWidth="1.7"
          />
          <path
            d="M207 48c-43 11-79-9-102-4S44 85 12 82m143-32c-14-14-26-23-38-26m-1 22c-10-7-17-16-26-23m68 32c-12 13-30 15-42 15m6-23c-16 6-23 16-37 21m7-19c-12 13-30 16-44 20"
            strokeWidth=".95"
          />
          <path
            d="m57 86 19 6m-27-2 15 5m-25-1 14 4m48-76 9-2m0-3 12 1m7 3 10 4"
            strokeWidth=".65"
          />

          {/* Separate contour strokes give depth without colour or shaded fills. */}
          <path
            d="M139 90c-27 7-47 28-51 51m36-43c-18 13-30 33-32 54m-1 13c1 23 9 44 21 62m-11-56c0 27 8 51 22 70"
            strokeWidth=".85"
          />
          <path
            d="M169 95c16 8 33 10 50 4m-41 2c17 7 33 9 48 4m-34 4c18 5 35 3 49-1m-25 7c12-3 22-3 32 0m-16 5q11-1 20 5"
            strokeWidth=".7"
          />
          <path
            d="M269 108q14 9 20 24m-12-12 12 19m-5 1q7 12 7 24m-49 75q-8 12-21 18m12-9-15 13m-42 3q17-5 32 0m-44 4q15-5 29-3"
            strokeWidth=".75"
          />
        </g>
        <clipPath id={leftHalf}>
          <rect x="-50" y="-50" width="238" height="450" />
        </clipPath>
        <clipPath id={rightHalf}>
          <rect x="188" y="-50" width="240" height="450" />
        </clipPath>
        <clipPath id={word}>
          <rect className={styles.wordWipe} x="164" y="82" width="48" height="196" />
        </clipPath>
        <clipPath id={top}>
          <rect x="-50" y="-50" width="450" height="218" />
        </clipPath>
        <clipPath id={bottom}>
          <rect x="-50" y="168" width="450" height="220" />
        </clipPath>
        <clipPath id={horizontalWord}>
          <rect className={styles.horizontalWipe} x="105" y="145" width="168" height="50" />
        </clipPath>
        <g id={knife} strokeWidth="1.3">
          <path d="M-105 4H29v18h-96q-24-1-38-18Z" />
          <path d="M-91 8H22M-66 18h83" strokeWidth=".6" />
          <path d="m29 3 54-5q8 0 8 8v9q0 8-8 7l-54-1V3Z" />
          <path d="M33 6v12m5-12 44-4m-43 15 43 2" strokeWidth=".6" />
          <circle cx="47" cy="10" r="1.5" strokeWidth=".7" />
          <circle cx="74" cy="10" r="1.5" strokeWidth=".7" />
        </g>{" "}
      </defs>

      <g className={styles.verticalScene}>
        <g className={styles.wordmark}>
          <g clipPath={`url(#${word})`}>
            <text textAnchor="middle" className={styles.lettering} strokeWidth=".6">
              {Array.from("Zeebaran").map((letter, index) => (
                <tspan key={index} x="188" y={106 + index * 22}>
                  {letter}
                </tspan>
              ))}
            </text>
          </g>
        </g>

        <g className={styles.leftHalf}>
          <g clipPath={`url(#${leftHalf})`}>
            <use href={`#${drawing}`} />
          </g>
          <path
            className={styles.cutFace}
            d="M188 88q-12 92 0 184 12-92 0-184Z"
            strokeWidth=".85"
          />
        </g>
        <g className={styles.rightHalf}>
          <g clipPath={`url(#${rightHalf})`}>
            <use href={`#${drawing}`} />
          </g>
          <path
            className={styles.cutFace}
            d="M188 88q-12 92 0 184 12-92 0-184Z"
            strokeWidth=".85"
          />
        </g>

        {/* The blade travels along the seam before the two drawn halves part. */}
        <path className={styles.seam} pathLength="1" d="M188 88V272" strokeWidth=".85" />
        <g className={styles.knife}>
          <use href={`#${knife}`} />
        </g>
      </g>
      <g className={styles.horizontalScene}>
        <g className={styles.wordmark}>
          <g clipPath={`url(#${horizontalWord})`}>
            <text
              x="188"
              y="181"
              textAnchor="middle"
              className={styles.horizontalLettering}
              strokeWidth=".6"
            >
              zeebaran
            </text>
          </g>
        </g>
        <g className={styles.topHalf}>
          <g clipPath={`url(#${top})`}>
            <use href={`#${drawing}`} />
          </g>
          <path
            className={styles.cutFace}
            d="M80 168q108-15 216 0-108 15-216 0Z"
            strokeWidth=".85"
          />
        </g>
        <g className={styles.bottomHalf}>
          <g clipPath={`url(#${bottom})`}>
            <use href={`#${drawing}`} />
          </g>
          <path
            className={styles.cutFace}
            d="M80 168q108-15 216 0-108 15-216 0Z"
            strokeWidth=".85"
          />
        </g>
        <path className={styles.seam} pathLength="1" d="M296 168H80" strokeWidth=".85" />
        <g className={styles.horizontalKnife}>
          <use href={`#${knife}`} />
        </g>
      </g>
    </svg>
  );
}
