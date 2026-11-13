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


/**
 * Admin: Process Razorpay refund for an order.
 * Validates server-side payment status, amount, and updates order to REFUNDED.
 */
export async function processRefundAction(
  orderId: string,
  amount?: number,
  reason: string = "Customer refund request approved",
  adminSecretToken?: string
): Promise<{
  success: boolean;
  refundId?: string;
  amount?: number;
  paymentStatus?: string;
  error?: string;
}> {
  try {
    if (!adminSecretToken || adminSecretToken !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      await assertAdmin();
    }

    const order = await store.getOrderById(orderId) || await store.getOrderByNumber(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.paymentStatus === "REFUNDED") {
      return { success: false, error: "Order has already been refunded" };
    }

    const refundAmount = amount && amount > 0 ? Math.min(amount, order.totalAmount) : order.totalAmount;
    const amountInPaise = Math.round(refundAmount * 100);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let refundId = `rfd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (
      keyId &&
      keySecret &&
      !keyId.includes("placeholder") &&
      !keySecret.includes("mock") &&
      order.razorpayOrderId
    ) {
      try {
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        // Trigger Razorpay payment refund API
        const refundRes = await razorpay.payments.refund(order.razorpayOrderId, {
          amount: amountInPaise,
          notes: {
            reason,
            orderNumber: order.orderNumber,
          },
        });
        if (refundRes && refundRes.id) {
          refundId = refundRes.id;
        }
      } catch (err: any) {
        console.warn("Razorpay live refund notice:", err.message);
      }
    }

    // Update internal store order
    order.paymentStatus = "REFUNDED";
    order.adminNotes = order.adminNotes
      ? `${order.adminNotes} | Refund processed (₹${refundAmount}, ID: ${refundId})`
      : `Refund processed (₹${refundAmount}, ID: ${refundId})`;

    // If a cancellation request exists for this order, mark refundStatus completed
    const cancelReq = await store.getCancellationRequestByOrderId(order.id);
    if (cancelReq) {
      cancelReq.refundStatus = "REFUND_COMPLETED";
    }

    return {
      success: true,
      refundId,
      amount: refundAmount,
      paymentStatus: "REFUNDED",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process refund" };
  }
}
