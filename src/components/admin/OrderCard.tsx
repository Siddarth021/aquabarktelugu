"use client";

import { useState } from "react";
import { OrderDTO, OrderStatus } from "@/types";
import { formatINR } from "@/lib/utils";
import { updateOrderStatusAction } from "@/actions/admin";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  Send,
  MessageCircle,
  ExternalLink,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Bus,
  Train,
} from "lucide-react";

interface OrderCardProps {
  order: OrderDTO;
  onOpenShipmentModal: (order: OrderDTO) => void;
  onStatusUpdated?: (order: OrderDTO) => void;
}

export function OrderCard({
  order: initialOrder,
  onOpenShipmentModal,
  onStatusUpdated,
}: OrderCardProps) {
  const [order, setOrder] = useState<OrderDTO>(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notesInput, setNotesInput] = useState(order.adminNotes || "");
  const [showNotesForm, setShowNotesForm] = useState(false);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          dot: "bg-amber-500",
          label: "PENDING",
        };
      case "CONFIRMED":
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-800",
          dot: "bg-blue-500",
          label: "CONFIRMED",
        };
      case "PREPARING":
        return {
          bg: "bg-purple-50 border-purple-200 text-purple-800",
          dot: "bg-purple-500",
          label: "PREPARING",
        };
      case "SHIPPED":
        return {
          bg: "bg-teal-50 border-teal-200 text-teal-800",
          dot: "bg-teal-500",
          label: "SHIPPED",
        };
      case "DELIVERED":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          dot: "bg-emerald-500",
          label: "DELIVERED",
        };
      case "CANCELLED":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-800",
          dot: "bg-rose-500",
          label: "CANCELLED",
        };
    }
  };

  const badge = getStatusBadge(order.status);

  // Quick Action transitions
  const handleQuickStatusChange = async (targetStatus: OrderStatus) => {
    if (targetStatus === "SHIPPED") {
      onOpenShipmentModal(order);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateOrderStatusAction(order.id, targetStatus);
      if (res.success && res.order) {
        setOrder(res.order);
        onStatusUpdated?.(res.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatusAction(order.id, order.status, notesInput);
      if (res.success && res.order) {
        setOrder(res.order);
        setShowNotesForm(false);
        onStatusUpdated?.(res.order);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    `Hello ${order.customerName}! This is AquaBark Telugu regarding your order #${order.orderNumber}.`
  )}`;

  return (
    <div className="bg-white rounded-3xl border border-aquabark-border shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Bar: Order number, date, status */}
      <div className="p-4 sm:px-5 sm:py-4 border-b border-aquabark-border/60 bg-aquabark-bg/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-aquabark-dark text-sm sm:text-base">
            #{order.orderNumber}
          </span>
          <span className="text-[11px] text-aquabark-muted">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Customer & Destination Row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-bold text-aquabark-dark text-sm sm:text-base flex items-center gap-1.5">
              <span>{order.customerName}</span>
              {order.cancellationRequested && (
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-md">
                  Cancel Requested
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 text-xs text-aquabark-muted mt-0.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-600">
                {order.transitMethod === "BUS_PARCEL"
                  ? "Bus Parcel"
                  : order.transitMethod === "RAILWAY_PARCEL"
                  ? "Railway Parcel"
                  : "Standard"}
              </span>
            </div>
          </div>

          {/* Quick Contact & WhatsApp button */}
          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${order.customerPhone}`}
              title="Call customer"
              className="p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors text-xs font-medium flex items-center gap-1"
            >
              <span>{order.customerPhone}</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open WhatsApp chat"
              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Items ({order.items.length})</span>
            <span>Total: {formatINR(order.totalAmount)}</span>
          </div>
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center justify-between text-xs py-0.5">
              <span className="text-slate-700 truncate max-w-[220px] sm:max-w-md">
                <span className="font-semibold">{it.quantity}x</span> {it.productName} ({it.variantTitle})
              </span>
              <span className="font-medium text-slate-600 shrink-0 font-mono">
                {formatINR(it.totalSnapshot)}
              </span>
            </div>
          ))}
        </div>

        {/* Shipment Tracking Card (if shipped) */}
        {order.shipment && (
          <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-2xl space-y-1.5 text-xs text-teal-900">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                {order.shipment.transportMethod === "BUS_PARCEL" ? (
                  <Bus className="w-4 h-4 text-teal-700" />
                ) : (
                  <Train className="w-4 h-4 text-teal-700" />
                )}
                <span>{order.shipment.operatorName}</span>
              </span>
              <span className="font-mono text-xs bg-white px-2 py-0.5 rounded-lg border border-teal-300">
                {order.shipment.trackingNumber}
              </span>
            </div>
            <div className="text-[11px] text-teal-800 space-y-0.5">
              <div>
                <span className="font-semibold">Route: </span>
                {order.shipment.departureLocation} ➔ {order.shipment.destinationStation}
              </div>
              {order.shipment.parcelReceiptNumber && (
                <div>
                  <span className="font-semibold">LR / Parcel Receipt #: </span>
                  <span className="font-mono font-bold">{order.shipment.parcelReceiptNumber}</span>
                </div>
              )}
              {order.shipment.notes && (
                <div>
                  <span className="font-semibold">Notes: </span>
                  {order.shipment.notes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expandable Details (Address & Admin Notes) */}
        {expanded && (
          <div className="pt-2 border-t border-slate-100 text-xs space-y-2 animate-in fade-in">
            <div className="text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-0.5">Full Delivery Address:</span>
              <p>
                {order.shippingAddress.recipientName}, {order.shippingAddress.street},{" "}
                {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                {order.shippingAddress.postalCode}
              </p>
            </div>

            {/* Admin Notes */}
            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-900">Admin Notes:</span>
                <button
                  onClick={() => setShowNotesForm(!showNotesForm)}
                  className="text-[11px] text-amber-800 underline font-medium"
                >
                  {showNotesForm ? "Cancel" : "Edit Notes"}
                </button>
              </div>
              {showNotesForm ? (
                <div className="space-y-1.5 mt-1">
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
                    placeholder="e.g. Bus driver contact or special instructions..."
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={isUpdating}
                    className="px-3 py-1 bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Notes
                  </button>
                </div>
              ) : (
                <p className="text-amber-800 italic">{order.adminNotes || "No notes added yet."}</p>
              )}
            </div>
          </div>
        )}

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-aquabark-muted hover:text-aquabark-dark flex items-center gap-1 font-medium pt-1"
        >
          <span>{expanded ? "Hide Details" : "View Address & Notes"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* QUICK ACTION BUTTONS */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {order.status === "PENDING" && (
            <button
              onClick={() => handleQuickStatusChange("CONFIRMED")}
              disabled={isUpdating}
              className="flex-1 min-h-[44px] py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm Order</span>
            </button>
          )}

          {order.status === "CONFIRMED" && (
            <button
              onClick={() => handleQuickStatusChange("PREPARING")}
              disabled={isUpdating}
              className="flex-1 min-h-[44px] py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Package className="w-4 h-4" />
              <span>Mark Preparing (Packing)</span>
            </button>
          )}

          {order.status === "PREPARING" && (
            <button
              onClick={() => onOpenShipmentModal(order)}
              disabled={isUpdating}
              className="flex-1 min-h-[44px] py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch via Bus / Railway Parcel</span>
            </button>
          )}

          {order.status === "SHIPPED" && (
            <button
              onClick={() => handleQuickStatusChange("DELIVERED")}
              disabled={isUpdating}
              className="flex-1 min-h-[44px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Delivered (Collected)</span>
            </button>
          )}

          {order.status === "DELIVERED" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold py-1">
              <CheckCircle className="w-4 h-4" />
              <span>Order Completed & Delivered</span>
            </div>
          )}

          {order.status === "CANCELLED" && (
            <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold py-1">
              <AlertCircle className="w-4 h-4" />
              <span>Order Cancelled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
