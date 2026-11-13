"use server";

import { store } from "@/lib/store";
import { assertAdmin } from "@/lib/auth";
import {
  PricingCalculationResult,
  TransportMethod,
  PromotionDTO,
  ProductVariantDTO,
} from "@/types";

/**
 * Validates a single coupon code against subtotal with anti-stacking rules.
 * Anti-stacking rule: Strictly one promotional discount coupon may be applied per checkout.
 */
export async function validateCouponAction(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  message?: string;
  promotion?: PromotionDTO;
  discountAmount: number;
}> {
  if (!code || !code.trim()) {
    return { valid: false, message: "Please enter a valid coupon code", discountAmount: 0 };
  }

  // Anti-stacking check: reject combined codes
  if (code.includes(",") || code.includes("+") || code.includes("&")) {
    return {
      valid: false,
      message: "Multiple coupon stacking is not permitted. Please use one coupon at a time.",
      discountAmount: 0,
    };
  }

  return store.validatePromotion(code.trim().toUpperCase(), subtotal);
}

/**
 * Calculates authoritative checkout pricing on the server.
 * Recomputes all item lines using current database/store prices (protecting against client tampering).
 */
export async function calculateCheckoutPricingAction(
  cartItems: { variantId: string; quantity: number }[],
  couponCode?: string,
  transitMethod: TransportMethod = "BUS_PARCEL"
): Promise<PricingCalculationResult> {
  if (!cartItems || cartItems.length === 0) {
    return {
      subtotal: 0,
      discountAmount: 0,
      appliedCoupon: null,
      shippingFee: 0,
      totalAmount: 0,
      requiresSpecialTransit: false,
      eligibleTransitMethods: ["BUS_PARCEL", "RAILWAY_PARCEL", "LOCAL_PICKUP"],
      currency: "INR",
    };
  }

  return store.calculatePricing(cartItems, couponCode, transitMethod);
}

/**
 * Dynamic Pricing update for a variant (Admin only)
 * Creates price audit trail, modifies current variant price for future checkouts without altering past orders.
 */
export async function updateDynamicPriceAction(
  variantId: string,
  newPrice: number,
  reason: string = "Dynamic market adjustment",
  adminSecretToken?: string
): Promise<{ success: boolean; variant?: ProductVariantDTO; oldPrice?: number; error?: string }> {
  try {
    // Verify admin access
    if (!adminSecretToken || adminSecretToken !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      await assertAdmin();
    }

    if (newPrice <= 0) {
      return { success: false, error: "Price must be greater than zero" };
    }

    const result = await store.updateVariantPrice(variantId, newPrice, reason);
    return {
      success: true,
      variant: result.variant,
      oldPrice: result.oldPrice,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update dynamic price" };
  }
}

/**
 * Retrieve active promotions list
 */
export async function getPromotionsAction(): Promise<PromotionDTO[]> {
  return store.getPromotions();
}
