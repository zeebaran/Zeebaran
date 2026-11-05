"use client";
import { useState } from "react";
export function Map({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  return loaded ? (
    <iframe
      title="Zeebaran location on Google Maps"
      src={url}
      width="100%"
      height="360"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      style={{ border: 0 }}
    />
  ) : (
    <div className="subtle-panel">
      <p>Google receives connection data when you load this map.</p>
      <button
        className="button button-secondary"
        onClick={() => setLoaded(true)}
      >
        Load Google Maps
      </button>
    </div>
  );
}
