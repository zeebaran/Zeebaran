import { useId } from "react";
import styles from "./contact-illustration.module.css";

/** A contact-page pen sketch: a field note, an envelope, and an orchard leaf seal. */
export function ContactIllustration() {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 320 330"
      fill="none"
      stroke="#171717"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={id + "-note"}>
          <rect x="82" y="0" width="164" height="143" />
        </clipPath>
        <clipPath id={id + "-brand"}>
          <rect className={styles.brandWipe} x="103" y="240" width="126" height="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-note)`}>
        <g className={styles.letter}>
          <path d="M91 185V22q0-4 4-4h126l20 20v147M221 18v20h20" strokeWidth="1.6" />
          <path d="M97 175V26h119m10 20h8v129" strokeWidth=".65" />
          <path
            className={styles.inkLines}
            pathLength="1"
            d="M113 52q34-3 68-1m-68 15q47-2 103 0m-103 12q43 2 91-1m-91 14h60"
            strokeWidth="1"
          />
          <path d="m185 93 5-4 3 4 6-2m6 0 9-1" strokeWidth=".8" />
        </g>
      </g>
      <g className={styles.envelope}>
        <path pathLength="1" d="m56 143 28-19m163 0 27 19" strokeWidth="1.5" />
        <path pathLength="1" d="M56 143v135q0 7 7 7h204q7 0 7-7V143" strokeWidth="1.7" />
        <path
          pathLength="1"
          d="m56 143 97 62q12 8 24 0l97-62M59 282l80-94m132 94-80-94"
          strokeWidth="1.3"
        />
        <path pathLength="1" d="M63 148v126m5 5h62m66 0h68" strokeWidth=".6" />

        {/* A small botanical seal connects correspondence to Zeebaran's orchard work. */}
        <circle pathLength="1" cx="165" cy="217" r="16" strokeWidth="1" />
        <path
          pathLength="1"
          d="M159 225c-4-10 1-20 13-24 4 12-1 22-13 24Zm0 0 9-17"
          strokeWidth=".85"
        />

        {/* Short pen strokes give the paper edges the same sketch character as About. */}
        <path
          pathLength="1"
          d="m63 157 6 5m-6 3 9 6m-9 3 7 5m182 84 12 10m-7-11 7 5m-7-6 7 2"
          strokeWidth=".6"
        />
      </g>
      <g clipPath={`url(#${id}-brand)`}>
        <text className={styles.brand} x="165" y="265" textAnchor="middle">
          zeebaran
        </text>
      </g>
      <path d="M83 296q82 3 165-1" strokeWidth=".65" />
    </svg>
  );
}
