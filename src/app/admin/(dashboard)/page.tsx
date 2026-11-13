import { getAdminDashboardStats, getAdminProducts } from "@/actions/admin";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const products = await getAdminProducts();

  return (
    <AdminDashboardView
      stats={{
        newOrdersCount: stats.pendingOrdersCount,
        totalProductsCount: products.length,
        salesTotal: stats.totalSales,
        recentOrders: stats.recentOrders,
      }}
    />
  );
}
