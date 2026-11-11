"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { ComparisonProvider } from "@/features/catalog/ComparisonProvider";
import { Footer } from "./Footer";
export function SiteFrame({ children }: { children: React.ReactNode }) {
  const admin = /^\/admin(?:\/|$)/.test(usePathname());
  if (admin) return children;
  return (
    <ComparisonProvider>
      <Nav />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </ComparisonProvider>
  );
}
