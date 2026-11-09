import { submissionSchema } from "@/features/contact/schema";
import {
  checkOrigin,
  errorResponse,
  jsonBody,
  EnquiryError,
} from "@/features/contact/server/errors";
import { limit, submit } from "@/features/contact/server/service";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const parsed = submissionSchema.safeParse(await jsonBody(req));
    if (!parsed.success) throw new EnquiryError(422, parsed.error.issues[0].message);
    await limit(req, "submit");
    return Response.json(await submit(parsed.data), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
