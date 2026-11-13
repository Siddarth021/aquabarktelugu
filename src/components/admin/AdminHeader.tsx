"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdminAction } from "@/actions/admin";
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  FolderTree,
  RotateCcw,
  Settings,
  LogOut,
  Fish,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

interface AdminHeaderProps {
  pendingCount?: number;
  lowStockCount?: number;
}

export function AdminHeader({ pendingCount = 0, lowStockCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: Package,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: "bg-amber-500",
    },
    {
      href: "/admin/products",
      label: "Products & Price",
      icon: Layers,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: "bg-rose-500",
    },
    { href: "/admin/combos", label: "Combos", icon: Sparkles },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/cancellations", label: "Cancellations", icon: RotateCcw },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAdminAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-aquabark-border/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Info */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary shadow-sm group-hover:bg-aquabark-darker transition-colors">
                <Fish className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-aquabark-dark leading-tight tracking-tight">
                  AquaBark
                </span>
                <span className="text-[11px] font-semibold text-aquabark-terracotta tracking-wider uppercase">
                  Mobile Admin
                </span>
              </div>
            </Link>

            {/* Mobile Online status dot */}
            <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-700">Live Studio</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-aquabark-secondary/80 text-aquabark-dark font-semibold shadow-xs"
                      : "text-aquabark-muted hover:text-aquabark-dark hover:bg-aquabark-bg"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Storefront preview & Logout */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              title="Open Customer Storefront"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-aquabark-border text-xs font-medium text-aquabark-dark hover:bg-aquabark-secondary/40 transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              title="Sign out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Menu Toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-aquabark-dark hover:bg-aquabark-secondary/50 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-aquabark-border bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-aquabark-dark text-white font-semibold"
                    : "text-aquabark-text hover:bg-aquabark-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 opacity-90" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-aquabark-border/60">
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm text-aquabark-muted hover:text-aquabark-dark"
            >
              <span>View Customer Storefront</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
