import { ButtonLink, Eyebrow } from "@/components/ui";
export default function NotFound() {
  return (
    <section className="shell error-page">
      <Eyebrow>404 · Page not found</Eyebrow>
      <h1>
        A different
        <br />
        <em>path awaits.</em>
      </h1>
      <p>This page may have moved or the address may be incorrect.</p>
      <div className="error-actions">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/products" secondary>
          Explore our plants
        </ButtonLink>
      </div>
    </section>
  );
}
