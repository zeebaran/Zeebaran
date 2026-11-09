"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/site";
import { ease } from "./Motion";

export function Nav() {
  const path = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === path;
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const active = (href: string) => path === href || path.startsWith(href + "/");

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const links = () =>
      Array.from(menu.current?.querySelectorAll<HTMLAnchorElement>("a[href]") || []);
    const frame = requestAnimationFrame(() => links()[0]?.focus({ preventScroll: true }));
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpenAt(null);
        toggle.current?.focus({ preventScroll: true });
      }
      if (e.key !== "Tab") return;
      const items = [toggle.current, ...links()].filter(
        (x): x is HTMLButtonElement | HTMLAnchorElement => x !== null,
      );
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
      if (wide.matches) setOpenAt(null);
    };
    const outside = (e: PointerEvent) => {
      if (
        e.target instanceof Node &&
        !menu.current?.contains(e.target) &&
        !toggle.current?.contains(e.target)
      )
        setOpenAt(null);
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

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-green/10 bg-white/95 px-6 py-2.5 shadow-lg backdrop-blur-md"
      >
        <Logo />
        <ul className="hidden items-center gap-6 text-[0.75rem] font-medium tracking-wide text-forest/80 lg:flex">
          {NAV.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`transition-colors hover:text-green ${active(l.href) ? "text-green" : ""}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="btn-orange rounded-full bg-orange px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#e05d00] hover:shadow"
          >
            Contact
          </Link>
          <button
            type="button"
            ref={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpenAt(open ? null : path)}
            className="relative -mr-2 grid size-9 after:absolute after:-inset-1 place-items-center rounded-full text-forest transition hover:bg-cream lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
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
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-x-4 top-[4.75rem] max-h-[calc(100dvh-5.75rem)] overflow-y-auto rounded-[1.75rem] border border-green/10 bg-white p-6 shadow-2xl sm:inset-x-6 lg:hidden"
          >
            <ul className="divide-y divide-line">
              {[...NAV, { href: "/contact", label: "Contact" } as const].map((l, i) => (
                <m.li
                  key={l.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.05 + i * 0.045,
                    duration: 0.5,
                    ease,
                  }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpenAt(null)}
                    aria-current={active(l.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 text-[1rem] font-medium leading-none text-forest transition-colors hover:text-green"
                  >
                    {l.label}
                    <span
                      className={`size-2 rounded-full ${active(l.href) ? "bg-orange" : "bg-transparent"}`}
                    />
                  </Link>
                </m.li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
