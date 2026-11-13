"use client";
import { useAdminFeedback } from "./notifications";
import { AdminSnackbar } from "./AdminSnackbar";
import { AdminLink as Link } from "@/features/admin/AdminLink";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Images,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Leaf,
  Settings,
} from "lucide-react";
import { contentPages } from "@/features/cms/model";
import { adminRequest } from "./client";
export function AdminShell({
  email,
  children,
  role = "admin",
}: {
  email: string;
  children: React.ReactNode;
  role?: "admin" | "editor";
}) {
  const router = useRouter();
  const search = useSearchParams();
  const path = usePathname(),
    [open, setOpen] = useState(false),
    [error, setError] = useAdminFeedback("error");
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  const isCurrent = (href: string) => {
    const [pathname, query] = href.split("?");
    if (path !== pathname) return false;
    if (!query) return true;
    const kind = search.get("kind") === "rootstock" ? "rootstock" : "variety";
    return new URLSearchParams(query).get("kind") === kind;
  };
  const link = (href: string, label: string, icon?: React.ReactNode) => (
    <Link
      key={href}
      prefetch={false}
      onClick={() => setOpen(false)}
      href={href}
      className={"admin-side-link " + (isCurrent(href) ? "is-active" : "")}
      aria-current={isCurrent(href) ? "page" : undefined}
    >
      {icon || <span className="admin-page-dot" />}
      <span>{label}</span>
      {isCurrent(href) && <ChevronRight size={14} />}
    </Link>
  );
  return (
    <div className="admin-workspace">
      <AdminSnackbar />
      <button
        className="admin-mobile-toggle"
        aria-label={open ? "Close administration menu" : "Open administration menu"}
        aria-expanded={open}
        aria-controls="admin-page-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <aside
        id="admin-page-navigation"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            document.querySelector<HTMLButtonElement>(".admin-mobile-toggle")?.focus();
          }
        }}
        className={"admin-sidebar " + (open ? "is-open" : "")}
      >
        <Link className="admin-wordmark" href="/admin">
          zeebaran<span>EDITORIAL DESK</span>
        </Link>
        <div className="admin-sidebar-body">
          {link("/admin", "Overview", <LayoutDashboard size={17} />)}
          {link("/admin/catalog?kind=variety", "Varieties & products", <Leaf size={17} />)}
          {link("/admin/catalog?kind=rootstock", "Rootstock selection", <Leaf size={17} />)}
          {link("/admin/media", "Media library", <Images size={17} />)}
          {role === "admin" && link("/admin/settings", "Contact & social", <Settings size={17} />)}
          <p className="admin-nav-label">
            THE WEBSITE <span>{contentPages.length}</span>
          </p>
          <nav aria-label="Administration pages">
            {contentPages
              .filter((p) => !p[0].startsWith("product-"))
              .map((p) => link("/admin/pages/" + p[0], p[1]))}
          </nav>
        </div>
        <div className="admin-sidebar-foot">
          <span className="admin-account-avatar">{email[0]?.toUpperCase()}</span>
          <div>
            <strong>{role === "admin" ? "Administrator" : "Editor"}</strong>
            <small>{email}</small>
          </div>
          <button
            title="Sign out"
            aria-label="Sign out"
            onClick={async () => {
              try {
                await adminRequest("/api/admin/session", undefined, "DELETE");
                router.replace("/admin/login");
                router.refresh();
              } catch {
                setError("Could not sign out. Please retry.");
              }
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
        {error && <p className="admin-error">{error}</p>}
      </aside>
      <main id="main" tabIndex={-1} className="admin-main">
        <header className="admin-topbar">
          <span>
            <Leaf size={14} /> ZEEBARAN / CONTENT & EXPERIENCE
          </span>
          <a href="/" target="_blank" rel="noreferrer">
            View website <ExternalLink size={14} />
          </a>
        </header>
        {children}
        <footer className="admin-desk-footer">
          <div>
            Born in Kashmir. Cultivated with care.
            <a
              className="admin-developer-credit"
              href="https://www.linkedin.com/in/naveedbhat085/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Designed &amp; Developed by Naveed Mohammad Bhat
            </a>
          </div>
          <span>Zeebaran editorial desk</span>
        </footer>
      </main>
    </div>
  );
}
