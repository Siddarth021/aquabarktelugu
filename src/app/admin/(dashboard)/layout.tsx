import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { adminStore } from "@/lib/admin-store";

export const metadata = {
  title: "AquaBark Admin | Mobile Dashboard",
  description: "Mobile-first store management for live aquarium fish and plants.",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect("/admin/login");
  }

  // Count pending orders & low stock items for badges
  const pendingOrdersCount = adminStore.orders.filter((o) => o.status === "PENDING").length;

  let lowStockCount = 0;
  for (const prod of adminStore.products) {
    for (const v of prod.variants) {
      if (v.stock <= 5) lowStockCount++;
    }
  }

  return (
    <div className="min-h-screen bg-aquabark-bg text-aquabark-text flex flex-col antialiased">
      {/* Sticky Header */}
      <AdminHeader pendingCount={pendingOrdersCount} lowStockCount={lowStockCount} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-10">
        {children}
      </main>

      {/* Mobile Sticky Bottom Navigation (Android first) */}
      <AdminBottomNav pendingCount={pendingOrdersCount} />
    </div>
  );
}
