"use client";
import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Images, X, Undo2 } from "lucide-react";
import type { ContentValue } from "@/features/cms/model";
import {
  partnerEntries,
  partnerFonts,
  partnerIssue,
  partnerLabel,
  type PartnerEntry,
} from "@/features/cms/partners";
import { partnerProfile } from "@/features/cms/partner-profiles";
import { PartnerMark } from "@/components/partners/PartnerMark";
import { Dialog } from "./Dialog";
import { MediaLibrary } from "./MediaLibrary";
import styles from "./partner-fields.module.css";
export function PartnerFields({
  content,
  onChange,
}: {
  content: ContentValue;
  onChange: (partners: PartnerEntry[]) => void;
}) {
  const partners = partnerEntries(content),
    [picker, setPicker] = useState<string | null>(null),
    [removed, setRemoved] = useState<{ entry: PartnerEntry; index: number } | null>(null);
  function update(id: string, patch: Partial<PartnerEntry>) {
    onChange(partners.map((partner) => (partner.id === id ? { ...partner, ...patch } : partner)));
  }
  function add() {
    const id = "partner-" + crypto.randomUUID();
    onChange([...partners, { id, name: "New partner", mode: "text", font: "sans" }]);
    requestAnimationFrame(() => document.getElementById(id + "-name")?.focus());
  }
  function move(index: number, delta: number) {
    const next = [...partners];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  }
  return (
    <div className={styles.editor}>
      <div className={styles.heading}>
        <div className="admin-tab-intro">
          <h2>Partners.</h2>
          <p>Add a name or a logo. Changes go live when you publish this page.</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-primary"
          onClick={add}
          disabled={partners.length >= 40}
        >
          <Plus size={16} /> Add partner
        </button>
      </div>
      {removed && (
        <div className={styles.undo} role="status">
          {partnerLabel(removed.entry)} removed from the draft.
          <button
            type="button"
            className="admin-text-button"
            disabled={partners.length >= 40}
            onClick={() => {
              const next = [...partners];
              next.splice(Math.min(removed.index, next.length), 0, removed.entry);
              onChange(next);
              setRemoved(null);
            }}
          >
            <Undo2 size={14} /> Undo
          </button>
        </div>
      )}
      <div className={styles.list}>
        {partners.map((partner, index) => (
          <article className={styles.card} key={partner.id} data-partner-editor={partner.id}>
            <div className={styles.top}>
              <span className="admin-eyebrow">Partner {index + 1}</span>
              <div className={styles.tools}>
                <button
                  type="button"
                  className="admin-icon-button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Move ${partnerLabel(partner)} up`}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  className="admin-icon-button"
                  disabled={index === partners.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Move ${partnerLabel(partner)} down`}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  className="admin-text-button"
                  aria-label={`Remove ${partnerLabel(partner)}`}
                  onClick={() => {
                    setRemoved({ entry: partner, index });
                    onChange(partners.filter((p) => p.id !== partner.id));
                  }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
            <div className={styles.preview}>
              <PartnerMark partner={partner} />
            </div>
            <div className={styles.fields}>
              <label>
                Partner name {partner.mode === "image" && <small>(optional for logos)</small>}
                <input
                  id={partner.id + "-name"}
                  aria-label="Partner name"
                  value={partner.name}
                  maxLength={120}
                  onChange={(e) => update(partner.id, { name: e.target.value, preset: undefined })}
                />
              </label>
              <label>
                Display as
                <select
                  aria-label="Display as"
                  value={partner.mode}
                  onChange={(e) =>
                    update(partner.id, {
                      mode: e.target.value as PartnerEntry["mode"],
                      preset: undefined,
                      image: undefined,
                    })
                  }
                >
                  <option value="text">Partner name</option>
                  <option value="image">Uploaded logo</option>
                </select>
              </label>
              {partner.mode === "text" ? (
                <>
                  <label>
                    Font
                    <select
                      aria-label="Font"
                      value={partner.font}
                      onChange={(e) =>
                        update(partner.id, {
                          font: e.target.value as PartnerEntry["font"],
                          preset: undefined,
                        })
                      }
                    >
                      {partnerFonts.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tagline <small>(optional)</small>
                    <input
                      value={partner.subtitle || ""}
                      maxLength={100}
                      onChange={(e) => update(partner.id, { subtitle: e.target.value })}
                    />
                  </label>
                </>
              ) : (
                <div className={styles.logoAction}>
                  <button
                    type="button"
                    className="admin-btn admin-outline"
                    onClick={() => setPicker(partner.id)}
                  >
                    <Images size={15} /> {partner.image ? "Change logo" : "Choose or upload logo"}
                  </button>
                  <small>
                    {partner.image
                      ? "Logo fits within the same small partner space."
                      : "Choose a logo before saving this entry. Transparent PNG or WebP works well."}
                  </small>
                </div>
              )}
            </div>
            <details className={styles.profileFields}>
              <summary>Partnership profile</summary>
              {(() => {
                const profile = partnerProfile(partner);
                const change = (patch: Partial<typeof profile>) =>
                  update(partner.id, { profile: { ...profile, ...patch } });
                return (
                  <div className={styles.profileGrid}>
                    <label>
                      Category
                      <input
                        value={profile.category}
                        maxLength={120}
                        onChange={(e) => change({ category: e.target.value })}
                      />
                    </label>
                    <label>
                      Profile heading
                      <input
                        value={profile.headline}
                        maxLength={240}
                        onChange={(e) => change({ headline: e.target.value })}
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        rows={6}
                        value={profile.description}
                        maxLength={12000}
                        onChange={(e) => change({ description: e.target.value })}
                      />
                    </label>
                    <label>
                      Focus section title
                      <input
                        value={profile.focusLabel}
                        maxLength={100}
                        onChange={(e) => change({ focusLabel: e.target.value })}
                      />
                    </label>
                    {profile.focusAreas.map((area, i) => (
                      <fieldset key={i} className={styles.focusRow}>
                        <legend>Focus area {i + 1}</legend>
                        <label>
                          Title
                          <input
                            value={area.title}
                            maxLength={160}
                            onChange={(e) =>
                              change({
                                focusAreas: profile.focusAreas.map((a, j) =>
                                  j === i ? { ...a, title: e.target.value } : a,
                                ),
                              })
                            }
                          />
                        </label>
                        <label>
                          Details
                          <textarea
                            rows={2}
                            value={area.description}
                            maxLength={2000}
                            onChange={(e) =>
                              change({
                                focusAreas: profile.focusAreas.map((a, j) =>
                                  j === i ? { ...a, description: e.target.value } : a,
                                ),
                              })
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className="admin-text-button"
                          onClick={() =>
                            change({ focusAreas: profile.focusAreas.filter((_, j) => j !== i) })
                          }
                        >
                          Remove focus area {i + 1}
                        </button>
                      </fieldset>
                    ))}
                    <button
                      type="button"
                      className="admin-btn admin-outline"
                      disabled={profile.focusAreas.length >= 12}
                      onClick={() =>
                        change({
                          focusAreas: [...profile.focusAreas, { title: "", description: "" }],
                        })
                      }
                    >
                      <Plus size={14} />
                      Add focus area
                    </button>
                    <label>
                      Commitment section title
                      <input
                        value={profile.commitmentLabel}
                        maxLength={100}
                        onChange={(e) => change({ commitmentLabel: e.target.value })}
                      />
                    </label>
                    <label>
                      Commitment or vision
                      <textarea
                        rows={5}
                        value={profile.commitment}
                        maxLength={6000}
                        onChange={(e) => change({ commitment: e.target.value })}
                      />
                    </label>
                    <label>
                      Closing statement
                      <textarea
                        rows={3}
                        value={profile.closing}
                        maxLength={800}
                        onChange={(e) => change({ closing: e.target.value })}
                      />
                    </label>
                  </div>
                );
              })()}
            </details>
            {partnerIssue([partner]) && (
              <p className={styles.validation}>
                {partner.mode === "text"
                  ? "Enter a partner name."
                  : "Choose a logo to finish this entry."}
              </p>
            )}
          </article>
        ))}
      </div>
      {!partners.length && (
        <p className="admin-empty">No partners in this draft. Add a partner to show the strip.</p>
      )}
      <p className={styles.note}>
        Removing a partner keeps its uploaded logo in the media library.
      </p>
      {picker && (
        <Dialog
          label="Choose a partner logo"
          className="admin-media-dialog"
          onClose={() => setPicker(null)}
        >
          <div className="admin-dialog-heading">
            <h2>Choose a partner logo.</h2>
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Close logo library"
              onClick={() => setPicker(null)}
            >
              <X />
            </button>
          </div>
          <MediaLibrary
            kind="image"
            onSelect={(m) => {
              update(picker, {
                image: {
                  src: m.src,
                  alt: m.alt,
                  publicId: m.publicId,
                  resourceType: "image",
                  width: m.width,
                  height: m.height,
                },
              });
              setPicker(null);
            }}
          />
        </Dialog>
      )}
    </div>
  );
}
