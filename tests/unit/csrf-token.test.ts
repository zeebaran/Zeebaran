import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ value: "", set: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => ({ value: state.value }),
    set: (name: string, value: string, options: unknown) => {
      state.value = value;
      state.set(name, value, options);
    },
  }),
}));
import { GET } from "../../app/api/admin/csrf/route";
beforeEach(() => {
  state.value = "";
  state.set.mockClear();
});
describe("multi-tab CSRF lifecycle", () => {
  it("preserves an existing valid token across independent requests", async () => {
    const request = new Request("http://localhost:3000/api/admin/csrf");
    const first = await (await GET(request)).json();
    const [left, right] = await Promise.all([
      GET(request).then((r) => r.json()),
      GET(request).then((r) => r.json()),
    ]);
    expect(first.token).toMatch(/^[a-f0-9]{64}$/);
    expect(left.token).toBe(first.token);
    expect(right.token).toBe(first.token);
    expect(state.set).toHaveBeenLastCalledWith(
      "zeebaran-csrf",
      first.token,
      expect.objectContaining({ httpOnly: true, sameSite: "strict", secure: false }),
    );
  });
  it("replaces malformed cookies and requires HTTPS cookies on deployed hosts", async () => {
    state.value = "malformed";
    const response = await GET(new Request("https://zeebaran.com/api/admin/csrf"));
    const { token } = await response.json();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(state.set).toHaveBeenLastCalledWith(
      "zeebaran-csrf",
      token,
      expect.objectContaining({ secure: true }),
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
