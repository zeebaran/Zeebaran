"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
const KEY = "zeebaran-analytics-consent",
  gaId = process.env.NEXT_PUBLIC_GA_ID;
const enabled = !!gaId && /^G-[A-Z0-9]+$/.test(gaId);
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
function getConsent() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return "denied";
  }
}
function subscribe(fn: () => void) {
  window.addEventListener("storage", fn);
  window.addEventListener("zeebaran-consent", fn);
  return () => {
    window.removeEventListener("storage", fn);
    window.removeEventListener("zeebaran-consent", fn);
  };
}
function choose(v: string) {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
  window.dispatchEvent(new Event("zeebaran-consent"));
}
export function track(event: string, params: Record<string, string> = {}) {
  if (enabled && getConsent() === "accepted")
    window.gtag?.("event", event, params);
}
export function Analytics() {
  const consent = useSyncExternalStore(subscribe, getConsent, () => null),
    path = usePathname(),
    previous = useRef("");
  useEffect(() => {
    if (
      enabled &&
      consent === "accepted" &&
      window.gtag &&
      previous.current !== path
    ) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.origin + path,
      });
      previous.current = path;
    }
  }, [path, consent]);
  useEffect(() => {
    if (!enabled || consent !== "accepted") return;
    const click = (e: MouseEvent) => {
      const href =
        (e.target as Element)?.closest?.("a")?.getAttribute("href") || "";
      if (href.startsWith("tel:")) track("contact_click", { method: "phone" });
      else if (href.startsWith("https://wa.me/"))
        track("contact_click", { method: "whatsapp" });
      else if (href.startsWith("mailto:"))
        track("contact_click", { method: "email" });
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [consent]);
  if (!enabled) return null;
  return (
    <>
      {consent === "accepted" && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
          onLoad={() => {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function (...args: unknown[]) {
              window.dataLayer.push(args);
            };
            window.gtag("js", new Date());
            window.gtag("config", gaId, { send_page_view: false });
            if (previous.current !== path) {
              window.gtag("event", "page_view", {
                page_path: path,
                page_location: window.location.origin + path,
              });
              previous.current = path;
            }
          }}
        />
      )}
      {consent === null && (
        <div
          className="consent-banner"
          role="region"
          aria-label="Analytics preference"
        >
          <p>
            Allow optional analytics to help us understand how this website is
            used? <a href="/privacy">Privacy notice</a>
          </p>
          <button
            className="button button-secondary"
            onClick={() => choose("denied")}
          >
            Decline
          </button>
          <button className="button" onClick={() => choose("accepted")}>
            Allow analytics
          </button>
        </div>
      )}
    </>
  );
}
export function AnalyticsPreference() {
  return enabled ? (
    <button
      className="button button-secondary"
      onClick={() => {
        choose("denied");
        window.location.reload();
      }}
    >
      Turn off optional analytics
    </button>
  ) : (
    <p>Optional analytics is currently disabled.</p>
  );
}
