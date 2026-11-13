import { PageContent } from "@/features/cms/server/public";
import { pageMeta } from "@/lib/seo";
import { PodcastPage } from "@/features/podcast/PodcastPage";
export const metadata = pageMeta(
  "Bazm-e-Khayal · Podcast",
  "Agricultural conversations with growers, doctors, scientists and professionals. Watch Bazm-e-Khayal, the Zeebaran podcast.",
  "/podcast",
);
export default function Podcast() {
  return (
    <PageContent page="podcast">
      <PodcastPage />
    </PageContent>
  );
}
