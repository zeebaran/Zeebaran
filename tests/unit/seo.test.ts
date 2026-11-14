import { afterEach, expect, it, vi } from "vitest";
import { pageMeta } from "../../lib/seo";
import { socialImage } from "../../features/media/social";

vi.mock("server-only", () => ({}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("uses one concise home title consistently across browser and social metadata", () => {
  const meta = pageMeta("Himalayan Horticulture & Orchard Infrastructure", "Description", "/");
  const title = "Himalayan Horticulture & Orchard Infrastructure | Zeebaran";
  expect(title.length).toBeLessThanOrEqual(60);
  expect(meta.title).toEqual({ absolute: title });
  expect(meta.openGraph).toMatchObject({ title, images: [socialImage] });
  expect(meta.twitter).toMatchObject({ title, site: "@zeebaran", images: [socialImage.url] });
});

it("defaults metadata to the current Vercel site rather than the unmigrated domain", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
  expect((await import("../../lib/env")).SITE_URL).toBe("https://zeebaran.vercel.app");
});

it("uses the stable production alias on Vercel, not its protected preview URL", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "stable.vercel.app");
  vi.stubEnv("VERCEL_URL", "private-deployment.vercel.app");
  expect((await import("../../lib/env")).SITE_URL).toBe("https://stable.vercel.app");
});

it("allows an explicit custom origin after the domain cutover", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.zeebaran.com/");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "stable.vercel.app");
  expect((await import("../../lib/env")).SITE_URL).toBe("https://www.zeebaran.com");
});
