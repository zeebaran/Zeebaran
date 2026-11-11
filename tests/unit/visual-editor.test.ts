import { describe, it, expect } from "vitest";
import { editorDefinition } from "../../features/cms/editor-fields";
import generated from "../../features/cms/catalog.generated.json";
import {
  isVisualMessage,
  isVisualContent,
  visualChannel,
} from "../../features/admin/visual-protocol";
describe("Visual page editing boundaries", () => {
  it("rejects malformed or excessive preview updates", () => {
    expect(isVisualContent({ text: { heading: "A page" }, images: {} })).toBe(true);
    for (const value of [
      null,
      { text: [], images: {} },
      { text: { heading: 42 }, images: {} },
      { text: {}, images: { photo: { src: 42, alt: "Image" } } },
      { text: {}, images: {}, missionSections: { demos: "bad" } },
      { text: { heading: "a".repeat(12001) }, images: {} },
    ])
      expect(isVisualContent(value)).toBe(false);
  });
  it("makes meaningful Mission page copy available visually while preserving the compact fields view", () => {
    expect(editorDefinition("mission", generated.mission).fields).toHaveLength(2);
    const fields = editorDefinition("mission", generated.mission, "visual").fields;
    expect(fields.some((field) => field.value === "Our Mission · In The Field")).toBe(true);
    expect(
      fields.some(
        (field) =>
          field.value ===
          "Every installation is filmed from soil preparation through to canopy close, creating a permanent record of the work and the results.",
      ),
    ).toBe(true);
    expect(fields.some((field) => field.value === "ZB-OI-01")).toBe(false);
  });
  it("requires the exact protocol namespace, page and message type", () => {
    expect(isVisualMessage({ channel: visualChannel, page: "home", type: "sync" })).toBe(true);
    for (const value of [
      null,
      "sync",
      {},
      { channel: "other", page: "home", type: "sync" },
      { channel: visualChannel, page: 1, type: "sync" },
      { channel: visualChannel, page: "home", type: 1 },
    ])
      expect(isVisualMessage(value)).toBe(false);
  });
});
