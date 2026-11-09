import "server-only";
import { isIP } from "node:net";
import { createHash, randomUUID } from "node:crypto";
import type { Submission } from "../schema";
import { EnquiryError } from "./errors";
export function isLocal() {
  return (
    !process.env.FIREBASE_PROJECT_ID &&
    !process.env.VERCEL &&
    (process.env.NODE_ENV === "development" || process.env.ZEEBARAN_LOCAL_INBOX === "1")
  );
}
function available() {
  if (!isLocal() && !process.env.FIREBASE_PROJECT_ID)
    throw new EnquiryError(
      503,
      "Online delivery is unavailable. Please send your enquiry by email.",
    );
}
export async function limit(req: Request, action: string) {
  available();
  const windowMs = 15 * 60 * 1000;
  const slot = Math.floor(Date.now() / windowMs);
  const address = isLocal()
    ? "development"
    : process.env.VERCEL
      ? req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
      : process.env.TRUSTED_CLIENT_IP_HEADER
        ? req.headers.get(process.env.TRUSTED_CLIENT_IP_HEADER)?.trim()
        : null;
  if (!isLocal() && (!address || !isIP(address)))
    throw new EnquiryError(503, "The enquiry desk is unavailable. Please use email.");
  const key = createHash("sha256").update([slot, action, address].join("|")).digest("hex");
  const until = (slot + 1) * windowMs;
  if (isLocal()) (await import("./local")).limitLocal(key, until);
  else await (await import("./firebase")).limitCloud(key, until);
}
export async function prepare(id: string, size: number) {
  const ticket = randomUUID();
  if (isLocal()) return (await import("./local")).issueLocal(ticket, id, size);
  return (await import("./firebase")).issueCloud(ticket, id, size);
}
export async function submit(data: Submission) {
  const fingerprint = createHash("sha256").update(JSON.stringify(data)).digest("hex");
  if (isLocal()) {
    (await import("./local")).saveLocal(data, fingerprint);
    return { delivery: "local" };
  }
  await (await import("./firebase")).saveCloud(data, fingerprint);
  return { delivery: "desk" };
}
