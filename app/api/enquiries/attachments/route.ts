import { prepareSchema } from "@/features/contact/schema";
import {
  checkOrigin,
  errorResponse,
  jsonBody,
  EnquiryError,
} from "@/features/contact/server/errors";
import { limit, prepare } from "@/features/contact/server/service";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const parsed = prepareSchema.safeParse(await jsonBody(req));
    if (!parsed.success) throw new EnquiryError(422, parsed.error.issues[0].message);
    await limit(req, "upload");
    return Response.json(await prepare(parsed.data.requestId, parsed.data.size));
  } catch (error) {
    return errorResponse(error);
  }
}
