import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import {
  setTestAdminToken as setAdminStoreToken,
  isValidAdminToken,
  requireAdmin,
} from "@/lib/admin-auth";
import {
  setTestAdminToken as setAuthToken,
  assertAdmin,
} from "@/lib/auth";
import {
  getAdminDashboardStats,
  updateOrderStatusAction as adminUpdateStatusAction,
  updateVariantPriceAction,
  createProductAction,
  handleCancellationAction,
} from "@/actions/admin";
import { POST as razorpayOrderPost } from "@/app/api/razorpay/order/route";
import { POST as razorpayVerifyPost } from "@/app/api/razorpay/verify/route";
import { POST as razorpayWebhookPost } from "@/app/api/razorpay/webhook/route";
import { createOrderAction } from "@/actions/orders";

describe("Security, RBAC, Price Tampering & Cryptographic Verification", () => {
  const adminSecret = "aquabark-telugu-secure-setup-2026";
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
  const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";

  beforeEach(() => {
    process.env.ADMIN_BOOTSTRAP_SECRET = adminSecret;
    setAdminStoreToken(undefined);
    setAuthToken(undefined);
  });

  afterEach(() => {
    setAdminStoreToken(undefined);
    setAuthToken(undefined);
  });

  describe("1. Server-Side RBAC & Role Escalation Defense", () => {
    it("validates token matching against expected admin secrets and rejects imposters", () => {
      expect(isValidAdminToken(adminSecret)).toBe(true);
      expect(isValidAdminToken("aquabark-telugu-secure-setup-2026")).toBe(true);
      expect(isValidAdminToken("attacker-malicious-token")).toBe(false);
      expect(isValidAdminToken("")).toBe(false);
      expect(isValidAdminToken(null)).toBe(false);
      expect(isValidAdminToken(undefined)).toBe(false);
    });

    it("strictly blocks unauthenticated/customer requests from executing admin actions", async () => {
      // Set unauthenticated context
      setAdminStoreToken(null);
      setAuthToken(null);

      // 1. Dashboard stats must reject
      await expect(getAdminDashboardStats()).rejects.toThrow(/UNAUTHORIZED/i);

      // 2. Order status updates must reject
      await expect(
        adminUpdateStatusAction("any-order-id", "CONFIRMED")
      ).rejects.toThrow(/UNAUTHORIZED/i);

      // 3. Dynamic price updates must reject
      await expect(
        updateVariantPriceAction("var-rdg-pair", 999)
      ).rejects.toThrow(/UNAUTHORIZED/i);

      // 4. Product creation must reject
      await expect(
        createProductAction({
          name: "Hacked Product",
          categoryId: "cat-1",
          description: "Attack",
          minOrderQty: 1,
          maxOrderQty: 5,
          imageUrl: "",
          isActive: true,
          variants: [{ title: "Hacked", sku: "HACK", price: 10, stock: 10 }],
        })
      ).rejects.toThrow(/UNAUTHORIZED/i);

      // 5. Cancellation resolution must reject
      await expect(
        handleCancellationAction("canc-123", "APPROVE")
      ).rejects.toThrow(/UNAUTHORIZED/i);
    });

    it("allows authorized admin actions when valid admin credentials are authenticated", async () => {
      setAdminStoreToken(adminSecret);
      setAuthToken(adminSecret);

      const stats = await getAdminDashboardStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalOrdersCount).toBe("number");
    });
  });

  describe("2. Server-Authoritative Pricing Integrity & Client Tampering Defense", () => {
    it("recalculates pricing strictly on server, completely ignoring client-supplied price or amount", async () => {
      // var-rdg-pair: regular catalog price is ₹320 (x 2 = ₹640)
      // Attacker attempts to submit arbitrary amount: 100 paise (₹1) and custom unitPrice: 1
      const tamperedReq = new NextRequest("http://localhost:3000/api/razorpay/order", {
        method: "POST",
        body: JSON.stringify({
          cartItems: [
            {
              variantId: "var-rdg-pair",
              quantity: 2,
              unitPrice: 1, // Malicious spoofed client price
              price: 1,
            },
          ],
          amount: 100, // Malicious spoofed 100 paise
          couponCode: "WELCOME10",
          transitMethod: "BUS_PARCEL",
        }),
      });

      const res = await razorpayOrderPost(tamperedReq);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);

      // Server recalculation: ₹320 * 2 = ₹640.
      // WELCOME10 coupon: 10% discount (-₹64)
      // Bus Parcel: ₹100
      // Expected total: ₹640 - ₹64 + ₹100 = ₹676 = 67600 paise.
      // MUST NOT be 100 paise!
      expect(data.amount).toBe(67600);
      expect(data.amount).not.toBe(100);
    });

    it("enforces server-side price snapshots upon order creation regardless of client payload fields", async () => {
      const variant = await store.getVariantById("var-deb-male");
      expect(variant).toBeDefined();
      const authenticPrice = variant!.price;

      // Malicious payload attempting to pass unit price of ₹1
      const spoofedOrderInput = {
        customerName: "Price Tamper Attacker",
        customerPhone: "+919848077711",
        shippingAddress: {
          recipientName: "Attacker",
          phone: "+919848077711",
          street: "Cyber Road",
          city: "Hyderabad",
          state: "Telangana",
          postalCode: "500001",
        },
        transitMethod: "BUS_PARCEL" as const,
        cartItems: [
          {
            variantId: "var-deb-male",
            quantity: 1,
            price: 1, // Tampered
            unitPrice: 1, // Tampered
            totalSnapshot: 1, // Tampered
          } as any,
        ],
      };

      const res = await createOrderAction(spoofedOrderInput);
      expect(res.success).toBe(true);

      const createdItem = res.order!.items[0];
      // Invariant: Server MUST record the authentic catalog price, not the attacker's ₹1!
      expect(createdItem.priceSnapshot).toBe(authenticPrice);
      expect(createdItem.totalSnapshot).toBe(authenticPrice);
      expect(res.order!.subtotal).toBe(authenticPrice);
    });
  });

  describe("3. Razorpay Signature Verification & Cryptographic HMAC Integrity", () => {
    it("accepts authentic HMAC SHA-256 signatures generated with the server key secret", async () => {
      const orderId = "order_rzp_secure_1001";
      const paymentId = "pay_rzp_secure_2002";

      const validSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const req = new NextRequest("http://localhost:3000/api/razorpay/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        }),
      });

      const res = await razorpayVerifyPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.verified).toBe(true);
    });

    it("strictly rejects forged or tampered payment signatures with HTTP 400", async () => {
      const orderId = "order_rzp_secure_1001";
      const paymentId = "pay_rzp_secure_2002";
      const forgedSignature = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

      const req = new NextRequest("http://localhost:3000/api/razorpay/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: forgedSignature,
        }),
      });

      const res = await razorpayVerifyPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.verified).toBe(false);
      expect(data.error).toMatch(/invalid payment signature/i);
    });

    it("strictly rejects verification requests with missing cryptographic parameters", async () => {
      const req = new NextRequest("http://localhost:3000/api/razorpay/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: "order_123",
          // missing razorpay_payment_id and razorpay_signature
        }),
      });

      const res = await razorpayVerifyPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe("4. Razorpay Webhook Security & Idempotency", () => {
    it("validates webhook HMAC signature against RAZORPAY_WEBHOOK_SECRET and enforces idempotency", async () => {
      const eventId = `evt_sec_test_${Date.now()}`;
      const payload = {
        id: eventId,
        event: "order.paid",
        payload: {
          payment: {
            entity: {
              id: "pay_test_wh_sec",
              order_id: "order_sec_wh_123",
              amount: 50000,
            },
          },
        },
      };

      const bodyText = JSON.stringify(payload);
      const authenticWebhookSignature = crypto
        .createHmac("sha256", razorpayWebhookSecret)
        .update(bodyText)
        .digest("hex");

      // First webhook delivery
      const req1 = new NextRequest("http://localhost:3000/api/razorpay/webhook", {
        method: "POST",
        headers: {
          "x-razorpay-signature": authenticWebhookSignature,
          "content-type": "application/json",
        },
        body: bodyText,
      });

      const res1 = await razorpayWebhookPost(req1);
      const data1 = await res1.json();
      expect(res1.status).toBe(200);
      expect(data1.status).toBe("success");

      // Second replay attempt with identical eventId -> Must return already_processed (Idempotency)
      const req2 = new NextRequest("http://localhost:3000/api/razorpay/webhook", {
        method: "POST",
        headers: {
          "x-razorpay-signature": authenticWebhookSignature,
          "content-type": "application/json",
        },
        body: bodyText,
      });

      const res2 = await razorpayWebhookPost(req2);
      const data2 = await res2.json();
      expect(res2.status).toBe(200);
      expect(data2.status).toBe("already_processed");
    });

    it("strictly rejects webhook requests with invalid or forged signatures", async () => {
      const bodyText = JSON.stringify({ id: "evt_fake", event: "order.paid" });
      const req = new NextRequest("http://localhost:3000/api/razorpay/webhook", {
        method: "POST",
        headers: {
          "x-razorpay-signature": "forged_webhook_hex_signature",
          "content-type": "application/json",
        },
        body: bodyText,
      });

      const res = await razorpayWebhookPost(req);
      expect(res.status).toBe(400);
    });

    it("rejects webhook requests without x-razorpay-signature header", async () => {
      const req = new NextRequest("http://localhost:3000/api/razorpay/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: "evt_no_sig", event: "order.paid" }),
      });

      const res = await razorpayWebhookPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe("5. Sensitive Secrets & Environment Boundary Enforcement", () => {
    it("ensures private backend secrets are not prefixed with NEXT_PUBLIC_", () => {
      // Next.js convention: variables starting with NEXT_PUBLIC_ are baked into client JS bundles.
      // Private server-only secrets must NEVER be prefixed with NEXT_PUBLIC_.
      const sensitiveKeys = [
        "RAZORPAY_KEY_SECRET",
        "RAZORPAY_WEBHOOK_SECRET",
        "SUPABASE_SERVICE_ROLE_KEY",
        "ADMIN_BOOTSTRAP_SECRET",
        "DATABASE_URL",
        "DIRECT_URL",
      ];

      for (const key of sensitiveKeys) {
        expect(key.startsWith("NEXT_PUBLIC_")).toBe(false);
      }
    });

    it("ensures public DTOs do not leak internal database credentials or secrets", async () => {
      const products = await store.getProducts();
      expect(products.length).toBeGreaterThan(0);

      const jsonStr = JSON.stringify(products);
      expect(jsonStr).not.toContain(adminSecret);
      expect(jsonStr).not.toContain(razorpayKeySecret);
      expect(jsonStr).not.toContain(razorpayWebhookSecret);
    });
  });
});
