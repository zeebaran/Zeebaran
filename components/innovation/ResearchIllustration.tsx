import { useId } from "react";
import styles from "./research-illustration.module.css";

/** Original vector artwork; no image request or client animation library. */
export function ResearchIllustration() {
  const id = useId().replace(/:/g, ""),
    metal = id + "-metal",
    fruit = id + "-fruit",
    specimen = id + "-specimen",
    scan = id + "-scan";
  return (
    <div className={styles.artwork} data-research-illustration>
      <svg
        viewBox="0 0 520 520"
        fill="none"
        role="img"
        aria-labelledby={id + "-title"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id={id + "-title"}>
          A microscope and an apple, connecting laboratory research with the orchard
        </title>
        <defs>
          <linearGradient
            id={metal}
            x1="155"
            y1="150"
            x2="292"
            y2="418"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f4f5e9" />
            <stop offset="1" stopColor="#dce6c9" />
          </linearGradient>
          <linearGradient
            id={fruit}
            x1="329"
            y1="327"
            x2="423"
            y2="420"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#eef3df" />
            <stop offset="1" stopColor="#d9e6c1" />
          </linearGradient>
          <clipPath id={specimen}>
            <path d="M380 330c-20-20-49-10-57 15-12 33 8 70 33 77 11 3 17-5 25-4 10 0 16 7 27 1 25-13 40-50 25-76-11-22-36-27-53-13Z" />
          </clipPath>
          <linearGradient id={scan} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#8cc63f" stopOpacity="0" />
            <stop offset=".85" stopColor="#8cc63f" stopOpacity=".28" />
            <stop offset="1" stopColor="#8cc63f" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Quiet construction lines give the drawing a botanical plate character. */}
        <g className={styles.blueprint} stroke="#123b25" strokeOpacity=".13" strokeWidth=".8">
          <path d="M66 440h404M87 446v-12M459 446v-12" />
          <path d="M102 357V168m-5 0h10m-10 189h10" />
          <path d="M327 123a126 126 0 0 1 127 127" strokeDasharray="2 7" />
          <circle cx="398" cy="205" r="66" strokeDasharray="1 6" />
        </g>
        <ellipse cx="269" cy="442" rx="164" ry="9" fill="#123b25" fillOpacity=".045" />

        {/* Curved cast arm, with the open space and mechanical stage kept distinct. */}
        <g
          className={styles.microscope}
          stroke="#123b25"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            pathLength="1"
            d="M219 397c54-18 91-73 91-132 0-32-14-57-44-65l-13 19c22 9 32 26 32 49 0 42-29 80-65 96l-1 33Z"
            fill={`url(#${metal})`}
          />
          <path
            pathLength="1"
            d="M239 371c37-24 58-63 58-104 0-21-6-37-18-49"
            strokeOpacity=".25"
            strokeWidth=".8"
          />
          <path pathLength="1" d="M203 304h24v84h-24z" fill={`url(#${metal})`} />
          <path pathLength="1" d="M211 308v74" strokeWidth=".7" strokeOpacity=".35" />

          <g className={styles.optics}>
            <g transform="rotate(-24 211 158)">
              <rect pathLength="1" x="191" y="86" width="40" height="12" rx="3" fill="#123b25" />
              <path pathLength="1" d="M197 98h28v82h-28z" fill={`url(#${metal})`} />
              <path pathLength="1" d="M203 104v68" strokeWidth=".8" strokeOpacity=".35" />
              <rect pathLength="1" x="190" y="180" width="42" height="12" rx="3" fill="#e4ebd4" />
              <path
                pathLength="1"
                d="m197 192-7 25 10 3 9-26m7-2 2 34h11l-2-34m4 0 11 21 8-5-10-20"
                fill="#edf0e2"
              />
              <path pathLength="1" d="m191 211 11 4m16 3h11m10-11 9-5" strokeWidth="3" />
              <path pathLength="1" d="M193 92h36" stroke="#8cc63f" strokeWidth="2" />
            </g>
          </g>

          <path pathLength="1" d="M143 286h144v12H143z" fill="#e7edda" />
          <path pathLength="1" d="M149 298h132" strokeOpacity=".3" />
          <path pathLength="1" d="M173 281h80v5h-80z" fill="#fffdf5" strokeWidth="1" />
          <path pathLength="1" d="M183 278v8m58-8v8" strokeWidth="1" />
          <ellipse pathLength="1" cx="217" cy="282" rx="10" ry="2" fill="#8cc63f" stroke="none" />
          <path
            pathLength="1"
            className={styles.focusBeam}
            d="m211 257-10 21h31l-10-21Z"
            fill="#8cc63f"
            fillOpacity=".18"
            stroke="none"
          />
          <path
            pathLength="1"
            className={styles.focusLight}
            d="M215 263v12"
            stroke="#8cc63f"
            strokeDasharray="2 4"
            strokeWidth="1"
          />
          <path pathLength="1" d="M202 309h26l-5 14h-16l-5-14Z" fill="#e4ebd4" />
          <path pathLength="1" d="M204 324h23m-19 5h14" strokeWidth="1" />

          <g className={styles.focusDial}>
            <circle pathLength="1" cx="291" cy="251" r="27" fill="#f7f5ea" />
            <circle pathLength="1" cx="291" cy="251" r="21" strokeWidth=".7" strokeOpacity=".4" />
            <circle pathLength="1" cx="291" cy="251" r="11" fill="#dce8c9" />
            <circle pathLength="1" cx="291" cy="251" r="3" fill="#123b25" stroke="none" />
            <path
              pathLength="1"
              d="M291 227v4m0 40v4m-24-24h4m40 0h4m-41-17 3 3m28 28 3 3m0-34-3 3m-28 28-3 3"
              strokeWidth=".8"
            />
            <path pathLength="1" d="M291 233v6" stroke="#8cc63f" strokeWidth="2.5" />
          </g>
          <circle pathLength="1" cx="282" cy="298" r="9" fill="#e5ecd7" />
          <circle pathLength="1" cx="282" cy="298" r="3" strokeWidth=".8" />

          <path
            pathLength="1"
            d="M158 403c7-13 26-20 58-20 30 0 50 7 58 20l17 20H141l17-20Z"
            fill={`url(#${metal})`}
          />
          <path pathLength="1" d="M143 423h148v9H143z" fill="#d8e3c5" />
          <path pathLength="1" d="M164 402h106m-113 13h121" strokeWidth=".7" strokeOpacity=".3" />
          <path pathLength="1" d="M158 433v4h18v-4m80 0v4h18v-4" strokeWidth="1.2" />
        </g>

        {/* Apple specimen, with fine contour hatching rather than a stock icon. */}
        <g className={styles.apple} stroke="#123b25" strokeLinecap="round" strokeLinejoin="round">
          <path
            pathLength="1"
            d="M380 330c-20-20-49-10-57 15-12 33 8 70 33 77 11 3 17-5 25-4 10 0 16 7 27 1 25-13 40-50 25-76-11-22-36-27-53-13Z"
            fill={`url(#${fruit})`}
            strokeWidth="1.6"
          />
          <path pathLength="1" d="M380 330c-5-15-2-29 8-39" strokeWidth="2.4" />
          <path
            pathLength="1"
            d="M384 310c7-20 26-27 43-22-4 20-23 30-43 22Z"
            fill="#8cc63f"
            strokeWidth="1.2"
          />
          <path
            pathLength="1"
            d="m386 309 30-15m-19 10 2-10m6 7 9 2"
            strokeWidth=".7"
            strokeOpacity=".6"
          />
          <path
            pathLength="1"
            d="M342 342c-11 21-8 45 9 62m-3-59c-10 23-6 43 6 55m56-59c13 21 9 45-5 62m-2-57c9 19 7 36-2 48"
            strokeOpacity=".25"
            strokeWidth=".75"
          />
          <path pathLength="1" d="M368 334c8 4 16 4 24 0" strokeWidth=".8" strokeOpacity=".6" />
          <g clipPath={`url(#${specimen})`} stroke="none">
            <g className={styles.specimenScan}>
              <rect pathLength="1" x="316" y="311" width="128" height="25" fill={`url(#${scan})`} />
              <path
                pathLength="1"
                d="M316 334h128"
                stroke="#8cc63f"
                strokeOpacity=".65"
                strokeWidth="1"
              />
            </g>
          </g>
          <path
            className={styles.ink}
            pathLength="1"
            d="M379 347c-4 14-5 33 1 48m-8-28c-10 2-11 12-3 16 7-2 9-12 3-16Zm16 4c9 2 10 10 3 15-6-2-8-11-3-15Z"
            strokeWidth=".8"
            strokeOpacity=".55"
          />
        </g>

        {/* Magnified cells connect the specimen to the instrument. */}
        <g stroke="#123b25" strokeLinecap="round" strokeLinejoin="round">
          <path
            className={styles.connector}
            pathLength="1"
            d="m394 318 4-57m-56-57h-36l-51 64"
            strokeDasharray="2 5"
            strokeWidth=".8"
            strokeOpacity=".3"
          />
          <circle
            className={styles.lensFrame}
            pathLength="1"
            cx="398"
            cy="205"
            r="52"
            fill="#f7f5ea"
            strokeWidth="1.1"
          />
          <circle
            className={styles.lensFrame}
            pathLength="1"
            cx="398"
            cy="205"
            r="47"
            strokeWidth=".7"
            strokeOpacity=".2"
          />
          <g className={styles.cells} strokeWidth=".9" strokeOpacity=".7">
            <path d="m377 172 19-4 12 16-8 20-23 2-11-16 11-18Z" fill="#e8efda" />
            <path d="m408 184 20-2 13 18-8 20-20 1-13-17 8-20Z" />
            <path d="m377 206 23-2 13 17-9 20-22-1-13-16 8-18Z" fill="#edf2e2" />
            <path d="m366 190-13 7m16 27-12 2m47 15 6 8" />
            <circle
              className={styles.nucleus}
              cx="387"
              cy="187"
              r="3"
              fill="#8cc63f"
              stroke="none"
            />
            <circle
              className={styles.nucleus}
              cx="422"
              cy="203"
              r="3"
              fill="#8cc63f"
              stroke="none"
            />
            <circle
              className={styles.nucleus}
              cx="390"
              cy="224"
              r="3"
              fill="#8cc63f"
              stroke="none"
            />
          </g>
          <path d="M393 140v-9m5 9v-5m59 69h9m-9 5h5" strokeWidth=".7" strokeOpacity=".35" />
        </g>
      </svg>
    </div>
  );
}
