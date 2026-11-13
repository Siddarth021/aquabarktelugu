"use server";

import { store } from "@/lib/store";
import { CartDTO } from "@/types";

/**
 * Retrieve current cart for session
 */
export async function getCartAction(sessionToken: string): Promise<CartDTO> {
  if (!sessionToken) {
    return { sessionToken: "", items: [], subtotal: 0, itemCount: 0 };
  }
  return store.getCart(sessionToken);
}

/**
 * Add an item to cart with stock validation
 */
export async function addToCartAction(
  sessionToken: string,
  variantId: string,
  quantity: number = 1
): Promise<{ success: boolean; cart: CartDTO; error?: string }> {
  if (!sessionToken) {
    return {
      success: false,
      cart: { sessionToken: "", items: [], subtotal: 0, itemCount: 0 },
      error: "Session token required",
    };
  }

  return store.addToCart(sessionToken, variantId, quantity);
}

/**
 * Update item quantity in cart
 */
export async function updateCartItemAction(
  sessionToken: string,
  variantId: string,
  quantity: number
): Promise<{ success: boolean; cart: CartDTO; error?: string }> {
  if (!sessionToken) {
    return {
      success: false,
      cart: { sessionToken: "", items: [], subtotal: 0, itemCount: 0 },
      error: "Session token required",
    };
  }

  return store.updateCartItem(sessionToken, variantId, quantity);
}

/**
 * Remove an item from cart
 */
export async function removeFromCartAction(
  sessionToken: string,
  variantId: string
): Promise<{ success: boolean; cart: CartDTO }> {
  return store.removeFromCart(sessionToken, variantId);
}

/**
 * Clear all items in cart
 */
export async function clearCartAction(
  sessionToken: string
): Promise<{ success: boolean }> {
  await store.clearCart(sessionToken);
  return { success: true };
}

/**
 * Validates stock for all items in the customer's cart
 */
export async function validateCartStockAction(
  sessionToken: string
): Promise<{
  valid: boolean;
  outOfStockItems: {
    variantId: string;
    title: string;
    requested: number;
    available: number;
  }[];
}> {
  const cart = await store.getCart(sessionToken);
  const outOfStockItems = [];

  for (const item of cart.items) {
    const variant = await store.getVariantById(item.variantId);
    if (!variant) {
      outOfStockItems.push({
        variantId: item.variantId,
        title: item.variantTitle,
        requested: item.quantity,
        available: 0,
      });
      continue;
    }

    const available = Math.max(0, variant.stock - variant.reservedStock);
    if (available < item.quantity) {
      outOfStockItems.push({
        variantId: item.variantId,
        title: `${item.productName} (${item.variantTitle})`,
        requested: item.quantity,
        available,
      });
    }
  }

  return {
    valid: outOfStockItems.length === 0,
    outOfStockItems,
  };
}
