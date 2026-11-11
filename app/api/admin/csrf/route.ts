import { cookies } from "next/headers";
import { csrfToken, secureCookie } from "@/features/admin/server/security";
export async function GET(req: Request) {
  const jar = await cookies();
  const existing = jar.get("zeebaran-csrf")?.value || "";
  const token = /^[a-f0-9]{64}$/.test(existing) ? existing : csrfToken();
  jar.set("zeebaran-csrf", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie(req),
    path: "/",
    maxAge: 3600,
  });
  return Response.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
