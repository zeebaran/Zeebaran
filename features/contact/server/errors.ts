export class EnquiryError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof EnquiryError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error("Enquiry service failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json(
    {
      error: "The enquiry desk is unavailable. Your form is still here. Please retry or use email.",
    },
    { status: 503 },
  );
}
export async function readLimited(req: Request, limit: number) {
  if (Number(req.headers.get("content-length")) > limit)
    throw new EnquiryError(413, "The upload is too large.");
  const reader = req.body?.getReader();
  if (!reader) throw new EnquiryError(400, "The request is empty.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new EnquiryError(413, "The upload is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, size);
}
export async function jsonBody(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new EnquiryError(415, "Use a JSON request.");
  const bytes = await readLimited(req, 32 * 1024);
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new EnquiryError(400, "Invalid request.");
  }
}
export function checkOrigin(req: Request) {
  const supplied = req.headers.get("origin");
  if (!supplied) return;
  const requestUrl = new URL(req.url);
  // Next normalises loopback hostnames in req.url. The HTTP Host preserves the origin the visitor opened.
  const host = req.headers.get("host") || requestUrl.host;
  const protocol =
    process.env.VERCEL && req.headers.get("x-forwarded-proto") === "https"
      ? "https:"
      : requestUrl.protocol;
  if (supplied !== protocol + "//" + host)
    throw new EnquiryError(403, "Submit the form from this website.");
}
