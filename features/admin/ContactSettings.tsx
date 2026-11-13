"use client";
import { useAdminFeedback, notifyAdmin } from "./notifications";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Save, RefreshCw, Plus, Trash2, Mail, MapPin, Link2, Phone } from "lucide-react";
import { adminRequest } from "./client";
import { contactChannels, type SiteSettings, type SettingsRecord } from "@/features/site/model";
import { siteSettingsSchema } from "@/features/site/schema";
import styles from "./contact-settings.module.css";

function FooterSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.switch}>
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function ContactSettings({ initial }: { initial: SettingsRecord }) {
  const [record, setRecord] = useState(initial),
    [settings, setSettings] = useState(initial.settings);
  const [busy, setBusy] = useState(false),
    [action, setAction] = useState<"save" | "reload">("save"),
    [error, setError] = useAdminFeedback("error"),
    [notice, setNotice] = useState("");
  const lock = useRef(false);
  const dirty = JSON.stringify(settings) !== JSON.stringify(record.settings);
  const [seenRevision, setSeenRevision] = useState(initial.revision);
  // Reuse fresh server props without another fetch; keep unsaved entries intact.
  if (initial.revision > seenRevision) {
    setSeenRevision(initial.revision);
    if (initial.revision > record.revision) {
      if (dirty)
        setNotice(
          "Another administrator updated these settings. Your entries are kept; reload before saving.",
        );
      else {
        setRecord(initial);
        setSettings(initial.settings);
      }
    }
  }
  useEffect(() => {
    if (!dirty) return;
    const leave = (event: BeforeUnloadEvent) => event.preventDefault();
    const navigate = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.("a");
      if (
        link?.href &&
        !link.target &&
        !event.defaultPrevented &&
        !window.confirm("Leave and discard unsaved contact settings?")
      )
        event.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", leave);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty]);
  async function reload() {
    if (lock.current || (dirty && !window.confirm("Reload and discard unsaved contact settings?")))
      return;
    lock.current = true;
    setAction("reload");
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const latest = await adminRequest<SettingsRecord>("/api/admin/settings");
      setRecord(latest);
      setSettings(latest.settings);
      notifyAdmin("Contact & social settings reloaded.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not reload settings.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !dirty) return;
    setError("");
    setNotice("");
    const validated = siteSettingsSchema.safeParse(settings);
    if (!validated.success) {
      const issue = validated.error.issues[0];
      const group = issue.path[0],
        key = issue.path[1];
      const basicLabels: Record<string, string> = {
        email: "Email",
        phone: "Phone number",
        whatsapp: "WhatsApp number",
      };
      const label =
        group === "channels"
          ? contactChannels.find((entry) => entry[0] === key)?.[1]
          : group === "socials"
            ? key === "youtube"
              ? "YouTube"
              : String(key || "Social profile")
            : group === "addresses"
              ? "Office " + (typeof key === "number" ? key + 1 : "addresses")
              : basicLabels[String(group)] || "Contact settings";
      setError(`${label || "Contact settings"}: ${issue.message}`);
      return;
    }
    lock.current = true;
    setAction("save");
    setBusy(true);
    try {
      const saved = await adminRequest<SettingsRecord>("/api/admin/settings", {
        revision: record.revision,
        settings: validated.data,
      });
      setRecord(saved);
      setSettings(saved.settings);
      setNotice("Saved. New page loads now use these details.");
      notifyAdmin("Contact & social settings saved.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Settings could not be saved. Your entries are still here.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const edit = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((old) => ({ ...old, [key]: value }));
    setNotice("");
  };
  return (
    <form className={styles.workspace} onSubmit={save} noValidate>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>WEBSITE SETTINGS</p>
          <h1>
            Contact &amp; social<span>.</span>
          </h1>
          <p>One place for every way to reach Zeebaran.</p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className="admin-btn admin-outline"
            disabled={busy}
            onClick={() => void reload()}
          >
            <RefreshCw size={15} /> {busy && action === "reload" ? "Reloading…" : "Reload"}
          </button>
          <button className="admin-btn admin-primary" type="submit" disabled={!dirty || busy}>
            <Save size={15} />
            {busy && action === "save" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
      <div className={styles.status} role="status">
        {notice ||
          (dirty
            ? "Unsaved changes · Save updates the live website."
            : `Up to date · Revision ${record.revision}`)}
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <fieldset disabled={busy} className={styles.section}>
        <legend>Footer visibility</legend>
        <p className={styles.hint}>
          Hide an item temporarily without deleting its details. These switches only affect the
          footer.
        </p>
        <div className={styles.grid}>
          {(
            [
              ["email", "Show email in footer"],
              ["phone", "Show phone in footer"],
              ["addresses", "Show addresses in footer"],
              ["socials", "Show social media in footer"],
            ] as const
          ).map(([key, label]) => (
            <FooterSwitch
              key={key}
              label={label}
              checked={settings.footer[key]}
              onChange={(checked) => edit("footer", { ...settings.footer, [key]: checked })}
            />
          ))}
        </div>
        <div className={styles.platforms}>
          {(["facebook", "instagram", "youtube", "whatsapp"] as const).map((key) => (
            <FooterSwitch
              key={key}
              label={`Show ${key === "youtube" ? "YouTube" : key === "whatsapp" ? "WhatsApp" : key[0].toUpperCase() + key.slice(1)} in footer`}
              checked={settings.footer[key]}
              onChange={(checked) => edit("footer", { ...settings.footer, [key]: checked })}
            />
          ))}
        </div>
      </fieldset>
      <fieldset disabled={busy} className={styles.section}>
        <legend>
          <Phone size={18} /> Main contact
        </legend>
        <div className={styles.grid}>
          <label htmlFor="settings-email">
            Email
            <input
              id="settings-email"
              type="email"
              autoComplete="off"
              value={settings.email}
              onChange={(e) => edit("email", e.target.value)}
            />
          </label>
          <label htmlFor="settings-phone">
            <span id="settings-phone-label">Phone number</span>
            <input
              id="settings-phone"
              aria-labelledby="settings-phone-label"
              aria-describedby="settings-phone-help"
              type="tel"
              value={settings.phone}
              onChange={(e) => edit("phone", e.target.value)}
            />
            <small id="settings-phone-help">Include the country code.</small>
          </label>
          <label htmlFor="settings-whatsapp">
            <span id="settings-whatsapp-label">WhatsApp number</span>
            <input
              id="settings-whatsapp"
              aria-labelledby="settings-whatsapp-label"
              aria-describedby="settings-whatsapp-help"
              type="tel"
              value={settings.whatsapp}
              placeholder="+91 …"
              onChange={(e) => edit("whatsapp", e.target.value)}
            />
            <small id="settings-whatsapp-help">
              Used by every nursery enquiry button and the footer icon. Leave empty to turn WhatsApp
              off.
            </small>
          </label>
        </div>
        <p className={styles.hint}>
          The main email updates website links and the form’s email fallback. Submitted forms still
          reach your verified form inbox.
        </p>
      </fieldset>
      <fieldset disabled={busy} className={styles.section}>
        <legend>
          <Link2 size={18} /> Social profiles
        </legend>
        <p className={styles.hint}>Empty links stay hidden in the footer.</p>
        <div className={styles.grid}>
          {(["facebook", "instagram", "youtube"] as const).map((key) => (
            <label htmlFor={"settings-" + key} key={key}>
              <span className={styles.capitalize}>{key === "youtube" ? "YouTube" : key}</span>
              <input
                id={"settings-" + key}
                type="url"
                value={settings.socials[key]}
                onChange={(e) => edit("socials", { ...settings.socials, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={busy} className={styles.section}>
        <legend>
          <Mail size={18} /> Institutional email desks
        </legend>
        <div className={styles.grid}>
          {contactChannels.map(([key, label]) => (
            <label htmlFor={"settings-desk-" + key} key={key}>
              {label}
              <input
                id={"settings-desk-" + key}
                type="email"
                value={settings.channels[key]}
                onChange={(e) => edit("channels", { ...settings.channels, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={busy} className={styles.section}>
        <legend>
          <MapPin size={18} /> Office addresses
        </legend>
        <p className={styles.hint}>
          Shared by the footer and Contact page. Map locations remain in Contact → Regional hubs.
        </p>
        <div className={styles.offices}>
          {settings.addresses.map((address, index) => (
            <div className={styles.office} key={address.id}>
              <div className={styles.officeHeading}>
                <strong>Office {index + 1}</strong>
                <button
                  type="button"
                  aria-label={"Remove " + (address.label || "office " + (index + 1))}
                  onClick={() => {
                    if (
                      window.confirm("Remove this office address from the website when you save?")
                    )
                      edit(
                        "addresses",
                        settings.addresses.filter((item) => item.id !== address.id),
                      );
                  }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
              <FooterSwitch
                label={`Show office ${index + 1} in footer`}
                checked={address.showInFooter}
                onChange={(checked) =>
                  edit(
                    "addresses",
                    settings.addresses.map((item) =>
                      item.id === address.id ? { ...item, showInFooter: checked } : item,
                    ),
                  )
                }
              />
              {(["label", "address", "note"] as const).map((key) => (
                <label key={key} htmlFor={`office-${address.id}-${key}`}>
                  {key === "label"
                    ? "Office name"
                    : key === "address"
                      ? "Address"
                      : "Short description (optional)"}
                  <input
                    id={`office-${address.id}-${key}`}
                    value={address[key]}
                    onChange={(e) =>
                      edit(
                        "addresses",
                        settings.addresses.map((item) =>
                          item.id === address.id ? { ...item, [key]: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          ))}
        </div>
        <button
          className="admin-btn admin-outline"
          type="button"
          disabled={settings.addresses.length >= 8}
          onClick={() =>
            edit("addresses", [
              ...settings.addresses,
              { id: crypto.randomUUID(), label: "", address: "", note: "", showInFooter: true },
            ])
          }
        >
          <Plus size={15} /> Add office
        </button>
      </fieldset>
    </form>
  );
}
