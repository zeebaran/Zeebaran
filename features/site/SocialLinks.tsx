"use client";
import { useSiteSettings } from "./SettingsProvider";
import { whatsappLink } from "./model";
import styles from "./social-links.module.css";
import { SocialMark } from "./SocialMark";
export function SocialLinks() {
  const { settings } = useSiteSettings();
  const links = { ...settings.socials, whatsapp: whatsappLink(settings.whatsapp) };
  if (!settings.footer.socials) return null;
  const visible = (Object.keys(links) as (keyof typeof links)[]).filter(
    (key) => settings.footer[key] && !!links[key],
  );
  if (!visible.length) return null;
  return (
    <nav className={styles.links} aria-label="Zeebaran social media">
      {visible.map((key) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            "Zeebaran on " +
            (key === "youtube"
              ? "YouTube"
              : key === "whatsapp"
                ? "WhatsApp"
                : key[0].toUpperCase() + key.slice(1))
          }
        >
          <SocialMark platform={key} />
        </a>
      ))}
    </nav>
  );
}
