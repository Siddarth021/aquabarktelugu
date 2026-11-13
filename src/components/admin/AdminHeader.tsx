"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Fish,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  User,
  ExternalLink,
  Package,
  RotateCcw,
} from "lucide-react";
import { logoutAdminAction } from "@/actions/admin";

interface AdminHeaderProps {
  pendingCount?: number;
  lowStockCount?: number;
  cancellationCount?: number;
}

export function AdminHeader({
  pendingCount = 0,
  lowStockCount = 0,
  cancellationCount = 0,
}: AdminHeaderProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const totalNotifications = pendingCount + cancellationCount + (lowStockCount > 0 ? 1 : 0);

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-aquabark-border/80">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo (Visible on mobile; on desktop the sidebar has it, but subtle brand remains) */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 lg:hidden">
              <div className="w-9 h-9 rounded-2xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary shadow-xs">
                <Fish className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base text-aquabark-dark leading-tight">
                  AquaBarkTelugu
                </span>
                <span className="text-[10px] font-semibold text-aquabark-terracotta tracking-wider uppercase">
                  Admin
                </span>
              </div>
            </Link>

            {/* Live Store status pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800">
                Store Active <span className="hidden sm:inline">• Telugu Dispatch Hubs</span>
              </span>
            </div>
          </div>

          {/* Right Section: Notification Bell + Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="p-2.5 rounded-2xl text-slate-600 hover:text-aquabark-dark hover:bg-slate-100 transition-colors relative cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {totalNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-xl border border-aquabark-border p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-bold text-sm text-aquabark-dark">Notifications</h4>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {totalNotifications} Pending
                    </span>
                  </div>

                  <div className="py-2 space-y-2">
                    {pendingCount > 0 ? (
                      <Link
                        href="/admin/orders?status=PENDING"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">
                            {pendingCount} New Pending Orders
                          </span>
                          <span className="text-slate-500 text-[11px]">Ready for fulfillment confirmation</span>
                        </div>
                      </Link>
                    ) : null}

                    {cancellationCount > 0 ? (
                      <Link
                        href="/admin/cancellations"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">
                            {cancellationCount} Cancellation Request
                          </span>
                          <span className="text-slate-500 text-[11px]">Review refund & stock restoration</span>
                        </div>
                      </Link>
                    ) : null}

                    {lowStockCount > 0 ? (
                      <Link
                        href="/admin/products"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                          <span className="font-bold text-xs font-mono">!</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">
                            {lowStockCount} Variants Low on Stock
                          </span>
                          <span className="text-slate-500 text-[11px]">Tap to restock before sellout</span>
                        </div>
                      </Link>
                    ) : null}

                    {totalNotifications === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Everything is up to date. No pending actions!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Settings Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-aquabark-dark text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  A
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">AquaBark Admin</span>
                  <span className="text-[10px] text-slate-400">Owner Access</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-aquabark-border p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block">Signed in as Admin</span>
                    <span className="text-[11px] text-slate-400">aquabarktelugu.com</span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Store & Feasibility Settings</span>
                    </Link>
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>Customer Storefront</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
