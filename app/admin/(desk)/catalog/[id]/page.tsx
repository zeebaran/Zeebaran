import { notFound } from "next/navigation";
import { catalogAccess } from "@/features/catalog/server/access";
import { readEntry } from "@/features/catalog/server/store";
import { CatalogEditor } from "@/features/catalog/admin/CatalogEditor";
import { AdminError } from "@/features/admin/server/security";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await catalogAccess(),
    { id } = await params;
  let record;
  try {
    record = await readEntry(id);
  } catch (e) {
    if (e instanceof AdminError && (e.status === 404 || e.status === 422)) notFound();
    throw e;
  }
  if (record.deleted) notFound();
  return <CatalogEditor key={id} initial={record} kind={record.draft.kind} role={role} />;
}
