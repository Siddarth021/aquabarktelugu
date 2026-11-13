import { describe, it, expect, beforeEach } from "vitest";
import { store } from "@/lib/store";
import {
  getAdminDashboardStats,
  getAdminOrders,
  updateOrderStatusAction,
  dispatchOrderAction,
  getAdminProducts,
  updateVariantPriceAction,
  updateVariantStockAction,
  createProductAction,
  getAdminCategories,
  createCategoryAction,
  toggleCategoryActiveAction,
  getAdminCombos,
  createComboAction,
  deleteComboAction,
  getAdminCancellations,
  handleCancellationAction,
  getAdminSettings,
  updateAdminSettingsAction,
} from "@/actions/admin";
import { isValidAdminToken } from "@/lib/admin-auth";

describe("AquaBark Admin Mobile Dashboard & Workflows", () => {
  beforeEach(() => {
    process.env.ADMIN_BOOTSTRAP_SECRET = "aquabark-telugu-secure-setup-2026";
  });

  describe("Security & Token Verification", () => {
    it("validates admin bootstrap secret correctly", () => {
      expect(isValidAdminToken("aquabark-telugu-secure-setup-2026")).toBe(true);
      expect(isValidAdminToken("wrong-password")).toBe(false);
      expect(isValidAdminToken(null)).toBe(false);
      expect(isValidAdminToken(undefined)).toBe(false);
    });
  });

  describe("Dashboard Metrics & Low Stock Detection", () => {
    it("calculates dashboard stats, orders count, and detects low stock variants", async () => {
      const stats = await getAdminDashboardStats();
      expect(stats).toBeDefined();
      expect(typeof stats.todayOrdersCount).toBe("number");
      expect(typeof stats.totalSales).toBe("number");
      expect(Array.isArray(stats.lowStockItems)).toBe(true);
      expect(Array.isArray(stats.recentOrders)).toBe(true);

      // Verify that any low stock item has stock <= 5
      for (const item of stats.lowStockItems) {
        expect(item.stock).toBeLessThanOrEqual(5);
      }
    });
  });

  describe("Order Fulfillment Lifecycle & Dispatch", () => {
    it("transitions order status along the fulfillment lifecycle (PENDING -> CONFIRMED -> PREPARING)", async () => {
      const products = await getAdminProducts();
      const variant = products[0].variants[0];
      const created = await store.createOrder({
        customerName: "Test Customer Lifecycle",
        customerPhone: "9848099991",
        shippingAddress: {
          recipientName: "Test Customer",
          phone: "9848099991",
          street: "Station Road",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          postalCode: "520001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: variant.id, quantity: 1 }],
      });
      expect(created.success).toBe(true);
      const testOrder = created.order!;

      // Update to CONFIRMED
      const resConfirm = await updateOrderStatusAction(testOrder.id, "CONFIRMED", "Confirmed by owner");
      expect(resConfirm.success).toBe(true);
      expect(resConfirm.order?.status).toBe("CONFIRMED");

      // Update to PREPARING
      const resPrep = await updateOrderStatusAction(testOrder.id, "PREPARING", "Packing in thermocol box");
      expect(resPrep.success).toBe(true);
      expect(resPrep.order?.status).toBe("PREPARING");
    });

    it("dispatches order via Bus Parcel and generates ABT-TRK tracking ID", async () => {
      const products = await getAdminProducts();
      const variant = products[0].variants[0];
      const created = await store.createOrder({
        customerName: "Test Customer Dispatch",
        customerPhone: "9848099992",
        shippingAddress: {
          recipientName: "Test Customer",
          phone: "9848099992",
          street: "Station Road",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          postalCode: "520001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: variant.id, quantity: 1 }],
      });
      expect(created.success).toBe(true);
      const testOrder = created.order!;

      // First confirm & prepare
      await updateOrderStatusAction(testOrder.id, "CONFIRMED");
      await updateOrderStatusAction(testOrder.id, "PREPARING");

      const dispatchRes = await dispatchOrderAction({
        orderId: testOrder.id,
        transportMethod: "BUS_PARCEL",
        operatorName: "TSRTC Parcel Express",
        departureLocation: "MGBS Hyderabad (Bay 12)",
        destinationStation: "Vijayawada PNBS Parcel Counter",
        parcelReceiptNumber: "LR-TSRTC-88912",
        dispatchDate: new Date().toISOString(),
        notes: "Bus No: TS 09 Z 4410",
      });

      expect(dispatchRes.success).toBe(true);
      expect(dispatchRes.trackingNumber).toBeDefined();
      expect(dispatchRes.trackingNumber).toMatch(/^ABT-TRK-\d+$/);

      // Verify order is now SHIPPED with tracking info
      const updatedOrders = await getAdminOrders();
      const shippedOrder = updatedOrders.find((o) => o.id === testOrder.id);
      expect(shippedOrder?.status).toBe("SHIPPED");
      expect(shippedOrder?.shipment?.trackingNumber).toBe(dispatchRes.trackingNumber);
      expect(shippedOrder?.shipment?.parcelReceiptNumber).toBe("LR-TSRTC-88912");

      // Mark Delivered
      const deliverRes = await updateOrderStatusAction(testOrder.id, "DELIVERED", "Collected at PNBS");
      expect(deliverRes.success).toBe(true);
      expect(deliverRes.order?.status).toBe("DELIVERED");
    });
  });

  describe("Dynamic Pricing & Stock Adjustments", () => {
    it("updates variant price on the fly without affecting existing order price snapshots", async () => {
      const products = await getAdminProducts();
      const firstVariant = products[0].variants[0];
      const initialPrice = firstVariant.price;

      // Ensure an existing order has an item snapshot with initial price
      const orders = await getAdminOrders();
      const existingOrderItem = orders[0]?.items[0];
      const recordedSnapshot = existingOrderItem?.priceSnapshot;

      // Update variant price
      const newTestPrice = 399;
      const res = await updateVariantPriceAction(firstVariant.id, newTestPrice, "Festival discount update");
      expect(res.success).toBe(true);
      expect(res.variant?.price).toBe(newTestPrice);

      // Immutable snapshot guarantee: verify old order snapshot did NOT mutate
      if (existingOrderItem) {
        const reloadedOrders = await getAdminOrders();
        const reloadedItem = reloadedOrders[0]?.items[0];
        expect(reloadedItem?.priceSnapshot).toBe(recordedSnapshot);
      }
    });

    it("adjusts variant stock and prevents negative stock values", async () => {
      const products = await getAdminProducts();
      const targetVariant = products[0].variants[0];
      const originalStock = targetVariant.stock;

      // Increment stock by +10
      const incRes = await updateVariantStockAction(targetVariant.id, 10, "Breeder shipment received");
      expect(incRes.success).toBe(true);
      expect(incRes.newStock).toBe(originalStock + 10);

      // Attempt decrement below zero
      const invalidRes = await updateVariantStockAction(targetVariant.id, -999999, "Invalid reduction");
      expect(invalidRes.success).toBe(false);
      expect(invalidRes.error).toContain("negative");
    });
  });

  describe("Cancellations & Single-Time Stock Restoration", () => {
    it("restores variant stock once upon approval and prevents double restoration", async () => {
      // 1. Create a fresh order
      const products = await store.getAllAdminProducts();
      const variant = products[0].variants[0];
      const stockBeforeOrder = variant.stock;

      const orderRes = await store.createOrder({
        customerName: "Ramesh Babu",
        customerPhone: "9848011111",
        shippingAddress: {
          recipientName: "Ramesh Babu",
          phone: "9848011111",
          street: "Main Road",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          postalCode: "520001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: variant.id, quantity: 2 }],
      });

      expect(orderRes.success).toBe(true);
      const newOrder = orderRes.order!;

      // Confirm order (fulfills reserved stock into actual deduction)
      await store.updateOrderStatus(newOrder.id, "CONFIRMED");

      // Verify stock decreased by 2
      const variantAfterOrder = await store.getVariantById(variant.id);
      expect(variantAfterOrder?.stock).toBe(stockBeforeOrder - 2);

      // 2. Request cancellation
      const cancelReqRes = await store.requestCancellation(
        newOrder.id,
        "Changed aquarium plan",
        "Want to buy bigger setup"
      );
      expect(cancelReqRes.success).toBe(true);
      const reqId = cancelReqRes.cancellationRequest!.id;

      // 3. Admin approves cancellation -> Should restore 2 units
      const approveRes = await handleCancellationAction(reqId, "APPROVE", "Refund processed");
      expect(approveRes.success).toBe(true);
      expect(approveRes.isRestored).toBe(true);

      const variantAfterFirstApproval = await store.getVariantById(variant.id);
      expect(variantAfterFirstApproval?.stock).toBe(stockBeforeOrder);

      // 4. Invariant: second approval attempt fails or does not double-restore stock
      const secondApprove = await handleCancellationAction(reqId, "APPROVE");
      expect(secondApprove.success).toBe(false);

      const variantAfterSecondAttempt = await store.getVariantById(variant.id);
      expect(variantAfterSecondAttempt?.stock).toBe(stockBeforeOrder); // NOT doubled!
    });
  });

  describe("Categories, Combos & Settings", () => {
    it("manages category creation and toggle active state", async () => {
      const initialCats = await getAdminCategories();
      const initialCount = initialCats.length;

      const createRes = await createCategoryAction({
        name: "Test Driftwood Collection",
        description: "Hardscape woods",
      });
      expect(createRes.success).toBe(true);
      expect(createRes.category?.slug).toBe("test-driftwood-collection");

      // Toggle active
      const toggleRes = await toggleCategoryActiveAction(createRes.category!.id);
      expect(toggleRes.success).toBe(true);
      expect(toggleRes.isActive).toBe(false);
    });

    it("creates, retrieves, and deletes combo offers", async () => {
      const products = await getAdminProducts();
      const variant1 = products[0].variants[0];

      const comboRes = await createComboAction({
        title: "Test Nano Trio Combo",
        description: "Special test bundle",
        comboPrice: 499,
        originalPrice: 650,
        stockLimit: 8,
        items: [{ productId: products[0].id, variantId: variant1.id, quantity: 1 }],
      });

      expect(comboRes.success).toBe(true);
      expect(comboRes.combo?.comboPrice).toBe(499);

      // Delete combo
      const deleteRes = await deleteComboAction(comboRes.combo!.id);
      expect(deleteRes.success).toBe(true);

      const combosAfter = await getAdminCombos();
      expect(combosAfter.some((c) => c.id === comboRes.combo!.id)).toBe(false);
    });

    it("reads and updates transport feasibility and WhatsApp alert settings", async () => {
      const currentSettings = await getAdminSettings();
      expect(currentSettings).toBeDefined();

      const updateRes = await updateAdminSettingsAction({
        min_order_live_fish: "550",
        whatsapp_alert_number: "+91 99999 88888",
      });
      expect(updateRes.success).toBe(true);

      const updated = await getAdminSettings();
      expect(updated.min_order_live_fish).toBe("550");
      expect(updated.whatsapp_alert_number).toBe("+91 99999 88888");
    });
  });
});
