import { z } from "zod";

import {
  checkOrigin,
  EnquiryError,
  errorResponse,
  readLimited,
} from "@/features/contact/server/errors";
import { isLocal } from "@/features/contact/server/service";
export async function PUT(req: Request, { params }: { params: Promise<{ ticket: string }> }) {
  try {
    checkOrigin(req);
    const { ticket } = await params;
    if (!isLocal() || !z.uuid().safeParse(ticket).success)
      throw new EnquiryError(404, "Upload not found.");
    const { ticketSize, putLocal } = await import("@/features/contact/server/local");
    const data = await readLimited(req, ticketSize(ticket));
    await putLocal(ticket, data);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
