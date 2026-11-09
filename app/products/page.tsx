import { pageMeta } from "@/lib/seo";
import { ProductsPage } from "@/components/pages/products";

export const metadata = pageMeta(
  "Plant Material & Varieties",
  "Certified, virus-indexed apple planting material — Gala, Fuji, Red Delicious, Honeycrisp, Pink Lady, Golden Delicious, Granny Smith, and Ambri (GI). M9, M26, MM106 and M7 rootstocks. Direct WhatsApp enquiry.",
  "/products",
);

export default function Page() {
  return <ProductsPage />;
}
