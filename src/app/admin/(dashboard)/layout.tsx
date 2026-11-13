import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { store } from "@/lib/store";

export const metadata = {
  title: "AquaBarkTelugu Admin | Console",
  description: "Minimalist store management for live aquarium fish and plants.",
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

  // Count pending orders, low stock items, and cancellations for badges
  const orders = await store.getAllOrders();
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;

  const products = await store.getAllAdminProducts();
  let lowStockCount = 0;
  for (const prod of products) {
    for (const v of prod.variants) {
      if (v.stock <= 5) lowStockCount++;
    }
  }

  const cancellations = await store.getCancellationRequests();
  const pendingCancellationsCount = cancellations.filter((c) => c.status === "REQUESTED").length;

  return (
    <div className="min-h-screen bg-aquabark-bg text-aquabark-text flex antialiased">
      {/* Desktop Sidebar */}
      <AdminSidebar
        pendingCount={pendingOrdersCount}
        cancellationCount={pendingCancellationsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <AdminHeader
          pendingCount={pendingOrdersCount}
          lowStockCount={lowStockCount}
          cancellationCount={pendingCancellationsCount}
        />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
          {children}
        </main>

        {/* Mobile Sticky Bottom Navigation with "More" Slide-Over */}
        <AdminBottomNav
          pendingCount={pendingOrdersCount}
          cancellationCount={pendingCancellationsCount}
        />
      </div>
    </div>
  );
}
