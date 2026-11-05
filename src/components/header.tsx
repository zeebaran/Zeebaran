"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight, Sprout } from "lucide-react";
import { navigation, site } from "@/lib/site";
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest(".site-header")
      )
        setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1101px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", resize);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);
  function active(href: string) {
    return (
      pathname === href ||
      (href === "/products" && pathname.startsWith("/apple-trees"))
    );
  }
  function close() {
    setOpen(false);
  }
  return (
    <>
      <div className="topline">
        <div className="shell">
          <span>Rooted in Kashmir. Growing with you.</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Link
            href="/"
            className="wordmark"
            aria-label="Zeebaran home"
            onClick={close}
          >
            <Sprout aria-hidden="true" strokeWidth={1.6} />
            <span>
              zeebaran<span className="brand-dot">.</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/contact" className="header-cta">
            Let’s talk <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <div
          ref={panel}
          id="mobile-navigation"
          className="mobile-navigation"
          hidden={!open}
        >
          <nav className="shell" aria-label="Mobile navigation">
            <Link href="/" onClick={close}>
              Home
            </Link>
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                aria-current={active(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/apple-trees" onClick={close}>
              Apple trees
            </Link>
            <Link href="/contact" onClick={close}>
              Contact us <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
