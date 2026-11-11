// Node 22+: node --experimental-strip-types --env-file=.env.local scripts/migrate-catalog.mjs
// Dry run by default. --apply --project=<FIREBASE_PROJECT_ID> explicitly writes existing authored content.
import { PRODUCTS, ROOTSTOCKS } from "../lib/products-content.ts";
import { emptyCatalog } from "../features/catalog/model.ts";
import { catalogSchema, normalizeSearch } from "../features/catalog/schema.ts";
import { textKey, imageKey } from "../features/cms/model.ts";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import fs from "node:fs";
import { createHash } from "node:crypto";
const apply = process.argv.includes("--apply"),
  target = process.argv.find((v) => v.startsWith("--project="))?.slice(10);
if (apply && (!target || target !== process.env.FIREBASE_PROJECT_ID))
  throw Error("Pass --project matching FIREBASE_PROJECT_ID. No writes performed.");
const guide = JSON.parse(
  fs.readFileSync(new URL("./migrations/legacy-rootstock-guide.json", import.meta.url), "utf8"),
);
const mapPath = process.argv.find((v) => v.startsWith("--media-map="))?.slice(12);
const mediaMap = mapPath ? JSON.parse(fs.readFileSync(mapPath, "utf8")) : {};
const data = [];
for (const [index, root] of Object.values(ROOTSTOCKS).entries()) {
  const detail = guide.find((r) => r.code === root.code);
  data.push({
    ...emptyCatalog("rootstock"),
    slug: root.code.toLowerCase(),
    name: detail?.title || root.code,
    code: root.code,
    headline: detail?.title || root.code,
    intro: detail?.desc || root.note,
    system: root.system,
    spacing: root.spacing,
    yield: root.yield,
    bestFor: detail?.best || "",
    note: root.note,
    agronomyNotes: root.note,
    images: [
      {
        src: "/images/nursery-development-and-hillside-mother-block-orchards-11ecd.webp",
        alt: "Nursery development and hillside mother-block orchards",
      },
    ],
    sortOrder: index,
  });
}
for (const [index, product] of PRODUCTS.entries()) {
  const { rootstocks, image, sceneVariant, sceneSeed, ...fields } = product;
  void sceneVariant;
  void sceneSeed;
  data.push({
    ...emptyCatalog("variety"),
    ...fields,
    rootstockIds: rootstocks.map((r) => r.code.toLowerCase()),
    images: image ? [{ src: image, alt: product.name + " apples" }] : [],
    sortOrder: index,
  });
}
data.forEach((d) => catalogSchema.parse(d));
console.log(
  JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    varieties: PRODUCTS.length,
    rootstocks: Object.keys(ROOTSTOCKS).length,
    project: target || "not selected",
    policy: "create missing entries only; never overwrite existing catalog records",
  }),
);
if (apply) {
  const app = initializeApp({
    projectId: target,
    credential:
      process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
        ? cert({
            projectId: target,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          })
        : applicationDefault(),
  });
  const db = getFirestore(app),
    cms = await db.getAll(
      ...["products", ...PRODUCTS.map((p) => "product-" + p.slug)].map((id) =>
        db.collection("cmsPages").doc(id),
      ),
    );
  const overrides = new Map(cms.map((d) => [d.id, d.get("published")]));
  let created = 0,
    skipped = 0;
  for (const entry of data) {
    const own = overrides.get("product-" + entry.slug),
      shared = overrides.get("products");
    const resolve = (s) => own?.text?.[textKey(s)] ?? shared?.text?.[textKey(s)] ?? s;
    for (const key of Object.keys(entry))
      if (typeof entry[key] === "string" && !["slug", "kind", "code"].includes(key))
        entry[key] = resolve(entry[key]);
    entry.highlights = entry.highlights.map(resolve);
    entry.images = entry.images.map(
      (m) => own?.images?.[imageKey(m.src)] || shared?.images?.[imageKey(m.src)] || m,
    );
    catalogSchema.parse(entry);
    for (const image of entry.images.filter((i) => i.src.startsWith("/images/"))) {
      const asset = db
        .collection("catalogAssets")
        .doc(createHash("sha256").update(image.src).digest("hex"));
      await db.runTransaction(async (tx) => {
        if (!(await tx.get(asset)).exists)
          tx.create(asset, { ...image, name: entry.name, createdAt: Timestamp.now() });
      });
    }
    entry.images = entry.images.map((image) => {
      const replacement = mediaMap[image.src];
      return replacement
        ? {
            src: replacement.src,
            alt: image.alt,
            publicId: replacement.publicId,
            width: replacement.width,
            height: replacement.height,
          }
        : image;
    });
    for (const image of entry.images.filter((i) => i.publicId)) {
      if (
        !image.src.startsWith(
          "https://res.cloudinary.com/" + process.env.CLOUDINARY_CLOUD_NAME + "/image/upload/",
        )
      )
        throw Error("Media manifest references a different Cloudinary environment.");
      const cloud = await fetch(
        "https://api.cloudinary.com/v1_1/" +
          process.env.CLOUDINARY_CLOUD_NAME +
          "/resources/image/upload/" +
          encodeURIComponent(image.publicId),
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(
                process.env.CLOUDINARY_API_KEY + ":" + process.env.CLOUDINARY_API_SECRET,
              ).toString("base64"),
          },
          signal: AbortSignal.timeout(20000),
        },
      );
      if (!cloud.ok) throw Error("Could not verify migrated Cloudinary media.");
      const resource = await cloud.json();
      if (resource.secure_url !== image.src) throw Error("Cloudinary resource mismatch.");
      const asset = db
        .collection("cmsMedia")
        .doc(Buffer.from(image.publicId).toString("base64url"));
      await db.runTransaction(async (tx) => {
        if (!(await tx.get(asset)).exists)
          tx.create(asset, {
            ...image,
            name: entry.name,
            resourceType: "image",
            bytes: resource.bytes,
            format: resource.format,
            createdBy: "authored-content-migration",
            createdAt: Timestamp.now(),
          });
      });
    }
    catalogSchema.parse(entry);
    const ref = db.collection("catalogEntries").doc(entry.slug),
      pub = db.collection("catalogPublished").doc(entry.slug);
    const inserted = await db.runTransaction(async (tx) => {
      const old = await tx.get(ref);
      if (old.exists) return false;
      const linked = entry.rootstockIds.length
        ? await tx.getAll(
            ...entry.rootstockIds.map((id) => db.collection("catalogEntries").doc(id)),
          )
        : [];
      if (linked.some((d) => !d.exists || d.get("deleted") || d.get("kind") !== "rootstock"))
        throw Error(
          "A linked rootstock is missing or deleted; migration stopped without overwriting it.",
        );
      const now = Timestamp.now();
      tx.create(ref, {
        draft: entry,
        kind: entry.kind,
        nameSort: normalizeSearch(entry.name),
        rootstockRefs: entry.rootstockIds,
        revision: 1,
        published: true,
        deleted: false,
        createdAt: now,
        updatedAt: now,
        updatedBy: "authored-content-migration",
        publishedAt: now,
        deletedAt: null,
      });
      tx.create(pub, {
        ...entry,
        nameSort: normalizeSearch(entry.name),
        publishedAt: now,
        revision: 1,
      });
      return true;
    });
    if (inserted) created++;
    else skipped++;
  }
  console.log(JSON.stringify({ created, skipped }));
  console.log(
    "Revalidate/redeploy the application after migration. No hardcoded runtime fallback is used.",
  );
}
