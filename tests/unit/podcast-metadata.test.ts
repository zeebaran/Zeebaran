import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/server/security", () => ({
  AdminError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));
import { fetchYoutubeMetadata } from "@/features/podcast/metadata";
afterEach(() => vi.unstubAllGlobals());
it("imports only plain title/channel from a fixed endpoint, ignoring returned HTML", async () => {
  const fetch = vi.fn().mockResolvedValue(
    Response.json({
      title: " Orchard science ",
      author_name: "Bazm-e-Khayal",
      html: "<script>unsafe</script>",
    }),
  );
  vi.stubGlobal("fetch", fetch);
  expect(await fetchYoutubeMetadata("https://youtu.be/M7lc1UVf-VE")).toEqual({
    url: "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE",
    title: "Orchard science",
    channel: "Bazm-e-Khayal",
  });
  expect(fetch.mock.calls[0][0].hostname).toBe("www.youtube.com");
  expect(fetch.mock.calls[0][1].redirect).toBe("error");
});
it("rejects arbitrary URLs before fetch and handles provider failures without fabricated copy", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  await expect(fetchYoutubeMetadata("https://127.0.0.1/private")).rejects.toMatchObject({
    status: 422,
  });
  expect(fetch).not.toHaveBeenCalled();
  fetch.mockResolvedValue(new Response("private", { status: 404 }));
  await expect(fetchYoutubeMetadata("https://youtu.be/M7lc1UVf-VE")).rejects.toMatchObject({
    status: 422,
  });
  fetch.mockResolvedValue(Response.json({ title: "x".repeat(20000) }));
  await expect(fetchYoutubeMetadata("https://youtu.be/M7lc1UVf-VE")).rejects.toMatchObject({
    status: 422,
  });
});
