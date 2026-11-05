import { PageIntro, Photo, Eyebrow, EnquiryBanner } from "@/components/ui";
import { installationSteps } from "@/content/plants";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Orchard installation",
  "From site assessment and orchard planning to preparation and planting. Discuss your orchard project with Zeebaran in Kashmir.",
  "/orchard-installation",
);
export default function Installation() {
  return (
    <>
      <PageIntro
        eyebrow="Orchard installation"
        title="Your land."
        accent="A considered plan."
      >
        <p>
          From the first conversation to the first planted row, bring your
          orchard’s needs into focus.
        </p>
      </PageIntro>
      <div className="shell">
        <Photo
          src="/images/planting.jpg"
          alt="Young orchard trees planted in orderly rows"
          className="wide-photo installation-photo"
          sizes="100vw"
          priority
        />
        <p className="photo-caption">
          Thoughtful planning creates a foundation for the work ahead.
        </p>
      </div>
      <section className="section shell">
        <div className="section-heading">
          <div>
            <Eyebrow>From ground to growth</Eyebrow>
            <h2>
              Every stage
              <br />
              <em>has its purpose.</em>
            </h2>
          </div>
          <p>
            We discuss the scope around your land, the planting plan and the
            support the project needs.
          </p>
        </div>
        <div className="process-grid">
          {installationSteps.map((s, i) => (
            <article className="process-item" key={s.title}>
              <span className="process-number">0{i + 1}</span>
              <span className="eyebrow">{s.label}</span>
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section tint">
        <div className="shell two-column">
          <div>
            <Eyebrow>Planning your project</Eyebrow>
            <h2>
              A little clarity,
              <br />
              <em>before we begin.</em>
            </h2>
          </div>
          <div className="faq-list">
            <details>
              <summary>What should I share in my enquiry?</summary>
              <p>
                Your site location, approximate land area, current use,
                preferred planting period and any photographs or existing plans.
                You can send attachments when the team replies.
              </p>
            </details>
            <details>
              <summary>Can I discuss an existing orchard?</summary>
              <p>
                Yes. Describe the existing planting and the support you are
                looking for so the team can assess your request.
              </p>
            </details>
            <details>
              <summary>How are scope and pricing agreed?</summary>
              <p>
                The team confirms the work, planting material, responsibilities,
                timeline and quotation after reviewing your project. No price or
                availability is implied by this website.
              </p>
            </details>
            <details>
              <summary>Is installation available in my area?</summary>
              <p>
                Share your location with us. Site visits, travel and service
                coverage are confirmed for each enquiry.
              </p>
            </details>
          </div>
        </div>
      </section>
      <EnquiryBanner title="An orchard begins" accent="with a conversation." />
    </>
  );
}
