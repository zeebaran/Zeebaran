import "server-only";
import { draftMode } from "next/headers";
import { adminSession } from "@/features/admin/server/security";
import { readPage } from "./store";
import { unstable_cache } from "next/cache";
import { getFirestore } from "firebase-admin/firestore";
import { firebase } from "@/lib/firebase-admin";
import { ContentProvider } from "../Content";
import { emptyContent, placedContent, type ContentValue } from "../model";
import { cache } from "react";
import { resolveSettings } from "@/features/site/server";
import { SettingsProvider } from "@/features/site/SettingsProvider";
export const publishedContent = cache(function publishedContent(page: string) {
  return unstable_cache(
    async () => {
      if (!process.env.FIREBASE_PROJECT_ID) return emptyContent();
      const doc = await getFirestore(firebase()).collection("cmsPages").doc(page).get();
      const data = doc.data();
      const content = placedContent(page, (data?.published as ContentValue) || emptyContent());
      if (page === "podcast" && content.podcast)
        content.podcast.episodes = content.podcast.episodes.filter((episode) => episode.enabled);
      if (page === "about" && content.team)
        content.team = content.team.filter((member) => member.enabled);
      if (page === "site" && data?.publicSettings)
        content.publicSettings = resolveSettings(data.publicSettings, content.text);
      return content;
    },
    [
      "published-cms",
      page,
      process.env.FIREBASE_PROJECT_ID || "unconfigured",
      process.env.FIRESTORE_EMULATOR_HOST || "cloud",
    ],
    { tags: ["cms:" + page], revalidate: 60 },
  )().catch((error) => {
    // Failed refreshes must remain errors inside Next's cache, so successful
    // published overrides are retained rather than replaced by authored defaults.
    console.error(
      JSON.stringify({
        event: "cms.read_failed",
        page,
        type: error instanceof Error ? error.name : "Unknown",
      }),
    );
    return emptyContent();
  });
});
export async function PageContent({ page, children }: { page: string; children: React.ReactNode }) {
  let content = await publishedContent(page),
    preview = false;
  const settings = page === "site" ? resolveSettings(content.publicSettings, content.text) : null;
  const configured = !!content.publicSettings;
  if ((await draftMode()).isEnabled) {
    try {
      await adminSession();
      content = (await readPage(page)).draft;
      preview = true;
    } catch {
      // A stale preview cookie never exposes draft content without a valid admin session.
    }
  }
  const cmsValue = settings ? { text: content.text, images: content.images } : content;
  const rendered = (
    <ContentProvider page={page} value={cmsValue}>
      {preview && page !== "site" && (
        <div className="cms-preview-banner">
          Draft preview — visible only to you.{" "}
          <a href={"/api/admin/preview?page=" + page + "&exit=1"}>Exit preview</a>
        </div>
      )}
      {children}
    </ContentProvider>
  );
  return settings ? (
    <SettingsProvider settings={settings} configured={configured}>
      {rendered}
    </SettingsProvider>
  ) : (
    rendered
  );
}
