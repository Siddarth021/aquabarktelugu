"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Tag,
  ShoppingBag,
  Bus,
  Train,
  Check,
  Loader2
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";
import { createOrderAction } from "@/actions/orders";
import { calculateCheckoutPricingAction } from "@/actions/pricing";
import { TransportMethod } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    appliedCoupon,
    couponDiscount,
    subtotal,
    shippingFee,
    total,
    clearCart,
  } = useCart();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Andhra Pradesh");
  const [postalCode, setPostalCode] = useState("");
  const [nearestStation, setNearestStation] = useState("");
  const [transitMethod, setTransitMethod] = useState<TransportMethod>("BUS_PARCEL");
  const [adminNotes, setAdminNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Authoritative server pricing
  const [serverPricing, setServerPricing] = useState({
    subtotal,
    discountAmount: couponDiscount,
    shippingFee,
    totalAmount: total,
  });

  useEffect(() => {
    async function revalidatePricing() {
      if (items.length === 0) return;
      try {
        const payload = items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }));
        const res = await calculateCheckoutPricingAction(payload, appliedCoupon || undefined, transitMethod);
        if (res) {
          setServerPricing({
            subtotal: res.subtotal,
            discountAmount: res.discountAmount,
            shippingFee: res.shippingFee,
            totalAmount: res.totalAmount,
          });
        }
      } catch (e) {
        // Fallback to client pricing calculation
        setServerPricing({
          subtotal,
          discountAmount: couponDiscount,
          shippingFee,
          totalAmount: total,
        });
      }
    }
    revalidatePricing();
  }, [items, appliedCoupon, transitMethod, subtotal, couponDiscount, shippingFee, total]);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please enter your full recipient name.");
    if (!phone.trim() || phone.trim().length < 10) return setError("Please provide a valid 10-digit mobile number.");
    if (!street.trim()) return setError("Please enter your street address / door number.");
    if (!city.trim()) return setError("Please enter your city / town.");
    if (!postalCode.trim() || postalCode.trim().length < 6) return setError("Please enter a valid 6-digit PIN code.");
    if (!nearestStation.trim()) return setError("Please specify your nearest Bus Station or Railway Station Parcel Office.");

    setLoading(true);

    try {
      const orderPayload = {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        shippingAddress: {
          recipientName: name.trim(),
          phone: sameAsPhone ? phone.trim() : (whatsapp.trim() || phone.trim()),
          street: street.trim(),
          landmark: landmark.trim() || undefined,
          city: city.trim(),
          state: state,
          postalCode: postalCode.trim(),
        },
        transitMethod,
        cartItems: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon || undefined,
        adminNotes: `Nearest Station: ${nearestStation.trim()}${adminNotes ? ` | Note: ${adminNotes}` : ""}`,
      };

      const result = await createOrderAction(orderPayload);

      if (!result.success || !result.order) {
        throw new Error(result.error || "Failed to create order on server");
      }

      const createdOrder = result.order;

      // Save order to customer local session history for immediate tracking convenience
      try {
        const savedHistory = JSON.parse(localStorage.getItem("aquabark_orders") || "[]");
        savedHistory.unshift(createdOrder);
        localStorage.setItem("aquabark_orders", JSON.stringify(savedHistory));
        localStorage.setItem("aquabark_user_phone", phone.trim());
      } catch (err) {
        console.warn("Storage warning:", err);
      }

      // Check if Razorpay is available in window
      const hasRazorpay = typeof (window as any).Razorpay !== "undefined";
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (hasRazorpay && razorpayKey) {
        const options = {
          key: razorpayKey,
          amount: createdOrder.totalAmount * 100,
          currency: "INR",
          name: "AquaBark Telugu",
          description: `Order ${createdOrder.orderNumber} - Live Fish Transit`,
          image: "/logo.svg",
          handler: async function (response: any) {
            clearCart();
            setOrderSuccess(createdOrder);
            setLoading(false);
          },
          prefill: {
            name: name,
            contact: phone,
            email: email,
          },
          theme: {
            color: "#214D36",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Simulated / Sandbox confirmation
        clearCart();
        setOrderSuccess(createdOrder);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Order creation error:", err);
      setError(err.message || "An unexpected error occurred while placing your order.");
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="py-16 bg-aquabark-bg min-h-[75vh]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl border border-aquabark-border shadow-card p-8 sm:p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Order Confirmed & Booked
              </span>
              <h1 className="font-serif text-3xl font-bold text-aquabark-dark mt-3">
                Danyavadamulu! Thank You For Your Order
              </h1>
              <p className="text-sm text-aquabark-muted mt-2">
                Order <strong>#{orderSuccess.orderNumber}</strong> has been received by our breeding farm.
              </p>
            </div>

            <div className="bg-aquabark-secondary/30 rounded-2xl p-5 text-left text-xs space-y-2 border border-aquabark-border/60">
              <div className="flex justify-between">
                <span className="text-aquabark-muted">Recipient Name:</span>
                <span className="font-bold text-aquabark-dark">{orderSuccess.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-aquabark-muted">Phone Number:</span>
                <span className="font-bold text-aquabark-dark">{orderSuccess.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-aquabark-muted">Transit Mode:</span>
                <span className="font-bold text-aquabark-dark">
                  {orderSuccess.transitMethod === "BUS_PARCEL"
                    ? "TSRTC/APSRTC Bus Parcel"
                    : orderSuccess.transitMethod === "RAILWAY_PARCEL"
                    ? "South Central Railway Parcel"
                    : "Express Courier"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-aquabark-muted">Total Paid:</span>
                <span className="font-bold text-aquabark-dark">{formatINR(orderSuccess.totalAmount)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed text-left">
              <strong>🚚 What Happens Next?</strong>
              <p className="mt-1">
                Your livestock will be fed and conditioned for 12 hours before evening medical oxygen packing. Once dispatched from Rajahmundry/Vijayawada hub, you will receive your Parcel Waybill receipt number via WhatsApp SMS.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={`/track/${orderSuccess.orderNumber}`}
                className="w-full sm:w-auto bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs font-bold px-8 py-3.5 rounded-full shadow-soft flex items-center justify-center gap-2"
              >
                <span>Track Live Transit Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto bg-aquabark-secondary hover:bg-aquabark-primary text-aquabark-dark text-xs font-semibold px-6 py-3.5 rounded-full"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-aquabark-bg">
        <h2 className="font-serif text-2xl font-bold text-aquabark-dark">No items to checkout</h2>
        <p className="text-xs text-aquabark-muted mt-2">Please add products to your basket before checking out.</p>
        <Link
          href="/shop"
          className="inline-block mt-4 bg-aquabark-dark text-white text-xs font-bold px-6 py-3 rounded-full"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 bg-aquabark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-1">
            Secure Booking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
            Checkout & Live Transit Booking
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Forms (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Recipient Contact Info */}
              <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-aquabark-border">
                  <div className="w-8 h-8 rounded-xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark">
                    <User className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-aquabark-dark">
                    1. Recipient Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                      Calling Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9848012345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                      WhatsApp Number for Tracking
                    </label>
                    {sameAsPhone ? (
                      <div className="text-xs text-aquabark-muted pt-2 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Using calling mobile number</span>
                      </div>
                    ) : (
                      <input
                        type="tel"
                        placeholder="e.g. 9490012345"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                      />
                    )}
                    <label className="flex items-center gap-1.5 text-[11px] text-aquabark-muted mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={(e) => setSameAsPhone(e.target.checked)}
                        className="rounded text-aquabark-dark"
                      />
                      <span>WhatsApp is same as mobile</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address & Nearest Hub */}
              <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-aquabark-border">
                  <div className="w-8 h-8 rounded-xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-aquabark-dark">
                    2. Address & Station Counter
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                      Door No, Street & Area *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4-22/1, Beside Temple, MVP Colony"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Visakhapatnam"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                        State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                      >
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Other">Other (Pan-India)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 530017"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Nearest Station / Bus Stand input */}
                  <div>
                    <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                      Nearest Bus Station / Railway Station Parcel Office *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dwaraka Bus Station RTC Counter or Secunderabad Station"
                      value={nearestStation}
                      onChange={(e) => setNearestStation(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                    />
                    <p className="text-[11px] text-aquabark-muted mt-1">
                      Live fish parcels are dispatched to this specific depot counter for safe, air-conditioned handling.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Transport Method Selection */}
              <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-aquabark-border">
                  <div className="w-8 h-8 rounded-xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-aquabark-dark">
                    3. Choose Safe Transit Mode
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Bus Parcel Option */}
                  <label
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                      transitMethod === "BUS_PARCEL"
                        ? "border-aquabark-dark bg-aquabark-secondary/30 ring-1 ring-aquabark-dark"
                        : "border-aquabark-border bg-white hover:border-aquabark-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="transitMethod"
                      value="BUS_PARCEL"
                      checked={transitMethod === "BUS_PARCEL"}
                      onChange={() => setTransitMethod("BUS_PARCEL")}
                      className="mt-1 text-aquabark-dark"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-emerald-800" />
                        <span className="font-bold text-xs text-aquabark-dark">
                          TSRTC / APSRTC Bus Parcel (Recommended for Live Fish)
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold ml-auto">
                          Overnight (12h)
                        </span>
                      </div>
                      <p className="text-[11px] text-aquabark-muted mt-1">
                        Dispatched in the evening; arrives directly at your district/mandal RTC parcel counter next morning. Minimal stress for fish.
                      </p>
                    </div>
                  </label>

                  {/* Railway Parcel Option */}
                  <label
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                      transitMethod === "RAILWAY_PARCEL"
                        ? "border-aquabark-dark bg-aquabark-secondary/30 ring-1 ring-aquabark-dark"
                        : "border-aquabark-border bg-white hover:border-aquabark-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="transitMethod"
                      value="RAILWAY_PARCEL"
                      checked={transitMethod === "RAILWAY_PARCEL"}
                      onChange={() => setTransitMethod("RAILWAY_PARCEL")}
                      className="mt-1 text-aquabark-dark"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Train className="w-4 h-4 text-emerald-800" />
                        <span className="font-bold text-xs text-aquabark-dark">
                          South Central Railway Express Parcel
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold ml-auto">
                          Interstate Rail
                        </span>
                      </div>
                      <p className="text-[11px] text-aquabark-muted mt-1">
                        Carried in brake van parcel van to destination Railway Parcel Office. Pickup with photo ID.
                      </p>
                    </div>
                  </label>

                  {/* Private Courier */}
                  <label
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                      transitMethod === "PRIVATE_COURIER"
                        ? "border-aquabark-dark bg-aquabark-secondary/30 ring-1 ring-aquabark-dark"
                        : "border-aquabark-border bg-white hover:border-aquabark-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="transitMethod"
                      value="PRIVATE_COURIER"
                      checked={transitMethod === "PRIVATE_COURIER"}
                      onChange={() => setTransitMethod("PRIVATE_COURIER")}
                      className="mt-1 text-aquabark-dark"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-800" />
                        <span className="font-bold text-xs text-aquabark-dark">
                          Private Courier Doorstep (Plants & Dry Goods Only)
                        </span>
                      </div>
                      <p className="text-[11px] text-aquabark-muted mt-1">
                        Delivered to home address in 2-4 business days. Note: Live fish cannot be sent via general courier.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column: Order Review & Razorpay Pay Button (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 space-y-6 sticky top-28">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark pb-4 border-b border-aquabark-border">
                Basket Review ({items.length} items)
              </h2>

              {/* Items summary */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 text-xs">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-aquabark-secondary/30 flex-shrink-0">
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 line-clamp-1">
                      <h4 className="font-bold text-aquabark-dark line-clamp-1">{item.productName}</h4>
                      <span className="text-[11px] text-aquabark-muted">
                        {item.quantity}x {item.variantTitle}
                      </span>
                    </div>
                    <div className="font-bold text-aquabark-dark">
                      {formatINR(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Server-recomputed Pricing breakdown */}
              <div className="space-y-2 text-xs text-aquabark-text pt-4 border-t border-aquabark-border">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatINR(serverPricing.subtotal)}</span>
                </div>
                {serverPricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Applied Coupon ({appliedCoupon})</span>
                    <span>-{formatINR(serverPricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Oxygen Transit Fee</span>
                  <span className="font-semibold">
                    {serverPricing.shippingFee === 0 ? (
                      <span className="text-emerald-700">FREE</span>
                    ) : (
                      formatINR(serverPricing.shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-aquabark-dark pt-3 border-t border-aquabark-border">
                  <span>Payable Total</span>
                  <span>{formatINR(serverPricing.totalAmount)}</span>
                </div>
              </div>

              {/* Live Arrival Shield Guarantee */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl text-[11px] text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">100% Live Arrival Assured</span>
                  <span>Oxygen bags + Insulated cooler. Free replacement if unboxing DOA happens.</span>
                </div>
              </div>

              {/* Submit & Pay Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-aquabark-dark hover:bg-aquabark-darker disabled:opacity-50 text-white font-bold text-sm tracking-wide py-4 px-6 rounded-full shadow-card flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Booking Transit & Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>PAY WITH RAZORPAY / UPI ({formatINR(serverPricing.totalAmount)})</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-aquabark-muted">
                Secured via 256-bit SSL encryption. Accepts UPI, GPay, PhonePe, Paytm, Debit/Credit Cards & NetBanking.
              </p>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}

