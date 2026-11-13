"use client";

import { useState } from "react";
import Link from "next/link";
import { OrderDTO, OrderStatus } from "@/types";
import { formatINR } from "@/lib/utils";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { ShipmentModal } from "@/components/admin/ShipmentModal";
import {
  ShoppingBag,
  Layers,
  TrendingUp,
  Eye,
  ArrowRight,
  Package,
} from "lucide-react";

interface AdminDashboardViewProps {
  stats: {
    newOrdersCount: number;
    totalProductsCount: number;
    salesTotal: number;
    recentOrders: OrderDTO[];
  };
}

export function AdminDashboardView({ stats }: AdminDashboardViewProps) {
  const [orders, setOrders] = useState<OrderDTO[]>(stats.recentOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<OrderDTO | null>(null);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PREPARING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "SHIPPED":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  const handleOrderUpdated = (updated: OrderDTO) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (selectedOrder?.id === updated.id) {
      setSelectedOrder(updated);
    }
  };

  const handleShipmentSuccess = (trackingNumber: string) => {
    if (shipmentOrder) {
      const updatedShipment = {
        ...shipmentOrder,
        status: "SHIPPED" as OrderStatus,
        shipment: {
          id: `shp-${Date.now()}`,
          orderId: shipmentOrder.id,
          trackingNumber,
          transportMethod: shipmentOrder.transitMethod || "BUS_PARCEL",
          operatorName: "Parcel Express",
          departureLocation: "Hub",
          destinationStation: shipmentOrder.shippingAddress.city,
          dispatchDate: new Date().toISOString(),
        },
      };
      handleOrderUpdated(updatedShipment);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Simple Welcome Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-aquabark-dark tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your store at a glance.
        </p>
      </div>

      {/* EXACTLY 3 PRIMARY STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. New Orders */}
        <Link
          href="/admin/orders?status=PENDING"
          className="bg-white rounded-3xl p-5 border border-aquabark-border shadow-xs hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              New Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 font-mono">
            {stats.newOrdersCount}
          </div>
          <p className="text-xs text-amber-700/90 font-medium mt-1">
            Pending fulfillment
          </p>
        </Link>

        {/* 2. Total Products */}
        <Link
          href="/admin/products"
          className="bg-white rounded-3xl p-5 border border-aquabark-border shadow-xs hover:border-aquabark-primary hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-10 h-10 rounded-2xl bg-aquabark-secondary text-aquabark-dark flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 font-mono">
            {stats.totalProductsCount}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Active in catalog
          </p>
        </Link>

        {/* 3. Sales */}
        <div className="bg-white rounded-3xl p-5 border border-aquabark-border shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sales
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono truncate">
            {formatINR(stats.salesTotal)}
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            Total verified revenue
          </p>
        </div>
      </div>

      {/* RECENT ORDERS TABLE / LIST */}
      <div className="bg-white rounded-3xl border border-aquabark-border shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-5 sm:px-6 sm:py-4 border-b border-aquabark-border/60 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-aquabark-dark text-base">Recent Orders</h3>
            <p className="text-xs text-slate-400">Latest customer purchases</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* List / Table */}
        {orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No recent orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-aquabark-dark whitespace-nowrap">
                      #{ord.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.shippingAddress.city}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {formatINR(ord.totalAmount)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-aquabark-secondary text-aquabark-dark text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          onOpenShipmentModal={(ord) => setShipmentOrder(ord)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}

      {/* Shipment Modal */}
      {shipmentOrder && (
        <ShipmentModal
          order={shipmentOrder}
          isOpen={true}
          onClose={() => setShipmentOrder(null)}
          onSuccess={handleShipmentSuccess}
        />
      )}
    </div>
  );
}
