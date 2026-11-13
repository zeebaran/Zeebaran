import "server-only";
import { normalizeHarvestSeason, type HarvestSeason } from "../harvest";
import { cache } from "react";
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { FieldPath, type Query, type DocumentData } from "firebase-admin/firestore";
import { catalogDb, encodeCursor } from "./store";
import { AdminError } from "@/features/admin/server/security";
import { catalogSchema, slugSchema, normalizeSearch } from "../schema";
import {
  summary,
  type CatalogData,
  type CatalogItem,
  type CatalogKind,
  type CatalogPage,
  type CatalogSummary,
} from "../model";
const namespace = () =>
  [
    process.env.FIREBASE_PROJECT_ID || "unconfigured",
    process.env.FIRESTORE_EMULATOR_HOST || "cloud",
  ].join(":");
const tag = "product-catalog";
function item(id: string, data: DocumentData): CatalogItem {
  return {
    ...catalogSchema.strip().parse(data),
    id,
    publishedAt: data.publishedAt.toDate().toISOString(),
    image: data.images[0]?.src,
    rootstocks: [],
  } as CatalogItem;
}
function configured() {
  if (!process.env.FIREBASE_PROJECT_ID)
    throw new AdminError(
      503,
      "The catalog is temporarily unavailable. Please contact our nursery team.",
    );
}
export const publishedItem = cache(async (id: string): Promise<CatalogItem | null> => {
  if (!slugSchema.safeParse(id).success) return null;
  return unstable_cache(
    async () => {
      configured();
      const d = await catalogDb().collection("catalogPublished").doc(id).get();
      return d.exists ? item(d.id, d.data()!) : null;
    },
    ["catalog-item", namespace(), id],
    { tags: ["catalog-item:" + id], revalidate: 300 },
  )();
});
export const publishedPage = cache(
  async (
    kind: CatalogKind,
    cursor: string | null = null,
    q = "",
    limit = 24,
    season: HarvestSeason | null = null,
  ): Promise<CatalogPage<CatalogItem>> => {
    const search = normalizeSearch(q).slice(0, 80);
    const harvest = normalizeHarvestSeason(season);
    return unstable_cache(
      async () => {
        configured();
        let query: Query = catalogDb().collection("catalogPublished").where("kind", "==", kind);
        if (harvest && kind === "variety") query = query.where("season", "==", harvest);
        const order = search ? "nameSort" : "sortOrder";
        if (search)
          query = query.where("nameSort", ">=", search).where("nameSort", "<=", search + "\uf8ff");
        query = query.orderBy(order).orderBy(FieldPath.documentId());
        if (cursor) {
          try {
            if (cursor.length > 4096) throw Error();
            const v = JSON.parse(Buffer.from(cursor, "base64url").toString());
            if (
              !Array.isArray(v) ||
              v.length !== 2 ||
              typeof v[1] !== "string" ||
              !slugSchema.safeParse(v[1]).success ||
              typeof v[0] !== (search ? "string" : "number")
            )
              throw Error();
            query = query.startAfter(...v);
          } catch {
            throw new AdminError(422, "Invalid catalog cursor.");
          }
        }
        const docs = (await query.limit(limit + 1).get()).docs,
          visible = docs.slice(0, limit),
          last = visible.at(-1);
        return {
          items: visible.map((d) => item(d.id, d.data())),
          nextCursor: docs.length > limit && last ? encodeCursor([last.get(order), last.id]) : null,
        };
      },
      ["catalog-page", namespace(), kind, cursor || "", search, String(limit), harvest || ""],
      { tags: ["catalog-kind:" + kind], revalidate: 300 },
    )();
  },
);
export async function publishedSummaries(
  kind: CatalogKind,
  cursor: string | null = null,
  q = "",
  season: HarvestSeason | null = null,
): Promise<CatalogPage<CatalogSummary>> {
  const page = await publishedPage(kind, cursor, q, 24, season);
  return { ...page, items: page.items.map(summary) };
}
export const resolvePublished = cache(async (ids: string[]) => {
  const unique = [...new Set(ids)];
  if (unique.length > 24 || unique.some((id) => !slugSchema.safeParse(id).success))
    throw new AdminError(422, "Invalid catalog selection.");
  if (!unique.length) return [];
  return unstable_cache(
    async () => {
      configured();
      const docs = await catalogDb().getAll(
        ...unique.map((id) => catalogDb().collection("catalogPublished").doc(id)),
      );
      return docs.filter((d) => d.exists).map((d) => item(d.id, d.data()!));
    },
    ["catalog-batch", namespace(), ...unique],
    { tags: [tag], revalidate: 300 },
  )();
});
export const productWithRoots = cache(async (id: string) => {
  const product = await publishedItem(id);
  if (!product) return null;
  const roots = await resolvePublished(product.rootstockIds);
  return { ...product, rootstocks: roots.filter((r) => r.kind === "rootstock") } as CatalogItem;
});
export function invalidateCatalog(id: string, kind: CatalogKind) {
  revalidateTag("catalog-item:" + id, { expire: 0 });
  revalidateTag("catalog-kind:" + kind, { expire: 0 });
  revalidateTag(tag, { expire: 0 });
  revalidatePath("/products");
  revalidatePath("/products/" + id);
  revalidatePath("/products/rootstocks/" + id);
  revalidatePath("/products/compare");
  revalidatePath("/sitemap.xml");
}
export type { CatalogData };

export const catalogCounts = cache(() =>
  unstable_cache(
    async () => {
      configured();
      const rows = await Promise.all(
        (["variety", "rootstock"] as const).map((kind) =>
          catalogDb().collection("catalogPublished").where("kind", "==", kind).count().get(),
        ),
      );
      return { variety: rows[0].data().count, rootstock: rows[1].data().count };
    },
    ["catalog-counts", namespace()],
    { tags: [tag], revalidate: 300 },
  )(),
);
export const catalogSitemap = cache(() =>
  unstable_cache(
    async () => {
      configured();
      const result: { slug: string; kind: CatalogKind; publishedAt: string }[] = [];
      let cursor: string | undefined;
      for (let page = 0; page < 100; page++) {
        let query = catalogDb()
          .collection("catalogPublished")
          .orderBy(FieldPath.documentId())
          .select("slug", "kind", "publishedAt")
          .limit(500);
        if (cursor) query = query.startAfter(cursor);
        const rows = (await query.get()).docs;
        result.push(
          ...rows.map((d) => ({
            slug: d.id,
            kind: d.get("kind") as CatalogKind,
            publishedAt: d.get("publishedAt").toDate().toISOString(),
          })),
        );
        if (rows.length < 500) return result;
        cursor = rows.at(-1)!.id;
      }
      throw new Error("Partition the catalog sitemap before exceeding 50,000 URLs.");
    },
    ["catalog-sitemap", namespace()],
    { tags: [tag], revalidate: 3600 },
  )(),
);
