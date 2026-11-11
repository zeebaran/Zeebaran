import { catalogRole } from "@/features/catalog/server/access";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { catalog } from "@/features/cms/catalog";
import { contentPages } from "@/features/cms/model";
import { editorDefinition } from "@/features/cms/editor-fields";
import { readPage } from "@/features/cms/server/store";
import { PageEditor } from "@/features/admin/PageEditor";
export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const user = await requireAdmin();
  const { page } = await params;
  if (page.startsWith("product-")) redirect("/admin/catalog/" + page.slice(8));
  const entry = contentPages.find((p) => p[0] === page);
  if (!entry) notFound();
  const record = await readPage(page);
  return (
    <PageEditor
      canPublish={catalogRole(user) === "admin"}
      key={page}
      page={page}
      title={entry[1]}
      url={entry[2]}
      description={entry[3]}
      definition={editorDefinition(page, catalog[page] || { fields: [], images: [] })}
      visualDefinition={editorDefinition(
        page,
        catalog[page] || { fields: [], images: [] },
        "visual",
      )}
      initial={record}
    />
  );
}
