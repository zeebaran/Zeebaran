import styles from "./team-illustration.module.css";

/** Original, code-native line sketch: colleagues planning an orchard together. */
export function TeamIllustration() {
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 380 350"
      fill="none"
      stroke="#242424"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Central colleague and two collaborators, sketched without facial caricature. */}
      <path
        className={styles.lead}
        pathLength="1"
        d="M161 91c-2-18 7-32 25-34 20-2 33 10 33 28m-57-7c9 1 13-5 17-10 8 10 21 14 39 12m-54 6c-3 22 6 39 23 39 17 0 28-18 29-39m-44 35-1 15-24 11m56-27 1 16 25 11m-58-11 16 17 17-17m-47 10c-12 10-17 24-19 43m91-43c14 10 20 26 22 43"
      />
      <path
        className={styles.left}
        pathLength="1"
        d="M59 153c-5-11-2-30 9-37 13-8 32-7 40 6 4 7 3 16 1 24m-48-7c8 0 13-6 17-12 8 7 17 10 31 9m-47 10c0 18 9 31 23 31 14 0 23-15 23-32m-36 28-1 14-22 12m48-27 1 15 23 13m-50-12 13 13 14-14m-49 12c-15 11-19 28-20 48l14 37m83-76 15 26m-82-6 5 27 33 16m20-36 20 19 35 4"
      />
      <path
        className={styles.right}
        pathLength="1"
        d="M278 147c-3-16 3-31 18-35 16-5 31 3 34 17l-1 18m-48-12c7 0 14-6 19-12 7 8 14 11 29 12m-47 11c0 18 9 31 23 31 15 0 24-15 24-32m-38 28-1 14-23 12m49-26 1 14 22 12m-48-11 13 14 13-14m22 11c15 13 18 30 19 49l-14 36m-79-85-16 26m80-6-4 27-35 17m-17-37-20 19-34 5"
      />
      {/* Hands join the work surface, with a shared orchard plan between them. */}
      <path
        className={styles.hands}
        pathLength="1"
        d="m141 225 15-3 13 4 9-1 6 5-4 5-16 1-17-3m92-8-15-2-14 4-9-1-7 5 5 5 16 1 17-3"
        strokeWidth="1"
      />
      <path
        className={styles.table}
        pathLength="1"
        d="M39 245 120 209l142 1 80 36-81 49-139-1-83-49Zm0 0v8l83 49 139 1 81-49v-8m-220 48v40m139-39v39m-213-75-6 58m291-59 6 59"
      />
      <path
        className={styles.plan}
        pathLength="1"
        d="m128 233 87-1 47 23-88 4-46-26Zm13 3 34 19m-19-21 33 20m-17-20 32 19m-17-19 31 18m-39-9 54-2m-39 11 55-3"
        strokeWidth=".65"
      />
      {/* Small sapling: the common purpose at the centre of the table. */}
      <path
        className={styles.sapling}
        pathLength="1"
        d="M179 201h24l-4 19h-16l-4-19Zm11 0v-27m0 15c-13-1-18-8-18-17 12 0 19 6 18 17Zm1-7c1-13 8-21 20-22 0 13-7 22-20 22Z"
      />
      <path
        className={styles.detail}
        pathLength="1"
        d="m189 185-10-9m15-1 11-10m-23 40h18m-6 34 4 2m42-3 12 6m-114 21 23 12m101-10 18-10M70 326q118 8 239 0"
        strokeWidth=".6"
        strokeOpacity=".55"
      />
      <path
        className={styles.clothing}
        pathLength="1"
        d="m152 148 6 34m70-34-5 33m-47-22v21m25-20v20m-37-89 3 13m46-14-3 14"
        strokeWidth=".65"
      />
    </svg>
  );
}
