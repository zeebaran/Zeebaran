"use client";
import { useState } from "react";
import { Film, Link2, Plus, Trash2 } from "lucide-react";
import { type ContentValue } from "@/features/cms/model";
import { missionSections } from "@/features/cms/mission-content";
import {
  missionVideoSections,
  type MissionSections,
  type MissionSectionId,
  type MissionVideoEntry,
} from "@/features/cms/mission-videos";

export function MissionVideoFields({
  content,
  onChange,
  onChoose,
  initialSection = "orchard",
}: {
  content: ContentValue;
  onChange: (sections: MissionSections) => void;
  onChoose: (id: string) => void;
  initialSection?: MissionSectionId;
}) {
  const [section, setSection] = useState<MissionSectionId>(initialSection),
    sections = missionSections(content),
    cards = sections[section],
    definition = missionVideoSections.find((s) => s.id === section)!;
  function update(id: string, patch: Partial<MissionVideoEntry>) {
    onChange({
      ...sections,
      [section]: cards.map((card) => (card.id === id ? { ...card, ...patch } : card)),
    });
  }
  function add() {
    const prefixMap: Record<MissionSectionId, string> = {
      orchard: "ZB-OI",
      process: "ZB-IP",
      demos: "ZB-DM",
    };
    const prefix = prefixMap[section];
    const existing = cards
      .map((c) => parseInt(c.id.replace(prefix + "-", ""), 10))
      .filter((n) => !isNaN(n));
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
    const id = `${prefix}-${String(next).padStart(2, "0")}`;
    onChange({ ...sections, [section]: [...cards, { id, title: "New video", description: "" }] });
    requestAnimationFrame(() => document.getElementById(id + "-title")?.focus());
  }
  function remove(id: string) {
    if (
      cards.length <= 1 ||
      !window.confirm(
        "Remove this card from the draft? Its uploaded video stays in the media library.",
      )
    )
      return;
    onChange({ ...sections, [section]: cards.filter((card) => card.id !== id) });
  }
  return (
    <div className="admin-mission-videos">
      <div className="admin-mission-section-nav" role="group" aria-label="Mission sections">
        {missionVideoSections.map((item) => (
          <button
            key={item.id}
            type="button"
            className="admin-btn admin-outline"
            aria-pressed={section === item.id}
            onClick={() => setSection(item.id)}
          >
            {item.label}
            <small>{sections[item.id].length}</small>
          </button>
        ))}
      </div>
      <div className="admin-mission-section-heading">
        <div className="admin-tab-intro">
          <h2>{definition.label}</h2>
          <p>
            Manage this section’s cards. Two cards are provided to start; add more whenever you need
            them.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-primary"
          disabled={cards.length >= 24}
          onClick={add}
        >
          <Plus size={16} /> Add video
        </button>
      </div>
      <div className="admin-mission-video-grid">
        {cards.map((card, index) => (
          <article key={card.id} className="admin-mission-video-card" data-video-editor={card.id}>
            <div className="admin-mission-card-heading">
              <p className="admin-eyebrow admin-card-reference">{card.id}</p>
              <button
                type="button"
                className="admin-text-button"
                disabled={cards.length <= 1}
                onClick={() => remove(card.id)}
                aria-label={"Remove card " + (index + 1)}
              >
                <Trash2 size={14} /> Remove card
              </button>
            </div>
            <label>
              Video title
              <input
                id={card.id + "-title"}
                maxLength={200}
                value={card.title}
                onChange={(event) => update(card.id, { title: event.target.value })}
              />
            </label>
            <label>
              Description
              <textarea
                aria-label="Description"
                rows={4}
                maxLength={12000}
                value={card.description}
                onChange={(event) => update(card.id, { description: event.target.value })}
              />
            </label>
            <label>
              <span>
                <Link2 size={15} /> YouTube video link
              </span>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=…"
                value={card.video?.kind === "youtube" ? card.video.src : ""}
                onChange={(event) =>
                  update(card.id, {
                    video: event.target.value.trim()
                      ? { kind: "youtube", src: event.target.value.trim() }
                      : undefined,
                  })
                }
              />
            </label>
            {card.video?.kind === "cloudinary" && (
              <p className="admin-field-meta">Cloudinary video selected</p>
            )}
            <div className="admin-slot-actions">
              <button
                type="button"
                className="admin-btn admin-outline"
                onClick={() => onChoose(card.id)}
              >
                <Film size={15} /> Choose or upload video
              </button>
              <button
                type="button"
                className="admin-text-button"
                disabled={!card.video}
                onClick={() => update(card.id, { video: undefined })}
              >
                Remove video
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
