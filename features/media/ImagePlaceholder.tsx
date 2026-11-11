import type { CSSProperties } from "react";
/** No network, static files or synthetic scenery. Keeps the original image's footprint. */
export function ImagePlaceholder({
  alt = "",
  className = "",
  style,
  fill,
  width,
  height,
  state = "missing",
  ...attributes
}: {
  alt?: string;
  className?: string;
  style?: CSSProperties;
  fill?: boolean;
  width?: number | string;
  height?: number | string;
  state?: "loading" | "missing" | "error";
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...attributes}
      className={"media-placeholder " + className}
      data-media-placeholder={state}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      style={{
        ...(fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
          : {
              ...(width ? { maxWidth: width } : {}),
              aspectRatio:
                Number(width) > 0 && Number(height) > 0
                  ? `${Number(width)} / ${Number(height)}`
                  : "4/3",
            }),
        ...style,
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m3 17 5-5 4 4 3-3 6 6" />
      </svg>
    </span>
  );
}
