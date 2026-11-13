import styles from "./hub-hero.module.css";

/** A permanent field hub, an open grower's notebook and a young orchard tree. */
export function HubIllustration() {
  return (
    <svg
      className={styles.sketch}
      data-hub-illustration
      viewBox="25 55 380 380"
      fill="none"
      stroke="#171717"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.building}>
        {/* A pitched timber roof with a sheltered, open entrance. */}
        <path pathLength="1" d="m43 171 118-91 126 89-9 10-117-81-110 82-8-9Z" strokeWidth="1.45" />
        <path pathLength="1" d="M62 174v133h198V174M70 178v122h182V178" strokeWidth="1.35" />
        <path
          pathLength="1"
          d="m70 165 91-69 100 70M149 132h24m-20-6h16m-12-6h8"
          strokeWidth=".65"
        />
        <path
          pathLength="1"
          d="M93 300V202h65v98m-58 0v-91h51v91m-38-87v83m23-83v83M158 202l17 9v88l-17 1m6-74 5 2v18l-5-1"
          strokeWidth="1.05"
        />
        <path
          pathLength="1"
          d="M188 206h48v49h-48v-49Zm5 5h38v39h-38v-39Zm19 0v39m-19-19h38M184 259h56"
          strokeWidth="1.05"
        />
        <path
          pathLength="1"
          d="M85 170h151v21H85v-21Zm5 5v11m141-11v11M78 199h9m-9 20h9m-9 20h9m-9 20h9m-9 20h9m91-81h66m-66 73h66m-66 17h66"
          strokeWidth=".6"
        />
        <path
          pathLength="1"
          d="M86 307v7h99v-7m-106 7v7h113v-7M65 302l-4 2m191-6 4 2m-19-27 7 2m-166-31 6 2"
          strokeWidth=".75"
        />
      </g>
      <text className={styles.sign} x="160" y="185" textAnchor="middle" stroke="none">
        Zeebaran Hub
      </text>
      <g className={styles.tree} strokeWidth="1.25">
        {/* A supported young tree: knowledge put into everyday growing practice. */}
        <path
          pathLength="1"
          d="M325 362c-5-43-2-84-10-125-4-26-7-52-5-78m22 204c-6-46-3-86-11-127-5-28-7-52-5-77M320 270l-28-25m27-4 31-25m-37 4-27-29m27 4 23-26M307 181l-15-24"
        />
        <path
          pathLength="1"
          d="M292 245c-24 1-40-12-44-33 24 1 39 12 44 33Zm58-29c0-23 14-39 36-43-1 22-15 38-36 43Zm-64-25c-22-2-35-17-35-38 22 4 34 17 35 38Zm50-22c-1-23 11-40 32-46 1 23-11 39-32 46Zm-44-12c-17-6-26-21-23-39 18 7 26 20 23 39Zm20 6c-9-22-6-42 8-58 9 23 6 42-8 58Z"
        />
        <path
          pathLength="1"
          d="m292 245-30-24m88-5 24-31m-88 6-25-27m75 5 22-33m-66 21-15-26m35 32 7-43"
          strokeWidth=".65"
        />
        <path
          pathLength="1"
          d="M343 252c-10-8-22-3-24 8-3 13 7 27 16 24 10 4 22-8 21-20 0-10-6-16-13-12Zm-5-3 3-9m-2 9c3-7 9-9 16-7-3 6-9 9-16 7Z"
          strokeWidth=".95"
        />
        <path
          pathLength="1"
          d="M301 173v189m-4 0h8m-5-123 23-4m-23 9 24-4m-24-2 23 2M309 365l16-7 20 6m-20-2-10 11m14-11 10 10"
          strokeWidth=".8"
        />
      </g>
      <g className={styles.notebook}>
        {/* An open field notebook rests on a simple consultation table. */}
        <path
          pathLength="1"
          d="m43 338 177-1 27 19H68l-25-18Zm0 0v6l25 19h179v-7M76 363l-6 52m11-52-4 52m148-52 9 52m-14-52 7 52M75 395h152"
          strokeWidth="1.2"
        />
        <path
          pathLength="1"
          d="M86 313c19-5 35-3 53 5 18-9 35-12 54-8l18 33c-21-4-43-1-65 9-20-10-40-12-61-8l1-31Zm53 5 7 34m-61-8v5c21-4 41-2 61 7 22-9 44-13 65-8v-5"
          strokeWidth="1.05"
        />
        <path
          pathLength="1"
          d="m95 322 32 5m-32 3 33 5m-32 3 34 5m23-15 32-7m-29 14 34-7m-29 14 34-7M156 322l24-6m-50 14-5-9m-5 9-2-6"
          strokeWidth=".6"
        />
        <path
          pathLength="1"
          d="m211 327 14 15-3 3-14-16 3-2Zm14 15 3 6-6-3m-15-17 2-2"
          strokeWidth=".8"
        />
      </g>
      <g className={styles.ground} strokeWidth=".65">
        <path d="M43 417h203m33-47 77-1m-63 8h56M64 423h28m111-1h23m-2 0h20m80-44h10" />
        <path d="m276 365-3-7m7 7 5-7m69 10 4-6m2 6 5-4" />
      </g>
    </svg>
  );
}
