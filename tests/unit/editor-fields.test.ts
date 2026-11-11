import { describe, expect, it } from "vitest";
import {
  editorDefinition,
  lockedCopyUnchanged,
  missionHeroCopy,
} from "../../features/cms/editor-fields";
import catalog from "../../features/cms/catalog.generated.json";
import { contentPages, textKey } from "../../features/cms/model";
describe("Intentional page editing", () => {
  it("limits Mission general copy to exactly the two requested hero fields", () => {
    const definition = editorDefinition("mission", catalog.mission);
    expect(definition.fields.map((field) => field.value)).toEqual(
      missionHeroCopy.map((field) => field.value),
    );
    expect(definition.fields.map((field) => field.label)).toEqual(["Hero heading", "Introduction"]);
    expect(definition.images).toEqual(catalog.mission.images);
  });
  it("hides technical controls and sequence numbers on all page editors while retaining statistics", () => {
    for (const [page] of contentPages) {
      const fields = editorDefinition(page, catalog[page as keyof typeof catalog]).fields;
      expect(fields.some((field) => /^(?:0\d|→|Pause|Watch|ZB-OI-01)$/.test(field.value))).toBe(
        false,
      );
      expect(
        new Set(
          fields.map((field) =>
            field.value.replace(/[{}]/g, "").replace(/\s+/g, " ").trim().toLowerCase(),
          ),
        ).size,
      ).toBe(fields.length);
    }
    expect(
      editorDefinition("home", catalog.home).fields.some(
        (field) => field.numeric && field.value === "18",
      ),
    ).toBe(true);
    for (const field of catalog.about.fields.filter((field) => /^\d{4}$/.test(field.value)))
      expect(
        editorDefinition("about", catalog.about).fields.some(
          (visible) => visible.key === field.key,
        ),
      ).toBe(true);
  });
  it("preserves hidden manual edits and blocks adding, changing or deleting them through ordinary saves", () => {
    const editable = new Set([textKey(missionHeroCopy[0].value)]),
      existing = { locked: "A manual edit" };
    expect(
      lockedCopyUnchanged({ ...existing, [[...editable][0]]: "A new heading" }, existing, editable),
    ).toBe(true);
    expect(lockedCopyUnchanged({ locked: "Changed" }, existing, editable)).toBe(false);
    expect(lockedCopyUnchanged({}, existing, editable)).toBe(false);
    expect(lockedCopyUnchanged({ locked: "Injected" }, {}, editable)).toBe(false);
  });
});
