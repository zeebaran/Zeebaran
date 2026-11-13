"use client";
import { ContentText } from "@/features/cms/Content";
import { ContentLink as Link } from "@/features/cms/Content";
import { Logo } from "./Logo";
import { FOOTER, SITE } from "@/lib/site";
import { useSiteSettings } from "@/features/site/SettingsProvider";
import { SocialLinks } from "@/features/site/SocialLinks";
import { phoneDigits } from "@/features/site/model";

function Col({
  title,
  links,
  span,
  preview,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
  span: string;
  preview?: boolean;
}) {
  return (
    <div className={`space-y-3 ${span}`}>
      <h3 className="text-eyebrow font-bold uppercase tracking-[0.18em] !text-leaf">
        <ContentText>{title}</ContentText>
      </h3>
      <ul className="space-y-2 pt-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              prefetch={preview ? false : undefined}
              className="text-small font-medium text-white/70 transition-colors hover:text-white"
            >
              <ContentText>{l.label}</ContentText>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ preview = false }: { preview?: boolean } = {}) {
  const { settings } = useSiteSettings();
  const addresses = settings.footer.addresses
    ? settings.addresses.filter((address) => address.showInFooter)
    : [];
  const hasContact = settings.footer.email || settings.footer.phone || addresses.length > 0;
  return (
    <footer id="footer" className="border-t border-leaf/20 bg-forest pb-12 pt-16 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Logo light dot />
            <p className="max-w-sm text-small text-white/70">
              <ContentText>
                Zeebaran works in horticulture because strengthening the conditions around people is
                how capability grows: in individuals, institutions, and society.
              </ContentText>
            </p>
            <p className="pt-4 font-serif text-small italic text-leaf">
              <ContentText>
                &ldquo;The purpose was never the platform. It was always greater human
                capability.&rdquo;
              </ContentText>
            </p>
            <SocialLinks />
          </div>
          <Col
            preview={preview}
            title="Explore"
            links={FOOTER.explore}
            span={hasContact ? "lg:col-span-2" : "lg:col-span-3"}
          />
          <Col
            preview={preview}
            title="Company"
            links={FOOTER.company}
            span={hasContact ? "lg:col-span-2" : "lg:col-span-4"}
          />
          {hasContact && (
            <div className="space-y-3 lg:col-span-3">
              <h3 className="text-eyebrow font-bold uppercase tracking-[0.18em] !text-leaf">
                <ContentText>Contact</ContentText>
              </h3>
              <div className="space-y-3 pt-1 text-small text-white/80">
                {settings.footer.email && (
                  <div>
                    <span className="block font-bold text-white">
                      <ContentText>Email</ContentText>
                    </span>
                    <a className="text-leaf hover:underline" href={`mailto:${settings.email}`}>
                      {settings.email}
                    </a>
                  </div>
                )}
                {settings.footer.phone && (
                  <div>
                    <span className="block font-bold text-white">Phone</span>
                    <a
                      className="text-white/70 hover:text-white"
                      href={"tel:+" + phoneDigits(settings.phone)}
                    >
                      {settings.phone}
                    </a>
                  </div>
                )}
                {addresses.map((a) => (
                  <div key={a.id}>
                    <span className="block font-bold text-white">{a.label}</span>
                    <p className="text-white/70">{a.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[0.75rem] text-white/70 sm:flex-row">
          <div>
            <ContentText>
              &copy; <ContentText></ContentText>
              {new Date().getFullYear()}
            </ContentText>{" "}
            <ContentText>{SITE.legalName}</ContentText>{" "}
            <ContentText>All rights reserved.</ContentText>
          </div>
          <div>
            <ContentText>Born in Kashmir &middot; Growing across the Himalayas</ContentText>
          </div>
        </div>
        <div className="mt-5 text-center text-[0.6875rem] leading-relaxed text-white/60">
          <a
            href="https://www.linkedin.com/in/naveedbhat085/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf"
          >
            Designed &amp; Developed by Naveed Mohammad Bhat
          </a>
        </div>
      </div>
    </footer>
  );
}
