"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";

/** CMS snapshots revalidate on entry; other private routes remain freshly loaded. */
export function AdminLink({
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onTouchStart,
  ...props
}: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const canWarm = typeof props.href === "string" && props.href.startsWith("/admin/pages/");
  return (
    <Link
      {...props}
      prefetch={canWarm && intent ? true : false}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setIntent(true), 120);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        clearTimeout(timer.current);
        setIntent(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        setIntent(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setIntent(false);
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        setIntent(true);
      }}
    />
  );
}
