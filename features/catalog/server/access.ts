import "server-only";
import { adminSession, AdminError, allowedAdmin } from "@/features/admin/server/security";
import type { DecodedIdToken } from "firebase-admin/auth";
export type CatalogRole = "admin" | "editor";
export function catalogRole(user: DecodedIdToken): CatalogRole {
  const owners = (process.env.ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase());
  if (user.email_verified && user.email && owners.includes(user.email.toLowerCase()))
    return "admin";
  if (allowedAdmin(user) && user.zeebaranRole === "admin") return "admin";
  if (allowedAdmin(user) && user.zeebaranRole === "editor") return "editor";
  throw new AdminError(403, "This account has no catalog access.");
}
export async function catalogAccess(action: "read" | "edit" | "publish" | "delete" = "read") {
  const user = await adminSession(),
    role = catalogRole(user);
  if ((action === "publish" || action === "delete") && role !== "admin")
    throw new AdminError(403, "An administrator must publish or delete entries.");
  return { user, role };
}
