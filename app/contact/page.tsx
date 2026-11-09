import { ContactForm } from "@/features/contact/ContactForm";
import { Reveal } from "@/components/Motion";
import {
  ContactHero,
  Channels,
  Topography,
  WriteIntro,
  BornInKashmir,
} from "@/components/pages/contact";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Contact",
  "Begin a conversation with Zeebaran about research, investment, collaboration or careers.",
  "/contact",
);

export default function Contact() {
  return (
    <>
      <ContactHero />
      <Channels />
      <Topography />
      <section id="write" className="scroll-mt-24 pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-start gap-12 rounded-[2rem] border border-line/60 bg-white p-6 shadow-sm sm:rounded-[2.5rem] sm:p-12 lg:grid-cols-12 lg:gap-16 lg:p-16">
            <div className="lg:col-span-6">
              <WriteIntro />
              <a
                href="/contact/simple"
                className="mt-5 inline-flex text-small font-semibold text-green underline underline-offset-4"
              >
                Use the short enquiry form
              </a>
            </div>
            <Reveal delay={0.1} className="lg:col-span-6">
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
      <BornInKashmir />
    </>
  );
}
