"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, ArrowUp, ArrowDown, Images, X, Undo2, ChevronDown } from "lucide-react";
import { Dialog } from "@/features/admin/Dialog";
import type { ContentValue } from "@/features/cms/model";
import { TeamPortrait } from "./TeamPortrait";
import { teamMembers, newMember, type TeamMember } from "./model";
import { teamIssue } from "./schema";
import styles from "./team-fields.module.css";
const MediaLibrary = dynamic(() =>
  import("@/features/admin/MediaLibrary").then((m) => m.MediaLibrary),
);
export function TeamFields({
  content,
  onChange,
}: {
  content: ContentValue;
  onChange: (members: TeamMember[]) => void;
}) {
  const members = teamMembers(content),
    [picker, setPicker] = useState<string | null>(null),
    [removed, setRemoved] = useState<{ member: TeamMember; index: number } | null>(null);
  function update(id: string, patch: Partial<TeamMember>) {
    onChange(members.map((member) => (member.id === id ? { ...member, ...patch } : member)));
  }
  function move(index: number, direction: number) {
    const next = [...members];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }
  function add() {
    const id = "member-" + crypto.randomUUID();
    onChange([...members, newMember(id)]);
    requestAnimationFrame(() => {
      const card = document.getElementById(id);
      if (card instanceof HTMLDetailsElement) card.open = true;
      document.getElementById(id + "-name")?.focus();
    });
  }
  return (
    <div className={styles.editor}>
      <div className={styles.heading}>
        <div>
          <h2>The people behind Zeebaran.</h2>
          <p>
            Edit a profile, replace a portrait or adjust the order. Changes go live when you publish
            About.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-primary"
          onClick={add}
          disabled={members.length >= 30}
        >
          <Plus size={15} />
          Add member
        </button>
      </div>
      {removed && (
        <div className={styles.undo} role="status">
          {removed.member.name} removed from this draft.
          <button
            type="button"
            className="admin-text-button"
            disabled={members.length >= 30}
            onClick={() => {
              const next = [...members];
              next.splice(Math.min(removed.index, next.length), 0, removed.member);
              onChange(next);
              setRemoved(null);
            }}
          >
            <Undo2 size={14} />
            Undo
          </button>
        </div>
      )}
      <div className={styles.list}>
        {members.map((member, index) => (
          <details
            key={member.id}
            id={member.id}
            className={styles.member}
            data-team-editor={member.id}
          >
            <summary>
              <div className={styles.thumb}>
                <TeamPortrait member={member} sizes="64px" />
              </div>
              <div className={styles.identity}>
                <strong>{member.name || "New team member"}</strong>
                <span>{member.role || "Add designation"}</span>
              </div>
              <span className={styles.status}>{member.enabled ? "Visible" : "Hidden"}</span>
              <ChevronDown size={16} className={styles.chevron} />
            </summary>
            <div className={styles.body}>
              <div className={styles.tools}>
                <label className={styles.visibility}>
                  <input
                    type="checkbox"
                    checked={member.enabled}
                    onChange={(e) => update(member.id, { enabled: e.target.checked })}
                  />
                  Show this member
                </label>
                <div>
                  <button
                    type="button"
                    className="admin-icon-button"
                    aria-label={`Move ${member.name} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-button"
                    aria-label={`Move ${member.name} down`}
                    disabled={index === members.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    className="admin-text-button"
                    aria-label={`Remove ${member.name}`}
                    onClick={() => {
                      setRemoved({ member, index });
                      onChange(members.filter((m) => m.id !== member.id));
                    }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
              <div className={styles.photoActions}>
                <button
                  type="button"
                  className="admin-btn admin-outline"
                  onClick={() => setPicker(member.id)}
                >
                  <Images size={15} />
                  {member.image ? "Change portrait" : "Choose or upload portrait"}
                </button>
                {member.image && (
                  <button
                    type="button"
                    className="admin-text-button"
                    onClick={() => {
                      const { image: _image, ...rest } = member;
                      void _image;
                      onChange(members.map((m) => (m.id === member.id ? rest : m)));
                    }}
                  >
                    Use placeholder
                  </button>
                )}
              </div>
              <div className={styles.grid}>
                {(
                  [
                    ["name", "Name", 120],
                    ["role", "Designation", 160],
                    ["organisation", "Company", 160],
                    ["phone", "Phone number (optional)", 40],
                  ] as const
                ).map(([key, label, max]) => (
                  <label key={key} htmlFor={`${member.id}-${key}`}>
                    {label}
                    <input
                      id={`${member.id}-${key}`}
                      type={key === "phone" ? "tel" : "text"}
                      value={member[key]}
                      maxLength={max}
                      onChange={(e) => update(member.id, { [key]: e.target.value })}
                    />
                  </label>
                ))}
              </div>
              <label htmlFor={`${member.id}-summary`}>
                Short introduction
                <textarea
                  id={`${member.id}-summary`}
                  aria-label="Short introduction"
                  rows={3}
                  maxLength={600}
                  value={member.summary}
                  onChange={(e) => update(member.id, { summary: e.target.value })}
                />
              </label>
              <label htmlFor={`${member.id}-biography`}>
                Full biography
                <textarea
                  id={`${member.id}-biography`}
                  aria-label="Full biography"
                  rows={8}
                  maxLength={12000}
                  value={member.biography}
                  onChange={(e) => update(member.id, { biography: e.target.value })}
                />
              </label>
              <label htmlFor={`${member.id}-specialisations`}>
                Expertise &amp; responsibilities (one per line)
                <textarea
                  id={`${member.id}-specialisations`}
                  aria-label="Expertise & responsibilities"
                  rows={5}
                  value={member.specialisations.join("\n")}
                  maxLength={4000}
                  onChange={(e) =>
                    update(member.id, { specialisations: e.target.value.split("\n") })
                  }
                />
              </label>
              <div className={styles.grid}>
                {(
                  [
                    ["philosophy", "Leadership philosophy (optional)"],
                    ["vision", "Company vision (optional)"],
                  ] as const
                ).map(([key, label]) => (
                  <label htmlFor={`${member.id}-${key}`} key={key}>
                    {label}
                    <textarea
                      id={`${member.id}-${key}`}
                      aria-label={label}
                      rows={3}
                      maxLength={500}
                      value={member[key]}
                      onChange={(e) => update(member.id, { [key]: e.target.value })}
                    />
                  </label>
                ))}
              </div>
              {teamIssue([member]) && <p className={styles.validation}>{teamIssue([member])}</p>}
            </div>
          </details>
        ))}
      </div>
      {!members.length && (
        <p className="admin-empty">
          No team profiles in this draft. Add a member to show the team section.
        </p>
      )}
      <p className={styles.note}>
        Removing a profile or choosing a placeholder keeps its portrait safely in the media library.
      </p>
      {picker && (
        <Dialog
          label="Choose a team portrait"
          className="admin-media-dialog"
          onClose={() => setPicker(null)}
        >
          <div className="admin-dialog-heading">
            <h2>Choose a team portrait.</h2>
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Close portrait library"
              onClick={() => setPicker(null)}
            >
              <X />
            </button>
          </div>
          <MediaLibrary
            category="team"
            kind="image"
            onSelect={(m) => {
              const member = members.find((item) => item.id === picker);
              update(picker, {
                image: {
                  src: m.src,
                  alt: member?.name || m.alt,
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
