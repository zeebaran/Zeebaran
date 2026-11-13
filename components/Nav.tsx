"use client";

import { ContentText } from "@/features/cms/Content";

import { ContentLink as Link } from "@/features/cms/Content";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { NAV, ABOUT_LINKS } from "@/lib/site";
import styles from "./nav-about.module.css";
import { ease } from "./Motion";

const mobileLinks = [...NAV, ...ABOUT_LINKS];
const contactButton =
  "action-motion btn-orange rounded-full bg-orange font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#e05d00] hover:shadow";

export function Nav({ pathOverride }: { pathOverride?: string } = {}) {
  const reduce = useReducedMotion();
  const currentPath = usePathname();
  const path = pathOverride || currentPath;
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === path;
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [aboutAt, setAboutAt] = useState<string | null>(null);
  const [hoveredAt, setHoveredAt] = useState<string | null>(null);
  const desktopAbout = useRef<HTMLLIElement>(null);
  const desktopToggle = useRef<HTMLButtonElement>(null);
  const desktopAboutOpen = aboutAt === path || hoveredAt === path;
  const closeMobile = () => setOpenAt(null);
  const closeAbout = () => {
    setAboutAt(null);
    setHoveredAt(null);
  };
  const active = (href: string) => path === href || path.startsWith(href + "/");

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () =>
      Array.from(menu.current?.querySelectorAll<HTMLAnchorElement>("a[href]") || []);
    const frame = requestAnimationFrame(() => controls()[0]?.focus({ preventScroll: true }));
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobile();
        toggle.current?.focus({ preventScroll: true });
      }
      if (e.key !== "Tab") return;
      const items = [toggle.current, ...controls()].filter((x) => x !== null);
      const i = items.findIndex((el) => el === document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items.at(-1)?.focus();
      } else if (!e.shiftKey && (i < 0 || i === items.length - 1)) {
        e.preventDefault();
        items[0]?.focus();
      }
    };
    const wide = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      if (wide.matches) closeMobile();
    };
    const outside = (e: PointerEvent) => {
      if (
        e.target instanceof Node &&
        !menu.current?.contains(e.target) &&
        !toggle.current?.contains(e.target)
      )
        closeMobile();
    };
    window.addEventListener("keydown", esc);
    wide.addEventListener("change", resize);
    document.addEventListener("pointerdown", outside);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = original;
      window.removeEventListener("keydown", esc);
      wide.removeEventListener("change", resize);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  useEffect(() => {
    if (!desktopAboutOpen) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !desktopAbout.current?.contains(e.target)) closeAbout();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closeAbout();
      if (desktopAbout.current?.contains(document.activeElement)) {
        e.preventDefault();
        desktopToggle.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    wide.addEventListener("change", closeAbout);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      wide.removeEventListener("change", closeAbout);
    };
  }, [desktopAboutOpen]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        aria-label="Primary"
        className="relative mx-auto flex max-w-5xl items-center justify-between rounded-full border border-green/10 bg-white/95 px-6 py-2.5 shadow-lg backdrop-blur-md"
      >
        <span key={path} aria-hidden="true" className="nav-route-seam" />
        <Logo />
        <ul className="hidden items-center gap-6 text-[0.75rem] font-medium tracking-wide text-forest/80 lg:flex">
          {NAV.map((l) => (
            <li
              key={l.href}
              ref={l.href === "/about" ? desktopAbout : undefined}
              className={l.href === "/about" ? styles.parent : undefined}
              onBlur={
                l.href === "/about"
                  ? (e) => {
                      if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget))
                        setAboutAt(null);
                    }
                  : undefined
              }
              onPointerLeave={l.href === "/about" ? () => setHoveredAt(null) : undefined}
              onFocus={
                l.href === "/about"
                  ? (e) => {
                      if (e.target.closest("#about-navigation")) setAboutAt(path);
                    }
                  : undefined
              }
            >
              <Link
                href={l.href}
                prefetch={pathOverride ? false : undefined}
                aria-current={active(l.href) ? "page" : undefined}
                className={`field-nav-link relative transition-colors hover:text-green ${active(l.href) ? "text-green" : ""}`}
              >
                <ContentText>{l.label}</ContentText>
              </Link>
              {l.href === "/about" && (
                <>
                  <button
                    ref={desktopToggle}
                    type="button"
                    className={styles.toggle}
                    aria-label="About related pages"
                    aria-expanded={desktopAboutOpen}
                    aria-controls="about-navigation"
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setHoveredAt(path);
                    }}
                    onClick={(e) => {
                      e.currentTarget.focus({ preventScroll: true });
                      if (aboutAt === path) closeAbout();
                      else setAboutAt(path);
                    }}
                  >
                    <ChevronDown size={12} aria-hidden="true" />
                  </button>
                  <ul id="about-navigation" hidden={!desktopAboutOpen} className={styles.dropdown}>
                    {ABOUT_LINKS.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          prefetch={false}
                          aria-current={active(item.href) ? "page" : undefined}
                          onClick={closeAbout}
                        >
                          <ContentText>{item.label}</ContentText>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            prefetch={pathOverride ? false : undefined}
            className={`${contactButton} px-5 py-2 text-xs`}
          >
            <ContentText>Contact</ContentText>
          </Link>
          <button
            type="button"
            ref={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => (open ? closeMobile() : setOpenAt(path))}
            className="relative -mr-2 grid size-9 after:absolute after:-inset-1 place-items-center rounded-full text-forest transition hover:bg-cream lg:hidden"
          >
            <ContentText>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </ContentText>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            ref={menu}
            role="navigation"
            aria-label="Mobile navigation"
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0 round 1.75rem)" }}
            animate={{ clipPath: "inset(0 0 0% 0 round 1.75rem)" }}
            exit={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 100% 0 round 1.75rem)" }}
            transition={{ duration: reduce ? 0 : 0.32, ease }}
            className="fixed inset-x-4 top-[4.75rem] max-h-[calc(100dvh-5.75rem)] overflow-y-auto rounded-[1.75rem] border border-green/10 bg-white p-6 shadow-2xl sm:inset-x-6 lg:hidden"
          >
            <ul className="divide-y divide-line">
              {mobileLinks.map((l, i) => (
                <m.li
                  key={l.href}
                  initial={reduce ? false : { x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: reduce ? 0 : 0.025 + i * 0.018,
                    duration: 0.5,
                    ease,
                  }}
                >
                  <Link
                    href={l.href}
                    prefetch={pathOverride ? false : undefined}
                    onClick={closeMobile}
                    aria-current={active(l.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 text-[1rem] font-medium leading-none text-forest transition-colors hover:text-green"
                  >
                    <ContentText>{l.label}</ContentText>
                    <span
                      className={`size-2 rounded-full ${active(l.href) ? "bg-orange" : "bg-transparent"}`}
                    />
                  </Link>
                </m.li>
              ))}
            </ul>
            <Link
              href="/contact"
              prefetch={pathOverride ? false : undefined}
              onClick={closeMobile}
              aria-current={active("/contact") ? "page" : undefined}
              className={`${contactButton} mt-4 flex min-h-11 items-center justify-center px-5 py-3 text-sm`}
            >
              <ContentText>Contact</ContentText>
            </Link>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
