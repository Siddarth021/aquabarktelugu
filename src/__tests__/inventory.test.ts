import { describe, it, expect, beforeEach } from "vitest";
import { store } from "@/lib/store";
import { createOrderAction, updateOrderStatusAction } from "@/actions/orders";
import {
  requestCancellationAction,
  resolveCancellationAction,
} from "@/actions/cancellations";
import { updateVariantStockAction } from "@/actions/admin";

describe("Inventory, Atomic Reservations & Single-Time Restoration", () => {
  const adminSecret = "aquabark-telugu-secure-setup-2026";

  beforeEach(() => {
    process.env.ADMIN_BOOTSTRAP_SECRET = adminSecret;
  });

  describe("1. Atomic Stock Reservation on Pending Orders", () => {
    it("atomically increments reservedStock without prematurely deducting physical stock", async () => {
      const variant = await store.getVariantById("var-tetra-5");
      expect(variant).toBeDefined();
      const initialStock = variant!.stock;
      const initialReserved = variant!.reservedStock;

      const orderRes = await createOrderAction({
        customerName: "Reservation Customer",
        customerPhone: "+919848033344",
        shippingAddress: {
          recipientName: "Reservation Recipient",
          phone: "+919848033344",
          street: "Tilak Road",
          city: "Hyderabad",
          state: "Telangana",
          postalCode: "500001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-tetra-5", quantity: 3 }],
      });

      expect(orderRes.success).toBe(true);
      const afterReservation = await store.getVariantById("var-tetra-5");
      // Reserved stock increased by 3
      expect(afterReservation!.reservedStock).toBe(initialReserved + 3);
      // Physical stock remains unchanged until confirmed
      expect(afterReservation!.stock).toBe(initialStock);
    });
  });

  describe("2. Concurrency & Overselling Prevention", () => {
    it("strictly blocks checkout when requested quantity exceeds available stock", async () => {
      const variant = await store.getVariantById("var-deb-male");
      expect(variant).toBeDefined();
      const available = variant!.stock - variant!.reservedStock;

      const orderRes = await createOrderAction({
        customerName: "Oversell Attacker",
        customerPhone: "+919848099887",
        shippingAddress: {
          recipientName: "Attacker",
          phone: "+919848099887",
          street: "Station Road",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          postalCode: "520001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-deb-male", quantity: available + 10 }],
      });

      expect(orderRes.success).toBe(false);
      expect(orderRes.error).toMatch(/insufficient stock/i);
    });

    it("prevents overselling under high concurrency (race condition stress test)", async () => {
      // Pick variant var-an-lava (Anubias on Lava Rock)
      const variant = await store.getVariantById("var-an-lava");
      expect(variant).toBeDefined();

      // Set known small stock for testing concurrency
      const targetStock = 2;
      variant!.stock = targetStock;
      variant!.reservedStock = 0;

      // 5 concurrent shoppers all attempting to buy 1 item simultaneously
      const attempts = [1, 2, 3, 4, 5].map((idx) =>
        createOrderAction({
          customerName: `Concurrent Buyer ${idx}`,
          customerPhone: `+91984800000${idx}`,
          shippingAddress: {
            recipientName: `Buyer ${idx}`,
            phone: `+91984800000${idx}`,
            street: "MG Road",
            city: "Visakhapatnam",
            state: "Andhra Pradesh",
            postalCode: "530001",
          },
          transitMethod: "BUS_PARCEL",
          cartItems: [{ variantId: "var-an-lava", quantity: 1 }],
        })
      );

      const results = await Promise.all(attempts);
      const successfulOrders = results.filter((r) => r.success);
      const rejectedOrders = results.filter((r) => !r.success);

      // Invariant: Exactly 2 should succeed, 3 must be rejected!
      expect(successfulOrders.length).toBe(targetStock);
      expect(rejectedOrders.length).toBe(3);

      for (const rejected of rejectedOrders) {
        expect(rejected.error).toMatch(/insufficient stock/i);
      }

      // Check variant reservedStock never exceeded the physical stock
      const finalVariant = await store.getVariantById("var-an-lava");
      expect(finalVariant!.reservedStock).toBe(targetStock);
      expect(finalVariant!.stock - finalVariant!.reservedStock).toBe(0);

      // Restore stock
      variant!.stock = 15;
      variant!.reservedStock = 0;
    });
  });

  describe("3. Order Fulfillment & Permanent Stock Deduction", () => {
    it("permanently deducts physical stock and clears reservedStock on order confirmation", async () => {
      const variant = await store.getVariantById("var-as-std");
      expect(variant).toBeDefined();
      const initialStock = variant!.stock;
      const initialReserved = variant!.reservedStock;

      const orderRes = await createOrderAction({
        customerName: "Fulfillment Customer",
        customerPhone: "+919848055566",
        shippingAddress: {
          recipientName: "Fulfillment Customer",
          phone: "+919848055566",
          street: "Brodipet",
          city: "Guntur",
          state: "Andhra Pradesh",
          postalCode: "522002",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-as-std", quantity: 2 }],
      });

      expect(orderRes.success).toBe(true);
      const orderId = orderRes.order!.id;

      // Confirm order (Admin fulfillment)
      const confirmRes = await updateOrderStatusAction(orderId, "CONFIRMED", "Confirmed", adminSecret);
      expect(confirmRes.success).toBe(true);

      const afterFulfill = await store.getVariantById("var-as-std");
      // Physical stock permanently deducted
      expect(afterFulfill!.stock).toBe(initialStock - 2);
      // Reserved stock cleared back to initial
      expect(afterFulfill!.reservedStock).toBe(initialReserved);
    });
  });

  describe("4. Single-Time Cancellation Restoration Guarantee", () => {
    it("restores stock upon cancellation approval and strictly prevents double restoration on subsequent calls", async () => {
      const variant = await store.getVariantById("var-spf-double");
      expect(variant).toBeDefined();
      const stockStart = variant!.stock;

      // 1. Create and confirm an order with 2 units
      const orderRes = await createOrderAction({
        customerName: "Cancellation Test Customer",
        customerPhone: "+919848077788",
        shippingAddress: {
          recipientName: "Cancel Customer",
          phone: "+919848077788",
          street: "Collectorate Road",
          city: "Kurnool",
          state: "Andhra Pradesh",
          postalCode: "518001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-spf-double", quantity: 2 }],
      });
      const orderId = orderRes.order!.id;

      await updateOrderStatusAction(orderId, "CONFIRMED", "Confirmed", adminSecret);
      const afterDeduct = await store.getVariantById("var-spf-double");
      expect(afterDeduct!.stock).toBe(stockStart - 2);

      // 2. Customer submits cancellation request
      const cancelReq = await requestCancellationAction(
        orderId,
        "Changed mind",
        "Already bought another filter"
      );
      expect(cancelReq.success).toBe(true);

      // 3. First Admin Approval -> Restores stock
      const firstApproval = await resolveCancellationAction(
        orderId,
        "APPROVE",
        "Approved refund",
        adminSecret
      );
      expect(firstApproval.success).toBe(true);
      expect(firstApproval.isStockRestored).toBe(true);

      const afterFirstRestore = await store.getVariantById("var-spf-double");
      expect(afterFirstRestore!.stock).toBe(stockStart);

      // 4. INVARIANT: Second Approval Attempt MUST BE REJECTED without double-restoring!
      const secondApproval = await resolveCancellationAction(
        orderId,
        "APPROVE",
        "Duplicate approval call",
        adminSecret
      );
      expect(secondApproval.success).toBe(false);

      const afterSecondAttempt = await store.getVariantById("var-spf-double");
      expect(afterSecondAttempt!.stock).toBe(stockStart); // Still exactly stockStart, not stockStart + 2!
    });

    it("handles concurrent cancellation approvals safely (exact single restoration)", async () => {
      const variant = await store.getVariantById("var-jf-wood");
      expect(variant).toBeDefined();
      const stockStart = variant!.stock;

      const orderRes = await createOrderAction({
        customerName: "Concurrent Cancel Customer",
        customerPhone: "+919848099112",
        shippingAddress: {
          recipientName: "Cancel Customer",
          phone: "+919848099112",
          street: "Station Road",
          city: "Nellore",
          state: "Andhra Pradesh",
          postalCode: "524001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-jf-wood", quantity: 1 }],
      });
      const orderId = orderRes.order!.id;

      await updateOrderStatusAction(orderId, "CONFIRMED", "Confirmed", adminSecret);
      await requestCancellationAction(orderId, "Defective order request", "Mistake");

      // Fire 2 simultaneous approval calls
      const [res1, res2] = await Promise.all([
        resolveCancellationAction(orderId, "APPROVE", "First call", adminSecret),
        resolveCancellationAction(orderId, "APPROVE", "Second call", adminSecret),
      ]);

      // Exactly one must succeed with isStockRestored = true, the other must fail
      const successes = [res1, res2].filter((r) => r.success);
      const failures = [res1, res2].filter((r) => !r.success);

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1);

      const finalVariant = await store.getVariantById("var-jf-wood");
      expect(finalVariant!.stock).toBe(stockStart);
    });
  });

  describe("5. Admin Stock Adjustment & Boundaries", () => {
    it("updates stock correctly and prevents negative stock values", async () => {
      const variant = await store.getVariantById("var-mc-cup");
      expect(variant).toBeDefined();
      const currentStock = variant!.stock;

      // Positive adjustment (+5)
      const incRes = await updateVariantStockAction("var-mc-cup", 5, "Received new nursery batch");
      expect(incRes.success).toBe(true);
      expect(incRes.newStock).toBe(currentStock + 5);

      // Negative adjustment (-2)
      const decRes = await updateVariantStockAction("var-mc-cup", -2, "Disposed yellowed cups");
      expect(decRes.success).toBe(true);
      expect(decRes.newStock).toBe(currentStock + 3);

      // Attempting to decrement below zero must fail
      const invalidDecRes = await updateVariantStockAction("var-mc-cup", -9999, "Excessive deduction");
      expect(invalidDecRes.success).toBe(false);
      expect(invalidDecRes.error).toMatch(/cannot be negative/i);

      // Revert back
      await updateVariantStockAction("var-mc-cup", -3, "Revert test adjustment");
    });
  });
});
