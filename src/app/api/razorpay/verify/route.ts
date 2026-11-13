import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Missing required Razorpay parameters: razorpay_order_id, razorpay_payment_id, razorpay_signature",
        },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";

    // Standard Razorpay verification: HMAC SHA256(order_id + "|" + payment_id, secret)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    const bufExpected = Buffer.from(expectedSignature, "utf-8");
    const bufReceived = Buffer.from(razorpay_signature, "utf-8");

    const isSignatureValid =
      bufExpected.length === bufReceived.length &&
      crypto.timingSafeEqual(bufExpected, bufReceived);

    if (!isSignatureValid) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Invalid payment signature. Verification failed.",
        },
        { status: 400 }
      );
    }

    // Signature is valid. Find matching internal order.
    let order = null;
    if (orderId) {
      order = await store.getOrderById(orderId);
      if (!order) {
        order = await store.getOrderByNumber(orderId);
      }
    }

    if (!order) {
      // Find order by razorpayOrderId
      const allOrders = await store.getAllOrders();
      order = allOrders.find((o) => o.razorpayOrderId === razorpay_order_id) || null;
    }

    if (order) {
      await store.confirmOrderPayment(order.id, {
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
      });

      return NextResponse.json({
        success: true,
        verified: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: "CONFIRMED",
        paymentStatus: "PAID",
      });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Signature verified successfully, but no matching order record was linked.",
    });
  } catch (error: any) {
    console.error("Signature verification error:", error);
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: error.message || "Payment verification failed",
      },
      { status: 500 }
    );
  }
}
