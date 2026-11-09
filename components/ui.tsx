import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "orange" | "light";
  className?: string;
  arrow?: "right" | "up";
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  arrow = "right",
}: BtnProps) {
  const base =
    "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.8125rem] font-semibold tracking-wide transition duration-300 ease-out active:scale-[0.98]";
  const v = {
    primary: "bg-green text-white hover:bg-forest",
    orange: "bg-orange text-white hover:bg-[#ff8230]",
    ghost:
      "border border-forest/25 text-forest hover:border-forest hover:bg-forest hover:text-white",
    light: "border border-white/40 text-white hover:bg-white hover:text-forest",
  }[variant];
  const Icon = arrow === "up" ? ArrowUpRight : ArrowRight;
  return (
    <Link href={href} className={`${base} ${v} ${className}`}>
      {children}
      <Icon
        aria-hidden
        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-small font-semibold text-green"
    >
      <span className="border-b border-green/40 pb-0.5 transition-colors group-hover:border-green">
        {children}
      </span>
      <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/** Large serif statement with a short rule above it. */
export function Statement({ lines, accent }: { lines: string; accent: string }) {
  return (
    <div className="section text-center">
      <div className="mx-auto mb-8 h-px w-14 bg-green/50" />
      <p className="mx-auto max-w-3xl px-6 font-serif text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-[1.15] tracking-[-0.01em] text-forest">
        {lines}
        <br />
        <em className="text-green">{accent}</em>
      </p>
    </div>
  );
}

/** Bordered card with a micro label and a dash-bulleted list. */
export function Checklist({
  label,
  items,
  bare = false,
}: {
  label?: string;
  items: readonly string[];
  bare?: boolean;
}) {
  return (
    <div className={bare ? "" : "card p-6 sm:p-8"}>
      {label && <span className="micro">{label}</span>}
      <ul className={label ? "mt-4" : "mt-2"}>
        {items.map((m) => (
          <li key={m} className="flex gap-3 border-t border-line py-3 text-small text-forest/85">
            <span className="mt-2.5 h-px w-3 shrink-0 bg-green" />
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
