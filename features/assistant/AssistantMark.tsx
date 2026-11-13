/** A conversation bubble with a single orchard leaf, drawn in the brand's line style. */
export function AssistantMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        className="orchard-mark-bubble"
        pathLength={1}
        d="M12 29l-5 4V15a9 9 0 0 1 9-9h9a9 9 0 0 1 9 9v6a9 9 0 0 1-9 9H12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        className="orchard-mark-leaf"
        pathLength={1}
        d="M17 24c0-8 3-12 10-12 0 7-3 11-10 11m0 1 6-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
