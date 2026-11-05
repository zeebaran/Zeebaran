"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="shell error-page">
      <p className="eyebrow">Something went wrong</p>
      <h1>
        Let’s try
        <br />
        <em>that again.</em>
      </h1>
      <p>We couldn’t load this page. Please retry or return home.</p>
      <div className="error-actions">
        <button className="button" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="button button-secondary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
