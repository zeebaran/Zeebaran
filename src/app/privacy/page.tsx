import { PageIntro } from "@/components/ui";
import { AnalyticsPreference } from "@/components/analytics";
import { site, pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Privacy notice",
  "How Zeebaran handles website enquiries and optional analytics.",
  "/privacy",
);
export default function Privacy() {
  return (
    <>
      <PageIntro
        eyebrow="Your information"
        title="Privacy,"
        accent="in plain language."
      >
        <p>How this website handles information when you contact Zeebaran.</p>
      </PageIntro>
      <article className="shell legal section-tight">
        <h2>Who to contact</h2>
        <p>
          Zeebaran Services Private Limited, Anantnag, Kashmir, 192201. For
          privacy requests, email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <h2>Your enquiry</h2>
        <p>
          We use your name, email, enquiry and optional phone number to respond
          to your request. When the button says “Open email draft”, your entries
          prepare an email in your browser. They are not submitted to our
          server. You choose whether to send the draft from your email app.
        </p>
        <p>
          When online delivery is enabled, “Send enquiry” securely passes your
          details through our server to Resend for email delivery. Upstash
          stores a hashed network identifier and request count for up to 15
          minutes to limit abuse; it does not store your enquiry text.
        </p>
        <h2>Email and external services</h2>
        <p>
          Sent enquiries may remain in the business mailbox while your request
          and related business records are handled. Contact us to request
          access, correction or deletion. Your email provider and WhatsApp, if
          you choose that link, process information under their own policies.
        </p>
        <h2>Optional analytics</h2>
        <p>
          If configured, Google Analytics loads only after you select “Allow
          analytics”. It measures page visits and contact actions. Our events
          exclude form text, names, emails and phone numbers. Your choice is
          stored in your browser.
        </p>
        <AnalyticsPreference />
        <h2>Maps</h2>
        <p>
          If available, Google Maps loads only after you press “Load Google
          Maps”. Google then receives connection data, including your IP
          address.
        </p>
        <h2>Technical information</h2>
        <p>
          The hosting provider may process request information needed to operate
          and secure the website. Please avoid sending sensitive personal
          information in enquiries.
        </p>
      </article>
    </>
  );
}
