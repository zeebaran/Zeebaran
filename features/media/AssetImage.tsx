"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { authoredAsset, imageSource, cloudinaryLoader } from "./delivery";
import { ImagePlaceholder } from "./ImagePlaceholder";

/** One delivery and error policy for public photographs, catalog media and admin thumbnails. */
export function AssetImage({ src, onError, onLoad, ...props }: ImageProps) {
  const source = typeof src === "string" ? src : "",
    resolved = imageSource(source),
    asset = authoredAsset(source);
  const [failed, setFailed] = useState(""),
    [loaded, setLoaded] = useState("");
  const attrs = Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith("data-")),
  );
  const width = props.width || asset?.width || 960,
    height = props.height || asset?.height || 640;
  if (!resolved || failed === resolved)
    return (
      <ImagePlaceholder
        {...attrs}
        alt={props.alt}
        className={props.className}
        style={props.style}
        fill={props.fill}
        width={width}
        height={height}
        state={resolved ? "error" : "missing"}
      />
    );
  return (
    <>
      {props.fill && loaded !== resolved && <ImagePlaceholder fill state="loading" />}
      <Image
        {...props}
        alt={props.alt}
        src={resolved}
        {...(!props.fill ? { width, height } : {})}
        loader={cloudinaryLoader}
        unoptimized={false}
        onLoad={(event) => {
          setLoaded(resolved);
          onLoad?.(event);
        }}
        onError={(event) => {
          setFailed(resolved);
          onError?.(event);
        }}
      />
    </>
  );
}
