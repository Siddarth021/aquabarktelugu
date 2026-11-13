import { describe, it, expect } from "vitest";
import { POST as orderPost } from "@/app/api/razorpay/order/route";
import { POST as verifyPost } from "@/app/api/razorpay/verify/route";
import { POST as webhookPost } from "@/app/api/razorpay/webhook/route";
import { GET as reviewsGet, POST as reviewsPost } from "@/app/api/reviews/route";
import crypto from "crypto";
import { NextRequest } from "next/server";

describe("AquaBark Telugu - API Routes Tests", () => {
  describe("/api/razorpay/order", () => {
    it("should calculate server-side amount and return razorpay order", async () => {
      const req = new NextRequest("http://localhost:3000/api/razorpay/order", {
        method: "POST",
        body: JSON.stringify({
          cartItems: [{ variantId: "var-rdg-pair", quantity: 2 }],
          couponCode: "WELCOME10",
          transitMethod: "BUS_PARCEL",
        }),
      });

      const res = await orderPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.id).toMatch(/^order_/);
      // var-rdg-pair is 320 x 2 = 640 (> 499 min order), 10% coupon = -64, bus parcel = 100 -> 676 INR = 67600 paise
      expect(data.amount).toBe(67600);
    });

    it("should reject order with empty items", async () => {
      const req = new NextRequest("http://localhost:3000/api/razorpay/order", {
        method: "POST",
        body: JSON.stringify({
          cartItems: [],
        }),
      });

      const res = await orderPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe("/api/razorpay/verify", () => {
    it("should verify valid HMAC SHA256 payment signature", async () => {
      const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
      const orderId = "order_test_998877";
      const paymentId = "pay_test_112233";

      const signature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const req = new NextRequest("http://localhost:3000/api/razorpay/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });

      const res = await verifyPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.verified).toBe(true);
    });

    it("should reject tampered or invalid payment signature with status 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/razorpay/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_456",
          razorpay_signature: "tampered_invalid_hex_signature_abcdef1234567890abcdef1234567890",
        }),
      });

      const res = await verifyPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.verified).toBe(false);
      expect(data.error).toMatch(/invalid payment signature/i);
    });
  });

  describe("/api/razorpay/webhook", () => {
    it("should verify webhook signature and handle idempotency", async () => {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";
      const eventId = `evt_test_${Date.now()}`;
      const payload = {
        id: eventId,
        event: "order.paid",
        payload: {
          payment: {
            entity: {
              id: "pay_test_wh_1",
              order_id: "order_mock_apsrtc_209843",
              amount: 89000,
            },
          },
        },
      };

      const bodyText = JSON.stringify(payload);
      const signature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyText)
        .digest("hex");

      const req1 = new NextRequest("http://localhost:3000/api/razorpay/webhook", {
        method: "POST",
        headers: {
          "x-razorpay-signature": signature,
          "content-type": "application/json",
        },
        body: bodyText,
      });

      const res1 = await webhookPost(req1);
      const data1 = await res1.json();
      expect(res1.status).toBe(200);
      expect(data1.status).toBe("success");

      // Second attempt with exact same eventId -> Must return already_processed
      const req2 = new NextRequest("http://localhost:3000/api/razorpay/webhook", {
        method: "POST",
        headers: {
          "x-razorpay-signature": signature,
          "content-type": "application/json",
        },
        body: bodyText,
      });

      const res2 = await webhookPost(req2);
      const data2 = await res2.json();
      expect(res2.status).toBe(200);
      expect(data2.status).toBe("already_processed");
    });
  });

  describe("/api/reviews", () => {
    it("should retrieve reviews list", async () => {
      const req = new NextRequest("http://localhost:3000/api/reviews");
      const res = await reviewsGet(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.reviews)).toBe(true);
    });

    it("should check verified purchase when customer submits a review", async () => {
      // Ramesh Rao (+919848022338) purchased prod-fish-001 in seed order
      const reqVerified = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: "prod-fish-001",
          rating: 5,
          title: "Verified purchase test",
          comment: "Super healthy fish, arrived active in Vijayawada!",
          customerName: "Ramesh Rao",
          customerPhone: "+919848022338",
        }),
      });

      const resVerified = await reviewsPost(reqVerified);
      const dataVerified = await resVerified.json();
      expect(resVerified.status).toBe(201);
      expect(dataVerified.isVerifiedPurchase).toBe(true);

      // Random customer without order -> isVerifiedPurchase should be false
      const reqUnverified = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: "prod-fish-001",
          rating: 4,
          comment: "Looks good on website",
          customerName: "Random Visitor",
          customerPhone: "+919000000000",
        }),
      });

      const resUnverified = await reviewsPost(reqUnverified);
      const dataUnverified = await resUnverified.json();
      expect(resUnverified.status).toBe(201);
      expect(dataUnverified.isVerifiedPurchase).toBe(false);
    });
  });
});
