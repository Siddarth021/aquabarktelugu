import { describe, it, expect, beforeEach } from "vitest";
import { store } from "@/lib/store";
import {
  createOrderAction,
  getOrderAction,
  updateOrderStatusAction,
  listCustomerOrdersAction,
} from "@/actions/orders";
import {
  createShipmentAction,
  lookupTrackingAction,
} from "@/actions/shipping";

describe("Order Fulfillment Workflow & Parcel Tracking Verification", () => {
  const adminSecret = "aquabark-telugu-secure-setup-2026";

  beforeEach(() => {
    process.env.ADMIN_BOOTSTRAP_SECRET = adminSecret;
  });

  describe("1. Order Status Transition Lifecycle", () => {
    it("transitions an order cleanly through the complete state machine: PENDING -> CONFIRMED -> PREPARING -> SHIPPED -> DELIVERED", async () => {
      // 1. Create Order -> PENDING
      const orderRes = await createOrderAction({
        customerName: "Workflow LifeCycle Customer",
        customerPhone: "+919848012345",
        customerEmail: "workflow.test@example.com",
        shippingAddress: {
          recipientName: "Workflow Recipient",
          phone: "+919848012345",
          street: "Gandhi Nagar",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          postalCode: "520003",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-rdg-pair", quantity: 1 }],
      });

      expect(orderRes.success).toBe(true);
      const orderId = orderRes.order!.id;
      expect(orderRes.order!.status).toBe("PENDING");

      // 2. Transition: PENDING -> CONFIRMED
      const confirmRes = await updateOrderStatusAction(
        orderId,
        "CONFIRMED",
        "Payment authorized and verified",
        adminSecret
      );
      expect(confirmRes.success).toBe(true);
      expect(confirmRes.order?.status).toBe("CONFIRMED");

      // 3. Transition: CONFIRMED -> PREPARING
      const preparingRes = await updateOrderStatusAction(
        orderId,
        "PREPARING",
        "Oxygen packing and thermocol insulation box packaging started",
        adminSecret
      );
      expect(preparingRes.success).toBe(true);
      expect(preparingRes.order?.status).toBe("PREPARING");

      // 4. Transition: PREPARING -> SHIPPED (via Shipment Creation)
      const shipmentRes = await createShipmentAction(
        {
          orderId,
          transportMethod: "BUS_PARCEL",
          operatorName: "APSRTC Garuda Super Luxury",
          departureLocation: "Pandit Nehru Bus Station (PNBS) Vijayawada",
          destinationStation: "Dwaraka Bus Stand Parcel Counter Visakhapatnam",
          parcelReceiptNumber: "APSRTC-LR-993812",
          dispatchDate: new Date().toISOString(),
          notes: "Live tropical fish pure oxygen pack. Consignee: Call +919848012345 upon arrival.",
        },
        adminSecret
      );
      expect(shipmentRes.success).toBe(true);
      expect(shipmentRes.shipment).toBeDefined();

      const orderAfterShip = await store.getOrderById(orderId);
      expect(orderAfterShip?.status).toBe("SHIPPED");

      // 5. Transition: SHIPPED -> DELIVERED
      const deliveredRes = await updateOrderStatusAction(
        orderId,
        "DELIVERED",
        "Parcel picked up by customer at Dwaraka Bus Stand parcel counter",
        adminSecret
      );
      expect(deliveredRes.success).toBe(true);
      expect(deliveredRes.order?.status).toBe("DELIVERED");

      // Verify order lookup reflects final DELIVERED state
      const finalRes = await getOrderAction(orderId);
      expect(finalRes.success).toBe(true);
      expect(finalRes.order?.status).toBe("DELIVERED");
      expect(finalRes.order?.shipment).toBeDefined();
    });

    it("strictly blocks illegal state transitions on CANCELLED orders", async () => {
      // Create and cancel an order
      const orderRes = await createOrderAction({
        customerName: "Illegal Transition Tester",
        customerPhone: "+919848098765",
        shippingAddress: {
          recipientName: "Cancel Tester",
          phone: "+919848098765",
          street: "Nawabpet",
          city: "Nellore",
          state: "Andhra Pradesh",
          postalCode: "524002",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-an-ring", quantity: 1 }],
      });
      const orderId = orderRes.order!.id;

      // Mark cancelled
      const cancelRes = await store.updateOrderStatus(orderId, "CANCELLED", "Direct cancel");
      expect(cancelRes.success).toBe(true);

      // Attempting to modify a cancelled order must fail
      const tryConfirm = await updateOrderStatusAction(orderId, "CONFIRMED", "Attempt confirm", adminSecret);
      expect(tryConfirm.success).toBe(false);
      expect(tryConfirm.error).toMatch(/cannot modify a cancelled order/i);

      const tryShip = await updateOrderStatusAction(orderId, "SHIPPED", "Attempt ship", adminSecret);
      expect(tryShip.success).toBe(false);
      expect(tryShip.error).toMatch(/cannot modify a cancelled order/i);
    });

    it("returns error when attempting to update a non-existent order", async () => {
      const res = await updateOrderStatusAction("non-existent-order-9999", "CONFIRMED", "Note", adminSecret);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/not found/i);
    });
  });

  describe("2. Manual Parcel Tracking Creation & Public Lookup", () => {
    it("creates shipment with valid ABT-TRK-XXXXXX tracking format for Bus Parcel", async () => {
      const orderRes = await createOrderAction({
        customerName: "Bus Parcel Tracking Customer",
        customerPhone: "+919848077112",
        shippingAddress: {
          recipientName: "Bus Customer",
          phone: "+919848077112",
          street: "MG Road",
          city: "Khammam",
          state: "Telangana",
          postalCode: "507001",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-jf-bare", quantity: 2 }],
      });
      const orderId = orderRes.order!.id;

      const shipmentRes = await createShipmentAction(
        {
          orderId,
          transportMethod: "BUS_PARCEL",
          operatorName: "TSRTC Parcel Express",
          departureLocation: "MGBS Hyderabad (Bay 18)",
          destinationStation: "Khammam Old Bus Station Parcel Office",
          parcelReceiptNumber: "TSRTC-KHM-449102",
          dispatchDate: new Date().toISOString(),
          notes: "Handle with care - live aquatic plants",
        },
        adminSecret
      );

      expect(shipmentRes.success).toBe(true);
      const trackingNumber = shipmentRes.shipment!.trackingNumber;
      expect(trackingNumber).toMatch(/^ABT-TRK-\d{6}$/);

      // Verify Public Lookup
      const lookup = await lookupTrackingAction(trackingNumber);
      expect(lookup.success).toBe(true);
      expect(lookup.shipment?.operatorName).toBe("TSRTC Parcel Express");
      expect(lookup.shipment?.departureLocation).toBe("MGBS Hyderabad (Bay 18)");
      expect(lookup.shipment?.destinationStation).toBe("Khammam Old Bus Station Parcel Office");
      expect(lookup.shipment?.parcelReceiptNumber).toBe("TSRTC-KHM-449102");
      expect(lookup.order?.customerPhone).toBe("+919848077112");
    });

    it("creates shipment for South Central Railway Parcel with railway receipt number", async () => {
      const orderRes = await createOrderAction({
        customerName: "Rail Parcel Customer",
        customerPhone: "+919848055667",
        shippingAddress: {
          recipientName: "Rail Customer",
          phone: "+919848055667",
          street: "Station Circle",
          city: "Warangal",
          state: "Telangana",
          postalCode: "506002",
        },
        transitMethod: "RAILWAY_PARCEL",
        cartItems: [{ variantId: "var-deb-female", quantity: 1 }],
      });
      const orderId = orderRes.order!.id;

      const shipmentRes = await createShipmentAction(
        {
          orderId,
          transportMethod: "RAILWAY_PARCEL",
          operatorName: "South Central Railway (SCR) Luggage Van",
          departureLocation: "Secunderabad Junction (Parcel Office Counter 4)",
          destinationStation: "Warangal Railway Station (WL) Parcel Depot",
          parcelReceiptNumber: "SCR-RR-771920",
          dispatchDate: new Date().toISOString(),
          notes: "Live Fish - Train #12724 Telangana Express",
        },
        adminSecret
      );

      expect(shipmentRes.success).toBe(true);
      expect(shipmentRes.shipment?.transportMethod).toBe("RAILWAY_PARCEL");
      expect(shipmentRes.shipment?.parcelReceiptNumber).toBe("SCR-RR-771920");

      const lookup = await lookupTrackingAction(shipmentRes.shipment!.trackingNumber);
      expect(lookup.success).toBe(true);
      expect(lookup.shipment?.operatorName).toContain("South Central Railway");
    });

    it("rejects shipment creation when required logistics fields are missing", async () => {
      const res = await createShipmentAction(
        {
          orderId: "some-order-id",
          transportMethod: "BUS_PARCEL",
          operatorName: "",
          departureLocation: "",
          destinationStation: "",
          dispatchDate: new Date().toISOString(),
        },
        adminSecret
      );

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/required/i);
    });

    it("returns error on public tracking lookup for invalid or non-existent tracking ID", async () => {
      const nonExistent = await lookupTrackingAction("ABT-TRK-999999");
      expect(nonExistent.success).toBe(false);
      expect(nonExistent.error).toMatch(/not found/i);

      const empty = await lookupTrackingAction("");
      expect(empty.success).toBe(false);
      expect(empty.error).toMatch(/enter a valid tracking number/i);
    });
  });

  describe("3. Customer Order Lookup & Account Integration", () => {
    it("retrieves customer order history by phone number accurately", async () => {
      const uniquePhone = "+9198480" + Math.floor(10000 + Math.random() * 90000);
      await createOrderAction({
        customerName: "Account Customer",
        customerPhone: uniquePhone,
        shippingAddress: {
          recipientName: "Account Recipient",
          phone: uniquePhone,
          street: "Lake View Road",
          city: "Tirupati",
          state: "Andhra Pradesh",
          postalCode: "517501",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-an-ring", quantity: 1 }],
      });

      const customerRes = await listCustomerOrdersAction(uniquePhone);
      expect(customerRes.success).toBe(true);
      expect(customerRes.orders.length).toBeGreaterThan(0);
      expect(customerRes.orders[0].customerPhone).toBe(uniquePhone);
      expect(customerRes.orders[0].items.length).toBe(1);
    });
  });
});
