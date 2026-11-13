import { governanceEditableCopy } from "@/lib/governance-content";
import { principles } from "@/lib/content";
import type { FieldDefinition, PageDefinition } from "./model";
import { SITE } from "@/lib/site";
import { contactChannels } from "@/features/site/model";
const sharedContactCopy = new Set([
  SITE.email,
  SITE.phone,
  ...contactChannels.map((entry) => entry[2]),
  ...SITE.addresses.flatMap((office) => [office.label, office.lines.join(", "), office.note]),
]);

export const missionHeroCopy = [
  { value: "Work that speaks\n{for itself.}", label: "Hero heading" },
  {
    value:
      "Every claim Zeebaran makes is backed by work you can see. Below is a live record of orchard installations, transformation processes, grower testimonials, and demonstrations — documented as the work happens.",
    label: "Introduction",
  },
] as const;
const controls = new Set([
  "watch",
  "play",
  "pause",
  "resume",
  "close",
  "next",
  "previous",
  "video coming soon",
  "video unavailable",
  "scroll to explore",
  "next slide",
  "previous slide",
  "next photograph",
  "previous photograph",
  "close gallery",
  "pause slideshow",
  "play slideshow",
]);
const visibleText = (value: string) =>
  value.replace(/[{}]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

/** The capture catalog remains a compatibility archive; the editor exposes only useful content. */
export function editorDefinition(
  page: string,
  definition: PageDefinition,
  mode: "fields" | "visual" = "fields",
): PageDefinition {
  if (page === "mission" && mode === "fields")
    return {
      ...definition,
      fields: missionHeroCopy
        .map((copy) => ({
          ...definition.fields.find((field) => field.value === copy.value)!,
          label: copy.label,
        }))
        .filter((field) => !!field.key),
    };
  // Retain legacy keys in the validation catalog, but expose only copy still rendered on this page.
  const governanceCopy =
    page === "governance"
      ? new Set<string>([
          "Governance",
          ...governanceEditableCopy,
          ...principles.flatMap((p) => [p.t, p.d]),
        ])
      : null;
  const fields = new Map<string, FieldDefinition>();
  for (const field of definition.fields) {
    if (governanceCopy && !governanceCopy.has(field.value)) continue;
    const value = field.value.trim(),
      normalized = visibleText(value);
    if (
      !/[\p{L}\p{N}]/u.test(value) ||
      controls.has(normalized) ||
      ((page === "site" || page === "contact") && sharedContactCopy.has(value)) ||
      /^ZB-(?:OI|IP|DM|CR)-\d+$/i.test(value) ||
      (page === "mission" && /^\d+$/.test(value)) ||
      (!field.numeric && (/^0\d$/.test(value) || (page === "products" && /^\d+$/.test(value))))
    )
      continue;
    const existing = fields.get(normalized);
    if (!existing || (value.includes("{") && !existing.value.includes("{")))
      fields.set(normalized, field);
  }
  return { ...definition, fields: [...fields.values()] };
}

/** Hidden legacy overrides may remain, but normal edits cannot add/change/remove locked copy. */
export function lockedCopyUnchanged(
  incoming: Record<string, string>,
  existing: Record<string, string>,
  editable: ReadonlySet<string>,
) {
  return [...new Set([...Object.keys(incoming), ...Object.keys(existing)])].every(
    (key) => editable.has(key) || incoming[key] === existing[key],
  );
}
