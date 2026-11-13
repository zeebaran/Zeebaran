"use client";
import NextLink from "next/link";
import { ImagePlus } from "lucide-react";
import styles from "./removed-image.module.css";
import type { ComponentProps } from "react";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  Children,
  isValidElement,
} from "react";
import { type ImageProps } from "next/image";
import { AssetImage } from "@/features/media/AssetImage";
import { authoredAsset, imageSource, imageDelivery } from "@/features/media/delivery";
import { emptyContent, imageKey, textKey, type ContentValue } from "./model";
import { regionalHubs } from "@/features/contact/hubs-content";
import { partnerEntries } from "./partners";
import { missionSections } from "./mission-content";
import { useVisualContent, useVisualEditing } from "./visual-context";
import { emptyPodcast } from "@/features/podcast/model";
export function usePodcast() {
  return useContext(ContentContext).value.podcast || emptyPodcast();
}
export function useRegionalHubs() {
  return regionalHubs(useContext(ContentContext).value);
}
export function useTeamEntries() {
  return useContext(ContentContext).value.team;
}
export function usePartners() {
  return partnerEntries(useContext(ContentContext).value);
}
export function useMissionSections() {
  return missionSections(useContext(ContentContext).value);
}
const ContentContext = createContext<{ value: ContentValue; page: string }>({
  value: emptyContent(),
  page: "",
});
export function ContentProvider({
  value,
  page,
  children,
}: {
  value: ContentValue;
  page: string;
  children: ReactNode;
}) {
  const overrides = useVisualContent();
  const resolved = overrides?.[page] || value;
  const context = useMemo(() => ({ value: resolved, page }), [resolved, page]);
  return <ContentContext.Provider value={context}>{children}</ContentContext.Provider>;
}
export function useContentPage() {
  return useContext(ContentContext).page;
}
export function useContentString(fallback: string) {
  return useContext(ContentContext).value.text[textKey(fallback)] ?? fallback;
}
export function useContentStrings() {
  const { value } = useContext(ContentContext);
  return (fallback: string) => value.text[textKey(fallback)] ?? fallback;
}
export function ContentMailLink({ href, ...props }: React.ComponentProps<"a">) {
  const copy = useContentStrings();
  let destination = href;
  if (href?.startsWith("mailto:")) {
    const split = href.indexOf("?"),
      address = href.slice(7, split < 0 ? undefined : split),
      resolved = copy(address);
    if (resolved !== address)
      destination =
        "mailto:" +
        encodeURIComponent(resolved).replace(/%40/g, "@") +
        (split < 0 ? "" : href.slice(split));
  }
  return <a {...props} href={destination} />;
}
export function useCardVideo(id: string) {
  const { page, value } = useContext(ContentContext);
  return page === "mission" ? value.videos?.[id] : undefined;
}
export function ContentText({ children }: { children?: ReactNode }) {
  const { value: content, page } = useContext(ContentContext);
  if (typeof children !== "string" && typeof children !== "number") return children;
  const fallback = String(children);
  if (!fallback.trim()) return children;
  const key = textKey(fallback),
    value = content.text[key] ?? fallback;
  return (
    <span
      className="contents"
      data-cms-page={page}
      data-cms-field={key}
      data-cms-default={fallback}
      data-cms-numeric={typeof children === "number" || undefined}
    >
      {value}
    </span>
  );
}
export function ContentSvgText({ children, ...props }: React.SVGProps<SVGTextElement>) {
  const fallback =
      typeof children === "string" || typeof children === "number" ? String(children) : "",
    page = useContentPage(),
    value = useContentString(fallback);
  return (
    <text
      {...props}
      data-cms-page={page}
      data-cms-field={fallback ? textKey(fallback) : undefined}
      data-cms-default={fallback || undefined}
    >
      {fallback ? value : children}
    </text>
  );
}
export function useContentImageOverrides() {
  return useContext(ContentContext).value.images;
}
/** A placement control in the editor only; intentional removals stay invisible publicly. */
export function RemovedContentImage({
  source,
  alt = "",
  className = "",
  style,
  fill,
  width,
  height,
}: {
  source: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
  width?: number | string;
  height?: number | string;
}) {
  const editing = useVisualEditing();
  const page = useContentPage();
  if (!editing) return null;
  return (
    <span
      className={`${styles.placeholder} ${className}`}
      style={{
        ...style,
        ...(fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
          : {
              aspectRatio:
                Number(width) > 0 && Number(height) > 0
                  ? `${Number(width)} / ${Number(height)}`
                  : "4 / 3",
            }),
      }}
      role="button"
      tabIndex={0}
      aria-label={`Add or restore image${alt ? `: ${alt}` : ""}`}
      data-cms-page={page}
      data-cms-image={imageKey(source)}
      data-cms-source={source}
      data-cms-alt={alt}
      data-cms-image-removed="true"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    >
      <span className={styles.content}>
        <ImagePlus size={24} strokeWidth={1.4} aria-hidden="true" />
        <span>Add or restore image</span>
      </span>
    </span>
  );
}
export function useContentImage(src: string, alt = "") {
  const override = useContentImageOverrides()[imageKey(src)];
  const value = override === null ? { src: "", alt: "" } : (override ?? { src, alt });
  return {
    ...authoredAsset(value.src),
    ...value,
    src: imageSource(value.src),
    removed: override === null,
  };
}
export function ContentImage(props: ImageProps) {
  const source = typeof props.src === "string" ? props.src : "";
  const media = useContentImage(source, props.alt);
  const page = useContentPage();
  if (media.removed)
    return (
      <RemovedContentImage
        source={source}
        alt={props.alt}
        className={props.className}
        style={props.style}
        fill={props.fill}
        width={props.width}
        height={props.height}
      />
    );
  return (
    <AssetImage
      {...props}
      src={media.src}
      alt={props.alt === "" ? "" : media.alt || props.alt}
      data-cms-page={page}
      data-cms-image={source ? imageKey(source) : undefined}
      data-cms-source={source || undefined}
      data-cms-alt={props.alt}
    />
  );
}
export function ContentPicture({ source, children }: { source: string; children: ReactNode }) {
  const override = useContentImageOverrides()[imageKey(source)];
  if (override === null) return <RemovedContentImage source={source} fill />;
  const changed = !!override && imageSource(override.src) !== imageSource(source);
  return (
    <picture className="absolute inset-0">
      {Children.map(children, (child) =>
        changed && isValidElement(child) && child.type === "source" ? null : child,
      )}
    </picture>
  );
}
export function ContentPreload(props: React.ComponentProps<"link">) {
  const media = useContentImage("asset:banners/home/home-desktop-2400x1140-new-webp");
  const original = imageSource("asset:banners/home/home-desktop-2400x1140-new-webp");
  const small = media.src === original ? "asset:banners/home/hero-mobile-480-avif" : media.src;
  const large = media.src === original ? "asset:banners/home/hero-mobile-720-avif" : media.src;
  return media.src ? (
    <link
      {...props}
      type={undefined}
      imageSrcSet={imageDelivery(small, 480) + " 480w, " + imageDelivery(large, 720) + " 720w"}
    />
  ) : null;
}
export function ContentRawImage(props: React.ComponentProps<"img">) {
  const source = typeof props.src === "string" ? props.src : "";
  const asset = authoredAsset(source);
  // Native placements keep their dimensions, but share the CDN and failure policy.
  return (
    <ContentImage
      {...props}
      src={source}
      alt={props.alt || ""}
      width={Number(props.width) || asset?.width || 960}
      height={Number(props.height) || asset?.height || 640}
    />
  );
}

/** Public links keep normal prefetching; the editor canvas never speculates into other pages. */
export function ContentLink(props: ComponentProps<typeof NextLink>) {
  const preview = useVisualContent();
  return <NextLink {...props} prefetch={preview ? false : props.prefetch} />;
}
