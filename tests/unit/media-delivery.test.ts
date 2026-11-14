import { existsSync } from "node:fs";
import { socialImage } from "../../features/media/social";
import { createRequire } from "node:module";
import config from "../../next.config";
import { describe, it, expect } from "vitest";
import {
  authoredAssets,
  assetId,
  originalSource,
  imageSource,
  imageDelivery,
} from "../../features/media/delivery";
import { imageKey } from "../../features/cms/model";
import { isMediaCategory, categoryForEditor } from "../../features/media/categories";
describe("central media delivery", () => {
  it("resolves every authored image to the verified account and preserves CMS keys", () => {
    expect(Object.keys(authoredAssets).length).toBeGreaterThanOrEqual(49);
    for (const [id, asset] of Object.entries(authoredAssets)) {
      expect(assetId(asset.legacySource)).toBe(id);
      expect(originalSource(id)).toBe(asset.legacySource);
      expect(imageSource(id)).toBe(asset.src);
      expect(imageSource(asset.legacySource)).toBe(asset.src);
      expect(imageKey(id)).toBe(imageKey(asset.legacySource));
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
    }
  });
  it("rejects unknown local assets, arbitrary hosts, credential URLs and other accounts", () => {
    for (const src of [
      "/images/unknown.webp",
      "asset:unknown",
      "data:image/svg+xml,test",
      "javascript:bad",
      "https://example.com/image.jpg",
      "https://res.cloudinary.com/other/image/upload/photo.jpg",
      "https://user:pass@res.cloudinary.com/jfiuaflr/image/upload/photo.jpg",
    ])
      expect(imageSource(src)).toBe("");
  });
  it("uses bounded CDN widths, format negotiation, quality and original crop ratio", () => {
    const src = Object.values(authoredAssets)[0].src;
    expect(imageDelivery(src, 480)).toContain("/image/upload/f_auto,q_auto,c_limit,w_480/");
    expect(imageDelivery(src, 99999)).toContain("w_3840/");
    expect(imageDelivery(src, -1)).toContain("w_32/");
    expect(imageDelivery(src, NaN)).toContain("w_960/");
    expect(imageDelivery(src, 480, 999)).toContain("q_100");
    expect(imageDelivery("/missing.png", 480)).toBe("");
  });
  it("matches URL-encoded historical image paths in Next's redirect matcher", async () => {
    const { getPathMatch } = createRequire(import.meta.url)(
      "next/dist/shared/lib/router/utils/path-match",
    );
    const redirects = await config.redirects!();
    for (const asset of Object.values(authoredAssets)) {
      const path = encodeURI(asset.legacySource);
      const redirect = redirects.find((item) => item.source === path);
      expect(redirect?.destination).toBe(asset.src);
      expect(redirect?.permanent).toBe(true);
      expect(getPathMatch(redirect!.source)(path)).not.toBe(false);
    }
  });
  it("keeps OG and brand identity local and outside photographic migrations", async () => {
    expect(socialImage.url).toBe("/images/og-share.jpg");
    expect(socialImage.type).toBe("image/jpeg");
    expect(existsSync(new URL("../../public/images/og-share.jpg", import.meta.url))).toBe(true);
    expect(existsSync(new URL("../../public/images/OG.webp", import.meta.url))).toBe(true);
    expect(
      Object.values(authoredAssets).every((asset) => asset.legacySource.startsWith("/images/")),
    ).toBe(true);
    expect(
      (await config.redirects!()).some((route) => /opengraph|\/brand\//.test(route.source)),
    ).toBe(false);
  });
  it("shares the fixed folder taxonomy with the editor", () => {
    expect(isMediaCategory("../../private")).toBe(false);
    expect(categoryForEditor("/admin/pages/partnerships")).toBe("partners");
    expect(categoryForEditor("/admin/rootstocks/m9")).toBe("rootstocks");
  });
});
