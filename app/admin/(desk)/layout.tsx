import { catalogRole } from "@/features/catalog/server/access";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { AdminShell } from "@/features/admin/AdminShell";
export const dynamic = "force-dynamic";
export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const email = user.email || "";
  return (
    <AdminShell email={email} role={catalogRole(user)}>
      {children}
    </AdminShell>
  );
}
