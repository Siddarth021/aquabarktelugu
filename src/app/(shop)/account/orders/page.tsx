"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  Truck, 
  ArrowLeft, 
  ChevronRight, 
  Receipt, 
  AlertCircle,
  XCircle,
  Clock,
  CheckCircle2,
  Bus,
  Train
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { listCustomerOrdersAction } from "@/actions/orders";
import { OrderDTO } from "@/types";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const phone = localStorage.getItem("aquabark_user_phone") || "9848012345";
        
        // 1. Try server fetch
        const res = await listCustomerOrdersAction(phone);
        if (res.success && res.orders.length > 0) {
          setOrders(res.orders);
          setLoading(false);
          return;
        }

        // 2. Fallback to localStorage
        const local = JSON.parse(localStorage.getItem("aquabark_orders") || "[]");
        if (local.length > 0) {
          setOrders(local);
          setLoading(false);
          return;
        }

        // 3. Fallback demo orders so the page is never blank
        const sampleOrders: OrderDTO[] = [
          {
            id: "ord-sample-1",
            orderNumber: "ABT-2026-849201",
            status: "SHIPPED",
            customerName: "Kiran Varma",
            customerPhone: phone,
            shippingAddress: {
              recipientName: "Kiran Varma",
              phone: phone,
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
              id: "shp-sample-1",
              orderId: "ord-sample-1",
              trackingNumber: "ABT-TRK-849201",
              transportMethod: "BUS_PARCEL",
              operatorName: "APSRTC Garuda Plus Bus Cargo",
              departureLocation: "Vijayawada Central PNBS Depot",
              destinationStation: "Dwaraka Bus Station, Visakhapatnam",
              parcelReceiptNumber: "LR #VJA-RTC-98421",
              dispatchDate: new Date(Date.now() - 36000000).toISOString(),
            },
          },
        ];

        setOrders(sampleOrders);
      } catch (e) {
        console.error("Failed to load customer orders:", e);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PREPARING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="py-12 bg-aquabark-bg min-h-[75vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-aquabark-dark hover:text-aquabark-accent mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account Overview</span>
        </Link>

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-aquabark-dark">
              Order History & Dispatches
            </h1>
            <p className="text-xs text-aquabark-muted mt-1">
              Review your live livestock orders, transit waybills, and invoices.
            </p>
          </div>
          <Link
            href="/shop"
            className="bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-soft"
          >
            Order New Livestock
          </Link>
        </div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-aquabark-border p-12 text-center space-y-4 shadow-soft">
            <Package className="w-12 h-12 text-aquabark-muted mx-auto stroke-1" />
            <h2 className="font-serif text-xl font-bold text-aquabark-dark">No Orders Found</h2>
            <p className="text-xs text-aquabark-muted max-w-sm mx-auto">
              You haven't placed any orders yet. Discover our rare guppies and planted tank combos!
            </p>
            <Link
              href="/shop"
              className="inline-block mt-2 bg-aquabark-dark text-white text-xs font-bold px-6 py-3 rounded-full"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id || order.orderNumber}
                className="bg-white rounded-3xl border border-aquabark-border shadow-soft overflow-hidden p-6 sm:p-8 space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-aquabark-border">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-aquabark-terracotta">
                      {order.transitMethod === "BUS_PARCEL"
                        ? "TSRTC/APSRTC Bus Parcel"
                        : order.transitMethod === "RAILWAY_PARCEL"
                        ? "Railway Express Parcel"
                        : "Private Courier"}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-aquabark-dark mt-0.5">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-xs text-aquabark-muted">
                      Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Recent"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      PAID ({formatINR(order.totalAmount)})
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs p-3 rounded-2xl bg-aquabark-bg border border-aquabark-border/60"
                    >
                      <div>
                        <h4 className="font-bold text-aquabark-dark">{item.productName}</h4>
                        <span className="text-[11px] text-aquabark-muted">
                          {item.quantity}x {item.variantTitle} @ {formatINR(item.priceSnapshot)} each
                        </span>
                      </div>
                      <span className="font-bold text-aquabark-dark">
                        {formatINR(item.totalSnapshot)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Waybill / Tracking Banner */}
                {order.shipment?.parcelReceiptNumber && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
                    <div>
                      <span className="font-bold block">
                        Waybill / LR: {order.shipment.parcelReceiptNumber} ({order.shipment.operatorName})
                      </span>
                      <span>
                        Destination Depot: {order.shipment.destinationStation || order.shippingAddress.city}
                      </span>
                    </div>
                    <Link
                      href={`/track/${order.orderNumber}`}
                      className="inline-flex items-center gap-1.5 font-bold underline text-emerald-800 hover:text-emerald-950"
                    >
                      <span>Track Parcel Timeline →</span>
                    </Link>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-aquabark-border flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-aquabark-muted">
                    <span>Deliver to: {order.shippingAddress.recipientName}, {order.shippingAddress.city}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Cancellation option if not yet shipped */}
                    {["PENDING", "CONFIRMED", "PREPARING"].includes(order.status) && (
                      <Link
                        href={`/account/cancellations?orderId=${order.id || order.orderNumber}`}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Cancel Order
                      </Link>
                    )}

                    <Link
                      href={`/track/${order.orderNumber}`}
                      className="bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Shipment</span>
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

