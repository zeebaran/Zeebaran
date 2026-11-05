import { contactSchema, type ContactInput } from "./contact-schema";
export interface ContactServices {
  allowedOrigins: readonly string[];
  available: boolean;
  rateLimit: (request: Request) => Promise<boolean>;
  deliver: (data: ContactInput) => Promise<void>;
}
const reply = (
  status: number,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
export async function handleContact(
  request: Request,
  s: ContactServices,
): Promise<Response> {
  if (!s.allowedOrigins.includes(request.headers.get("origin") || ""))
    return reply(403, { error: "Please reload this page before submitting." });
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return reply(415, { error: "JSON is required." });
  if (Number(request.headers.get("content-length")) > 16384)
    return reply(413, { error: "Your enquiry is too long." });
  let raw: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { error: "Your enquiry is empty." });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        return reply(413, { error: "Your enquiry is too long." });
      }
      chunks.push(value);
    }
    const all = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      all.set(chunk, offset);
      offset += chunk.length;
    }
    raw = JSON.parse(new TextDecoder().decode(all));
  } catch {
    return reply(400, { error: "We couldn’t read your enquiry." });
  }
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success)
    return reply(422, {
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  if (parsed.data.website) return reply(200, { ok: true });
  if (!s.available)
    return reply(503, {
      error: "Online delivery is unavailable. Please email or call us.",
    });
  try {
    if (!(await s.rateLimit(request)))
      return reply(
        429,
        { error: "Please wait 15 minutes before trying again." },
        { "Retry-After": "900" },
      );
  } catch {
    return reply(503, {
      error: "We couldn’t verify this request. Please try later or email us.",
    });
  }
  try {
    await s.deliver(parsed.data);
    return reply(200, { ok: true });
  } catch {
    return reply(502, {
      error:
        "We couldn’t send your enquiry. Your details are still here. Please retry or email us.",
    });
  }
}
