"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Menu,
  X,
  FolderTree,
  Sparkles,
  RotateCcw,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logoutAdminAction } from "@/actions/admin";

interface AdminBottomNavProps {
  pendingCount?: number;
  cancellationCount?: number;
}

export function AdminBottomNav({
  pendingCount = 0,
  cancellationCount = 0,
}: AdminBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: Package,
      active: pathname.startsWith("/admin/orders"),
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Layers,
      active: pathname.startsWith("/admin/products"),
    },
  ];

  const moreMenuItems = [
    {
      name: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
      description: "Manage shop collections & display ordering",
    },
    {
      name: "Combos & Offers",
      href: "/admin/combos",
      icon: Sparkles,
      description: "Starter bundles, nano kits & discounts",
    },
    {
      name: "Cancellations",
      href: "/admin/cancellations",
      icon: RotateCcw,
      description: "Customer return & refund requests",
      badge: cancellationCount > 0 ? cancellationCount : null,
      badgeColor: "bg-rose-500",
    },
    {
      name: "Settings & Logistics",
      href: "/admin/settings",
      icon: Settings,
      description: "RTC Bus & Railway transit feasibility",
    },
  ];

  const handleLogout = async () => {
    setMoreSheetOpen(false);
    await logoutAdminAction();
    router.push("/admin/login");
    router.refresh();
  };

  const isMoreActive =
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/combos") ||
    pathname.startsWith("/admin/cancellations") ||
    pathname.startsWith("/admin/settings");

  return (
    <>
      {/* 4-Item Fixed Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-aquabark-border/80 lg:hidden shadow-lg safe-bottom">
        <nav className="grid grid-cols-4 h-16 max-w-md mx-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreSheetOpen(false)}
                className={`relative flex flex-col items-center justify-center py-1 transition-all ${
                  item.active
                    ? "text-aquabark-dark font-bold scale-105"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className="relative">
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${
                      item.active ? "bg-aquabark-secondary text-aquabark-dark" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight mt-0.5 tracking-tight">
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* "More" Trigger Button */}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              isMoreActive || moreSheetOpen
                ? "text-aquabark-dark font-bold scale-105"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="relative">
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isMoreActive || moreSheetOpen ? "bg-aquabark-secondary text-aquabark-dark" : ""
                }`}
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </div>
              {cancellationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </div>
            <span className="text-[11px] leading-tight mt-0.5 tracking-tight">
              More
            </span>
          </button>
        </nav>
      </div>

      {/* Slide-Over Sheet for "More" */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMoreSheetOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200 space-y-4">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-aquabark-dark text-aquabark-primary flex items-center justify-center font-bold text-xs">
                  AB
                </div>
                <h3 className="font-serif font-bold text-base text-aquabark-dark">
                  Store Administration
                </h3>
              </div>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu List */}
            <div className="space-y-1.5">
              {moreMenuItems.map((menu) => {
                const Icon = menu.icon;
                const isActive = pathname.startsWith(menu.href);
                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    onClick={() => setMoreSheetOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isActive
                        ? "bg-aquabark-secondary/80 text-aquabark-dark font-bold"
                        : "hover:bg-slate-50 text-slate-700 font-semibold"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm leading-tight">{menu.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {menu.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {menu.badge && (
                        <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-rose-500">
                          {menu.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Additional Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMoreSheetOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>View Customer Storefront</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Admin</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
