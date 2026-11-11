"use client";
import Link from "next/link";
export default function CatalogError({ reset }: { reset: () => void }) {
  return (
    <section className="admin-page catalog-empty">
      <p className="admin-eyebrow">THE PLANTING COLLECTION</p>
      <h1>A moment to reconnect.</h1>
      <p>
        The collection could not load. Retry, or sign in again if your administration session has
        expired.
      </p>
      <div>
        <button className="admin-btn admin-primary" onClick={reset}>
          Try again
        </button>
        <Link className="admin-btn admin-outline" href="/admin/login">
          Sign in again
        </Link>
      </div>
    </section>
  );
}
