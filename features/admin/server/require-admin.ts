import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminSession, AdminError, authService, allowedAdmin, sessionCookie } from "./security";

/** Check each protected server entry point, including client-side RSC navigation. */
export async function requireAdmin() {
  try {
    return await adminSession();
  } catch (error) {
    if (error instanceof AdminError && (error.status === 401 || error.status === 403))
      redirect("/admin/login");
    throw error;
  }
}

/**
 * Only for the public-layout canvas: no draft/history/private media is fetched
 * by this route. The protected parent supplies its already-authorized draft.
 * Verify signature/expiry/claims locally, avoiding a second revocation RPC for
 * public markup. Every private page/API still uses requireAdmin/adminSession
 * with immediate revocation checking; never use this for privileged data.
 */
export async function requireCanvasSession() {
  const value = (await cookies()).get(sessionCookie)?.value;
  if (!value) redirect("/admin/login");
  let user;
  try {
    user = await authService().verifySessionCookie(value, false);
  } catch {
    redirect("/admin/login");
  }
  if (!allowedAdmin(user)) redirect("/admin/login");
  return user;
}
