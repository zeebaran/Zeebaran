"use client";
import type { ContentValue, FieldDefinition } from "@/features/cms/model";

export function MissionHeroFields({
  fields,
  content,
  onText,
}: {
  fields: FieldDefinition[];
  content: ContentValue;
  onText: (key: string, value: string, fallback: string) => void;
}) {
  return (
    <section className="admin-mission-hero-copy" aria-label="Mission page text">
      {fields.map((field, index) => {
        const value = content.text[field.key] ?? field.value;
        return (
          <label key={field.key} className="admin-copy-field">
            <span>{field.label}</span>
            <textarea
              aria-label={field.label}
              rows={index === 0 ? 2 : 5}
              maxLength={12000}
              value={index === 0 ? value.replace(/[{}]/g, "") : value}
              onChange={(event) => {
                const plain = event.target.value;
                const lines = plain.replace(/[{}]/g, "").split("\n");
                const next =
                  index === 0 && lines.length > 1
                    ? lines.slice(0, -1).join("\n") + "\n{" + lines.at(-1) + "}"
                    : plain;
                onText(field.key, next, field.value);
              }}
            />
          </label>
        );
      })}
    </section>
  );
}
