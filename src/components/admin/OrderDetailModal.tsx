"use client";

import { useState } from "react";
import { OrderDTO, OrderStatus } from "@/types";
import { formatINR } from "@/lib/utils";
import { updateOrderStatusAction } from "@/actions/admin";
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  CheckCircle2,
  Package,
  Calendar,
  AlertCircle,
  Bus,
  Train,
} from "lucide-react";

interface OrderDetailModalProps {
  order: OrderDTO;
  isOpen: boolean;
  onClose: () => void;
  onOpenShipmentModal: (order: OrderDTO) => void;
  onOrderUpdated: (updated: OrderDTO) => void;
}

export function OrderDetailModal({
  order: initialOrder,
  isOpen,
  onClose,
  onOpenShipmentModal,
  onOrderUpdated,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDTO>(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

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

  const handleStatusChange = async (targetStatus: OrderStatus) => {
    if (targetStatus === "SHIPPED") {
      onClose();
      onOpenShipmentModal(order);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateOrderStatusAction(order.id, targetStatus);
      if (res.success && res.order) {
        setOrder(res.order);
        onOrderUpdated(res.order);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-aquabark-border flex items-center justify-between bg-aquabark-bg">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-aquabark-dark text-base">
                #{order.orderNumber}
              </h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-aquabark-muted mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Customer & Address Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Customer</span>
                <span className="text-sm font-bold text-slate-800">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${order.customerPhone}`}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customerPhone}</span>
                </a>
                <a
                  href={`https://wa.me/91${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  title="WhatsApp customer"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                Delivery Address & Transit Route
              </span>
              <p className="text-slate-700 leading-relaxed">
                {order.shippingAddress.recipientName}, {order.shippingAddress.street},{" "}
                {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <div className="mt-1 font-semibold text-aquabark-dark">
                Preferred Transit:{" "}
                {order.transitMethod === "BUS_PARCEL"
                  ? "Bus Parcel Express (APSRTC / TSRTC)"
                  : order.transitMethod === "RAILWAY_PARCEL"
                  ? "Railway Parcel (South Central Railway)"
                  : "Private Courier"}
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">
              Ordered Items & Snapshot Price
            </span>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 font-bold text-slate-500 border-b border-slate-200 flex justify-between">
                <span>Item</span>
                <span>Subtotal</span>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items.map((it) => (
                  <div key={it.id} className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">
                        {it.productName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {it.variantTitle} × {it.quantity} @ {formatINR(it.priceSnapshot)}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-800">
                      {formatINR(it.totalSnapshot)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-between font-bold text-sm text-aquabark-dark">
                <span>Total Amount:</span>
                <span className="font-mono">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipment Details if Dispatched */}
          {order.shipment && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {order.shipment.transportMethod === "BUS_PARCEL" ? (
                    <Bus className="w-4 h-4 text-teal-700" />
                  ) : (
                    <Train className="w-4 h-4 text-teal-700" />
                  )}
                  <span>{order.shipment.operatorName}</span>
                </span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-teal-300">
                  {order.shipment.trackingNumber}
                </span>
              </div>
              <div>
                <span className="font-semibold">Route: </span>
                {order.shipment.departureLocation} ➔ {order.shipment.destinationStation}
              </div>
              {order.shipment.parcelReceiptNumber && (
                <div>
                  <span className="font-semibold">Parcel LR Receipt #: </span>
                  <span className="font-mono font-bold">{order.shipment.parcelReceiptNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Action Transitions */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              Change Order Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              {order.status === "PENDING" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("CONFIRMED")}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Order</span>
                </button>
              )}

              {order.status === "CONFIRMED" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("PREPARING")}
                  className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>Start Preparing</span>
                </button>
              )}

              {order.status === "PREPARING" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("SHIPPED")}
                  className="col-span-2 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Dispatch via Bus / Railway Parcel</span>
                </button>
              )}

              {order.status === "SHIPPED" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("DELIVERED")}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Delivered</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
