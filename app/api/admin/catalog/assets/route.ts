import { authoredAsset } from "@/features/media/delivery";
import { catalogAccess } from "@/features/catalog/server/access";
import { catalogDb, decodeCursor, encodeCursor } from "@/features/catalog/server/store";
import { adminFailure } from "@/features/admin/server/security";
import { FieldPath } from "firebase-admin/firestore";
export async function GET(req: Request) {
  try {
    await catalogAccess();
    let query = catalogDb()
      .collection("catalogAssets")
      .orderBy("name")
      .orderBy(FieldPath.documentId());
    const cursor = decodeCursor(new URL(req.url).searchParams.get("cursor"));
    if (cursor) query = query.startAfter(...cursor);
    const docs = (await query.limit(41).get()).docs,
      items = docs.slice(0, 40),
      last = items.at(-1);
    return Response.json(
      {
        items: items.map((d) => {
          const data = d.data(),
            asset = authoredAsset(data.src);
          return asset
            ? {
                ...data,
                src: asset.src,
                publicId: asset.publicId,
                width: asset.width,
                height: asset.height,
              }
            : data;
        }),
        nextCursor: docs.length > 40 && last ? encodeCursor([last.get("name"), last.id]) : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return adminFailure(e);
  }
}
