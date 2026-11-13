"use server";

import { store } from "@/lib/store";
import { assertAdmin } from "@/lib/auth";
import { CreateOrderInput, OrderDTO, OrderStatus } from "@/types";

/**
 * Creates an order with atomic stock reservation and immutable price snapshots.
 * Client price payloads are strictly ignored; prices are recalculated on server.
 */
export async function createOrderAction(
  input: CreateOrderInput,
  sessionTokenToClear?: string
): Promise<{ success: boolean; order?: OrderDTO; error?: string }> {
  try {
    // Basic validations
    if (!input.customerName || !input.customerPhone) {
      return { success: false, error: "Customer name and phone number are required" };
    }

    if (!input.shippingAddress || !input.shippingAddress.city || !input.shippingAddress.street) {
      return { success: false, error: "Valid shipping address is required" };
    }

    if (!input.cartItems || input.cartItems.length === 0) {
      return { success: false, error: "Cannot create an empty order" };
    }

    // Atomic creation and stock reservation
    const result = await store.createOrder(input);

    if (result.success && sessionTokenToClear) {
      await store.clearCart(sessionTokenToClear);
    }

    return result;
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create order" };
  }
}

/**
 * Public or authenticated lookup of an order by Order Number or ID
 */
export async function getOrderAction(
  orderNumberOrId: string
): Promise<{ success: boolean; order?: OrderDTO | null; error?: string }> {
  if (!orderNumberOrId) {
    return { success: false, error: "Order identifier required" };
  }

  let order = await store.getOrderByNumber(orderNumberOrId);
  if (!order) {
    order = await store.getOrderById(orderNumberOrId);
  }

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  return { success: true, order };
}

/**
 * Customer order history lookup via phone or email
 */
export async function listCustomerOrdersAction(
  phoneOrEmail: string
): Promise<{ success: boolean; orders: OrderDTO[] }> {
  if (!phoneOrEmail || !phoneOrEmail.trim()) {
    return { success: true, orders: [] };
  }

  const orders = await store.getCustomerOrders(phoneOrEmail);
  return { success: true, orders };
}

/**
 * Admin: List all orders with optional status filter
 */
export async function listAdminOrdersAction(
  status?: OrderStatus,
  adminSecretToken?: string
): Promise<{ success: boolean; orders: OrderDTO[]; error?: string }> {
  try {
    if (!adminSecretToken || adminSecretToken !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      await assertAdmin();
    }

    const orders = await store.getAllOrders(status);
    return { success: true, orders };
  } catch (err: any) {
    return { success: false, orders: [], error: err.message || "Unauthorized" };
  }
}

/**
 * Admin: Update order status along the fulfillment lifecycle
 * (PENDING -> CONFIRMED -> PREPARING -> SHIPPED -> DELIVERED)
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  adminSecretToken?: string
): Promise<{ success: boolean; order?: OrderDTO; error?: string }> {
  try {
    if (!adminSecretToken || adminSecretToken !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      await assertAdmin();
    }

    return store.updateOrderStatus(orderId, newStatus, note, "Admin");
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update order status" };
  }
}
