import "server-only";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { firebase } from "@/lib/firebase-admin";
import { AdminError } from "@/features/admin/server/security";
import { textKey } from "@/features/cms/model";
import { defaultSettings, type SiteSettings, type SettingsRecord } from "./model";
import { siteSettingsSchema } from "./schema";

export function resolveSettings(value: unknown, legacy: Record<string, string> = {}) {
  const result = siteSettingsSchema.safeParse(value);
  return result.success ? result.data : defaultSettings((text) => legacy[textKey(text)] ?? text);
}
export async function readSettings(): Promise<SettingsRecord> {
  const db = getFirestore(firebase());
  const doc = await db.collection("cmsPages").doc("site").get();
  const data = doc.data();
  // One-time compatibility: retain previously published contact-page edits on first save.
  let legacy = data?.published?.text || {};
  if (!data?.publicSettings) {
    const contact = await db.collection("cmsPages").doc("contact").get();
    legacy = { ...legacy, ...contact.get("published.text") };
  }
  return {
    settings: resolveSettings(data?.publicSettings, legacy),
    revision: data?.settingsRevision || 0,
    updatedAt:
      data?.settingsUpdatedAt instanceof Timestamp
        ? data.settingsUpdatedAt.toDate().toISOString()
        : null,
  };
}
export async function saveSettings(
  settings: SiteSettings,
  revision: number,
  uid: string,
): Promise<SettingsRecord> {
  const validated = siteSettingsSchema.safeParse(settings);
  if (!validated.success)
    throw new AdminError(422, validated.error.issues[0]?.message || "Check the contact settings.");
  const db = getFirestore(firebase()),
    ref = db.collection("cmsPages").doc("site");
  const now = Timestamp.now();
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if ((doc.get("settingsRevision") || 0) !== revision)
      throw new AdminError(
        409,
        "These settings changed in another session. Reload before saving; your entries are still here.",
      );
    tx.set(
      ref,
      {
        publicSettings: validated.data,
        settingsRevision: revision + 1,
        settingsUpdatedAt: now,
        settingsUpdatedBy: uid,
      },
      {
        mergeFields: [
          "publicSettings",
          "settingsRevision",
          "settingsUpdatedAt",
          "settingsUpdatedBy",
        ],
      },
    );
    tx.create(db.collection("cmsAudit").doc(randomUUID()), {
      page: "site",
      action: "contact-settings",
      revision: revision + 1,
      actor: uid,
      createdAt: now,
    });
  });
  return {
    settings: validated.data,
    revision: revision + 1,
    updatedAt: now.toDate().toISOString(),
  };
}
