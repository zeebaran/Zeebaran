import styles from "./about-hero.module.css";

export function OrchardGrowerIllustration() {
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 340 295"
      fill="none"
      stroke="#242424"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Loose soil marks anchor the planting scene. */}
      <path
        pathLength="1"
        d="M32 249q54 5 119 2c20-1 32-14 56-15 22-2 36 10 52 12l51-1M143 264q29-3 54-1m29-5 17 3m-66-17 9-2m59 0 8 2"
        strokeOpacity=".58"
        strokeWidth="1.05"
      />
      {/* A grower kneels beside the young tree, with one hand reaching toward the soil. */}
      <path
        className={styles.grower}
        pathLength="1"
        d="M93 124c-8-6-10-17-7-26 3-9 12-15 22-14 13 2 19 10 19 22l9 11-8 3-1 10c-2 7-12 8-20 4l-4 8
           M84 108c3-6 10-9 20-9 15 0 26 6 38 4-6-5-12-8-18-9m-31 19 4 6m22-9h2
           M103 142c-13-5-23-3-32 6-10 11-15 34-17 51-2 13 4 23 16 27
           M104 142c10 5 17 17 19 30m-48-16c6-7 16-7 22 1l17 24 39 20-6 11-43-16-20-22
           M153 201l14 2 13 10c2 3-1 6-4 5l-10-5-6 1-13-2
           M70 226c13 3 25-5 38-14 12-8 25-5 30 6 4 9-2 19-12 24H66c-7 0-9-8-4-11l8-5m35-9 10 8m-59-25-6 28-17 6q-7 6 2 8h30"
      />
      {/* A tied stake supports the sapling as it takes root. */}
      <path
        className={styles.stake}
        pathLength="1"
        d="M238 236 242 104l6-1-6 134M219 155q11 5 21 2m-20 2q10 5 20 1m-1-4 6 5m-5-3 7-4"
        strokeWidth="1.2"
      />
      <path
        className={styles.sapling}
        pathLength="1"
        d="M210 236c3-21 8-41 9-62 1-27-4-53-2-75 1-14 5-26 11-37m-10 100q-8-20-26-35m27 14q12-18 27-27m-30 2q-8-18-18-27
           M228 62c-2-18 8-31 30-39-1 19-12 34-30 39Zm-30 27c-18 0-29-11-33-27 19 0 31 9 33 27Zm-6 38c-21 0-34-9-40-27 21 1 35 9 40 27Zm54-13c3-18 17-27 38-27-7 17-19 28-38 27Z"
      />
      <path
        className={styles.detail}
        pathLength="1"
        d="m232 55 17-23m-55 53-22-17m15 54-27-16m91 3 24-16M78 157q-9 12-12 29m46 50 14-5m73 7 4-5m20 2-4-5m40-27q16-8 34-9m-31 20q18-6 43-6"
        strokeOpacity=".65"
        strokeWidth=".85"
      />
    </svg>
  );
}
