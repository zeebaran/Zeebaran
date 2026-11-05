import { PageIntro, Photo, Eyebrow, EnquiryBanner } from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Our story",
  "Meet Zeebaran, a fruit-tree and horticulture business based in Anantnag, Kashmir, focused on planting material and orchard installation.",
  "/about",
);
export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="Our story"
        title="Rooted in Kashmir."
        accent="Looking ahead."
      >
        <p>
          Zeebaran brings fruit-tree enquiries and orchard installation
          together, with a simple starting point: understand what you want to
          grow.
        </p>
      </PageIntro>
      <div className="shell">
        <Photo
          src="/images/orchard-rows.jpg"
          alt="Apple orchard pictured on Zeebaran’s existing website"
          className="wide-photo about-photo"
          sizes="100vw"
          priority
        />
      </div>
      <section className="section shell two-column">
        <div>
          <Eyebrow>Zeebaran</Eyebrow>
          <h2>
            Close to the land.
            <br />
            <em>Open to possibility.</em>
          </h2>
        </div>
        <div>
          <p className="lead">
            Based in Anantnag, Kashmir, Zeebaran Services Private Limited works
            in fruit trees and horticulture.
          </p>
          <p>
            From choosing planting material to planning an orchard, each
            conversation starts with your land. We bring these decisions
            together so you can approach the next growing season with a
            considered plan.
          </p>
          <p>
            Whether you are considering a new orchard or looking for planting
            material, your land and your requirements shape the conversation.
          </p>
        </div>
      </section>
      <section className="story-quote">
        <div className="shell">
          <Eyebrow>Our guiding thought</Eyebrow>
          <blockquote>
            “We plant <em>hope.</em>”
          </blockquote>
          <p>It starts with a tree, a plan and care for what comes next.</p>
        </div>
      </section>
      <section className="section shell">
        <div className="section-heading">
          <h2>
            A practical approach
            <br />
            <em>to growing.</em>
          </h2>
        </div>
        <div className="approach-grid">
          <article>
            <span>01 / Listen</span>
            <h3>Start with your land</h3>
            <p>
              Your location, growing conditions and plans give the conversation
              its direction.
            </p>
          </article>
          <article>
            <span>02 / Consider</span>
            <h3>Ask better questions</h3>
            <p>
              Explore planting material and project requirements before making
              commitments.
            </p>
          </article>
          <article>
            <span>03 / Plan</span>
            <h3>Make the next step clear</h3>
            <p>
              Agree availability, scope and arrangements directly with the team.
            </p>
          </article>
        </div>
      </section>
      <EnquiryBanner />
    </>
  );
}
