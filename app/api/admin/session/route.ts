import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  AdminError,
  adminFailure,
  adminSession,
  allowedAdmin,
  authService,
  bodyJson,
  csrfGuard,
  limitAdmin,
  secureCookie,
  sessionCookie,
} from "@/features/admin/server/security";
export async function POST(req: Request) {
  try {
    await csrfGuard(req);
    const ip = process.env.VERCEL
      ? req.headers.get("x-vercel-forwarded-for") || "unknown"
      : req.headers.get(process.env.TRUSTED_CLIENT_IP_HEADER || "x-unconfigured") || "loopback";
    const body = z
      .object({ idToken: z.string().min(20).max(12000) })
      .safeParse(await bodyJson(req));
    if (!body.success) throw new AdminError(422, "Invalid sign-in.");
    let decoded;
    try {
      decoded = await authService().verifyIdToken(body.data.idToken, true);
    } catch {
      throw new AdminError(401, "Sign in again to verify your account.");
    }
    if (!allowedAdmin(decoded))
      throw new AdminError(403, "This account has no administration access.");
    if (Date.now() / 1000 - decoded.auth_time > 300)
      throw new AdminError(401, "Sign in again to start a fresh session.");
    await limitAdmin(
      "login-" +
        createHash("sha256")
          .update(decoded.uid + ":" + ip)
          .digest("hex"),
      30,
    );
    const value = await authService().createSessionCookie(body.data.idToken, {
      expiresIn: 8 * 3600000,
    });
    (await cookies()).set(sessionCookie, value, {
      httpOnly: true,
      secure: secureCookie(req),
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 3600,
    });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return adminFailure(e);
  }
}
export async function GET() {
  try {
    const user = await adminSession();
    return Response.json({ email: user.email }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return adminFailure(e);
  }
}
export async function DELETE(req: Request) {
  try {
    await csrfGuard(req);
    (await cookies()).delete(sessionCookie);
    return Response.json({ ok: true });
  } catch (e) {
    return adminFailure(e);
  }
}
