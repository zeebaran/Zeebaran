"use client";
import type { ComponentProps } from "react";
import { AssetImage } from "./AssetImage";
import { authoredAsset } from "./delivery";
/** Admin CSS continues to control the original thumbnail frame. */
export function MediaThumbnail({
  src = "",
  alt = "",
  width,
  height,
  ...props
}: ComponentProps<"img">) {
  const source = typeof src === "string" ? src : "",
    asset = authoredAsset(source);
  return (
    <AssetImage
      {...props}
      src={source}
      alt={alt}
      width={Number(width) || asset?.width || 640}
      height={Number(height) || asset?.height || 480}
      sizes={props.sizes || "(max-width:640px) 90vw, 480px"}
    />
  );
}
