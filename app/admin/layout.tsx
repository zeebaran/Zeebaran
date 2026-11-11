import type { Metadata } from "next";
import "./admin.css";
import { AdminBoundary } from "@/features/admin/AdminBoundary";
export const metadata: Metadata = {
  title: "Zeebaran · Editorial desk",
  robots: { index: false, follow: false },
  referrer: "same-origin",
};
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminBoundary>{children}</AdminBoundary>;
}
