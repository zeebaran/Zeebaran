import { Mail, Phone, ArrowUpRight, MessageCircle } from "lucide-react";
import { PageIntro, Eyebrow, Photo } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { Map } from "@/components/map";
import { site, pageMetadata } from "@/lib/site";
import { contactDeliveryAvailable } from "@/lib/contact-delivery";
import { plants } from "@/content/plants";
export const metadata = pageMetadata(
  "Contact",
  "Speak with Zeebaran about apple trees and orchard installation in Anantnag, Kashmir.",
  "/contact",
);
export const dynamic = "force-dynamic";
export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; plant?: string }>;
}) {
  const q = await searchParams,
    plant = plants.find((p) => p.name === q.plant)?.name;
  let mapUrl: string | undefined;
  try {
    const u = new URL(process.env.GOOGLE_MAPS_EMBED_URL || "");
    if (
      u.protocol === "https:" &&
      u.hostname === "www.google.com" &&
      u.pathname.startsWith("/maps/embed")
    )
      mapUrl = u.toString();
  } catch {}
  return (
    <>
      <PageIntro
        eyebrow="Let’s talk"
        title="Every good orchard"
        accent="starts somewhere."
      >
        <p>
          Tell us about your land, the trees you have in mind or the project
          you’re planning.
        </p>
      </PageIntro>
      <section className="shell contact-layout">
        <aside>
          <Eyebrow>Get in touch</Eyebrow>
          <a className="contact-method" href={`mailto:${site.email}`}>
            <Mail aria-hidden="true" />
            <span>
              <small>Email us</small>
              {site.email}
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a className="contact-method" href={site.phoneHref}>
            <Phone aria-hidden="true" />
            <span>
              <small>Call the team</small>
              {site.phone}
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a
            className="contact-method"
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden="true" />
            <span>
              <small>Message on WhatsApp</small>+91 7889385964
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <div className="subtle-panel">
            <h2>A useful starting point</h2>
            <p>
              Your location, land area or tree quantity, and your intended
              planting period help us understand your enquiry.
            </p>
          </div>
        </aside>
        <ContactForm
          deliveryAvailable={contactDeliveryAvailable()}
          initialTopic={q.topic}
          plant={plant}
        />
      </section>
      <section className="section contact-location">
        <div className="shell location-grid">
          <div>
            <Eyebrow>Rooted in Kashmir</Eyebrow>
            <h2>
              Find us
              <br />
              <em>in Anantnag.</em>
            </h2>
            <p>{site.address}</p>
            <p>
              Please contact the team to arrange a visit and confirm directions.
            </p>
          </div>
          {mapUrl ? (
            <Map url={mapUrl} />
          ) : (
            <Photo
              src="/images/planting.jpg"
              alt="Young orchard trees beneath an open sky"
              className="location-image"
            />
          )}
        </div>
      </section>
    </>
  );
}
