/** Decorative orchard linework; intentionally silent and outside the interaction layer. */
export function AssistantBackdrop({ header = false }: { header?: boolean }) {
  return header ? (
    <svg
      className="orchard-header-sketch"
      viewBox="0 0 300 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M67 109C106 86 139 62 178 40S250 14 306 3M139 63c8-23 24-39 47-44-2 22-18 39-47 44Zm35-21c26 8 49 4 65-13-26-7-47-2-65 13ZM210 24c7-20 20-31 41-34-5 19-20 31-41 34Z" />
      <path d="m147 56 25-25m16 9 35-8m-64 20c4 12 6 23 4 33m0-18c-12-8-24-5-29 8-5 16 10 31 21 27 8 5 23-1 25-14 2-13-4-22-17-21Zm0-5c5-9 12-13 23-10-5 9-13 13-23 10Z" />
      <path d="M15 89c45-4 67-19 96-22M222 87c27-8 51-9 81-5M235 94c25-5 47-5 67-2" opacity=".6" />
    </svg>
  ) : (
    <svg
      className="orchard-body-sketch"
      viewBox="0 0 340 390"
      fill="none"
      aria-hidden="true"
      focusable="false"
      stroke="currentColor"
      strokeWidth="0.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M344 6c-38 20-67 49-80 87s-17 74-42 110M285 55c-21-7-35-23-36-45 24 8 37 23 36 45Zm-17 30c24 0 45-12 54-35-24 1-44 13-54 35ZM256 125c-22-4-39-18-45-42 25 3 40 19 45 42Z" />
      <path d="m279 45-18-23m17 55 31-19m-61 56-24-19m35 19c10 4 18 12 23 23m-7-6c-17-6-28 3-29 19-2 21 15 41 29 35 16 7 34-15 31-34-2-18-16-26-31-20Zm2-7c4-11 13-16 26-13-6 10-14 14-26 13Zm-20 24c-3 10 0 20 6 25" />
      <path d="M13 287c20-15 32-31 47-48l12 8 22-27 16 9 34-49 11 14 9 27 13 8 17 28 20-20 10 11 15-7 19 26 18 9 20 21 37 15M110 229l19-9 15-40m1 22-7 24-15 15-8 25m43-62-4 30 13 24m-96-11-7 16-17 10m153-10 14 19 17 7" />
      <path d="M-9 318c41-14 65-8 96-21s47-19 72-7 39 16 70 10 66 1 119 22M-10 336c52-19 72-9 106-22s48-16 74-4 53 9 77 7 63 6 96 20M31 351c43-9 68-3 96-12s46-7 73 0 59 6 91 17M74 367c40-5 60-4 89-1s58 9 84 8" />
    </svg>
  );
}
