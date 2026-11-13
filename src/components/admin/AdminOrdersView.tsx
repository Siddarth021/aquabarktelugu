"use client";

import { useState, useMemo } from "react";
import { OrderDTO, OrderStatus } from "@/types";
import { formatINR } from "@/lib/utils";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { ShipmentModal } from "@/components/admin/ShipmentModal";
import { updateOrderStatusAction } from "@/actions/admin";
import {
  Search,
  Package,
  Eye,
  CheckCircle2,
  Truck,
  MessageCircle,
  Phone,
  Bus,
  Train,
} from "lucide-react";

interface AdminOrdersViewProps {
  initialOrders: OrderDTO[];
  initialStatusFilter?: OrderStatus | "ALL";
}

export function AdminOrdersView({
  initialOrders,
  initialStatusFilter = "ALL",
}: AdminOrdersViewProps) {
  const [orders, setOrders] = useState<OrderDTO[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">(
    initialStatusFilter
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<OrderDTO | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Main order fulfillment lifecycle tabs (Cancellation is handled separately in Cancellations section)
  const tabs: { key: OrderStatus | "ALL"; label: string }[] = [
    { key: "ALL", label: "All Orders" },
    { key: "PENDING", label: "Pending" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PREPARING", label: "Preparing" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const counts = useMemo(() => {
    const res: Record<string, number> = { ALL: orders.length };
    for (const o of orders) {
      res[o.status] = (res[o.status] || 0) + 1;
    }
    return res;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNum = o.orderNumber.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone.includes(q);
        const matchesCity = o.shippingAddress.city.toLowerCase().includes(q);
        if (!matchesNum && !matchesName && !matchesPhone && !matchesCity) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

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

  const handleQuickTransition = async (orderId: string, targetStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatusAction(orderId, targetStatus);
      if (res.success && res.order) {
        handleOrderUpdated(res.order);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShipmentSuccess = (trackingNumber: string) => {
    if (shipmentOrder) {
      const updatedShipment: OrderDTO = {
        ...shipmentOrder,
        status: "SHIPPED",
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
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-aquabark-dark tracking-tight">
          Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, confirm, and dispatch regional bus & train parcel orders
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order #, Customer Name, Phone, or City..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-white shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
        />
      </div>

      {/* Main Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-aquabark-dark text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ORDERS LIST: Clean listing with Order ID, Customer name, Amount, Status */}
      <div className="bg-white rounded-3xl border border-aquabark-border shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No orders match the current filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((ord) => {
              const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, "");
              const isUpdating = updatingId === ord.id;

              return (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Order ID, Customer Name, City */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-aquabark-dark text-sm sm:text-base">
                        #{ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                      {ord.transitMethod && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline">
                          {ord.transitMethod === "BUS_PARCEL"
                            ? "Bus Parcel"
                            : ord.transitMethod === "RAILWAY_PARCEL"
                            ? "Railway Parcel"
                            : "Courier"}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-bold text-slate-800">{ord.customerName}</span>
                      <span className="text-slate-300">•</span>
                      <span>{ord.shippingAddress.city}</span>
                      <span className="text-slate-300">•</span>
                      <a
                        href={`https://wa.me/91${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-0.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </a>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {ord.items.length} item{ord.items.length > 1 ? "s" : ""} •{" "}
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Right: Amount & Quick Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Amount
                      </span>
                      <span className="text-base font-bold font-mono text-slate-800">
                        {formatINR(ord.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* One-Click Quick Transitions */}
                      {ord.status === "PENDING" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleQuickTransition(ord.id, "CONFIRMED")}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}

                      {ord.status === "CONFIRMED" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleQuickTransition(ord.id, "PREPARING")}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 transition-colors cursor-pointer"
                        >
                          Prepare
                        </button>
                      )}

                      {ord.status === "PREPARING" && (
                        <button
                          type="button"
                          onClick={() => setShipmentOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-xs border border-teal-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </button>
                      )}

                      {ord.status === "SHIPPED" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleQuickTransition(ord.id, "DELIVERED")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}

                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
