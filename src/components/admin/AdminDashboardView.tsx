"use client";

import { useState } from "react";
import Link from "next/link";
import { OrderDTO, ProductDTO, CategoryDTO } from "@/types";
import { OrderCard } from "@/components/admin/OrderCard";
import { ShipmentModal } from "@/components/admin/ShipmentModal";
import { StockModal } from "@/components/admin/StockModal";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { ComboModal } from "@/components/admin/ComboModal";
import { formatINR } from "@/lib/utils";
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  Sparkles,
  Truck,
  RotateCcw,
  Sliders,
  ChevronRight,
  Fish,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface AdminDashboardViewProps {
  initialStats: {
    todayOrdersCount: number;
    todayOrdersValue: number;
    pendingOrdersCount: number;
    preparingOrdersCount: number;
    totalSales: number;
    totalOrdersCount: number;
    lowStockCount: number;
    lowStockItems: {
      productId: string;
      productName: string;
      variantId: string;
      variantTitle: string;
      stock: number;
      categoryName: string;
    }[];
    pendingCancellationsCount: number;
    recentOrders: OrderDTO[];
  };
  allProducts: ProductDTO[];
  allCategories: CategoryDTO[];
}

export function AdminDashboardView({
  initialStats,
  allProducts,
  allCategories,
}: AdminDashboardViewProps) {
  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState<OrderDTO[]>(initialStats.recentOrders);

  // Modals state
  const [shipmentOrder, setShipmentOrder] = useState<OrderDTO | null>(null);
  const [stockModalTarget, setStockModalTarget] = useState<{
    productName: string;
    variantId: string;
    variantTitle: string;
    currentStock: number;
  } | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);

  const handleOrderUpdated = (updated: OrderDTO) => {
    setRecentOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (updated.status !== "PENDING") {
      setStats((prev) => ({
        ...prev,
        pendingOrdersCount: Math.max(0, prev.pendingOrdersCount - 1),
      }));
    }
  };

  const handleShipmentSuccess = (trackingNumber: string) => {
    if (shipmentOrder) {
      setRecentOrders((prev) =>
        prev.map((o) =>
          o.id === shipmentOrder.id
            ? {
                ...o,
                status: "SHIPPED",
                shipment: {
                  id: `shp-${Date.now()}`,
                  orderId: o.id,
                  trackingNumber,
                  transportMethod: o.transitMethod || "BUS_PARCEL",
                  operatorName: "Parcel Express",
                  departureLocation: "Hub",
                  destinationStation: o.shippingAddress.city,
                  dispatchDate: new Date().toISOString(),
                },
              }
            : o
        )
      );
    }
  };

  const handleStockSuccess = (newStock: number) => {
    if (stockModalTarget) {
      setStats((prev) => ({
        ...prev,
        lowStockItems: prev.lowStockItems.map((item) =>
          item.variantId === stockModalTarget.variantId ? { ...item, stock: newStock } : item
        ),
      }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner / Store Status */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-aquabark-dark to-aquabark-darker text-white shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-aquabark-primary tracking-wide uppercase">
              Operations Active • Telugu States
            </span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
            Store Performance & Orders
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Dispatches from Hyderabad MGBS / Vijayawada PNBS Parcel Counters
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex-1 sm:flex-none py-2.5 px-3.5 bg-aquabark-primary text-aquabark-dark hover:bg-aquabark-secondary font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setIsComboModalOpen(true)}
            className="flex-1 sm:flex-none py-2.5 px-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Combo</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS (4-grid mobile-first) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Orders */}
        <div className="bg-white p-4 rounded-3xl border border-aquabark-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-aquabark-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-aquabark-dark font-mono">
            {stats.todayOrdersCount}
          </div>
          <p className="text-xs text-aquabark-muted mt-1">
            Value: <span className="font-bold text-slate-700">{formatINR(stats.todayOrdersValue)}</span>
          </p>
        </div>

        {/* Pending Orders Alert */}
        <Link
          href="/admin/orders?status=PENDING"
          className="bg-white p-4 rounded-3xl border border-amber-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              {stats.pendingOrdersCount}
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Action Req.
            </span>
          </div>
          <p className="text-xs text-amber-700/80 mt-1 flex items-center justify-between">
            <span>Tap to process</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* Total Sales */}
        <div className="bg-white p-4 rounded-3xl border border-aquabark-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-aquabark-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-aquabark-dark font-mono truncate">
            {formatINR(stats.totalSales)}
          </div>
          <p className="text-xs text-aquabark-muted mt-1">
            Across {stats.totalOrdersCount} orders
          </p>
        </div>

        {/* Low Stock Alerts */}
        <Link
          href="/admin/products"
          className="bg-white p-4 rounded-3xl border border-rose-200/80 shadow-xs hover:border-rose-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Items</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">
              {stats.lowStockCount}
            </span>
            <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              ≤ 5 units
            </span>
          </div>
          <p className="text-xs text-rose-700/80 mt-1 flex items-center justify-between">
            <span>View variants</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>
      </div>

      {/* LOW STOCK ALERT CARD (Direct quick restock actions) */}
      {stats.lowStockItems.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-600 text-white">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-rose-900">
                Low Inventory Alert ({stats.lowStockItems.length} Variants)
              </h3>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
            >
              <span>All Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {stats.lowStockItems.map((item) => (
              <div
                key={item.variantId}
                className="bg-white p-3 rounded-2xl border border-rose-200/80 shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{item.productName}</h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {item.variantTitle} •{" "}
                    <span className="text-rose-600 font-extrabold">{item.stock} left</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setStockModalTarget({
                      productName: item.productName,
                      variantId: item.variantId,
                      variantTitle: item.variantTitle,
                      currentStock: item.stock,
                    })
                  }
                  className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK ACTIONS BAR */}
      <div>
        <h3 className="text-xs font-bold text-aquabark-dark uppercase tracking-wider mb-2.5">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            href="/admin/orders?status=PREPARING"
            className="p-3.5 bg-white rounded-2xl border border-aquabark-border hover:border-aquabark-primary flex items-center gap-3 transition-colors shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-aquabark-dark block">Bus Dispatches</span>
              <span className="text-[11px] text-aquabark-muted">
                {stats.preparingOrdersCount} ready to pack
              </span>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="p-3.5 bg-white rounded-2xl border border-aquabark-border hover:border-aquabark-primary flex items-center gap-3 transition-colors shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-aquabark-dark block">Edit Prices</span>
              <span className="text-[11px] text-aquabark-muted">Dynamic updates</span>
            </div>
          </Link>

          <Link
            href="/admin/cancellations"
            className="p-3.5 bg-white rounded-2xl border border-aquabark-border hover:border-aquabark-primary flex items-center gap-3 transition-colors shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-aquabark-dark block">Cancellations</span>
              <span className="text-[11px] text-aquabark-muted">
                {stats.pendingCancellationsCount} requests
              </span>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="p-3.5 bg-white rounded-2xl border border-aquabark-border hover:border-aquabark-primary flex items-center gap-3 transition-colors shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-aquabark-dark block">Feasibility</span>
              <span className="text-[11px] text-aquabark-muted">Routes & WhatsApp</span>
            </div>
          </Link>
        </div>
      </div>

      {/* RECENT ORDERS FEED WITH 1-CLICK ACTION BUTTONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-aquabark-dark">Recent Customer Orders</h3>
            <p className="text-xs text-aquabark-muted">
              Confirm, prepare, or dispatch orders with one click
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-aquabark-dark hover:text-aquabark-darker flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-aquabark-border shadow-2xs"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOpenShipmentModal={(ord) => setShipmentOrder(ord)}
              onStatusUpdated={handleOrderUpdated}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {shipmentOrder && (
        <ShipmentModal
          order={shipmentOrder}
          isOpen={true}
          onClose={() => setShipmentOrder(null)}
          onSuccess={handleShipmentSuccess}
        />
      )}

      {stockModalTarget && (
        <StockModal
          isOpen={true}
          onClose={() => setStockModalTarget(null)}
          productName={stockModalTarget.productName}
          variantId={stockModalTarget.variantId}
          variantTitle={stockModalTarget.variantTitle}
          currentStock={stockModalTarget.currentStock}
          onSuccess={handleStockSuccess}
        />
      )}

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        categories={allCategories}
        onSuccess={() => {
          setIsProductModalOpen(false);
        }}
      />

      <ComboModal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        products={allProducts}
        onSuccess={() => {
          setIsComboModalOpen(false);
        }}
      />
    </div>
  );
}
