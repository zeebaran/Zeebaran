import { describe, expect, it } from "vitest";
import { adminAuthError } from "../../features/admin/auth-errors";
import { AdminRequestError } from "../../features/admin/client";

describe("admin authentication feedback", () => {
  it("shows the server's authorization or session error instead of hiding it", () => {
    expect(
      adminAuthError(new AdminRequestError(403, "This account has no administration access.")),
    ).toBe("This account has no administration access.");
  });
  it("identifies missing authorised domains and disabled providers", () => {
    expect(adminAuthError({ code: "auth/unauthorized-domain" })).toContain("not authorised");
    expect(adminAuthError({ code: "auth/operation-not-allowed" })).toContain("not enabled");
  });
  it("does not distinguish unknown accounts from incorrect passwords", () => {
    expect(adminAuthError({ code: "auth/user-not-found" })).toBe(
      adminAuthError({ code: "auth/invalid-credential" }),
    );
    expect(adminAuthError({ code: "auth/wrong-password" })).toBe(
      adminAuthError({ code: "auth/invalid-credential" }),
    );
  });
  it("provides an actionable recovery error without exposing internal details", () => {
    expect(adminAuthError({ code: "auth/too-many-requests" }, "reset")).toContain("Wait");
    expect(adminAuthError(new Error("private upstream detail"), "reset")).toBe(
      "The password link could not be sent. Please try again.",
    );
  });
});
