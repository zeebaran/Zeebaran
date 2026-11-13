import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { catalogRole } from "@/features/catalog/server/access";
import { readSettings } from "@/features/site/server";
import { ContactSettings } from "@/features/admin/ContactSettings";
export default async function SettingsPage() {
  const user = await requireAdmin();
  if (catalogRole(user) !== "admin") redirect("/admin");
  return <ContactSettings initial={await readSettings()} />;
}
