import { z } from "zod";
import { getFirestore, Timestamp, FieldPath } from "firebase-admin/firestore";
import { firebase } from "@/lib/firebase-admin";
import {
  adminSession,
  adminFailure,
  AdminError,
  csrfGuard,
  bodyJson,
} from "@/features/admin/server/security";
import { verifyResource } from "@/features/admin/server/cloudinary";
export async function GET(req: Request) {
  try {
    await adminSession();
    const db = getFirestore(firebase());
    const cursor = new URL(req.url).searchParams.get("cursor");
    if (cursor && !/^[A-Za-z0-9_-]{1,600}$/.test(cursor))
      throw new AdminError(422, "Invalid media cursor.");
    let query = db
      .collection("cmsMedia")
      .orderBy("createdAt", "desc")
      .orderBy(FieldPath.documentId(), "desc")
      .limit(49);
    if (cursor) {
      let values: unknown;
      try {
        values = JSON.parse(Buffer.from(cursor, "base64url").toString());
      } catch {
        /* legacy document ID cursor */
      }
      if (
        Array.isArray(values) &&
        values.length === 3 &&
        Number.isSafeInteger(values[0]) &&
        values[0] >= -62135596800 &&
        values[0] <= 253402300799 &&
        Number.isInteger(values[1]) &&
        values[1] >= 0 &&
        values[1] < 1e9 &&
        typeof values[2] === "string" &&
        /^[A-Za-z0-9_-]{1,400}$/.test(values[2])
      ) {
        query = query.startAfter(new Timestamp(values[0], values[1]), values[2]);
      } else {
        const previous = await db.collection("cmsMedia").doc(cursor).get();
        if (!previous.exists)
          throw new AdminError(422, "The media page has expired. Reopen the library.");
        query = query.startAfter(previous);
      }
    }
    const rows = await query.get(),
      visible = rows.docs.slice(0, 48);
    return Response.json(
      {
        nextCursor:
          rows.size > 48
            ? Buffer.from(
                JSON.stringify([
                  visible.at(-1)!.get("createdAt").seconds,
                  visible.at(-1)!.get("createdAt").nanoseconds,
                  visible.at(-1)!.id,
                ]),
              ).toString("base64url")
            : null,
        media: visible.map((doc) => ({
          ...doc.data(),
          createdAt: doc.get("createdAt")?.toDate().toISOString(),
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return adminFailure(e);
  }
}
export async function POST(req: Request) {
  try {
    await csrfGuard(req);
    const user = await adminSession();
    const d = z
      .object({
        publicId: z.string().min(1).max(200),
        kind: z.enum(["image", "video"]),
        alt: z.string().max(300),
        name: z.string().min(1).max(160),
      })
      .safeParse(await bodyJson(req));
    if (!d.success) throw new AdminError(422, "Add a file name and alternative text.");
    if (!d.data.publicId.startsWith("zeebaran/" + user.uid + "/"))
      throw new AdminError(403, "This upload does not belong to your account.");
    if (d.data.kind === "image" && !d.data.alt.trim())
      throw new AdminError(422, "Add alternative text for this image.");
    const db = getFirestore(firebase()),
      id = Buffer.from(d.data.publicId).toString("base64url");
    const ref = db.collection("cmsMedia").doc(id);
    const beforeVerification = await ref.get();
    const resource = await verifyResource(d.data.publicId, d.data.kind);
    await db.runTransaction(async (tx) => {
      const previous = await tx.get(ref);
      if (previous.get("state") === "deleting" || (beforeVerification.exists && !previous.exists))
        throw new AdminError(409, "This file is being deleted. Upload a new file instead.");
      if (previous.exists) return;
      tx.create(ref, {
        ...resource,
        alt: d.data.alt,
        name: d.data.name,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
      });
    });
    return Response.json(
      { media: { ...resource, alt: d.data.alt, name: d.data.name } },
      { status: 201 },
    );
  } catch (e) {
    return adminFailure(e);
  }
}
