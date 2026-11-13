"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  Sparkles,
  RotateCcw,
  Settings,
  Fish,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { logoutAdminAction } from "@/actions/admin";

interface AdminSidebarProps {
  pendingCount?: number;
  cancellationCount?: number;
}

export function AdminSidebar({ pendingCount = 0, cancellationCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
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
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: "bg-amber-500",
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Layers,
      active: pathname.startsWith("/admin/products"),
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
      active: pathname.startsWith("/admin/categories"),
    },
    {
      name: "Combos & Offers",
      href: "/admin/combos",
      icon: Sparkles,
      active: pathname.startsWith("/admin/combos"),
    },
    {
      name: "Cancellations",
      href: "/admin/cancellations",
      icon: RotateCcw,
      active: pathname.startsWith("/admin/cancellations"),
      badge: cancellationCount > 0 ? cancellationCount : undefined,
      badgeColor: "bg-rose-500",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-aquabark-border/80 min-h-screen shrink-0">
      {/* Brand Header in Sidebar */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-aquabark-border/60">
        <div className="w-10 h-10 rounded-2xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary shadow-xs">
          <Fish className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <span className="font-serif font-bold text-base text-aquabark-dark tracking-tight block leading-tight">
            AquaBarkTelugu
          </span>
          <span className="text-[11px] font-semibold text-aquabark-terracotta tracking-wider uppercase">
            Admin Console
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                item.active
                  ? "bg-aquabark-dark text-white shadow-xs"
                  : "text-slate-600 hover:text-aquabark-dark hover:bg-aquabark-secondary/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.active ? "text-aquabark-primary" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions in Sidebar */}
      <div className="p-4 border-t border-aquabark-border/60 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-aquabark-dark hover:bg-aquabark-bg transition-colors"
        >
          <span>View Customer Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <span>Sign Out</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
