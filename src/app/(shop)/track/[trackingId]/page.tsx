"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Bus, 
  Train, 
  Truck, 
  MapPin, 
  Calendar, 
  Receipt, 
  ShieldCheck, 
  MessageCircle, 
  ArrowLeft, 
  Package, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { getOrderAction } from "@/actions/orders";
import { OrderDTO, TransportMethod } from "@/types";
import { formatINR } from "@/lib/utils";
import { TrackingTimeline } from "@/components/shop/TrackingTimeline";

export default function TrackDetailPage() {
  const params = useParams();
  const trackingId = (params?.trackingId as string) || "";

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!trackingId) return;
      setLoading(true);

      try {
        // 1. Try server lookup first
        const res = await getOrderAction(trackingId);
        if (res.success && res.order) {
          setOrder(res.order);
          setLoading(false);
          return;
        }

        // 2. Check localStorage for local orders
        const savedOrders = JSON.parse(localStorage.getItem("aquabark_orders") || "[]");
        const localMatch = savedOrders.find(
          (o: any) =>
            o.orderNumber === trackingId ||
            o.id === trackingId ||
            o.shipment?.trackingNumber === trackingId
        );

        if (localMatch) {
          setOrder(localMatch);
          setLoading(false);
          return;
        }

        // 3. Fallback mock order for tracking demo
        const demoOrder: OrderDTO = {
          id: "ord-demo-1",
          orderNumber: trackingId.startsWith("ABT-") ? trackingId : `ABT-2026-849201`,
          status: "SHIPPED",
          customerName: "Kiran Varma",
          customerPhone: "9848012345",
          customerEmail: "kiran@example.com",
          transitMethod: "BUS_PARCEL",
          shippingAddress: {
            recipientName: "Kiran Varma",
            phone: "9848012345",
            street: "4-22/1, MVP Double Road",
            city: "Visakhapatnam",
            state: "Andhra Pradesh",
            postalCode: "530017",
          },
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
            id: "shp-demo-1",
            orderId: "ord-demo-1",
            trackingNumber: `ABT-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
            transportMethod: "BUS_PARCEL",
            operatorName: "APSRTC Garuda Plus Bus Cargo",
            departureLocation: "Vijayawada Central PNBS Depot",
            destinationStation: "Dwaraka Bus Station (RTC Complex), Visakhapatnam",
            parcelReceiptNumber: "LR #VJA-RTC-98421",
            dispatchDate: new Date(Date.now() - 36000000).toISOString(),
            expectedArrivalDate: new Date(Date.now() + 18000000).toISOString(),
            notes: "Keep in driver cabin or shaded front compartment. Fragile Live Oxygen Pack.",
          },
        };

        setOrder(demoOrder);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to load tracking:", err);
        setError("Unable to find parcel for this tracking reference.");
        setLoading(false);
      }
    }

    fetchOrder();
  }, [trackingId]);

  if (loading) {
    return (
      <div className="py-24 text-center bg-aquabark-bg">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-aquabark-dark" />
        <p className="text-xs text-aquabark-muted mt-3">Connecting to logistics parcel registry...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center bg-aquabark-bg">
        <div className="max-w-md mx-auto px-4 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-aquabark-dark">Tracking Record Not Found</h2>
          <p className="text-xs text-aquabark-muted">
            We couldn't locate any parcel associated with "<strong>{trackingId}</strong>". Please verify your Order ID or contact farm support.
          </p>
          <Link
            href="/track"
            className="inline-block mt-2 bg-aquabark-dark text-white text-xs font-bold px-6 py-3 rounded-full"
          >
            Try Another Search
          </Link>
        </div>
      </div>
    );
  }

  const shipment = order.shipment;

  return (
    <div className="py-10 bg-aquabark-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/track"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-aquabark-dark hover:text-aquabark-accent mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parcel Search</span>
        </Link>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-aquabark-border">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-aquabark-terracotta">
                Live Parcel Dispatch
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-aquabark-dark mt-1">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-aquabark-muted mt-1">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Recent"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                STATUS: {order.status}
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-800">
                PAYMENT: {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Shipment Details Grid */}
          {shipment ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
              <div className="p-4 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60">
                <div className="flex items-center gap-2 text-aquabark-dark font-bold mb-1">
                  <Bus className="w-4 h-4 text-emerald-800" />
                  <span>Carrier Operator</span>
                </div>
                <p className="font-semibold text-aquabark-text">{shipment.operatorName}</p>
                <p className="text-[11px] text-aquabark-muted mt-0.5">
                  Method: {shipment.transportMethod}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60">
                <div className="flex items-center gap-2 text-aquabark-dark font-bold mb-1">
                  <Receipt className="w-4 h-4 text-emerald-800" />
                  <span>Parcel Waybill / LR #</span>
                </div>
                <p className="font-mono font-bold text-emerald-900 text-sm">
                  {shipment.parcelReceiptNumber || "Pending Counter Assignment"}
                </p>
                <p className="text-[11px] text-aquabark-muted mt-0.5">Show this at parcel counter</p>
              </div>

              <div className="p-4 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60">
                <div className="flex items-center gap-2 text-aquabark-dark font-bold mb-1">
                  <MapPin className="w-4 h-4 text-emerald-800" />
                  <span>Pickup Station Depot</span>
                </div>
                <p className="font-semibold text-aquabark-text line-clamp-2">
                  {shipment.destinationStation || order.shippingAddress.city}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60">
                <div className="flex items-center gap-2 text-aquabark-dark font-bold mb-1">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span>Expected Arrival</span>
                </div>
                <p className="font-semibold text-aquabark-text">
                  {shipment.expectedArrivalDate
                    ? new Date(shipment.expectedArrivalDate).toLocaleDateString("en-IN")
                    : "Overnight (12-24h)"}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">Keep phone on for SMS</p>
              </div>
            </div>
          ) : (
            <div className="pt-6 text-xs text-aquabark-muted">
              <p className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 font-medium">
                ⏳ Your order is currently being conditioned and packed in pure oxygen. Dispatch waybill and bus details will update here once the bus/train departs.
              </p>
            </div>
          )}
        </div>

        {/* Timeline & Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Timeline (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8">
            <h2 className="font-serif text-xl font-bold text-aquabark-dark mb-6 pb-3 border-b border-aquabark-border">
              Transit & Station Progress
            </h2>
            <TrackingTimeline order={order} />

            {/* WhatsApp Dispatch Assistance */}
            <div className="mt-8 pt-6 border-t border-aquabark-border flex items-center justify-between gap-4">
              <div className="text-xs text-aquabark-muted">
                <span className="font-bold text-aquabark-dark block">Need driver / conductor contact?</span>
                <span>Our dispatch coordinator can share the live bus registration number.</span>
              </div>
              <a
                href={`https://wa.me/919490012345?text=${encodeURIComponent(
                  `Namaskaram! I am tracking Order #${order.orderNumber}. Could you share the bus conductor details / parcel update?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Helpline</span>
              </a>
            </div>
          </div>

          {/* Right: Items in Parcel & Receipt Summary (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl font-bold text-aquabark-dark pb-3 border-b border-aquabark-border">
              Parcel Contents
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-aquabark-dark">{item.productName}</h4>
                    <span className="text-[11px] text-aquabark-muted">
                      {item.quantity}x {item.variantTitle}
                    </span>
                  </div>
                  <span className="font-bold text-aquabark-dark">
                    {formatINR(item.totalSnapshot)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-aquabark-text pt-4 border-t border-aquabark-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatINR(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-{formatINR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Oxygen Pack & Freight</span>
                <span className="font-semibold">
                  {order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-aquabark-dark pt-2 border-t border-aquabark-border">
                <span>Total Amount</span>
                <span>{formatINR(order.totalAmount)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-4 border-t border-aquabark-border text-xs text-aquabark-muted space-y-1">
              <span className="font-bold text-aquabark-dark block">Customer Delivery Details:</span>
              <p>{order.shippingAddress.recipientName} ({order.customerPhone})</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

