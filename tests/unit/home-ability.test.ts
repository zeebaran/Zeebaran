import { expect, it } from "vitest";
import { catalog } from "../../features/cms/catalog";
import { textKey } from "../../features/cms/model";
import { homeAbility } from "../../lib/home-ability";
it("registers each Home selection's copy in the existing CMS without duplicate fields", () => {
  for (const item of homeAbility)
    for (const copy of [item.title, ...item.paragraphs, item.quote])
      expect(catalog.home.fields.filter((field) => field.key === textKey(copy))).toHaveLength(1);
});
