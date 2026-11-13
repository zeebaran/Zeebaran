"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { Dialog } from "@/features/admin/Dialog";
import { usePartners } from "@/features/cms/Content";
import { partnerLabel, strategicPartners, type PartnerEntry } from "@/features/cms/partners";
import { partnerProfile } from "@/features/cms/partner-profiles";
import { PartnerMark } from "./PartnerMark";
import styles from "./partner-profile.module.css";
const Context = createContext<{
  open: (partner: PartnerEntry, opener: HTMLButtonElement) => void;
  opened: boolean;
}>({ open: () => {}, opened: false });
export function usePartnerProfileOpen() {
  return useContext(Context).opened;
}
export function PartnerProfiles({ children }: { children: ReactNode }) {
  const partners = usePartners(),
    [chosen, setChosen] = useState<PartnerEntry | null>(null),
    opener = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!chosen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [chosen]);
  function close() {
    setChosen(null);
    requestAnimationFrame(() => {
      const button = opener.current;
      if (button?.isConnected) button.focus({ preventScroll: true });
    });
  }
  return (
    <Context.Provider
      value={{
        opened: !!chosen,
        open: (partner, button) => {
          opener.current =
            button
              .closest("[data-partner-strip]")
              ?.querySelector<HTMLButtonElement>(
                `li[data-partner-id="${partner.id}"]:not([aria-hidden="true"]) button`,
              ) || button;
          setChosen(
            partners.find(
              (p) => p.id === partner.id || p.name.toLowerCase() === partner.name.toLowerCase(),
            ) || partner,
          );
        },
      }}
    >
      {children}
      {chosen && <Profile partner={chosen} close={close} />}
    </Context.Provider>
  );
}
export function StrategicPartnerButtons() {
  const partners = usePartners().filter((partner) =>
    strategicPartners.some((strategic) => strategic.id === partner.id),
  );
  if (!partners.length) return null;
  return (
    <ul className="mb-10 flex flex-wrap gap-4">
      {partners.map((partner) => (
        <li key={partner.id}>
          <PartnerProfileButton
            partner={partner}
            className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-2 text-[0.8125rem] font-semibold text-forest shadow-sm transition-colors hover:bg-cream"
          >
            {partnerLabel(partner)}
          </PartnerProfileButton>
        </li>
      ))}
    </ul>
  );
}
export function PartnerProfileButton({
  partner,
  children,
  className,
  duplicate = false,
}: {
  partner: PartnerEntry;
  children: ReactNode;
  className?: string;
  duplicate?: boolean;
}) {
  const { open } = useContext(Context);
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-label={`View partnership with ${partnerLabel(partner)}`}
      tabIndex={duplicate ? -1 : undefined}
      onMouseDown={(event) => {
        if (duplicate) event.preventDefault();
      }}
      onClick={(event) => open(partner, event.currentTarget)}
    >
      {children}
    </button>
  );
}
function Profile({ partner, close }: { partner: PartnerEntry; close: () => void }) {
  const profile = partnerProfile(partner);
  return (
    <Dialog
      label={`Partnership with ${partnerLabel(partner)}`}
      onClose={close}
      className={styles.dialog}
      dismissOnBackdrop
      trapFocus
    >
      <div className={styles.toolbar}>
        <span>WORKING TOGETHER</span>
        <button
          type="button"
          onClick={close}
          className={styles.close}
          aria-label="Close partner profile"
          autoFocus
        >
          <X size={19} />
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.logo}>
          <PartnerMark partner={partner} prominent />
        </div>
        <p className={styles.category}>{profile.category}</p>
        <h2>{partnerLabel(partner)}</h2>
        {profile.headline && <p className={styles.headline}>{profile.headline}</p>}
        <div className={styles.copy}>
          {profile.description
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        {!!profile.focusAreas.length && (
          <section className={styles.focus}>
            <h3>{profile.focusLabel || "Focus areas"}</h3>
            <dl>
              {profile.focusAreas.map((area, i) => (
                <div key={i}>
                  <dt>{area.title}</dt>
                  <dd>{area.description}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {profile.commitment && (
          <section className={styles.commitment}>
            <h3>{profile.commitmentLabel || "Our commitment"}</h3>
            {profile.commitment.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        )}
        {profile.closing && <p className={styles.closing}>{profile.closing}</p>}
        <a href="/contact?reason=collaboration#write" className="action-motion catalog-action">
          Discuss this partnership <ArrowUpRight size={15} />
        </a>
      </div>
    </Dialog>
  );
}
