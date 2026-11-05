import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Botanical } from "./botanical";
import type { ReactNode } from "react";
export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}>
      <span aria-hidden="true" />
      {children}
    </p>
  );
}
export function ButtonLink({
  href,
  children,
  secondary = false,
  light = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`button ${secondary ? "button-secondary" : ""} ${light ? "button-light" : ""}`}
    >
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}
export function PageIntro({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <section className="page-intro shell">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="intro-heading">
        <h1>
          {title}
          {accent ? (
            <>
              <br />
              <em>{accent}</em>
            </>
          ) : null}
        </h1>
        <div className="intro-description">{children}</div>
      </div>
    </section>
  );
}
export function Photo({
  src,
  alt,
  className = "",
  sizes = "(max-width: 767px) 100vw, 50vw",
  priority = false,
  position,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  position?: string;
}) {
  return (
    <div className={`photo ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={priority}
        fetchPriority={priority ? "high" : undefined}
        quality={60}
        style={{ objectFit: "cover", objectPosition: position || "center" }}
      />
    </div>
  );
}
export function EnquiryBanner({
  title = "Let’s grow something",
  accent = "worth tending.",
  description = "A few details about your land or the trees you have in mind are a good place to start.",
}: {
  title?: string;
  accent?: string;
  description?: string;
}) {
  return (
    <section className="enquiry-banner">
      <Botanical className="enquiry-botanical" />
      <div className="shell enquiry-inner">
        <div>
          <Eyebrow light>Your next growing season</Eyebrow>
          <h2>
            {title}
            <br />
            <em>{accent}</em>
          </h2>
        </div>
        <div>
          <p>{description}</p>
          <ButtonLink href="/contact" light>
            Start a conversation
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb shell">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
