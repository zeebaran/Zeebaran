import { isTeamMembers, teamIssue, teamSchema } from "@/features/team/schema";
import type { TeamMember } from "@/features/team/model";
import { podcastSchema } from "@/features/podcast/schema";
import { prepareYoutubePoster } from "@/features/media/server-posters";
import { verifyMediaReferences } from "@/features/media/server/registration";
import { sameContent } from "../equal-content";
import { prunePageHistory, retainedPageRevisions } from "./history";
import { assetId } from "@/features/media/delivery";
import "server-only";
import { after } from "next/server";
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
    images: z.record(z.string(), media.nullable()),
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
    team: z
      .custom<TeamMember[]>((value) => isTeamMembers(value), "Invalid team profiles")
      .optional(),
    partners: z
      .custom<PartnerEntry[]>((value) => isPartnerEntries(value), "Invalid partner entries")
      .optional(),
    missionSections: z
      .object({ orchard: missionCards, process: missionCards, demos: missionCards })
      .strict()
      .optional(),
    podcast: podcastSchema.optional(),
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
    if (value && typeof value === "object" && "podcast" in value) {
      const check = podcastSchema.safeParse(value.podcast);
      if (!check.success)
        throw new AdminError(422, check.error.issues[0]?.message || "Check the podcast episodes.");
    }
    if (value && typeof value === "object" && "team" in value && Array.isArray(value.team)) {
      const issue = teamIssue(value.team as TeamMember[]);
      if (issue) throw new AdminError(422, issue);
    }
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
  if (result.podcast !== undefined && page !== "podcast")
    throw new AdminError(422, "Podcast episodes belong to the Podcast page.");
  for (const episode of result.podcast?.episodes || []) episode.url = youtubeUrl(episode.url)!;
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
  // Verify each distinct image once per save, including shared page/team/logo placements.
  // Keep this request-scoped: registrations are checked afresh on every mutation.
  const imageChecks = new Map<string, { src: string; message: string }>();
  function queueImage(publicId: string, src: string, message: string) {
    const previous = imageChecks.get(publicId);
    if (previous && previous.src !== src)
      throw new AdminError(422, "The same image cannot use different source URLs.");
    imageChecks.set(publicId, { src, message });
  }
  const images = new Map(definition.images.map((i) => [i.key, i]));
  for (const [key, image] of Object.entries(result.images)) {
    const field = images.get(key);
    if (!field) throw new AdminError(422, "This image does not belong to the page.");
    if (image === null) continue;
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
    queueImage(image.publicId, image.src, "This image has not been verified.");
  }
  if (result.team !== undefined && page !== "about")
    throw new AdminError(422, "Team profiles belong to the About page.");
  if (result.team)
    result.team = teamSchema
      .parse(result.team)
      .map((member) => ({ ...member, specialisations: member.specialisations.filter(Boolean) }));
  for (const member of result.team || []) {
    if (!member.image) continue;
    const image = member.image;
    if (!cloudUrl(image.src, "image") || !image.publicId)
      throw new AdminError(422, "Choose a verified library portrait.");
    queueImage(
      image.publicId,
      image.src,
      "A team portrait has not been verified by the media library.",
    );
  }
  if (result.partners !== undefined && page !== "partnerships")
    throw new AdminError(422, "Partners belong to the Partnerships page.");
  for (const partner of result.partners || []) {
    if (partner.mode !== "image" || !partner.image) continue;
    partner.name = partnerLabel(partner);
    const image = partner.image;
    if (!cloudUrl(image.src, "image") || !image.publicId)
      throw new AdminError(422, "Choose a verified library logo.");
    queueImage(
      image.publicId,
      image.src,
      "A partner logo has not been verified by the media library.",
    );
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
  for (const { video, title, description } of configuredVideos) {
    if (!title.trim() || title.length > 200 || !description.trim())
      throw new AdminError(422, "Add a video title and description to each configured card.");
    if (video.kind === "youtube") {
      const url = youtubeUrl(video.src);
      if (!url) throw new AdminError(422, "Use a valid YouTube video link.");
      video.src = url;
    } else {
      if (!cloudUrl(video.src, "video"))
        throw new AdminError(422, "Choose a verified library video.");
    }
  }
  if (Buffer.byteLength(JSON.stringify(result)) > 240000)
    throw new AdminError(413, "This page exceeds the content limit.");
  return result as ContentValue;
}
function youtubeIds(content: ContentValue) {
  const videos = [
    ...(content.podcast?.episodes || []).map((episode) => ({
      kind: "youtube" as const,
      src: episode.url,
    })),
    ...Object.values(content.videos || {}),
    ...Object.values(content.missionSections || {})
      .flat()
      .map((card) => card.video),
  ];
  return new Set(
    videos
      .filter((video) => video?.kind === "youtube")
      .map((video) => video!.src.split("/").at(-1)!),
  );
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
  const ref = getFirestore(firebase()).collection("cmsPages").doc(page);
  const fields = ["action", "actor", "createdAt", "revision"];
  const [snapshot, records] = await Promise.all([
    ref.get(),
    ref
      .collection("history")
      .orderBy("revision", "desc")
      .select(...fields)
      .limit(retainedPageRevisions)
      .get(),
  ]);
  const rows = [...records.docs];
  const current = snapshot.data();
  const publishedId = current?.publishedHistoryId;
  if (typeof publishedId === "string" && /^[a-f0-9-]{36}$/.test(publishedId)) {
    if (!rows.some((row) => row.id === publishedId)) {
      const pinned = await ref
        .collection("history")
        .select(...fields)
        .where("__name__", "==", publishedId)
        .limit(1)
        .get();
      rows.push(...pinned.docs);
    }
  }
  // A previous live publication remains a rollback point after many intervening draft saves.
  for (const timestamp of [current?.publishedAt, current?.previousPublishedAt]) {
    if (
      !(timestamp instanceof Timestamp) ||
      rows.some((row) => row.get("action") === "publish" && timestamp.isEqual(row.get("createdAt")))
    )
      continue;
    const legacy = await ref
      .collection("history")
      .where("createdAt", "==", timestamp)
      .select(...fields)
      .limit(2)
      .get();
    rows.push(
      ...legacy.docs.filter(
        (row) => row.get("action") === "publish" && !rows.some((known) => known.id === row.id),
      ),
    );
  }
  return rows.map((doc) => ({
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
  let posters: string[] = [];
  const committedRevision = await db.runTransaction(async (tx) => {
    // Match deletion lock order: media first, then the owning content document.
    await verifyMediaReferences(db, tx, content);
    const existing = await tx.get(ref),
      current = existing.data();
    if ((current?.revision || 0) !== request.data.revision)
      throw new AdminError(
        409,
        "A newer revision was saved elsewhere. Reload before editing to avoid overwriting it.",
      );
    const unchangedDraft = sameContent(
      content,
      placedContent(page, current?.draft || emptyContent()),
    );
    if (
      unchangedDraft &&
      (request.data.action !== "publish" ||
        (current?.publishedAt &&
          sameContent(content, placedContent(page, current.published || emptyContent()))))
    )
      return null;
    if (
      request.data.action !== "restore" &&
      !lockedCopyUnchanged(
        content.text,
        current?.draft?.text || {},
        new Set(editorDefinition(page, catalog[page], "visual").fields.map((field) => field.key)),
      )
    )
      throw new AdminError(422, "Only the page's editable text fields can be changed.");
    const previousVideos = youtubeIds(current?.draft || emptyContent());
    posters = [...youtubeIds(content)].filter(
      (id) => request.data.action === "publish" || !previousVideos.has(id),
    );
    const revision = request.data.revision + 1,
      now = Timestamp.now();
    const update = {
      draft: content,
      revision,
      updatedAt: now,
      updatedBy: user.uid,
      ...(request.data.action === "publish"
        ? {
            published: content,
            publishedAt: now,
            publishedHistoryId: history.id,
            ...(current?.publishedAt instanceof Timestamp
              ? { previousPublishedAt: current.publishedAt }
              : {}),
          }
        : {}),
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
    return revision;
  });
  if (committedRevision !== null && committedRevision > retainedPageRevisions)
    after(async () => {
      try {
        await prunePageHistory(page);
      } catch {
        console.error(JSON.stringify({ event: "cms.history_cleanup_failed", page }));
      }
    });
  // Poster delivery is optional. Complete the revision first; provider latency must not block saving.
  // Changed publications retry missing posters; unchanged submissions schedule no work.
  if (posters.length)
    after(async () => {
      for (let start = 0; start < posters.length; start += 3)
        await Promise.allSettled(posters.slice(start, start + 3).map(prepareYoutubePoster));
    });
  return readPage(page);
}
