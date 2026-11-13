import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
vi.mock("server-only", () => ({}));
import { authoredAssets } from "../../features/media/delivery";
import {
  mediaIdentity,
  mediaReferences,
  usesMedia,
  withoutMedia,
  isDefaultMedia,
} from "../../features/media/references";
import { destroyResource } from "../../features/admin/server/cloudinary";
import { verifyMediaReferences } from "../../features/media/server/registration";
const image = {
  publicId: "zeebaran/test/folder/photo",
  resourceType: "image" as const,
  src: "https://res.cloudinary.com/test/image/upload/v123/zeebaran/test/folder/photo.webp",
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("media reference safety", () => {
  it("recognizes transformed images and video poster dependencies", () => {
    expect(
      mediaIdentity(image.src.replace("upload/v123/", "upload/f_auto,q_auto,c_limit,w_960/v123/"))
        ?.publicId,
    ).toBe(image.publicId);
    expect(
      mediaIdentity(image.src.replace("/image/", "/video/").replace(".webp", ".jpg"))?.resourceType,
    ).toBe("video");
    expect(usesMedia({ retainedPublished: { images: [image] } }, image)).toBe(true);
    expect(
      usesMedia({ image: { ...image, src: image.src.replace("/photo", "/another") } }, image),
    ).toBe(false);
  });
  it("preserves revision text and removes only deleted file references", () => {
    const value = {
      text: { heading: "Keep my manual copy" },
      images: { first: image },
      team: [{ name: "Person", image }],
      partners: [{ name: "Partner", mode: "image", image }],
      missionSections: {
        orchard: [
          {
            title: "Film title",
            description: "Film details",
            video: { src: image.src, kind: "cloudinary" },
          },
        ],
      },
    };
    const cleaned = withoutMedia(value, image);
    expect(cleaned.text).toEqual(value.text);
    expect(cleaned.images).toEqual({});
    expect(cleaned.team).toEqual([{ name: "Person" }]);
    expect(cleaned.partners).toEqual([{ name: "Partner", mode: "text" }]);
    expect(cleaned.missionSections.orchard[0]).toEqual({
      title: "Film title",
      description: "Film details",
    });
    expect(mediaReferences(cleaned)).toEqual([]);
    expect(value.images.first).toEqual(image); // never mutate a loaded revision
  });
  it("protects original website fallback assets", () => {
    const authored = Object.values(authoredAssets)[0];
    expect(isDefaultMedia({ ...authored, resourceType: "image" })).toBe(true);
    expect(isDefaultMedia(image)).toBe(false);
  });
  it("checks shared registrations once within the writing transaction", async () => {
    const getAll = vi.fn(async () => [
      { exists: true, get: (key: string) => image[key as keyof typeof image] },
    ]);
    const db = { collection: () => ({ doc: (id: string) => id }) };
    await verifyMediaReferences(db as never, { getAll } as never, { images: [image, image] });
    expect(getAll).toHaveBeenCalledTimes(1);
    expect(getAll.mock.calls[0]).toHaveLength(1);
  });
  it.each(["deleting", "missing", "wrong-source"])("blocks %s registrations", async (state) => {
    const getAll = vi.fn(async () => [
      {
        exists: state !== "missing",
        get: (key: string) =>
          key === "state"
            ? state
            : key === "src" && state === "wrong-source"
              ? "wrong"
              : image[key as keyof typeof image],
      },
    ]);
    const db = { collection: () => ({ doc: (id: string) => id }) };
    await expect(
      verifyMediaReferences(db as never, { getAll } as never, { images: [image] }),
    ).rejects.toMatchObject({ status: 422 });
  });
  it("rejects forged public IDs even when the source URL is valid", async () => {
    await expect(
      verifyMediaReferences({} as never, {} as never, {
        image: { ...image, publicId: "different" },
      }),
    ).rejects.toMatchObject({ status: 422 });
  });
});
describe("Cloudinary permanent deletion", () => {
  beforeEach(() => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test");
    vi.stubEnv("CLOUDINARY_API_KEY", "public-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "fixture-secret");
  });
  it.each(["ok", "not found"])(
    "accepts the idempotent result %s with CDN invalidation",
    async (result) => {
      const fetch = vi.fn(async () => Response.json({ result }));
      vi.stubGlobal("fetch", fetch);
      await destroyResource(image.publicId, "image");
      const [url, request] = fetch.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe("https://api.cloudinary.com/v1_1/test/image/destroy");
      const body = request.body as URLSearchParams;
      expect(body.get("invalidate")).toBe("true");
      expect(body.get("public_id")).toBe(image.publicId);
      expect(body.get("signature")).toBe(
        createHash("sha256")
          .update(
            `invalidate=true&public_id=${image.publicId}&timestamp=${body.get("timestamp")}fixture-secret`,
          )
          .digest("hex"),
      );
      expect(body.has("api_secret")).toBe(false);
    },
  );
  it("does not treat provider errors as successful deletion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: { message: "Denied" } }, { status: 401 })),
    );
    await expect(destroyResource(image.publicId, "video")).rejects.toMatchObject({ status: 502 });
  });
});
