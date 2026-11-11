import { describe, expect, it } from "vitest";
import { defaultPartners, isPartnerEntries, partnerEntries } from "../../features/cms/partners";
import { emptyContent, placedContent, textKey } from "../../features/cms/model";
import { isVisualContent } from "../../features/admin/visual-protocol";
describe("managed partner strip", () => {
  it("keeps existing wordmarks and legacy edits until the list is deliberately managed", () => {
    const content = emptyContent();
    content.text[textKey("CIV")] = "Edited CIV";
    expect(partnerEntries(content)[0].name).toBe("Edited CIV");
    expect(partnerEntries(content)).toHaveLength(5);
    expect(partnerEntries({ ...content, partners: [] })).toEqual([]);
    expect(partnerEntries({ ...content, partners: [defaultPartners[1]] })).toHaveLength(1);
  });
  it("places partners only on the intended page, including an intentionally empty list", () => {
    const content = { ...emptyContent(), partners: [] };
    expect(placedContent("partnerships", content).partners).toEqual([]);
    expect(placedContent("home", content).partners).toBeUndefined();
  });
  it("accepts the text presets, approved fonts, and registered-image shape", () => {
    expect(isPartnerEntries(defaultPartners)).toBe(true);
    expect(
      isPartnerEntries([
        {
          id: "new",
          name: "Partner",
          mode: "image",
          font: "sans",
          image: {
            src: "https://res.cloudinary.com/test/image/upload/logo.png",
            alt: "Partner",
            publicId: "zeebaran/test/logo",
            resourceType: "image",
          },
        },
      ]),
    ).toBe(true);
  });
  it("bounds the payload and rejects duplicate ids, invalid fonts, video logos and unsafe extra fields", () => {
    const p = defaultPartners[0];
    for (const value of [
      [...Array.from({ length: 41 }, (_, i) => ({ ...p, id: String(i) }))],
      [p, p],
      [{ ...p, name: " " }],
      [{ ...p, name: "a".repeat(121) }],
      [{ ...p, font: "url(external-font)" }],
      [{ ...p, mode: "script" }],
      [{ ...p, preset: "untrusted" }],
      [{ ...p, html: "<script>" }],
      [{ ...p, mode: "image" }],
      [{ ...p, mode: "image", image: { src: "x", alt: "", resourceType: "video", publicId: "x" } }],
    ])
      expect(isPartnerEntries(value)).toBe(false);
  });
  it("allows logo-only partners and incomplete local previews without weakening publish validation", () => {
    const logo = {
      id: "logo-only",
      name: "",
      mode: "image",
      font: "sans",
      image: {
        src: "https://res.cloudinary.com/test/image/upload/logo.png",
        alt: "A university",
        publicId: "zeebaran/test/logo",
        resourceType: "image",
      },
    };
    expect(isPartnerEntries([logo])).toBe(true);
    expect(isPartnerEntries([{ ...logo, image: undefined }])).toBe(false);
    expect(isVisualContent({ ...emptyContent(), partners: [{ ...logo, image: undefined }] })).toBe(
      true,
    );
    expect(
      isVisualContent({ ...emptyContent(), partners: [{ ...defaultPartners[0], name: "" }] }),
    ).toBe(true);
    expect(isPartnerEntries([{ ...defaultPartners[0], name: "" }])).toBe(false);
  });
  it("applies the same payload boundary to the private visual preview", () => {
    expect(isVisualContent({ ...emptyContent(), partners: defaultPartners })).toBe(true);
    expect(
      isVisualContent({ ...emptyContent(), partners: [{ ...defaultPartners[0], font: "bad" }] }),
    ).toBe(false);
  });
});
