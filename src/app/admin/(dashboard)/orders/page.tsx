import { getAdminOrders } from "@/actions/admin";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";
import { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusParam = searchParams.status?.toUpperCase() as OrderStatus | undefined;
  const initialFilter = statusParam || "ALL";

  const orders = await getAdminOrders();

  return <AdminOrdersView initialOrders={orders} initialStatusFilter={initialFilter} />;
}
