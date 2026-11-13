import { describe, it, expect } from "vitest";
import {
  catalogSchema,
  slugSchema,
  publicationProblems,
  normalizeSearch,
} from "../../features/catalog/schema";
import { emptyCatalog, catalogHref } from "../../features/catalog/model";
describe("catalog data boundaries", () => {
  const draft = { ...emptyCatalog("variety"), slug: "an-authored-variety", name: "A variety" };
  it("allows incomplete private drafts but identifies publication requirements", () => {
    expect(catalogSchema.safeParse(draft).success).toBe(true);
    expect(publicationProblems(draft)).toHaveLength(4);
  });
  it.each(["../private", "UPPERCASE", "a/b", "compare", "rootstocks", "<script>", "a".repeat(81)])(
    "rejects unsafe or reserved slugs: %s",
    (slug) => expect(slugSchema.safeParse(slug).success).toBe(false),
  );
  it("keeps URLs stable and distinguishes rootstocks", () => {
    expect(catalogHref({ ...draft, kind: "rootstock" })).toBe(
      "/products/rootstocks/an-authored-variety",
    );
    expect(catalogHref(draft)).toBe("/products/an-authored-variety");
  });
  it("rejects unknown fields and client-controlled publication metadata", () => {
    expect(catalogSchema.safeParse({ ...draft, published: true }).success).toBe(false);
    expect(catalogSchema.safeParse({ ...draft, revision: 99 }).success).toBe(false);
  });
  it("bounds specifications, relationships, images and field sizes", () => {
    for (const change of [
      { intro: "a".repeat(12001) },
      { rootstockIds: Array.from({ length: 25 }, (_, i) => "r-" + i) },
      { images: Array.from({ length: 13 }, () => ({ src: "/image.webp", alt: "Image" })) },
      {
        specifications: Array.from({ length: 81 }, (_, i) => ({
          group: "G",
          label: "L" + i,
          value: "V",
        })),
      },
    ])
      expect(catalogSchema.safeParse({ ...draft, ...change }).success).toBe(false);
  });
  it("rejects duplicate links and ambiguous comparison rows", () => {
    expect(catalogSchema.safeParse({ ...draft, rootstockIds: ["m9", "m9"] }).success).toBe(false);
    expect(
      catalogSchema.safeParse({
        ...draft,
        specifications: [
          { group: "Soil", label: "pH", value: "6" },
          { group: "soil", label: "PH", value: "7" },
        ],
      }).success,
    ).toBe(false);
  });
  it("does not allow rootstock-to-rootstock relationships", () => {
    expect(
      catalogSchema.safeParse({ ...draft, kind: "rootstock", rootstockIds: ["m9"] }).success,
    ).toBe(false);
  });
  it("requires descriptive image alternatives", () => {
    expect(
      catalogSchema.safeParse({ ...draft, images: [{ src: "/image.webp", alt: " " }] }).success,
    ).toBe(false);
  });
  it("normalizes bounded prefix searches consistently", () => {
    expect(normalizeSearch("  Gála  ")).toBe("gala");
  });
  it("supports new kinds of characteristics without changing comparison code", () => {
    const d = {
      ...draft,
      specifications: [
        { group: "Field requirements", label: "Soil drainage", value: "Well drained" },
        { group: "Field requirements", label: "Chilling hours", value: "Owner-verified value" },
      ],
    };
    expect(catalogSchema.parse(d).specifications).toHaveLength(2);
  });
});
