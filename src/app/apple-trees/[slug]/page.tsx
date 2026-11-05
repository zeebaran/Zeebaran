import { notFound } from "next/navigation";
import { plants } from "@/content/plants";
import {
  Breadcrumb,
  Eyebrow,
  Photo,
  ButtonLink,
  TextLink,
} from "@/components/ui";
import { pageMetadata } from "@/lib/site";
export function generateStaticParams() {
  return plants.map(({ slug }) => ({ slug }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plant = plants.find((p) => p.slug === slug);
  return plant
    ? pageMetadata(
        `${plant.name} apple trees`,
        `Discuss ${plant.name} apple planting material, availability and orchard requirements with Zeebaran.`,
        `/apple-trees/${slug}`,
      )
    : {};
}
export default async function Plant({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plant = plants.find((p) => p.slug === slug);
  if (!plant) notFound();
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Our plants", href: "/products" },
          { label: "Apple trees", href: "/apple-trees" },
          { label: plant.name },
        ]}
      />
      <section className="shell detail-hero">
        <div className="detail-copy">
          <Eyebrow>Apple planting enquiries</Eyebrow>
          <h1>
            {plant.name}
            <br />
            <em>Apple trees.</em>
          </h1>
          <p>{plant.description}</p>
          <p className="availability">
            Availability and specifications confirmed on enquiry
          </p>
          <ButtonLink
            href={`/contact?topic=Plant%20enquiry&plant=${encodeURIComponent(plant.name)}`}
          >
            Enquire about {plant.name}
          </ButtonLink>
        </div>
        <div>
          <Photo
            src="/images/orchard.jpg"
            alt="Apple trees in an established orchard"
            className="detail-image"
            priority
          />
          <p className="photo-caption">
            Orchard imagery. Request current photographs of the available
            planting material.
          </p>
        </div>
      </section>
      <section className="section shell two-column border-top">
        <div>
          <Eyebrow>Make an informed start</Eyebrow>
          <h2>
            Let’s talk
            <br />
            <em>planting details.</em>
          </h2>
        </div>
        <div>
          <p>
            {plant.note} Planting suitability depends on your site and the
            specific material available.
          </p>
          <ul className="plain-list">
            <li>Available selection and rootstock</li>
            <li>Planting size, grade and quantity</li>
            <li>Documentation and care guidance</li>
            <li>Price, collection or delivery arrangements</li>
          </ul>
          <TextLink href="/apple-trees">Back to apple trees</TextLink>
        </div>
      </section>
    </>
  );
}
