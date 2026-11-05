import Link from "next/link";
import { ArrowUpRight, Sprout } from "lucide-react";
import { site } from "@/lib/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link href="/" className="wordmark" aria-label="Zeebaran home">
            <Sprout aria-hidden="true" strokeWidth={1.6} />
            <span>zeebaran.</span>
          </Link>
          <p>
            Fruit trees. Thoughtful orchards.
            <br />A connection to the land.
          </p>
          <span className="small-label">We plant hope.</span>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/products">Our plants</Link>
          <Link href="/apple-trees">Apple trees</Link>
          <Link href="/orchard-installation">Orchard installation</Link>
          <Link href="/about">Our story</Link>
        </div>
        <div>
          <h2>Start a conversation</h2>
          <a href={`mailto:${site.email}`}>
            {site.email}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href={site.phoneHref}>{site.phone}</a>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <p>{site.address}</p>
        </div>
      </div>
      <div className="shell footer-signature" aria-hidden="true">
        zeebaran<span>.</span>
      </div>
      <div className="shell footer-bottom">
        <p>
          © {new Date().getFullYear()} {site.legalName}
        </p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <span>Grown from a love of the land.</span>
      </div>
    </footer>
  );
}
