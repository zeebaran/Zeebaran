import { afterEach, describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
function jpeg(width: number, height: number) {
  return Uint8Array.from([
    255,
    216,
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
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe("video thumbnail import", () => {
  it("skips unavailable 120px previews before importing the standard thumbnail once", async () => {
    vi.stubEnv("FIRESTORE_EMULATOR_HOST", "");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "fixture-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "fixture-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "fixture-secret");
    const calls: string[] = [];
    const fetchMock = vi.fn(async (input: string, options?: RequestInit) => {
      calls.push(input);
      if (input.endsWith("maxresdefault.jpg")) return new Response(jpeg(120, 90));
      if (input.endsWith("hqdefault.jpg")) return new Response(jpeg(480, 360));
      expect(input).toBe("https://api.cloudinary.com/v1_1/fixture-cloud/image/upload");
      const body = options?.body as FormData;
      expect(body.get("asset_folder")).toBe("zeebaran/videos/posters");
      expect(body.get("overwrite")).toBe("false");
      expect(body.get("file")).toBeInstanceOf(Blob);
      expect(body.get("signature")).toMatch(/^[a-f0-9]{64}$/);
      return Response.json({
        public_id: "zeebaran/videos/posters/youtube-abcdefghijk",
        width: 480,
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const { prepareYoutubePoster } = await import("../../features/media/server-posters");
    await Promise.all([prepareYoutubePoster("abcdefghijk"), prepareYoutubePoster("abcdefghijk")]);
    await prepareYoutubePoster("abcdefghijk");
    expect(calls).toHaveLength(3);
  });
  it("fails softly for provider outages and never accepts arbitrary remote identifiers", async () => {
    vi.stubEnv("FIRESTORE_EMULATOR_HOST", "");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "fixture-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "fixture-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "fixture-secret");
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const { prepareYoutubePoster } = await import("../../features/media/server-posters");
    await prepareYoutubePoster("../../private");
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(prepareYoutubePoster("zyxwvutsrqp")).resolves.toBeUndefined();
  });
});
