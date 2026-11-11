import { prepareYoutubePoster } from "@/features/media/server-posters";
import { assetId } from "@/features/media/delivery";
import "server-only";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { isRegionalHubs, regionalHubIssue, type RegionalHub } from "../regional-hubs";
import { isPartnerEntries, partnerLabel, partnerIssue, type PartnerEntry } from "../partners";
import { firebase } from "@/lib/firebase-admin";
import { catalog } from "../catalog";
import {
  contentPages,
  emptyContent,
  placedContent,
  type ContentValue,
  type PageRecord,
} from "../model";
import { AdminError } from "@/features/admin/server/security";
import { missionVideoCards } from "../mission-videos";
import { textKey } from "../model";
import { youtubeUrl } from "../video";
import { editorDefinition, lockedCopyUnchanged } from "../editor-fields";
export { youtubeUrl } from "../video";
const media = z
  .object({
    src: z.string().max(2000),
    alt: z.string().max(300),
    publicId: z.string().max(300).optional(),
    resourceType: z.enum(["image", "video"]).optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  })
  .strict();
const videoSource = z
  .object({ kind: z.enum(["cloudinary", "youtube"]), src: z.string().min(1).max(2000) })
  .strict();
const missionCards = z
  .array(
    z
      .object({
        id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9-]{0,79}$/),
        title: z.string().min(1).max(200),
        description: z.string().max(12000),
        video: videoSource.optional(),
      })
      .strict(),
  )
  .min(1)
  .max(24);
const input = z
  .object({
    text: z.record(z.string(), z.string().max(12000)),
    images: z.record(z.string(), media),
    video: z
      .object({
        kind: z.enum(["cloudinary", "youtube"]),
        src: z.string().max(2000),
        title: z.string().min(1).max(200),
        poster: z.string().max(2000).optional(),
      })
      .optional(),
    videos: z
      .record(
        z.string().max(80),
        z
          .object({
            kind: z.enum(["cloudinary", "youtube"]),
            src: z.string().min(1).max(2000),
          })
          .strict(),
      )
      .optional(),
    regionalHubs: z
      .custom<RegionalHub[]>((value) => isRegionalHubs(value), "Invalid regional hubs")
      .optional(),
    partners: z
      .custom<PartnerEntry[]>((value) => isPartnerEntries(value), "Invalid partner entries")
      .optional(),
    missionSections: z
      .object({ orchard: missionCards, process: missionCards, demos: missionCards })
      .strict()
      .optional(),
  })
  .strict();
export function validPage(page: string) {
  if (!contentPages.some((x) => x[0] === page)) throw new AdminError(404, "Page not found.");
  return page;
}
function cloudUrl(value: string, type: "image" | "video") {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.startsWith("/" + process.env.CLOUDINARY_CLOUD_NAME + "/" + type + "/upload/") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
async function validated(page: string, value: unknown) {
  const parsed = input.safeParse(value);
  if (!parsed.success) {
    if (
      value &&
      typeof value === "object" &&
      "regionalHubs" in value &&
      Array.isArray(value.regionalHubs)
    ) {
      const issue = value.regionalHubs.every(
        (hub) =>
          hub &&
          typeof hub === "object" &&
          typeof hub.title === "string" &&
          Array.isArray(hub.locations) &&
          hub.locations.every(
            (location: unknown) =>
              location &&
              typeof location === "object" &&
              "name" in location &&
              typeof location.name === "string",
          ),
      )
        ? regionalHubIssue(value.regionalHubs as RegionalHub[])
        : "Check regional hub details and map locations.";
      if (issue) throw new AdminError(422, issue);
    }
    if (
      value &&
      typeof value === "object" &&
      "partners" in value &&
      Array.isArray(value.partners)
    ) {
      const issue = value.partners.every(
        (entry) => entry && typeof entry === "object" && typeof entry.name === "string",
      )
        ? partnerIssue(value.partners as PartnerEntry[])
        : "Check the partner entries.";
      if (issue) throw new AdminError(422, issue);
    }
    throw new AdminError(422, "Some content is invalid. Check field lengths and media.");
  }
  const result = parsed.data,
    definition = catalog[page];
  if (!definition) throw new AdminError(503, "This page's editing catalog is unavailable.");
  const fields = new Map(definition.fields.map((f) => [f.key, f]));
  for (const [key, text] of Object.entries(result.text)) {
    const field = fields.get(key);
    if (!field) throw new AdminError(422, "This field does not belong to the page.");
    if (field.numeric && (!/^\d+(?:\.\d+)?$/.test(text) || !Number.isFinite(Number(text))))
      throw new AdminError(422, "Use a non-negative number for numerical fields.");
  }
  if (result.regionalHubs !== undefined && page !== "contact")
    throw new AdminError(422, "Regional hubs belong to the Contact page.");
  const db = getFirestore(firebase());
  const images = new Map(definition.images.map((i) => [i.key, i]));
  for (const [key, image] of Object.entries(result.images)) {
    const field = images.get(key);
    if (!field) throw new AdminError(422, "This image does not belong to the page.");
    if (assetId(image.src) === assetId(field.src)) {
      image.src = field.src;
      if (!image.alt.trim()) throw new AdminError(422, "Add alternative text.");
      if (image.alt === field.alt) delete result.images[key];
      continue;
    }
    if (
      !image.alt.trim() ||
      !image.publicId ||
      image.resourceType !== "image" ||
      !cloudUrl(image.src, "image")
    )
      throw new AdminError(
        422,
        "Choose a verified library image and provide its alternative text.",
      );
    const registered = await db
      .collection("cmsMedia")
      .doc(Buffer.from(image.publicId).toString("base64url"))
      .get();
    if (
      !registered.exists ||
      registered.get("src") !== image.src ||
      registered.get("resourceType") !== "image"
    )
      throw new AdminError(422, "This image has not been verified.");
  }
  if (result.partners !== undefined && page !== "partnerships")
    throw new AdminError(422, "Partners belong to the Partnerships page.");
  const partnerImages = new Map<string, NonNullable<PartnerEntry["image"]>>();
  for (const partner of result.partners || []) {
    if (partner.mode !== "image" || !partner.image) continue;
    partner.name = partnerLabel(partner);
    const image = partner.image;
    if (!cloudUrl(image.src, "image") || !image.publicId)
      throw new AdminError(422, "Choose a verified library logo.");
    const previous = partnerImages.get(image.publicId);
    if (previous && previous.src !== image.src)
      throw new AdminError(422, "The same logo asset cannot use different source URLs.");
    partnerImages.set(image.publicId, image);
  }
  if (partnerImages.size) {
    const entries = [...partnerImages.values()];
    const registered = await db.getAll(
      ...entries.map((image) =>
        db.collection("cmsMedia").doc(Buffer.from(image.publicId!).toString("base64url")),
      ),
    );
    if (
      registered.some(
        (doc, i) =>
          !doc.exists || doc.get("src") !== entries[i].src || doc.get("resourceType") !== "image",
      )
    )
      throw new AdminError(422, "A partner logo has not been verified by the media library.");
  }
  // Old page-wide films no longer have a placement. Keep old history readable,
  // but never publish or render that obsolete field again.
  delete result.video;
  if (result.missionSections && page !== "mission")
    throw new AdminError(422, "Mission sections do not belong to this page.");
  if (result.missionSections) {
    const cards = Object.values(result.missionSections).flat();
    if (new Set(cards.map((card) => card.id)).size !== cards.length)
      throw new AdminError(422, "Each video card needs a unique ID.");
    delete result.videos; // The section editor is authoritative after the first save; legacy media is already carried across.
  }
  if (Object.keys(result.videos || {}).length && page !== "mission")
    throw new AdminError(422, "This page has no video card placements.");
  const configuredVideos: {
    video: z.infer<typeof videoSource>;
    title: string;
    description: string;
  }[] = [];
  for (const [id, video] of Object.entries(result.videos || {})) {
    const card = missionVideoCards.find((card) => card.id === id);
    if (!card) throw new AdminError(422, "This video card does not belong to the page.");
    const title = result.text[textKey(card.title)] ?? card.title;
    const description = result.text[textKey(card.subtitle)] ?? card.subtitle;
    configuredVideos.push({ video, title, description });
  }
  for (const card of Object.values(result.missionSections || {}).flat())
    if (card.video)
      configuredVideos.push({
        video: card.video,
        title: card.title,
        description: card.description,
      });
  const verifiedCloudVideos = new Set<string>();
  for (const { video, title, description } of configuredVideos) {
    if (!title.trim() || title.length > 200 || !description.trim())
      throw new AdminError(422, "Add a video title and description to each configured card.");
    if (video.kind === "youtube") {
      const url = youtubeUrl(video.src);
      if (!url) throw new AdminError(422, "Use a valid YouTube video link.");
      video.src = url;
      await prepareYoutubePoster(url.split("/").at(-1)!);
    } else {
      if (!cloudUrl(video.src, "video"))
        throw new AdminError(422, "Choose a verified library video.");
      if (verifiedCloudVideos.has(video.src)) continue;
      const found = await db.collection("cmsMedia").where("src", "==", video.src).limit(1).get();
      if (found.empty || found.docs[0].get("resourceType") !== "video")
        throw new AdminError(422, "This video has not been verified.");
      verifiedCloudVideos.add(video.src);
    }
  }
  if (Buffer.byteLength(JSON.stringify(result)) > 240000)
    throw new AdminError(413, "This page exceeds the content limit.");
  return result as ContentValue;
}
const iso = (value: unknown) => (value instanceof Timestamp ? value.toDate().toISOString() : null);
export async function readPage(page: string): Promise<PageRecord> {
  validPage(page);
  const doc = await getFirestore(firebase()).collection("cmsPages").doc(page).get();
  const d = doc.data();
  return {
    fetchedAt: Date.now(),
    revision: d?.revision || 0,
    draft: placedContent(page, d?.draft || emptyContent()),
    published: placedContent(page, d?.published || emptyContent()),
    updatedAt: iso(d?.updatedAt),
    publishedAt: iso(d?.publishedAt),
  };
}
export async function pageHistory(page: string) {
  validPage(page);
  const records = await getFirestore(firebase())
    .collection("cmsPages")
    .doc(page)
    .collection("history")
    .orderBy("createdAt", "desc")
    .select("action", "actor", "createdAt", "revision")
    .limit(20)
    .get();
  return records.docs.map((doc) => ({
    id: doc.id,
    action: doc.get("action"),
    actor: doc.get("actor"),
    createdAt: iso(doc.get("createdAt")),
    revision: doc.get("revision"),
  }));
}
export async function mutatePage(
  page: string,
  raw: unknown,
  user: { uid: string; email?: string },
) {
  validPage(page);
  const request = z
    .object({
      action: z.enum(["save", "publish", "restore"]),
      revision: z.number().int().nonnegative(),
      content: z.unknown().optional(),
      version: z.string().uuid().optional(),
    })
    .strict()
    .safeParse(raw);
  if (!request.success) throw new AdminError(422, "Invalid page update.");
  const db = getFirestore(firebase()),
    ref = db.collection("cmsPages").doc(page);
  let content: ContentValue;
  if (request.data.action === "restore") {
    if (!request.data.version) throw new AdminError(422, "Choose a saved revision.");
    const old = await ref.collection("history").doc(request.data.version).get();
    if (!old.exists) throw new AdminError(404, "Revision not found.");
    content = await validated(page, old.get("content"));
  } else content = await validated(page, request.data.content);
  const { randomUUID } = await import("node:crypto");
  const history = ref.collection("history").doc(randomUUID());
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(ref),
      current = existing.data();
    if ((current?.revision || 0) !== request.data.revision)
      throw new AdminError(
        409,
        "A newer revision was saved elsewhere. Reload before editing to avoid overwriting it.",
      );
    if (
      request.data.action !== "restore" &&
      !lockedCopyUnchanged(
        content.text,
        current?.draft?.text || {},
        new Set(editorDefinition(page, catalog[page], "visual").fields.map((field) => field.key)),
      )
    )
      throw new AdminError(422, "Only the page's editable text fields can be changed.");
    const revision = request.data.revision + 1,
      now = Timestamp.now();
    const update = {
      draft: content,
      revision,
      updatedAt: now,
      updatedBy: user.uid,
      ...(request.data.action === "publish" ? { published: content, publishedAt: now } : {}),
    };
    tx.set(ref, update, { mergeFields: Object.keys(update) });
    tx.create(history, {
      revision,
      action: request.data.action,
      content,
      actor: user.email || user.uid,
      createdAt: now,
    });
    tx.create(db.collection("cmsAudit").doc(history.id), {
      page,
      action: request.data.action,
      revision,
      actor: user.uid,
      createdAt: now,
    });
  });
  return readPage(page);
}
