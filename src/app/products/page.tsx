import { PageIntro, Photo, EnquiryBanner, TextLink } from "@/components/ui";
import { PlantGrid } from "@/components/plant-grid";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Our plants",
  "Explore Zeebaran’s apple planting enquiries and discuss the right material for your orchard in Kashmir.",
  "/products",
);
export default function Products() {
  return (
    <>
      <PageIntro
        eyebrow="Our plants"
        title="Good beginnings."
        accent="Rooted in possibility."
      >
        <p>
          Explore apple planting options, then speak with us about the selection
          that suits your land.
        </p>
      </PageIntro>
      <div className="shell">
        <Photo
          src="/images/orchard.jpg"
          alt="Red apples growing in an orchard"
          className="wide-photo catalogue-photo"
          sizes="100vw"
          priority
        />
        <p className="photo-caption">
          Every orchard starts with a considered choice.
        </p>
      </div>
      <section className="section shell catalogue-layout">
        <aside>
          <span className="eyebrow">Explore the collection</span>
          <h2>Apple trees</h2>
          <p>
            Availability changes with the growing season. Speak with us before
            planning your order.
          </p>
          <TextLink href="/apple-trees">Apple planting guide</TextLink>
        </aside>
        <div className="catalogue-body">
          <PlantGrid />
          <div className="subtle-panel">
            <h3>Have another planting requirement?</h3>
            <p>
              Tell us what you’re looking for. We’ll discuss whether we can help
              with your specific enquiry.
            </p>
            <TextLink href="/contact?topic=Plant%20enquiry">
              Ask the team
            </TextLink>
          </div>
        </div>
      </section>
      <EnquiryBanner />
    </>
  );
}
