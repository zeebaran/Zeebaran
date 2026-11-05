import { PageIntro, EnquiryBanner, Eyebrow } from "@/components/ui";
import { PlantGrid } from "@/components/plant-grid";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Apple trees",
  "Enquire about Gala and Red Delicious apple planting material with Zeebaran, Anantnag, Kashmir.",
  "/apple-trees",
);
export default function Apples() {
  return (
    <>
      <PageIntro
        eyebrow="The apple collection"
        title="A thoughtful choice."
        accent="A growing future."
      >
        <p>
          Start with the apple selections below. We’ll help you discuss
          availability, planting material and the needs of your site.
        </p>
      </PageIntro>
      <section className="shell section-tight">
        <h2 className="sr-only">Apple selections</h2>
        <PlantGrid />
        <p className="photo-caption">
          These are enquiry listings. Current stock, rootstock, grades and
          pricing are confirmed directly by the team.
        </p>
      </section>
      <section className="section tint">
        <div className="shell two-column">
          <div>
            <Eyebrow>Before you plant</Eyebrow>
            <h2>
              The right questions
              <br />
              <em>come first.</em>
            </h2>
          </div>
          <div>
            <ul className="plain-list">
              <li>
                <h3>Your growing site</h3>
                <p>
                  Share the location, land area and what is currently growing
                  there.
                </p>
              </li>
              <li>
                <h3>The planting material</h3>
                <p>
                  Ask about the available selection, rootstock, tree size and
                  documentation.
                </p>
              </li>
              <li>
                <h3>Your planting plan</h3>
                <p>
                  Discuss quantity, intended planting time and any orchard
                  installation support you need.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <EnquiryBanner />
    </>
  );
}
