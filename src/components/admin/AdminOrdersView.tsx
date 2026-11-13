"use client";

import { useState, useMemo } from "react";
import { OrderDTO, OrderStatus } from "@/types";
import { OrderCard } from "@/components/admin/OrderCard";
import { ShipmentModal } from "@/components/admin/ShipmentModal";
import {
  Search,
  Filter,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
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
  const [shipmentOrder, setShipmentOrder] = useState<OrderDTO | null>(null);

  // Status counts
  const counts = useMemo(() => {
    const res: Record<string, number> = { ALL: orders.length };
    for (const o of orders) {
      res[o.status] = (res[o.status] || 0) + 1;
    }
    return res;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNum = o.orderNumber.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone.includes(q);
        const matchesCity = o.shippingAddress.city.toLowerCase().includes(q);
        const matchesItem = o.items.some((i) => i.productName.toLowerCase().includes(q));
        if (!matchesNum && !matchesName && !matchesPhone && !matchesCity && !matchesItem) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleOrderUpdated = (updated: OrderDTO) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleShipmentSuccess = (trackingNumber: string) => {
    if (shipmentOrder) {
      setOrders((prev) =>
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

  const tabs: { key: OrderStatus | "ALL"; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PREPARING", label: "Preparing" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl font-bold text-aquabark-dark">
            Order Management
          </h1>
          <p className="text-xs text-aquabark-muted">
            Track, confirm, and dispatch live aquarium shipments
          </p>
        </div>

        {/* Total orders chip */}
        <div className="text-xs font-semibold text-aquabark-dark bg-white px-3 py-1.5 rounded-xl border border-aquabark-border shadow-2xs self-start sm:self-auto">
          <span>Total: </span>
          <span className="font-bold font-mono">{filteredOrders.length}</span> orders
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order #, Customer, Phone, City, or Fish name..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-white shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-md px-1.5 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Filter Tabs (Mobile friendly) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-aquabark-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-base">No orders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try searching with a different term.`
              : `No orders in status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOpenShipmentModal={(ord) => setShipmentOrder(ord)}
              onStatusUpdated={handleOrderUpdated}
            />
          ))}
        </div>
      )}

      {/* Dispatch Modal */}
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
