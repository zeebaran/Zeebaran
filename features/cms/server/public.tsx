import "server-only";
import { draftMode } from "next/headers";
import { adminSession } from "@/features/admin/server/security";
import { readPage } from "./store";
import { unstable_cache } from "next/cache";
import { getFirestore } from "firebase-admin/firestore";
import { firebase } from "@/lib/firebase-admin";
import { ContentProvider } from "../Content";
import { emptyContent, placedContent, type ContentValue } from "../model";
export function publishedContent(page: string) {
  return unstable_cache(
    async () => {
      if (!process.env.FIREBASE_PROJECT_ID) return emptyContent();
      const doc = await getFirestore(firebase()).collection("cmsPages").doc(page).get();
      return placedContent(page, (doc.data()?.published as ContentValue) || emptyContent());
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
}
export async function PageContent({ page, children }: { page: string; children: React.ReactNode }) {
  let content = await publishedContent(page),
    preview = false;
  if ((await draftMode()).isEnabled) {
    try {
      await adminSession();
      content = (await readPage(page)).draft;
      preview = true;
    } catch {
      // A stale preview cookie never exposes draft content without a valid admin session.
    }
  }
  return (
    <ContentProvider page={page} value={content}>
      {preview && page !== "site" && (
        <div className="cms-preview-banner">
          Draft preview — visible only to you.{" "}
          <a href={"/api/admin/preview?page=" + page + "&exit=1"}>Exit preview</a>
        </div>
      )}
      {children}
    </ContentProvider>
  );
}
