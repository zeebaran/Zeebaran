"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
/** Canvas uses public styling; management screens retain the editorial desk styling. */
export function AdminBoundary({ children }: { children: ReactNode }) {
  return usePathname().startsWith("/admin/canvas/") ? (
    children
  ) : (
    <div className="admin-root">{children}</div>
  );
}
