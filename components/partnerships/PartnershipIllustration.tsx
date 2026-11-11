import styles from "./partnership-illustration.module.css";

/** Himalayan ridges and two supporting hands, rendered as original botanical linework. */
export function PartnershipIllustration() {
  return (
    <svg
      className={styles.sketch}
      viewBox="0 -120 340 470"
      fill="none"
      stroke="#171717"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Broken summits, receding shoulders, snow gullies, and rock strata. */}
      <g strokeOpacity=".85">
        <path
          pathLength="1"
          className={styles.mountains}
          d="M16 70c8-9 12-13 18-16l9-20 9-4 13-23 7 3 8-13 11 17 8-5 8 12 11-30 7-5 10-27 9-9 8-23 8 10 6 20 9 7 8 19 9 5 14 28 11-10 9-19 9 7 7-4 12 22 8 3 12 25 9 5 17 24"
          strokeWidth="1.2"
        />
        <path
          pathLength="1"
          className={styles.snow}
          d="m124-22 10-5 8 7 6-11 9 4 8-8 9 9 6-3m-28-43-4 30 5 12-6 20 2 14-10 19-3 19m20-72 7 14-2 13 11 16 3 19 12 12m-57-5-6 18-10 10-6 22m-47-48 8 5 7-7 8 8m139-5 8 6 6-3 7 7"
          strokeWidth=".75"
        />
        <path
          pathLength="1"
          className={styles.snow}
          d="m142-48-8 20m12 7-7 20-7 8m25-43-1 13 7 14m6-9 8 16m-61 15-4 17-9 13m23-13-10 17m24-38-2 19-10 17m47-40 9 20 8 5m-1-12 11 18m32-33 3 19 11 7m-2-17 12 16 7 5"
          strokeWidth=".45"
          strokeOpacity=".7"
        />
        <path
          pathLength="1"
          className={styles.foothills}
          d="M17 87c17-5 21-15 35-19 11-4 15-1 25-8 13-9 20-7 34-14 10-5 18-3 27-8m39 8c16 6 23 3 36 12 11 7 16 4 26 9 14 7 24 0 35 8 17 11 30 10 48 22"
          strokeWidth=".7"
        />
        <path
          pathLength="1"
          className={styles.foothills}
          d="M26 97q22-13 43-15l22-10m-37 24 33-13m16-13 18-10m105 13 28 10m-9 1 24 9m-10-16 15 6m13 11 16 5"
          strokeWidth=".45"
          strokeOpacity=".6"
        />
      </g>

      {/* A tapered stem, asymmetric leaf margins, and fruit joined to its branch. */}
      <path
        pathLength="1"
        className={styles.stem}
        d="M167 216c6-29 6-57 2-87m3 43 23-19m-24 3-27-20m26 2 10-25m-8 47-17 7-4 8"
        strokeWidth="1.5"
      />
      <path
        pathLength="1"
        className={styles.stem}
        d="M172 215c5-22 5-40 3-57m-6 49 6-14m-4-43-2-12"
        strokeWidth=".65"
      />
      <path
        pathLength="1"
        className={styles.leaves}
        d="M145 137c-10 2-19-2-25-8l-1-4-4-1-2-7-3-3-1-13c12 1 22 6 28 14l1 5 4 3 3 14Zm50 16c0-11 6-20 14-25l5-1 3-4 8-1 4-3 13 1c-2 12-8 22-17 28l-5 1-4 3-9 1-4 2-8-2Zm-15-40c-4-11-2-23 3-31l4-3 1-5 7-5 2-4 13-5c4 14 1 27-6 36l-5 2-2 5-9 5-2 4-6 1Z"
        strokeWidth="1.1"
      />
      <path
        pathLength="1"
        className={styles.veins}
        d="m114 107 28 27m-17-17 1-7m6 13 1-8m-8 8-8-1m20 9-8-1m72 19 34-23m-23 16 1-9m7 4 4-9m-12 17 9 1m-38-36 20-40m-14 28-6-4m11-6 1-9m-8 22 7-3"
        strokeWidth=".5"
      />
      <path
        pathLength="1"
        className={styles.apple}
        d="M151 175c-6-6-15-2-15 6 0 8 5 15 11 13 6 3 12-3 14-11 1-7-4-12-10-8Zm-1 0 2-7m-11 12c-2 4-1 7 1 10m10-18q6-6 11-2-4 6-11 2"
        strokeWidth=".9"
      />
      <path
        pathLength="1"
        className={styles.soil}
        d="M129 219c8-7 12-6 20-9l9 1 9-3 10 3 7-1 11 5 9 1 9 6c-27 8-57 8-84-3Z"
        strokeWidth=".8"
      />
      <path
        pathLength="1"
        className={styles.soil}
        d="m145 215 8-1m8 7 8-1m13-5 7 2m-22-8-5 6m10-5 7 8m17 2 5 1"
        strokeWidth=".5"
      />

      {/* Open palms, articulated fingers, and cuff seams give the hands clear structure. */}
      <path
        pathLength="1"
        className={styles.hands}
        d="M34 282 66 246c11-13 24-16 38-18l35-3c10-1 20-5 26-9 6-4 13 0 10 6-3 6-16 12-30 17l-15 5 27-4c8-1 13 3 9 8-3 4-16 8-29 11l15-4c8-2 13 4 6 9-6 4-19 8-32 11l13-4c7-1 10 5 4 9-11 7-26 10-39 12l-16 17"
        strokeWidth="1.35"
      />
      <path
        pathLength="1"
        className={styles.hands}
        d="m306 282-32-36c-11-13-24-16-38-18l-35-3c-10-1-20-5-26-9-6-4-13 0-10 6 3 6 16 12 30 17l15 5-27-4c-8-1-13 3-9 8 3 4 16 8 29 11l-15-4c-8-2-13 4-6 9 6 4 19 8 32 11l-13-4c-7-1-10 5-4 9 11 7 26 10 39 12l16 17"
        strokeWidth="1.35"
      />
      <path
        pathLength="1"
        className={styles.cuffs}
        d="m29 282 51 35 12-16-51-35-12 16Zm282 0-51 35-12-16 51-35 12 16Z"
        strokeWidth="1.1"
      />
      <path
        pathLength="1"
        className={styles.creases}
        d="m39 280 41 28m221-28-41 28m-161-65 12-6m-9 16q8-4 17-3m-26 10 7-3m141-14-12-6m9 16q-8-4-17-3m26 10-7-3m-77-39 5-3m-10 26 4-1m24-25-5-3m10 26-4-1"
        strokeWidth=".5"
      />
      <circle pathLength="1" className={styles.creases} cx="76" cy="308" r="1.4" strokeWidth=".6" />
      <circle
        pathLength="1"
        className={styles.creases}
        cx="264"
        cy="308"
        r="1.4"
        strokeWidth=".6"
      />
      <path
        pathLength="1"
        className={styles.ground}
        d="M109 332q61 3 123-1"
        strokeWidth=".6"
        strokeOpacity=".45"
      />
    </svg>
  );
}
