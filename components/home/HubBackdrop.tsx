/** An oversized botanical study, kept faint behind the field-layer content. */
export function HubBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 select-none overflow-hidden text-cream"
      aria-hidden="true"
    >
      <svg
        className="absolute -left-8 top-4 h-[680px] w-[420px] max-w-none opacity-[0.065] sm:-top-4 sm:left-[3%] sm:h-[820px] sm:w-[505px]"
        viewBox="0 0 320 520"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {/* Three softly shaped leaves on complete, flowing stems. */}
        <path d="M153 499c-38-66-48-135-25-207 16-51 48-99 70-151 9-21 15-40 19-58M160 496c-39-69-48-134-25-202 17-51 47-98 69-150 9-21 15-41 19-58M126 362c-10 40-22 76-40 109-3 6-8 4-5-3 19-37 33-79 43-118M153 211l-11-51m16 45-10-47" />
        <path d="M142 160c15-48 0-82-30-80-43 1-77 77-68 147 27-22 82-20 112-54 28-29 31-71 8-75-15-2-25 30-22 62Z" />
        <path d="M48 219c23-37 56-62 94-59m0 0c-22-22-44-23-63-10m63 10c-5 26-19 45-41 57m26-44c-12 1-25 8-34 18m31-13c-3 12-9 20-17 28m35-46c10-11 15-25 14-38" />
        <path d="M217 83c-32-6-36-38-10-54 30-19 70 7 89 39-23-15-45 41-79 15Z" />
        <path d="M217 83c26-9 47-19 75-16m-75 16c-13-10-18-21-13-34m34 27c9-14 21-20 36-21" />
        <path d="M166 268c-26-36-55-41-60-12-13 39 103 63 133 102 13-40 19-86-8-113-25-22-51-7-65 23Z" />
        <path d="M166 268c29 14 53 39 70 83m-70-83c-22-7-38-2-45 11m45-11c-8 22-3 38 13 51m-13-51c20-12 38-10 51 3m-30 13c20 0 33 9 40 22m-31-12c-2 16 3 29 12 41" />
      </svg>
    </div>
  );
}
