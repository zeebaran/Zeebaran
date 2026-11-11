import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { activeRateCount, timestampMillis } from "../../lib/server/rate-limits";
describe("Spark-compatible rate-limit expiry", () => {
  it("starts a missing counter at zero", () => expect(activeRateCount(undefined, 5000)).toBe(0));
  it("ignores an expired counter even if the document was retained", () =>
    expect(activeRateCount({ count: 1000, expiresAt: new Date(4000) }, 5000)).toBe(0));
  it("expires at the exact deadline, not one request later", () =>
    expect(activeRateCount({ count: 12, expiresAt: new Date(5000) }, 5000)).toBe(0));
  it("preserves an active counter", () =>
    expect(activeRateCount({ count: 12, expiresAt: new Date(5001) }, 5000)).toBe(12));
  it("accepts Firestore timestamps without replacing them with client values", () => {
    expect(activeRateCount({ count: 3, expiresAt: { toMillis: () => 6000 } }, 5000)).toBe(3);
  });
  it("does not turn malformed active records into unlimited access", () => {
    for (const count of [-1, Infinity, NaN, "12"]) {
      expect(() => activeRateCount({ count, expiresAt: new Date(6000) }, 5000)).toThrow();
    }
    expect(() => activeRateCount({ count: 12 }, 5000)).toThrow();
  });
  it("can discard corrupted old counts once their expiry is valid and past", () =>
    expect(activeRateCount({ count: Infinity, expiresAt: new Date(4000) }, 5000)).toBe(0));
  it("rejects invalid expiry values", () => {
    expect(timestampMillis("5000")).toBeNull();
    expect(timestampMillis(new Date(NaN))).toBeNull();
    expect(timestampMillis(null)).toBeNull();
  });
});
