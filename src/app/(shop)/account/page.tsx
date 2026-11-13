"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Package, 
  Heart, 
  Truck, 
  XCircle, 
  LogOut, 
  MapPin, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function AccountDashboardPage() {
  const router = useRouter();
  const { wishlist } = useCart();
  const [name, setName] = useState("Kiran Varma");
  const [phone, setPhone] = useState("9848012345");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("aquabark_user_name");
      const storedPhone = localStorage.getItem("aquabark_user_phone");
      if (storedName) setName(storedName);
      if (storedPhone) setPhone(storedPhone);

      const storedOrders = JSON.parse(localStorage.getItem("aquabark_orders") || "[]");
      setOrders(storedOrders);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("aquabark_user_logged_in");
    router.push("/login");
  };

  return (
    <div className="py-12 bg-aquabark-bg min-h-[75vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark font-serif font-bold text-2xl">
              {name.charAt(0)}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-aquabark-terracotta">
                Verified Aquarist
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-aquabark-dark">
                {name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-aquabark-muted mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  +91 {phone}
                </span>
                <span>•</span>
                <span>Andhra Pradesh / South India</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            href="/account/orders"
            className="p-6 rounded-3xl bg-white border border-aquabark-border shadow-soft hover:shadow-card transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-aquabark-muted block">Total Orders</span>
              <span className="font-serif text-3xl font-bold text-aquabark-dark mt-1 block">
                {orders.length}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                View order history →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/track"
            className="p-6 rounded-3xl bg-white border border-aquabark-border shadow-soft hover:shadow-card transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-aquabark-muted block">Active Transit</span>
              <span className="font-serif text-3xl font-bold text-aquabark-dark mt-1 block">
                {orders.filter((o) => ["CONFIRMED", "PREPARING", "SHIPPED"].includes(o.status)).length}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                Live bus/rail tracking →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/shop?filter=wishlist"
            className="p-6 rounded-3xl bg-white border border-aquabark-border shadow-soft hover:shadow-card transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-aquabark-muted block">Saved In Wishlist</span>
              <span className="font-serif text-3xl font-bold text-aquabark-dark mt-1 block">
                {wishlist.length}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                View saved flora & fauna →
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
          </Link>
        </div>

        {/* Account Subsections Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Order Management & Receipts */}
          <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 space-y-4">
            <h2 className="font-serif text-lg font-bold text-aquabark-dark pb-2 border-b border-aquabark-border">
              Order Services
            </h2>
            <div className="space-y-2">
              <Link
                href="/account/orders"
                className="p-3.5 rounded-2xl bg-aquabark-bg hover:bg-aquabark-secondary/50 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-aquabark-dark" />
                  <span className="text-xs font-bold text-aquabark-dark">
                    Order History & Invoices
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-aquabark-muted group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/account/cancellations"
                className="p-3.5 rounded-2xl bg-aquabark-bg hover:bg-aquabark-secondary/50 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-4 h-4 text-aquabark-dark" />
                  <span className="text-xs font-bold text-aquabark-dark">
                    Request Order Cancellation / Refund
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-aquabark-muted group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Guarantees & Support */}
          <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 space-y-4">
            <h2 className="font-serif text-lg font-bold text-aquabark-dark pb-2 border-b border-aquabark-border">
              Livestock Safety & Guarantees
            </h2>
            <div className="space-y-2">
              <Link
                href="/policies/guarantee"
                className="p-3.5 rounded-2xl bg-aquabark-bg hover:bg-aquabark-secondary/50 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-aquabark-dark">
                    100% Live Arrival Guarantee Guidelines
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-aquabark-muted group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/policies/shipping"
                className="p-3.5 rounded-2xl bg-aquabark-bg hover:bg-aquabark-secondary/50 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-aquabark-dark">
                    Bus & Rail Parcel Pickup Station Guide
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-aquabark-muted group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

