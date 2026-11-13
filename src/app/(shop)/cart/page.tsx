"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  AlertTriangle, 
  Tag, 
  ShoppingBag,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    appliedCoupon,
    couponDiscount,
    couponError,
    applyCoupon,
    removeCoupon,
    subtotal,
    shippingFee,
    total,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");

  const freeShippingThreshold = 1499;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="py-20 bg-aquabark-bg min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-aquabark-secondary/70 flex items-center justify-center mx-auto text-aquabark-dark">
            <ShoppingBag className="w-10 h-10 stroke-1" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-aquabark-dark">
            Your Aquatic Basket is Empty
          </h1>
          <p className="text-xs sm:text-sm text-aquabark-muted">
            You haven't added any acclimated live fish, rare aquatic flora, or planted tank combos yet.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs font-bold px-8 py-3.5 rounded-full shadow-card transition-all"
            >
              <span>DISCOVER CATALOG</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-aquabark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-1">
            Review Your Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
            Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
          </h1>
        </div>

        {/* Live Fish Transit Feasibility Alert */}
        <div className="mb-8 rounded-3xl bg-amber-50 border border-amber-200/80 p-5 flex items-start gap-4 shadow-soft">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-xs text-amber-900 leading-relaxed">
            <h4 className="font-bold text-amber-950 text-sm mb-1">
              Live Fish Transit Notice & Feasibility:
            </h4>
            <p>
              To ensure 100% zero-stress survival, all live fish orders are packed with medical oxygen and double-layer thermocol boxes, dispatched through <strong>TSRTC/APSRTC Bus Parcel</strong> or <strong>Railway Express</strong>. Parcels are collected from your nearest town bus station or rail parcel counter.
            </p>
          </div>
        </div>

        {/* Layout Grid: Items on Left, Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Media & info */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-aquabark-secondary/30 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-aquabark-dark">
                      {item.productName}
                    </h3>
                    <div className="inline-block text-xs font-semibold text-aquabark-terracotta bg-amber-50 px-2.5 py-0.5 rounded-full mt-1">
                      {item.variantTitle}
                    </div>
                    <div className="text-xs text-aquabark-muted mt-1.5 font-medium">
                      Unit Price: {formatINR(item.unitPrice)}
                    </div>
                  </div>
                </div>

                {/* Controls and Total */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                  {/* Quantity control */}
                  <div className="flex items-center border border-aquabark-border rounded-full bg-aquabark-bg px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="p-1 text-aquabark-muted hover:text-aquabark-dark transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-xs px-3 text-aquabark-dark">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-1 text-aquabark-muted hover:text-aquabark-dark disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[80px]">
                    <span className="font-serif text-lg font-bold text-aquabark-dark block">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="p-2 text-aquabark-muted hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-between items-center pt-2">
              <Link
                href="/shop"
                className="text-xs font-bold text-aquabark-dark hover:text-aquabark-accent flex items-center gap-1"
              >
                <span>← Continue Shopping</span>
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Clear Entire Basket
              </button>
            </div>
          </div>

          {/* Cart Summary Card (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl font-bold text-aquabark-dark pb-4 border-b border-aquabark-border">
              Order Summary
            </h2>

            {/* Free shipping check */}
            <div className="bg-aquabark-secondary/30 p-3.5 rounded-2xl text-xs space-y-1">
              {remaining > 0 ? (
                <p className="text-aquabark-dark font-medium">
                  Add <strong>{formatINR(remaining)}</strong> more to get <strong>FREE Express Shipping</strong>!
                </p>
              ) : (
                <p className="text-emerald-800 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free Oxygen Parcel Transit Unlocked!</span>
                </p>
              )}
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-aquabark-dark block">
                Promo Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <Tag className="w-4 h-4" />
                    <span>{appliedCoupon} (-{formatINR(couponDiscount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 text-xs font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 uppercase text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (couponInput.trim()) {
                        applyCoupon(couponInput);
                        setCouponInput("");
                      }
                    }}
                    className="bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs font-semibold px-4 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Summary lines */}
            <div className="space-y-2.5 text-xs text-aquabark-text pt-2 border-t border-aquabark-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Oxygen Packing & Bus/Rail Transit</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700">FREE</span>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-aquabark-dark pt-3 border-t border-aquabark-border">
                <span>Estimated Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="bg-aquabark-bg p-3.5 rounded-2xl text-[11px] text-aquabark-muted space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-aquabark-dark">
                <ShieldCheck className="w-4 h-4 text-aquabark-accent" />
                <span>100% Live Arrival Guarantee</span>
              </div>
              <p>Double-insulated thermocol boxes with 48-hour oxygen endurance.</p>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full bg-aquabark-dark hover:bg-aquabark-darker text-white py-4 px-6 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-card transition-all active:scale-[0.98]"
            >
              <span>CHECKOUT & BOOK TRANSIT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}

