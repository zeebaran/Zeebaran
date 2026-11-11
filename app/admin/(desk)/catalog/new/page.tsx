import { catalogAccess } from "@/features/catalog/server/access";
import { CatalogEditor } from "@/features/catalog/admin/CatalogEditor";
export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { role } = await catalogAccess("edit"),
    { kind } = await searchParams;
  return (
    <CatalogEditor
      key={kind}
      kind={kind === "rootstock" ? "rootstock" : "variety"}
      role={role}
      initial={null}
    />
  );
}
