import { catalogAccess } from "@/features/catalog/server/access";
import { adminEntries } from "@/features/catalog/server/store";
import { CatalogIndex } from "@/features/catalog/admin/CatalogIndex";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await catalogAccess();
  const params = await searchParams,
    kind = params.kind === "rootstock" ? "rootstock" : "variety",
    deleted = params.deleted === "1";
  return (
    <CatalogIndex
      key={kind + deleted}
      kind={kind}
      deleted={deleted}
      initial={await adminEntries(kind, deleted)}
    />
  );
}
