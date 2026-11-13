import { requireAdmin } from "@/features/admin/server/require-admin";
import { catalogRole } from "@/features/catalog/server/access";
import { MediaLibrary } from "@/features/admin/MediaLibrary";
export default async function MediaPage() {
  const user = await requireAdmin();
  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">THE SHARED COLLECTION</p>
          <h1>
            Images with purpose.
            <br />
            <em>Stories with a place.</em>
          </h1>
          <p>Upload photographs and films, then choose their place in a page workspace.</p>
        </div>
      </div>
      <MediaLibrary canDelete={catalogRole(user) === "admin"} />
    </div>
  );
}
