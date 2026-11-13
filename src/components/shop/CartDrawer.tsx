"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";

export function CartDrawer() {
  const pathname = usePathname();

  // Complete Isolation: Strictly NEVER render customer cart drawer on admin routes
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }
  const {
    items,
    isCartOpen,
    setIsCartOpen,
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
  } = useCart();

  const [couponInput, setCouponInput] = useState("");

  if (!isCartOpen) return null;

  const freeShippingThreshold = 1499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-aquabark-bg shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-aquabark-border flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-aquabark-dark">Your Aquatic Basket</h2>
                <p className="text-xs text-aquabark-muted">{items.length} unique items</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-aquabark-muted hover:text-aquabark-dark rounded-full hover:bg-aquabark-secondary/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="bg-aquabark-secondary/40 px-6 py-3 border-b border-aquabark-border">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-aquabark-dark font-medium mb-1.5 flex items-center justify-between">
                <span>Add <strong>{formatINR(remainingForFreeShipping)}</strong> more for FREE Oxygen Parcel Shipping</span>
                <span className="text-[11px] text-aquabark-muted font-normal">{freeShippingProgress}%</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-800 font-semibold mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You unlocked FREE Express Parcel Transit! 🎉</span>
              </p>
            )}
            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-aquabark-dark transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-aquabark-secondary/70 flex items-center justify-center mx-auto text-aquabark-dark">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-aquabark-dark">Your basket is empty</h3>
                  <p className="text-xs text-aquabark-muted mt-1 max-w-xs mx-auto">
                    Explore our acclimated live fish, rare aquatic plants, and planted aquarium combos.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block mt-2 bg-aquabark-dark text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-aquabark-darker transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-4 rounded-2xl bg-white border border-aquabark-border shadow-soft"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-aquabark-secondary/30 flex-shrink-0">
                    <Image
                      src={item.imageUrl || "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=80"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-sm font-bold text-aquabark-dark leading-tight line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-aquabark-muted hover:text-red-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="inline-block text-[11px] font-medium text-aquabark-terracotta bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                        {item.variantTitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-sm text-aquabark-dark">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-aquabark-border rounded-full bg-aquabark-bg">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:text-aquabark-dark text-aquabark-muted transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-semibold px-2 text-aquabark-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:text-aquabark-dark text-aquabark-muted disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-aquabark-border space-y-4">
              
              {/* Coupon input */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Coupon <strong>{appliedCoupon}</strong> applied (-{formatINR(couponDiscount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-red-600 text-xs font-bold underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Discount code (e.g. WELCOME10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full text-xs uppercase px-3 py-2.5 rounded-xl border border-aquabark-border focus:border-aquabark-dark focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (couponInput.trim()) {
                          applyCoupon(couponInput);
                          setCouponInput("");
                        }
                      }}
                      className="bg-aquabark-secondary hover:bg-aquabark-primary text-aquabark-dark text-xs font-semibold px-4 rounded-xl transition-colors"
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

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-aquabark-text pt-2 border-t border-aquabark-border">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatINR(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Oxygen Pack & Express Transit</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700">FREE</span>
                    ) : (
                      formatINR(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-aquabark-dark pt-2 border-t border-aquabark-border">
                  <span>Estimated Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              {/* Transit Guarantee Badge */}
              <div className="flex items-center gap-2 text-[11px] text-aquabark-muted bg-aquabark-bg p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-aquabark-accent flex-shrink-0" />
                <span>Live Arrival Guarantee: Thermocol & Oxygen Packaged</span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-aquabark-dark hover:bg-aquabark-darker text-white py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-card transition-all active:scale-[0.99]"
              >
                <span>PROCEED TO SECURE CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

