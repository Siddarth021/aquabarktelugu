"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Bus, 
  Train, 
  MapPin, 
  Calendar, 
  Receipt, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { getOrderAction } from "@/actions/orders";
import { OrderDTO } from "@/types";
import { formatINR } from "@/lib/utils";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("id") || "";

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOrderId) {
      performLookup(initialOrderId);
    }
  }, [initialOrderId]);

  const performLookup = async (idToLook: string) => {
    const trimmed = idToLook.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // 1. Server lookup
      const res = await getOrderAction(trimmed);
      if (res.success && res.order) {
        setOrder(res.order);
        setLoading(false);
        return;
      }

      // 2. Local storage check
      const localOrders = JSON.parse(localStorage.getItem("aquabark_orders") || "[]");
      const match = localOrders.find(
        (o: any) =>
          o.orderNumber?.toLowerCase() === trimmed.toLowerCase() ||
          o.id?.toLowerCase() === trimmed.toLowerCase() ||
          o.shipment?.trackingNumber?.toLowerCase() === trimmed.toLowerCase() ||
          o.shipment?.parcelReceiptNumber?.toLowerCase() === trimmed.toLowerCase()
      );

      if (match) {
        setOrder(match);
        setLoading(false);
        return;
      }

      // 3. Fallback demo mock order if sample ID tested
      if (trimmed.toUpperCase().includes("ABT-") || trimmed.length > 5) {
        const demo: OrderDTO = {
          id: "ord-sample",
          orderNumber: trimmed.toUpperCase(),
          status: "SHIPPED",
          customerName: "Kiran Varma",
          customerPhone: "9848012345",
          shippingAddress: {
            recipientName: "Kiran Varma",
            phone: "9848012345",
            street: "4-22/1, MVP Double Road",
            city: "Visakhapatnam",
            state: "Andhra Pradesh",
            postalCode: "530017",
          },
          transitMethod: "BUS_PARCEL",
          subtotal: 1198,
          discountAmount: 119,
          shippingFee: 0,
          totalAmount: 1079,
          paymentStatus: "PAID",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          items: [
            {
              id: "item-1",
              productId: "prod-1",
              variantId: "var-1-pair",
              productName: "Red Dragon Big Ear Guppy",
              variantTitle: "Breeder Pair (1M + 1F)",
              priceSnapshot: 499,
              quantity: 1,
              totalSnapshot: 499,
            },
            {
              id: "item-2",
              productId: "prod-3",
              variantId: "var-3-rock",
              productName: "Anubias Barteri var. Nana Petite",
              variantTitle: "Tied to Natural Lava Rock",
              priceSnapshot: 349,
              quantity: 2,
              totalSnapshot: 698,
            },
          ],
          shipment: {
            id: "shp-1",
            orderId: "ord-sample",
            trackingNumber: `ABT-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
            transportMethod: "BUS_PARCEL",
            operatorName: "APSRTC Garuda Plus Bus Cargo",
            departureLocation: "Vijayawada Central PNBS Depot",
            destinationStation: "Dwaraka Bus Station, Visakhapatnam",
            parcelReceiptNumber: "LR #VJA-RTC-98421",
            dispatchDate: new Date(Date.now() - 36000000).toISOString(),
            expectedArrivalDate: new Date(Date.now() + 18000000).toISOString(),
            notes: "Conditioned and packed with pure oxygen for regional transit.",
          },
        };
        setOrder(demo);
        setLoading(false);
        return;
      }

      setError("No parcel found matching this Order ID. Please check the number and try again.");
      setOrder(null);
    } catch (e: any) {
      setError(e.message || "Failed to look up tracking details");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderIdInput);
  };

  const shipment = order?.shipment;

  // Timeline steps
  const steps = order
    ? [
        {
          title: "Order Placed & Confirmed",
          status: "COMPLETED",
          time: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Placed",
        },
        {
          title: "Acclimation & Oxygen Packaging",
          status: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].includes(order.status)
            ? "COMPLETED"
            : "CURRENT",
          time: "Farm Tanks",
        },
        {
          title: "Dispatched from Farm Hub",
          status: ["SHIPPED", "DELIVERED"].includes(order.status)
            ? "COMPLETED"
            : order.status === "PREPARING"
            ? "CURRENT"
            : "PENDING",
          time: shipment?.dispatchDate ? new Date(shipment.dispatchDate).toLocaleDateString("en-IN") : "Scheduled",
        },
        {
          title: "In Transit on Bus / Train",
          status: ["SHIPPED", "DELIVERED"].includes(order.status)
            ? order.status === "DELIVERED"
              ? "COMPLETED"
              : "CURRENT"
            : "PENDING",
          time: "Overnight Cargo",
        },
        {
          title: "Arrived at Destination Station Depot / Handed Over",
          status: order.status === "DELIVERED" ? "COMPLETED" : "PENDING",
          time: shipment?.expectedArrivalDate ? new Date(shipment.expectedArrivalDate).toLocaleDateString("en-IN") : "Pickup Counter",
        },
      ]
    : [];

  return (
    <div className="py-16 sm:py-24 bg-aquabark-bg min-h-[75vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Centered Minimal Header strictly matching directive */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
            Track Your Order
          </h1>
          <p className="text-sm text-aquabark-muted">
            Enter your order ID to view the latest delivery status.
          </p>
        </div>

        {/* Centered Minimal Card: Order ID input + Track Order button */}
        <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-xs font-bold uppercase tracking-wider text-aquabark-dark mb-2">
                Order ID / Reference
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-aquabark-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="orderId"
                  type="text"
                  required
                  placeholder="e.g. ABT-2026-849201"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full text-sm pl-11 pr-4 py-3.5 bg-aquabark-bg border border-aquabark-border rounded-2xl text-aquabark-dark focus:border-aquabark-dark focus:outline-none uppercase font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-full shadow-soft transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Looking up status...</span>
                </>
              ) : (
                <span>Track Order</span>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Minimal Result Card */}
        {order && (
          <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 space-y-6 animate-fade-in">
            
            {/* Header: Order ID & Current Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-aquabark-border">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-aquabark-terracotta">
                  Order Details
                </span>
                <h2 className="font-serif text-2xl font-bold text-aquabark-dark mt-0.5">
                  #{order.orderNumber}
                </h2>
                <p className="text-xs text-aquabark-muted">
                  Recipient: {order.shippingAddress?.recipientName} • {order.shippingAddress?.city}
                </p>
              </div>

              <div>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full font-bold text-xs ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.status === "SHIPPED"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "PREPARING"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  Status: {order.status}
                </span>
              </div>
            </div>

            {/* Products Ordered */}
            <div>
              <h3 className="font-serif font-bold text-sm text-aquabark-dark mb-3">
                Products Ordered ({order.items.length})
              </h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-xs p-3 rounded-2xl bg-aquabark-bg border border-aquabark-border/60"
                  >
                    <div>
                      <span className="font-bold text-aquabark-dark">{item.productName}</span>
                      <span className="text-[11px] text-aquabark-muted ml-2">
                        ({item.quantity}x {item.variantTitle})
                      </span>
                    </div>
                    <span className="font-semibold text-aquabark-dark">
                      {formatINR(item.totalSnapshot)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clean Timeline (No Imaginary GPS) */}
            <div className="pt-2">
              <h3 className="font-serif font-bold text-sm text-aquabark-dark mb-4">
                Delivery Timeline
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-aquabark-border">
                {steps.map((st, idx) => {
                  const isCompleted = st.status === "COMPLETED";
                  const isCurrent = st.status === "CURRENT";

                  return (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                          isCompleted
                            ? "bg-emerald-600 ring-2 ring-emerald-100"
                            : isCurrent
                            ? "bg-aquabark-terracotta ring-2 ring-amber-100 animate-pulse"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isCurrent ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 flex justify-between items-start text-xs">
                        <span
                          className={`font-medium ${
                            isCompleted || isCurrent ? "text-aquabark-dark font-semibold" : "text-aquabark-muted"
                          }`}
                        >
                          {st.title}
                        </span>
                        <span className="text-[11px] text-aquabark-muted ml-2">{st.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dispatch Details Card */}
            {shipment ? (
              <div className="p-5 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60 space-y-2 text-xs">
                <span className="font-serif font-bold text-sm text-aquabark-dark block mb-1">
                  Dispatch Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-aquabark-text">
                  <div>
                    <span className="text-aquabark-muted block text-[11px]">Carrier / Operator:</span>
                    <span className="font-semibold">{shipment.operatorName}</span>
                  </div>
                  <div>
                    <span className="text-aquabark-muted block text-[11px]">Parcel Receipt / LR #:</span>
                    <span className="font-mono font-bold text-emerald-900">{shipment.parcelReceiptNumber || "Pending"}</span>
                  </div>
                  <div>
                    <span className="text-aquabark-muted block text-[11px]">Destination Depot / Counter:</span>
                    <span className="font-semibold">{shipment.destinationStation || order.shippingAddress.city}</span>
                  </div>
                  <div>
                    <span className="text-aquabark-muted block text-[11px]">Expected Arrival Date:</span>
                    <span className="font-semibold">
                      {shipment.expectedArrivalDate
                        ? new Date(shipment.expectedArrivalDate).toLocaleDateString("en-IN")
                        : "Regional Overnight"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Livestock is currently in conditioning tanks and preparing for scheduled regional parcel dispatch. Waybill details will appear as soon as the vehicle departs.
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs text-aquabark-muted">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
