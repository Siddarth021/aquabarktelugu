import { getAdminDashboardStats, getAdminProducts, getAdminCategories } from "@/actions/admin";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const products = await getAdminProducts();
  const categories = await getAdminCategories();

  return (
    <AdminDashboardView
      initialStats={stats}
      allProducts={products}
      allCategories={categories}
    />
  );
}
