"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Settings,
} from "lucide-react";

interface AdminBottomNavProps {
  pendingCount?: number;
}

export function AdminBottomNav({ pendingCount = 0 }: AdminBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Home",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: Package,
      active: pathname.startsWith("/admin/orders"),
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: Layers,
      active: pathname.startsWith("/admin/products"),
    },
    {
      href: "/admin/combos",
      label: "Combos",
      icon: Sparkles,
      active: pathname.startsWith("/admin/combos"),
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-aquabark-border/80 lg:hidden shadow-lg safe-bottom">
      <nav className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 transition-all ${
                item.active
                  ? "text-aquabark-dark font-semibold scale-105"
                  : "text-aquabark-muted hover:text-aquabark-text"
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
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] leading-tight mt-0.5 tracking-tight ${
                  item.active ? "font-bold text-aquabark-dark" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
