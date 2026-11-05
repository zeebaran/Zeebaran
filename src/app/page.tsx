import { ArrowDown, MoveUpRight } from "lucide-react";
import Link from "next/link";
import {
  Eyebrow,
  ButtonLink,
  TextLink,
  Photo,
  EnquiryBanner,
} from "@/components/ui";
import { PlantGrid } from "@/components/plant-grid";
import { Reveal } from "@/components/reveal";
export default function Home() {
  return (
    <>
      <section className="home-hero shell">
        <div className="hero-copy">
          <Eyebrow>Fruit trees & orchard expertise</Eyebrow>
          <h1>
            A good orchard
            <br />
            starts <em>here.</em>
          </h1>
          <p className="hero-description">
            Fruit trees, practical guidance and high-density orchard
            installation. Rooted in Kashmir, with your next growing season in
            mind.
          </p>
          <div className="hero-actions">
            <ButtonLink href="/apple-trees">Explore apple trees</ButtonLink>
            <TextLink href="/orchard-installation">Plan your orchard</TextLink>
          </div>
          <div className="hero-footnote">
            <span className="coordinate-dot" aria-hidden="true" />
            <span>
              Anantnag, Kashmir
              <br />
              <strong>We plant hope.</strong>
            </span>
            <a
              href="#a-stronger-beginning"
              aria-label="Explore what Zeebaran offers"
            >
              <ArrowDown size={22} />
            </a>
          </div>
        </div>
        <div className="hero-image-wrap">
          <Photo
            src="/images/orchard.jpg"
            alt="Red apples growing along supported orchard rows"
            className="hero-image"
            priority
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1439px) 46vw, 640px"
            position="42% center"
          />
          <div className="hero-image-label">
            <span className="small-label">From the ground up</span>
            <span>
              Every season begins
              <br />
              with a possibility.
            </span>
          </div>
          <div className="hero-seal" aria-hidden="true">
            <span>Zeebaran</span>
            <span>
              We plant
              <br />
              <em>hope.</em>
            </span>
            <span>Kashmir</span>
          </div>
          <span className="image-edge-label">
            THE LAND. THE TREES. THE PEOPLE.
          </span>
        </div>
      </section>
      <div className="offering-strip">
        <div className="shell">
          <span>Plant selection</span>
          <span aria-hidden="true">✳</span>
          <span>Orchard planning</span>
          <span aria-hidden="true">✳</span>
          <span>Thoughtful installation</span>
          <span aria-hidden="true">✳</span>
          <span>Practical guidance</span>
        </div>
      </div>
      <section id="a-stronger-beginning" className="section shell">
        <Reveal className="intro-split">
          <Eyebrow>A stronger beginning</Eyebrow>
          <div>
            <h2>
              Good things grow
              <br />
              from <em>good decisions.</em>
            </h2>
            <p className="large-copy">
              The right planting material. A considered plan. Someone to turn to
              when you need guidance. At Zeebaran, we bring these beginnings
              together.
            </p>
            <TextLink href="/about">Get to know Zeebaran</TextLink>
          </div>
        </Reveal>
      </section>
      <section className="plants-section section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <Eyebrow>Our plants</Eyebrow>
              <h2>
                Find your
                <br />
                <em>next beginning.</em>
              </h2>
            </div>
            <div className="section-heading-aside">
              <p>
                Apple trees are at the heart of what we do. Explore our named
                selections, then talk to us about the planting material
                available for your orchard.
              </p>
              <TextLink href="/products">Explore our plants</TextLink>
            </div>
          </div>
          <PlantGrid />
          <p className="section-note">
            Planting material and availability vary. Our team can help confirm
            the details before you decide.
          </p>
        </div>
      </section>
      <section className="section shell service-feature">
        <Photo
          src="/images/planting.jpg"
          alt="Supported young apple trees planted in straight orchard rows"
          className="service-image"
        />
        <Reveal className="service-copy">
          <Eyebrow>Orchard installation</Eyebrow>
          <h2>
            A plan for the land.
            <br />
            <em>A place to grow.</em>
          </h2>
          <p>
            From understanding your site to establishing the trees, our
            high-density apple orchard installation service connects each part
            of the process.
          </p>
          <div className="service-list">
            <span>
              <b>01</b> Site assessment & planning
            </span>
            <span>
              <b>02</b> Ground preparation & support
            </span>
            <span>
              <b>03</b> Tree installation & guidance
            </span>
          </div>
          <ButtonLink href="/orchard-installation">
            Discover the process
          </ButtonLink>
        </Reveal>
      </section>
      <section className="approach-section">
        <div className="shell section">
          <div className="section-heading">
            <div>
              <Eyebrow>Our approach</Eyebrow>
              <h2>
                Closer to the trees.
                <br />
                <em>Closer to you.</em>
              </h2>
            </div>
            <p className="section-heading-aside">
              Useful advice begins with understanding what you want to grow—and
              where you want to grow it.
            </p>
          </div>
          <div className="approach-grid">
            {[
              {
                n: "01",
                t: "Start with your site",
                p: "Tell us about your land, local conditions and the orchard you have in mind.",
              },
              {
                n: "02",
                t: "Make an informed choice",
                p: "Discuss the selection, planting material and care requirements before committing.",
              },
              {
                n: "03",
                t: "Stay connected",
                p: "Ask questions about planting, establishment and the next steps in caring for your trees.",
              },
            ].map((item) => (
              <article key={item.n}>
                <span className="small-label">{item.n}</span>
                <h3>{item.t}</h3>
                <p>{item.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="story-section shell section">
        <div>
          <Eyebrow>Our story</Eyebrow>
          <h2>
            From Kashmir,
            <br />
            <em>with care.</em>
          </h2>
          <p>
            Zeebaran Services Private Limited works in fruit trees and orchard
            establishment from Anantnag, Kashmir. Our work brings together plant
            selection, practical experience and a connection to the land.
          </p>
          <Link href="/about" className="circle-link">
            Read our story{" "}
            <span>
              <MoveUpRight size={24} aria-hidden="true" />
            </span>
          </Link>
        </div>
        <Photo
          src="/images/orchard-rows.jpg"
          alt="Apple orchard pictured on Zeebaran’s existing website"
          className="story-image"
        />
      </section>
      <EnquiryBanner />
    </>
  );
}
