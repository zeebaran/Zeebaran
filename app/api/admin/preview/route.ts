import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminSession,
  adminFailure,
  AdminError,
  secureCookie,
} from "@/features/admin/server/security";
import { contentPages } from "@/features/cms/model";
export async function GET(req: Request) {
  try {
    await adminSession();
    const url = new URL(req.url);
    const page = contentPages.find((p) => p[0] === url.searchParams.get("page"));
    if (!page) throw new AdminError(404, "Page not found.");
    const mode = await draftMode();
    if (url.searchParams.get("exit") === "1") mode.disable();
    else {
      mode.enable();
      // Next sets Secure for production. Permit the same-site cookie on loopback HTTP for local preview.
      if (!secureCookie(req)) {
        const jar = await cookies(),
          value = jar.get("__prerender_bypass")?.value;
        if (value)
          jar.set("__prerender_bypass", value, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
          });
      }
    }
    const response = new NextResponse(null, { status: 307, headers: { Location: page[2] } });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex");
    return response;
  } catch (e) {
    return adminFailure(e);
  }
}
