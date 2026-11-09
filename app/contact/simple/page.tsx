import { ContactForm } from "@/features/contact/ContactForm";
import { Heading } from "@/components/Motion";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
export const metadata = pageMeta(
  "Send a short enquiry",
  "Send a message to the Zeebaran team.",
  "/contact/simple",
);
export default function SimpleContact() {
  return (
    <section className="wrap py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <Link href="/contact" className="text-small font-semibold text-green hover:underline">
          ← Contact Zeebaran
        </Link>
        <p className="eyebrow mb-4 mt-10 flex">Write to us</p>
        <Heading
          as="h1"
          immediate
          tone="leaf"
          text="A useful {first message.}"
          className="text-display mb-5"
        />
        <p className="mb-8 text-lead">
          Tell us who you are, what you are working on and how our team can help.
        </p>
        <ContactForm simple />
      </div>
    </section>
  );
}
