import { ContentText } from "@/features/cms/Content";
import { PageContent } from "@/features/cms/server/public";
import { ContactForm } from "@/features/contact/ContactForm";
import { Reveal } from "@/components/Motion";
import {
  ContactHero,
  Channels,
  Topography,
  WriteIntro,
  CorridorMapCard,
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
    <PageContent page="contact">
      {
        <>
          <ContactHero />
          <Channels />
          <Topography />
          <section id="write" className="scroll-mt-24 pb-16 sm:pb-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <div className="grid grid-cols-1 items-start gap-12 rounded-[2rem] border border-line/60 bg-white p-6 shadow-sm sm:rounded-[2.5rem] sm:p-12 lg:grid-cols-12 lg:items-end lg:gap-16 lg:p-16">
                <div className="lg:col-span-6">
                  <WriteIntro />
                  <a
                    href="/contact/simple"
                    className="mt-5 inline-flex text-small font-semibold text-green underline underline-offset-4"
                  >
                    <ContentText>Use the short enquiry form</ContentText>
                  </a>
                  <div className="mt-8 lg:mt-4" data-corridor-card>
                    <CorridorMapCard />
                  </div>
                </div>
                <Reveal delay={0.1} className="lg:col-span-6">
                  <ContactForm />
                </Reveal>
              </div>
            </div>
          </section>
          <BornInKashmir />
        </>
      }
    </PageContent>
  );
}
