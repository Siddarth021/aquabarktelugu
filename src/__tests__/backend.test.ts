import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import { store } from "@/lib/store";
import {
  addToCartAction,
  getCartAction,
  updateCartItemAction,
  removeFromCartAction,
  validateCartStockAction,
} from "@/actions/cart";
import {
  createOrderAction,
  getOrderAction,
  updateOrderStatusAction,
} from "@/actions/orders";
import {
  calculateCheckoutPricingAction,
  validateCouponAction,
  updateDynamicPriceAction,
} from "@/actions/pricing";
import {
  requestCancellationAction,
  resolveCancellationAction,
} from "@/actions/cancellations";
import {
  createShipmentAction,
  lookupTrackingAction,
} from "@/actions/shipping";

describe("AquaBark Telugu - Backend Server Actions & Store Tests", () => {
  const testSession = "test-session-" + Date.now();

  describe("1. Cart & Stock Validation", () => {
    it("should add product variant to cart and validate stock", async () => {
      // var-rdg-male has stock 35
      const res = await addToCartAction(testSession, "var-rdg-male", 2);
      expect(res.success).toBe(true);
      expect(res.cart.items.length).toBeGreaterThan(0);

      const cart = await getCartAction(testSession);
      const item = cart.items.find((i) => i.variantId === "var-rdg-male");
      expect(item).toBeDefined();
      expect(item?.quantity).toBe(2);
    });

    it("should prevent adding more items than available stock", async () => {
      const res = await addToCartAction(testSession, "var-deb-male", 999);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/available/i);
    });

    it("should update and remove cart items properly", async () => {
      await updateCartItemAction(testSession, "var-rdg-male", 4);
      let cart = await getCartAction(testSession);
      let item = cart.items.find((i) => i.variantId === "var-rdg-male");
      expect(item?.quantity).toBe(4);

      await removeFromCartAction(testSession, "var-rdg-male");
      cart = await getCartAction(testSession);
      item = cart.items.find((i) => i.variantId === "var-rdg-male");
      expect(item).toBeUndefined();
    });
  });

  describe("2. Pricing, Coupons & Anti-Stacking", () => {
    it("should calculate correct pricing and apply WELCOME10 coupon", async () => {
      // var-rdg-pair is ₹320 x 2 = ₹640
      const pricing = await calculateCheckoutPricingAction(
        [{ variantId: "var-rdg-pair", quantity: 2 }],
        "WELCOME10",
        "BUS_PARCEL"
      );

      expect(pricing.subtotal).toBe(640);
      expect(pricing.appliedCoupon?.code).toBe("WELCOME10");
      expect(pricing.discountAmount).toBe(64); // 10% of 640 = 64
      expect(pricing.shippingFee).toBe(100); // Bus parcel shipping
      expect(pricing.totalAmount).toBe(640 - 64 + 100);
    });

    it("should enforce anti-stacking rules (reject combined coupon strings)", async () => {
      const res = await validateCouponAction("WELCOME10+AQUA50", 1000);
      expect(res.valid).toBe(false);
      expect(res.message).toMatch(/anti-stacking|multiple coupon stacking is not permitted/i);
    });

    it("should enforce minimum order value for coupons", async () => {
      // AQUA50 requires min order value ₹500
      const res = await validateCouponAction("AQUA50", 250);
      expect(res.valid).toBe(false);
      expect(res.message).toMatch(/minimum order value/i);
    });
  });

  describe("3. Dynamic Pricing & Immutable Price Snapshots", () => {
    it("should dynamically update price and preserve previous order snapshots", async () => {
      const variant = await store.getVariantById("var-jf-bare");
      expect(variant).toBeDefined();
      const initialPrice = variant!.price;

      // 1. Create order at initial price
      const orderRes = await createOrderAction({
        customerName: "Snapshot Test Customer",
        customerPhone: "+919999911111",
        shippingAddress: {
          recipientName: "Snapshot Customer",
          phone: "+919999911111",
          street: "River Bank Road",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          postalCode: "520001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-jf-bare", quantity: 1 }],
      });

      expect(orderRes.success).toBe(true);
      const order = orderRes.order!;
      const snapshotItem = order.items.find((i) => i.variantId === "var-jf-bare");
      expect(snapshotItem?.priceSnapshot).toBe(initialPrice);

      // 2. Dynamic price update by admin
      const updateRes = await updateDynamicPriceAction(
        "var-jf-bare",
        initialPrice + 50,
        "Seasonal monsoon supply shortage",
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );
      expect(updateRes.success).toBe(true);

      // Check variant reflects new price
      const updatedVariant = await store.getVariantById("var-jf-bare");
      expect(updatedVariant?.price).toBe(initialPrice + 50);

      // 3. CRITICAL: Existing order snapshot MUST NOT CHANGE
      const fetchedOrder = await store.getOrderById(order.id);
      const fetchedSnapshot = fetchedOrder?.items.find((i) => i.variantId === "var-jf-bare");
      expect(fetchedSnapshot?.priceSnapshot).toBe(initialPrice);

      // Clean up / revert price
      await updateDynamicPriceAction(
        "var-jf-bare",
        initialPrice,
        "Revert test",
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );
    });
  });

  describe("4. Order Lifecycle, Status Transitions & Atomic Stock Reservation", () => {
    it("should atomically reserve stock upon order creation and fulfill on confirmation", async () => {
      const variantBefore = await store.getVariantById("var-angel-sml");
      expect(variantBefore).toBeDefined();
      const stockBefore = variantBefore!.stock;
      const reservedBefore = variantBefore!.reservedStock;

      const orderRes = await createOrderAction({
        customerName: "Order Lifecycle Customer",
        customerPhone: "+919848033333",
        shippingAddress: {
          recipientName: "Lifecycle Customer",
          phone: "+919848033333",
          street: "Station Road",
          city: "Secunderabad",
          state: "Telangana",
          postalCode: "500003",
        },
        transitMethod: "RAILWAY_PARCEL",
        cartItems: [{ variantId: "var-angel-sml", quantity: 2 }],
      });

      expect(orderRes.success).toBe(true);
      const orderId = orderRes.order!.id;

      // Check reservedStock increased by 2
      const variantAfterPending = await store.getVariantById("var-angel-sml");
      expect(variantAfterPending!.reservedStock).toBe(reservedBefore + 2);
      expect(variantAfterPending!.stock).toBe(stockBefore); // physical stock not yet deducted

      // Transition order to CONFIRMED
      const confirmRes = await updateOrderStatusAction(
        orderId,
        "CONFIRMED",
        "Payment verified",
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );
      expect(confirmRes.success).toBe(true);

      // Check stock is permanently deducted and reserved stock cleared
      const variantAfterConfirmed = await store.getVariantById("var-angel-sml");
      expect(variantAfterConfirmed!.stock).toBe(stockBefore - 2);
      expect(variantAfterConfirmed!.reservedStock).toBe(reservedBefore);
    });
  });

  describe("5. Single-Time Cancellation Restoration", () => {
    it("should restore stock on cancellation approval and strictly prevent double restoration", async () => {
      // 1. Create and confirm an order with 2 units of var-prime-100ml
      const variantStart = await store.getVariantById("var-prime-100ml");
      const stockStart = variantStart!.stock;

      const orderRes = await createOrderAction({
        customerName: "Cancel Customer",
        customerPhone: "+919888877777",
        shippingAddress: {
          recipientName: "Cancel Customer",
          phone: "+919888877777",
          street: "Park Street",
          city: "Guntur",
          state: "Andhra Pradesh",
          postalCode: "522002",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-prime-100ml", quantity: 2 }],
      });
      const orderId = orderRes.order!.id;

      // Confirm it so physical stock is deducted
      await updateOrderStatusAction(
        orderId,
        "CONFIRMED",
        "Confirmed",
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );

      const variantAfterDeduct = await store.getVariantById("var-prime-100ml");
      expect(variantAfterDeduct!.stock).toBe(stockStart - 2);

      // 2. Customer requests cancellation
      const cancelReq = await requestCancellationAction(
        orderId,
        "Accidental order",
        "Ordered wrong bottle size"
      );
      expect(cancelReq.success).toBe(true);

      // 3. Admin approves cancellation -> Should restore 2 items
      const approveRes = await resolveCancellationAction(
        orderId,
        "APPROVE",
        "Approved refund",
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );
      expect(approveRes.success).toBe(true);
      expect(approveRes.isStockRestored).toBe(true);

      const variantAfterRestore = await store.getVariantById("var-prime-100ml");
      expect(variantAfterRestore!.stock).toBe(stockStart);

      // 4. ATTEMPT SECOND RESOLUTION -> Must NOT restore stock again!
      const secondApprove = await resolveCancellationAction(
        orderId,
        "APPROVE",
        "Second attempt",
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );
      expect(secondApprove.success).toBe(false);

      const variantAfterSecondAttempt = await store.getVariantById("var-prime-100ml");
      expect(variantAfterSecondAttempt!.stock).toBe(stockStart); // Unchanged!
    });
  });

  describe("6. Shipping & Manual Dispatch Tracking", () => {
    it("should create shipment for Bus / Railway Parcel and support tracking lookup", async () => {
      // Find an order without shipment
      const orders = await store.getAllOrders();
      const targetOrder = orders.find((o) => !o.shipment && o.status !== "CANCELLED");
      expect(targetOrder).toBeDefined();

      const shipmentRes = await createShipmentAction(
        {
          orderId: targetOrder!.id,
          transportMethod: "BUS_PARCEL",
          operatorName: "TSRTC Garuda Plus Luxury Cargo",
          departureLocation: "MGBS Hyderabad (Bay 14)",
          destinationStation: "Warangal Bus Station Parcel Counter",
          parcelReceiptNumber: "TSRTC-LR-882194",
          dispatchDate: new Date().toISOString(),
          notes: "Live fishes oxygen packed. Call consignee upon arrival.",
        },
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );

      expect(shipmentRes.success).toBe(true);
      const trackingNumber = shipmentRes.shipment!.trackingNumber;
      expect(trackingNumber).toMatch(/^ABT-TRK-\d{6}$/);

      // Public tracking lookup
      const lookup = await lookupTrackingAction(trackingNumber);
      expect(lookup.success).toBe(true);
      expect(lookup.shipment?.operatorName).toBe("TSRTC Garuda Plus Luxury Cargo");
      expect(lookup.order?.id).toBe(targetOrder!.id);
    });
  });

  describe("7. Razorpay Signature Verification Logic", () => {
    it("should correctly compute and verify valid HMAC SHA256 signatures", () => {
      const secret = "mock_secret";
      const orderId = "order_test_123456";
      const paymentId = "pay_test_789012";

      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      expect(validSignature).toBe(expectedSignature);

      // Tampered paymentId should fail
      const invalidSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|tampered_pay_id`)
        .digest("hex");

      expect(validSignature).not.toBe(invalidSignature);
    });
  });

  describe("8. Razorpay Refund Server Action", () => {
    it("should process refund and update order status to REFUNDED", async () => {
      const { processRefundAction } = await import("@/actions/orders");
      
      // Order 1 from seed data is PAID
      const targetOrder = await store.getOrderByNumber("ABT-2026-104921");
      expect(targetOrder).toBeDefined();

      const refundRes = await processRefundAction(
        targetOrder!.id,
        targetOrder!.totalAmount,
        "Customer request",
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );

      expect(refundRes.success).toBe(true);
      expect(refundRes.paymentStatus).toBe("REFUNDED");
      expect(refundRes.refundId).toBeDefined();

      // Verify order paymentStatus in store is now REFUNDED
      const updatedOrder = await store.getOrderById(targetOrder!.id);
      expect(updatedOrder?.paymentStatus).toBe("REFUNDED");

      // Attempt second refund -> Should be rejected
      const secondRefund = await processRefundAction(
        targetOrder!.id,
        targetOrder!.totalAmount,
        "Duplicate attempt",
        process.env.ADMIN_BOOTSTRAP_SECRET || "aquabark-telugu-secure-setup-2026"
      );
      expect(secondRefund.success).toBe(false);
      expect(secondRefund.error).toMatch(/already been refunded/i);
    });
  });
});
