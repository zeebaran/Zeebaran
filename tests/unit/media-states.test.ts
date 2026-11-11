import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { ImagePlaceholder } from "../../features/media/ImagePlaceholder";
import { AssetImage } from "../../features/media/AssetImage";
import { usableJpeg } from "../../features/media/jpeg";
vi.mock("next/image", () => ({ default: () => null }));
function jpeg(width: number, height: number) {
  return Uint8Array.from([
    255,
    216,
    255,
    224,
    0,
    2,
    255,
    192,
    0,
    8,
    8,
    height >> 8,
    height & 255,
    width >> 8,
    width & 255,
    1,
  ]);
}
describe("media fallback states", () => {
  it("renders a file-free accessible icon in a fixed fill frame", () => {
    const html = renderToStaticMarkup(
      createElement(ImagePlaceholder, { fill: true, alt: "Orchard photograph" }),
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Orchard photograph"');
    expect(html).toContain("position:absolute");
    expect(html).not.toMatch(/<img|src=/);
  });
  it("keeps intrinsic ratios without forcing oversized dimensions on responsive thumbnails", () => {
    const html = renderToStaticMarkup(
      createElement(ImagePlaceholder, { width: 1536, height: 1024 }),
    );
    expect(html).toContain("aspect-ratio:1536 / 1024");
    expect(html).not.toMatch(/(?:style="|;)width:1536px/);
    expect(html).not.toContain("height:1024px");
    expect(html).toContain('aria-hidden="true"');
  });
  it("preserves CMS editing markers for missing sources", () => {
    const html = renderToStaticMarkup(
      createElement(AssetImage, {
        src: "asset:unknown",
        alt: "Missing orchard",
        fill: true,
        "data-cms-image": "fixture-slot",
      } as React.ComponentProps<typeof AssetImage>),
    );
    expect(html).toContain('data-cms-image="fixture-slot"');
    expect(html).toContain('data-media-placeholder="missing"');
  });
  it("accepts real JPEG frame dimensions, rejects missing thumbnails and malformed input", () => {
    expect(usableJpeg(jpeg(1280, 720))).toBe(true);
    expect(usableJpeg(jpeg(480, 360))).toBe(true);
    expect(usableJpeg(jpeg(120, 90))).toBe(false);
    expect(usableJpeg(new Uint8Array())).toBe(false);
    expect(usableJpeg(Uint8Array.from([255, 216, 255, 224, 255, 255]))).toBe(false);
    expect(usableJpeg(jpeg(480, 360).slice(0, 12))).toBe(false);
  });
});
