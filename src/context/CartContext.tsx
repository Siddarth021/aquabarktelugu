"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItemDTO } from "@/types";
import { COUPONS } from "@/data/mockData";

interface CartContextType {
  items: CartItemDTO[];
  addItem: (item: CartItemDTO) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: string | null;
  couponDiscount: number;
  couponError: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemDTO[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("aquabark_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem("aquabark_wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
      const savedCoupon = localStorage.getItem("aquabark_coupon");
      if (savedCoupon) {
        setAppliedCoupon(savedCoupon);
      }
    } catch (e) {
      console.error("Failed to load local storage cart:", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage on updates
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("aquabark_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to local storage:", e);
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("aquabark_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist:", e);
    }
  }, [wishlist, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem("aquabark_coupon", appliedCoupon);
      } else {
        localStorage.removeItem("aquabark_coupon");
      }
    } catch (e) {
      console.error("Failed to save coupon:", e);
    }
  }, [appliedCoupon, isInitialized]);

  const addItem = (item: CartItemDTO) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, item.maxStock);
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.variantId === variantId) {
          const clamped = Math.min(quantity, i.maxStock);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Calculate coupon discount
  let couponDiscount = 0;
  if (appliedCoupon && COUPONS[appliedCoupon]) {
    const rule = COUPONS[appliedCoupon];
    if (subtotal >= rule.minOrder) {
      const discount = Math.round((subtotal * rule.discountPercent) / 100);
      couponDiscount = Math.min(discount, rule.maxDiscount);
    }
  }

  const applyCoupon = (code: string): boolean => {
    const upper = code.trim().toUpperCase();
    setCouponError(null);
    if (!COUPONS[upper]) {
      setCouponError("Invalid coupon code. Try WELCOME10 or AQUA50.");
      return false;
    }
    const rule = COUPONS[upper];
    if (subtotal < rule.minOrder) {
      setCouponError(`Minimum cart value of ₹${rule.minOrder} required for ${upper}`);
      return false;
    }
    setAppliedCoupon(upper);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Free shipping above ₹1499, otherwise flat ₹150 for oxygen parcel packing
  const shippingFee = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 150;
  const total = Math.max(0, subtotal - couponDiscount + shippingFee);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        couponDiscount,
        couponError,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        total,
        itemCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

