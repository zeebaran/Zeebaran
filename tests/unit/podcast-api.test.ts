import { beforeEach, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({
  csrf: vi.fn(),
  session: vi.fn(),
  limit: vi.fn(),
  metadata: vi.fn(),
}));
vi.mock("@/features/admin/server/security", () => ({
  csrfGuard: calls.csrf,
  adminSession: calls.session,
  limitAdmin: calls.limit,
  bodyJson: (r: Request) => r.json(),
  AdminError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
  adminFailure: (e: { status?: number; message: string }) =>
    Response.json({ error: e.message }, { status: e.status || 503 }),
}));
vi.mock("@/features/podcast/metadata", () => ({ fetchYoutubeMetadata: calls.metadata }));
import { POST } from "@/app/api/admin/podcast/metadata/route";
beforeEach(() => {
  vi.clearAllMocks();
  calls.csrf.mockResolvedValue(undefined);
  calls.session.mockResolvedValue({ uid: "fixture" });
  calls.limit.mockResolvedValue(undefined);
  calls.metadata.mockResolvedValue({ title: "A title" });
});
const request = () =>
  new Request("https://fixture.test/api/admin/podcast/metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://youtu.be/M7lc1UVf-VE" }),
  });
it("requires CSRF and an admin session before provider access", async () => {
  calls.csrf.mockRejectedValueOnce({ status: 403, message: "Blocked" });
  expect((await POST(request())).status).toBe(403);
  expect(calls.session).not.toHaveBeenCalled();
  expect(calls.metadata).not.toHaveBeenCalled();
  calls.session.mockRejectedValueOnce({ status: 401, message: "Sign in" });
  expect((await POST(request())).status).toBe(401);
  expect(calls.metadata).not.toHaveBeenCalled();
});
it("limits imports and keeps metadata responses private", async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(calls.limit).toHaveBeenCalledWith("podcast-metadata-fixture", 60);
  expect(calls.metadata).toHaveBeenCalledTimes(1);
});
