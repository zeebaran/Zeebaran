import Link from "next/link";
import { Logo } from "./Logo";
import { FOOTER, SITE } from "@/lib/site";

function Col({
  title,
  links,
  span,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
  span: string;
}) {
  return (
    <div className={`space-y-3 ${span}`}>
      <h3 className="text-eyebrow font-bold uppercase tracking-[0.18em] !text-leaf">{title}</h3>
      <ul className="space-y-2 pt-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-small font-medium text-white/70 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="footer" className="border-t border-leaf/20 bg-forest pb-12 pt-16 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Logo light dot />
            <p className="max-w-sm text-small text-white/70">
              Zeebaran works in horticulture because strengthening the conditions around people is
              how capability grows: in individuals, institutions, and society.
            </p>
            <p className="pt-4 font-serif text-small italic text-leaf">
              &ldquo;The purpose was never the platform. It was always greater human
              capability.&rdquo;
            </p>
          </div>
          <Col title="Explore" links={FOOTER.explore} span="lg:col-span-2" />
          <Col title="Company" links={FOOTER.company} span="lg:col-span-2" />
          <div className="space-y-3 lg:col-span-3">
            <h3 className="text-eyebrow font-bold uppercase tracking-[0.18em] !text-leaf">
              Contact
            </h3>
            <div className="space-y-3 pt-1 text-small text-white/80">
              <div>
                <span className="block font-bold text-white">Email</span>
                <a className="text-leaf hover:underline" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </div>
              {SITE.addresses.map((a) => (
                <div key={a.label}>
                  <span className="block font-bold text-white">{a.label}</span>
                  <p className="text-white/70">{a.lines.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[0.75rem] text-white/70 sm:flex-row">
          <div>
            &copy; {new Date().getFullYear()} {SITE.legalName} All rights reserved.
          </div>
          <div>Born in Kashmir &middot; Growing across the Himalayas</div>
        </div>
      </div>
    </footer>
  );
}
