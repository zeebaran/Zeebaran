"use client";
import type { CSSProperties } from "react";
import { usePartners } from "@/features/cms/Content";
import { PartnerProfileButton, usePartnerProfileOpen } from "./PartnerProfiles";
import { PartnerMark } from "./PartnerMark";
import styles from "./partner-strip.module.css";
export function PartnerStrip() {
  const partners = usePartners();
  const profileOpen = usePartnerProfileOpen();
  if (!partners.length) return <div data-partner-strip className={styles.empty} />;
  // A group is at least a viewport wide, and sparse lists are repeated to avoid dead air.
  const count = Math.max(6, partners.length),
    entries = Array.from({ length: count }, (_, i) => partners[i % partners.length]);
  return (
    <div
      data-partner-strip
      data-profile-open={profileOpen || undefined}
      className={styles.viewport}
      tabIndex={0}
      aria-label="Partners. Focus or hover to pause scrolling."
    >
      <div
        className={styles.track}
        style={{ "--partner-duration": `${count * 5.5}s` } as CSSProperties}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className={styles.group}
            aria-label={copy === 0 ? "Partner names" : undefined}
            aria-hidden={copy === 1 || undefined}
          >
            {entries.map((partner, i) => (
              <li
                key={partner.id + "-" + i}
                aria-hidden={i >= partners.length || undefined}
                data-partner-id={partner.id}
              >
                <PartnerProfileButton
                  partner={partner}
                  className={styles.profileButton}
                  duplicate={copy === 1 || i >= partners.length}
                >
                  <PartnerMark partner={partner} />
                </PartnerProfileButton>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
