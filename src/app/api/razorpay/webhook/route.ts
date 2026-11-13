import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";

    // Verify Webhook Signature: HMAC SHA256(rawBody, webhookSecret)
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const bufExpected = Buffer.from(expectedSignature, "utf-8");
    const bufReceived = Buffer.from(signature, "utf-8");

    const isSignatureValid =
      bufExpected.length === bufReceived.length &&
      crypto.timingSafeEqual(bufExpected, bufReceived);

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = payload.event;

    // Idempotency check
    const isNew = await store.recordPaymentEvent(eventId);
    if (!isNew) {
      return NextResponse.json({
        status: "already_processed",
        eventId,
      });
    }

    console.log(`Processing Razorpay webhook event: ${eventType} (${eventId})`);

    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const rzpPaymentId = paymentEntity?.id;
      const internalOrderId =
        paymentEntity?.notes?.orderId || orderEntity?.notes?.orderId;

      let order = null;
      if (internalOrderId && internalOrderId !== "pre_checkout") {
        order = await store.getOrderById(internalOrderId);
      }

      if (!order && rzpOrderId) {
        const allOrders = await store.getAllOrders();
        order = allOrders.find((o) => o.razorpayOrderId === rzpOrderId) || null;
      }

      if (order && order.paymentStatus !== "PAID") {
        await store.confirmOrderPayment(order.id, {
          razorpayPaymentId: rzpPaymentId || "wh_captured",
          razorpayOrderId: rzpOrderId || order.razorpayOrderId || "",
          razorpaySignature: signature,
        });
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      if (rzpOrderId) {
        const allOrders = await store.getAllOrders();
        const order = allOrders.find((o) => o.razorpayOrderId === rzpOrderId);
        if (order) {
          order.paymentStatus = "FAILED";
          order.adminNotes = `Payment attempt failed: ${paymentEntity.error_description || "Unknown error"}`;
        }
      }
    }

    return NextResponse.json({ status: "success", eventId });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
