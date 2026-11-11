import { useId } from "react";
import styles from "./platform-illustration.module.css";

/** Original pen drawing of the connected orchard, harvest, and storage system. */
export function PlatformIllustration() {
  const connectionMask = useId().replace(/:/g, "") + "-connection";
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 400 420"
      fill="none"
      stroke="#171717"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask
          id={connectionMask}
          maskUnits="userSpaceOnUse"
          x="190"
          y="220"
          width="125"
          height="140"
        >
          <path
            className={styles.connectionTrace}
            pathLength="1"
            d="M224 230c43 0 83-7 83 26v9m-46 64c-18 16-43 23-65 21"
            stroke="white"
            strokeWidth="4"
          />
        </mask>
      </defs>
      {/* A trained fruit tree, with an open canopy and visible root system. */}
      <path
        className={styles.trunk}
        pathLength="1"
        d="M130 295c4-34 6-69 3-98l-13-31m13 47 21-37m-20 64-29-27m31 13 28-12m-33-16-20-14m22 1 10-36"
        strokeWidth="2"
      />
      <path
        className={styles.trunk}
        pathLength="1"
        d="M137 295c5-32 7-63 4-86m-4 50 30-23m-31 14-30-21"
        strokeWidth="1.2"
      />
      <path
        className={styles.canopy}
        pathLength="1"
        d="M119 232c-19 7-38-5-38-22-21 0-32-18-24-34-14-13-8-35 9-39-2-22 16-34 33-29 6-23 30-29 46-15 17-15 41-5 42 13 23-1 35 18 28 36 21 9 20 33 4 44 6 22-10 39-31 35-10 19-28 23-44 14"
        strokeWidth="1.6"
      />
      <path
        className={styles.detail}
        pathLength="1"
        d="M69 148q-5 14 3 24m18-49q13-8 24-2m42-13q17-5 25 7m22 34q10 11 3 21m-34 48q-7 9-18 7"
        strokeWidth=".7"
      />
      <path
        className={styles.fruit}
        pathLength="1"
        d="M98 156c-8-8-18-1-16 8 1 9 6 15 12 12 5 3 11-3 13-11 2-7-2-12-9-9Zm-1-1 3-7m-2 2q7-8 12-3-3 7-12 3"
        strokeWidth="1"
      />
      <path
        className={styles.fruit}
        pathLength="1"
        d="M164 145c-8-8-18-1-16 8 1 9 6 15 12 12 5 3 11-3 13-11 2-7-2-12-9-9Zm-1-1 3-7m-1 2q7-8 12-3-3 7-12 3"
        strokeWidth="1"
      />
      <path
        className={styles.fruit}
        pathLength="1"
        d="M176 196c-8-8-18-1-16 8 1 9 6 15 12 12 5 3 11-3 13-11 2-7-2-12-9-9Zm-1-1 3-7"
        strokeWidth="1"
      />
      <path
        className={styles.fruit}
        pathLength="1"
        d="M111 137q-13-8-22 1 9 10 22-1Zm32 32q10-12 21-7-3 12-21 7Zm-44 51q-13-8-22 1 9 10 22-1Z"
        strokeWidth=".8"
      />
      <path
        className={styles.ground}
        pathLength="1"
        d="M60 289h153m-145 5h135m-83 1-9 15-14 5m31-20-1 22-11 15m19-32 13 15 17 6m-27-8 1 22m-21-17-17 10m51-14 10 17"
        strokeWidth=".9"
      />
      <path
        className={styles.ground}
        pathLength="1"
        d="m78 300 8 2m-13 7 7 1m99-8 8-1m-8 9 9-2m-67 35h33"
        strokeWidth=".6"
      />
      {/* Light trellis wires make this an orchard rather than a generic tree. */}
      <path
        className={styles.trellis}
        pathLength="1"
        d="M51 283V185m171 98v-98M51 202h31m103 0h37M51 258h171"
        strokeWidth=".7"
      />

      {/* A small storage house and a ventilated harvest crate. */}
      <path
        className={styles.storage}
        pathLength="1"
        d="m259 143 47-28 48 28v70h-95v-70Zm0 0h95m-103-3 55-33 56 33m-93 5v62h75"
        strokeWidth="1.3"
      />
      <path
        className={styles.storage}
        pathLength="1"
        d="M278 213v-46h56v46m-51-38h46m-46 8h46m-46 8h46m-46 8h46m-20-78 4 6-4 7-4-7 4-6Z"
        strokeWidth=".8"
      />
      <path
        className={styles.crate}
        pathLength="1"
        d="m267 291 64 6 28-18-64-6-28 18Zm0 0v52l64 6 28-18v-52m-28 18v52"
        strokeWidth="1.4"
      />
      <path
        className={styles.crate}
        pathLength="1"
        d="m272 306 54 5m-54 10 54 5m-54 10 54 5m10-31 18-12m-18 27 18-12m-18 27 18-12"
        strokeWidth=".85"
      />
      <path
        className={styles.harvest}
        pathLength="1"
        d="M281 285c-5-11 5-18 12-11 6-6 15-1 13 8m6 5c-3-10 5-17 12-11 7-5 13 0 11 8m-42-10 1-6m29 8 2-6"
        strokeWidth=".9"
      />
      <path
        className={styles.crate}
        pathLength="1"
        d="m281 302 5 1m33 3 5 1m-43 27 5 1m33 3 5 1"
        strokeWidth="1.1"
      />
      {/* One continuous connection joins the stages without adding interface labels. */}
      <path
        className={styles.connections}
        mask={`url(#${connectionMask})`}
        d="M224 230c43 0 83-7 83 26v9m-46 64c-18 16-43 23-65 21"
        strokeWidth=".85"
        strokeDasharray="2 5"
      />
      <path
        className={styles.connections}
        d="m302 261 5 5 5-5m-111 84-6 5 6 5M247 358q57 3 119-2"
        strokeWidth=".75"
      />
    </svg>
  );
}
