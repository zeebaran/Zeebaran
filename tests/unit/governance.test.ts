import { expect, it } from "vitest";
import { governanceEditableCopy } from "../../lib/governance-content";
import { catalog } from "../../features/cms/catalog";
import { editorDefinition } from "../../features/cms/editor-fields";
import { textKey } from "../../features/cms/model";
it("keeps the current Governance copy editable and legacy keys valid without stale editor fields", () => {
  const editable = editorDefinition("governance", catalog.governance).fields;
  for (const value of governanceEditableCopy) {
    expect(catalog.governance.fields.some((field) => field.key === textKey(value))).toBe(true);
    expect(editable.some((field) => field.key === textKey(value))).toBe(true);
  }
  expect(
    catalog.governance.fields.some(
      (field) => field.value === "Governed like it {intends to last.}",
    ),
  ).toBe(true);
  expect(editable.some((field) => field.value === "Governed like it {intends to last.}")).toBe(
    false,
  );
});
