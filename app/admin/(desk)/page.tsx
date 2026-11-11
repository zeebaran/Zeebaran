import { AssetImage } from "@/features/media/AssetImage";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { AdminLink as Link } from "@/features/admin/AdminLink";
import { ArrowUpRight, ArrowRight, ImageIcon, ShieldCheck, Clock3, Feather } from "lucide-react";
import { getFirestore, FieldPath } from "firebase-admin/firestore";
import { firebase } from "@/lib/firebase-admin";
import { catalog } from "@/features/cms/catalog";
import { contentPages } from "@/features/cms/model";
export default async function Desk() {
  await requireAdmin();
  const rows = await getFirestore(firebase())
    .collection("cmsPages")
    .where(
      FieldPath.documentId(),
      "in",
      contentPages.map((p) => p[0]),
    )
    .select("publishedAt", "updatedAt")
    .get();
  const pages = new Map(rows.docs.map((doc) => [doc.id, doc.data()]));
  const totalImages = contentPages.reduce((n, p) => n + (catalog[p[0]]?.images.length || 0), 0),
    published = rows.docs.filter((d) => d.get("publishedAt")).length;
  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">YOUR WEBSITE, CONSIDERED.</p>
          <h1>
            A living story.
            <br />
            <em>Thoughtfully tended.</em>
          </h1>
          <p>Look after the words and imagery that bring Zeebaran to life.</p>
        </div>
        <Link href="/admin/pages/home" className="admin-btn admin-primary">
          Start with Home <ArrowRight size={16} />
        </Link>
      </div>
      <section className="admin-summary" aria-label="Website summary">
        {[
          [String(contentPages.length), "Page workspaces", <Feather key="p" size={18} />],
          [String(totalImages), "Editable image placements", <ImageIcon key="i" size={18} />],
          [String(published), "Pages published from the desk", <ShieldCheck key="s" size={18} />],
        ].map(([n, t, icon]) => (
          <div key={String(t)}>
            {icon}
            <strong>{n}</strong>
            <span>{t}</span>
          </div>
        ))}
      </section>
      <section className="admin-overview-feature">
        <div>
          <p className="admin-eyebrow">THE OPENING CHAPTER</p>
          <h2>
            Rooted in the valley.
            <br />
            <em>Ready for what’s next.</em>
          </h2>
          <p>
            Refine the first impression. Edit the homepage narrative, replace an orchard photograph,
            or prepare a film for publication.
          </p>
          <Link href="/admin/pages/home">
            Open the Home workspace <ArrowUpRight size={17} />
          </Link>
        </div>
        <div
          className="admin-feature-photo"
          role="img"
          aria-label="The Himalayan orchard at Zeebaran"
        >
          <AssetImage
            src="asset:banners/home/home-desktop-2400x1140-new-webp"
            alt=""
            fill
            sizes="(min-width:1024px) 40vw, 100vw"
            className="object-cover"
          />
          <span>
            <i /> THE HOME EXPERIENCE
          </span>
        </div>
      </section>
      <div className="admin-section-heading">
        <div>
          <p className="admin-eyebrow">THE EDITORIAL INDEX</p>
          <h2>Every page. Its own purpose.</h2>
        </div>
        <span>{contentPages.length} dedicated workspaces</span>
      </div>
      <section className="admin-page-grid" aria-label="Page editors">
        {contentPages.map(([id, title, url, description], i) => {
          const record = pages.get(id);
          return (
            <Link href={"/admin/pages/" + id} key={id} className="admin-page-card">
              <div>
                <span className="admin-card-index">{String(i + 1).padStart(2, "0")}</span>
                <span className={"admin-status " + (record?.publishedAt ? "published" : "")}>
                  {record?.publishedAt
                    ? "Published"
                    : record?.updatedAt
                      ? "Draft saved"
                      : "Original website"}
                </span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <footer>
                <span>{url}</span>
                <ArrowUpRight size={17} />
              </footer>
            </Link>
          );
        })}
      </section>
      <div className="admin-workflow-note">
        <Clock3 size={20} />
        <div>
          <strong>Make room for a careful review.</strong>
          <p>
            Save a draft, preview the actual page, and publish when it reads and feels right.
            Previous revisions stay available in each workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
