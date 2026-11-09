import { PageHero } from "@/components/sections";
import { Button } from "@/components/ui";
export default function NotFound() {
  return (
    <PageHero
      eyebrow="404"
      title="This path {leads nowhere.}"
      actions={<Button href="/">Back to home</Button>}
    >
      <p>The page you were looking for has moved or never existed.</p>
    </PageHero>
  );
}
