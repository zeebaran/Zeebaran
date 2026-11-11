import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { contentPages, textKey, imageKey } from "../../features/cms/model";

vi.mock("server-only", () => ({}));
const jar = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => jar }));
vi.mock("../../lib/firebase-admin", () => ({
  firebase: () => {
    throw Error("Unit tests must never connect to Firebase");
  },
}));

import {
  allowedAdmin,
  csrfGuard,
  sameOrigin,
  secureCookie,
} from "../../features/admin/server/security";
import { cloudConfig, signUpload } from "../../features/admin/server/cloudinary";
import { youtubeUrl } from "../../features/cms/server/store";

const origin = "https://zeebaran.example";
const request = (headers: Record<string, string> = {}) =>
  new Request(origin + "/api/admin/content/home", {
    headers: { host: "zeebaran.example", ...headers },
  });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("administration access", () => {
  beforeEach(() => vi.stubEnv("ADMIN_EMAILS", "zeebaran00@gmail.com"));
  it("requires both an approved email and Firebase verification", () => {
    expect(allowedAdmin({ email: "ZEEBARAN00@gmail.com", email_verified: true })).toBe(true);
    expect(allowedAdmin({ email: "zeebaran00@gmail.com", email_verified: false })).toBe(false);
    expect(allowedAdmin({ email: "outsider@example.test", email_verified: true })).toBe(false);
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(allowedAdmin({ email: "zeebaran00@gmail.com", email_verified: true })).toBe(false);
  });
  it("requires the actual origin and rejects cross-site or missing origins", () => {
    expect(() => sameOrigin(request({ origin }))).not.toThrow();
    expect(() => sameOrigin(request({ origin: "https://other.example" }))).toThrow();
    expect(() => sameOrigin(request())).toThrow();
  });
  it("rejects missing, incorrect and non-ASCII CSRF tokens", async () => {
    jar.get.mockReturnValue({ value: "a".repeat(64) });
    await expect(
      csrfGuard(request({ origin, "x-csrf-token": "a".repeat(64) })),
    ).resolves.toBeUndefined();
    for (const value of ["", "b".repeat(64), "é".repeat(64)])
      await expect(csrfGuard(request({ origin, "x-csrf-token": value }))).rejects.toMatchObject({
        status: 403,
      });
  });
  it("keeps deployment cookies secure and permits only loopback development HTTP", () => {
    expect(secureCookie(request())).toBe(true);
    expect(secureCookie(new Request("http://192.168.1.8"))).toBe(true);
    expect(secureCookie(new Request("http://127.0.0.1"))).toBe(false);
    expect(secureCookie(new Request("http://localhost"))).toBe(false);
  });
});

describe("media boundaries", () => {
  it("fails closed when the private Cloudinary secret is missing", () => {
    vi.stubEnv("CLOUDINARY_API_SECRET", "");
    expect(() => cloudConfig()).toThrow("Cloudinary is not configured");
  });
  it("signs sorted upload constraints without returning the private secret", () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "fixture-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "fixture-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "fixture-secret");
    const signed = signUpload("image", "fixture-owner");
    const parameters = {
      allowed_formats: signed.allowed_formats,
      asset_folder: signed.asset_folder,
      overwrite: signed.overwrite,
      public_id: signed.public_id,
      timestamp: signed.timestamp,
    };
    const payload = Object.entries(parameters)
      .map(([k, v]) => k + "=" + v)
      .join("&");
    expect(signed.signature).toBe(
      createHash("sha256")
        .update(payload + "fixture-secret")
        .digest("hex"),
    );
    expect(signed.public_id).toMatch(/^zeebaran\/fixture-owner\//);
    expect(signed.overwrite).toBe("false");
    expect(signed.asset_folder).toBe("zeebaran/galleries/field-work");
    expect(JSON.stringify(signed)).not.toContain("fixture-secret");
  });
  it("normalizes supported YouTube links and rejects arbitrary embeds", () => {
    expect(youtubeUrl("https://youtu.be/abcdefghijk")).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk",
    );
    expect(youtubeUrl("https://www.youtube.com/watch?v=abcdefghijk&t=12")).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk",
    );
    for (const url of [
      "javascript:alert(1)",
      "https://youtube.com.evil.example/watch?v=abcdefghijk",
      "https://example.test/embed/abcdefghijk",
      "https://youtu.be/short",
    ])
      expect(youtubeUrl(url)).toBeNull();
  });
});

describe("editor catalog integrity", () => {
  it("covers every page and keeps keys tied to the authored default", () => {
    const catalog = JSON.parse(
      readFileSync(
        fileURLToPath(new URL("../../features/cms/catalog.generated.json", import.meta.url)),
        "utf8",
      ),
    );
    for (const [page] of contentPages) {
      expect(catalog[page], page).toBeDefined();
      const fields = catalog[page].fields as { key: string; value: string }[];
      const images = catalog[page].images as { key: string; src: string }[];
      expect(fields.length, page).toBeGreaterThan(0);
      expect(new Set(fields.map((f) => f.key)).size, page).toBe(fields.length);
      expect(new Set(images.map((f) => f.key)).size, page).toBe(images.length);
      for (const f of fields) expect(f.key).toBe(textKey(f.value));
      for (const f of images) expect(f.key).toBe(imageKey(f.src));
    }
  });
});
