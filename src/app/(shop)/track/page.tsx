"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Truck, Bus, Train, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function TrackSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("aquabark_orders") || "[]");
      setRecentOrders(saved);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/track/${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="py-12 bg-aquabark-bg min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-aquabark-secondary px-3.5 py-1.5 rounded-full text-xs font-bold text-aquabark-dark">
            <Truck className="w-4 h-4 text-emerald-800" />
            <span>Overnight Bus & Rail Parcel Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-aquabark-dark">
            Track Live Livestock Parcel
          </h1>
          <p className="text-xs sm:text-sm text-aquabark-muted">
            Enter your Order Number (e.g. <code>ABT-2026-XXXXXX</code>) or Dispatch Waybill / LR Number to check transit status, bus departure, and station counter pickup readiness.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl border border-aquabark-border shadow-card p-6 sm:p-8 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-aquabark-muted" />
              <input
                type="text"
                placeholder="Enter Order ID or Waybill Number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-aquabark-bg border border-aquabark-border rounded-full text-sm text-aquabark-dark placeholder-aquabark-muted focus:outline-none focus:border-aquabark-dark uppercase"
              />
            </div>
            <button
              type="submit"
              className="bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs font-bold px-8 py-3.5 rounded-full shadow-soft flex items-center justify-center gap-2 transition-all"
            >
              <span>TRACK SHIPMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Supported Couriers & Logistics */}
          <div className="pt-6 mt-6 border-t border-aquabark-border/60 flex flex-wrap items-center justify-center gap-6 text-xs text-aquabark-muted">
            <div className="flex items-center gap-1.5 font-medium text-aquabark-dark">
              <Bus className="w-4 h-4 text-emerald-800" />
              <span>TSRTC Bus Parcel</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-aquabark-dark">
              <Bus className="w-4 h-4 text-emerald-800" />
              <span>APSRTC Express Cargo</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-aquabark-dark">
              <Train className="w-4 h-4 text-blue-800" />
              <span>South Central Railway (SCR)</span>
            </div>
          </div>
        </div>

        {/* Recent Orders from current user session */}
        {recentOrders.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-aquabark-dark">
              Your Recent Orders
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id || order.orderNumber}
                  href={`/track/${order.orderNumber}`}
                  className="p-5 rounded-2xl bg-white border border-aquabark-border shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-aquabark-dark">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-aquabark-muted">
                    <p>Total: {formatINR(order.totalAmount)}</p>
                    <p className="line-clamp-1 mt-0.5">
                      Destination: {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-aquabark-border flex items-center justify-between text-xs font-bold text-aquabark-dark group-hover:text-aquabark-accent">
                    <span>View Tracking Status</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

