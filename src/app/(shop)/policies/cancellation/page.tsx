import React from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw, Clock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | AquaBark Telugu",
  description: "Learn how cancellations, order modifications, and refunds work at AquaBark Telugu.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="py-12 bg-aquabark-bg min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-aquabark-dark hover:text-aquabark-accent mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>

        <div className="bg-white rounded-[2.5rem] border border-aquabark-border shadow-card p-8 sm:p-12 space-y-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-aquabark-terracotta">
              Fair & Transparent
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark mt-1">
              Cancellation & Refund Policy
            </h1>
            <p className="text-xs sm:text-sm text-aquabark-muted mt-2">
              Last updated: November 2026
            </p>
          </div>

          <div className="space-y-6 text-sm text-aquabark-text leading-relaxed border-t border-aquabark-border pt-6">
            
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">
                1. Order Cancellation Prior to Dispatch
              </h2>
              <p>
                Customers may request cancellation directly through their Account Dashboard (<Link href="/account/cancellations" className="text-emerald-800 underline font-semibold">Request Cancellation</Link>) or via WhatsApp helpline before 3:00 PM on the scheduled dispatch date.
              </p>
              <p>
                When a cancellation is approved, 100% of the payment is refunded back to the original source method (Razorpay / UPI / Card) within 2 to 5 business days, and the reserved livestock stock is restored to farm inventory.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">
                2. In-Transit Livestock Orders
              </h2>
              <p>
                Once livestock has been sealed in pure oxygen containers and delivered to the bus cargo or railway parcel agent, transit cannot be cancelled or recalled, as the welfare and life of the fish takes absolute precedence.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">
                3. Dead On Arrival (DOA) Claim Policy
              </h2>
              <p>
                All orders are covered under our <strong>100% Live Arrival Guarantee</strong>. If any livestock arrives deceased, follow these simple steps:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Take a clear 30-second unboxing video of the sealed plastic oxygen bag showing the fish before cutting open the bag.</li>
                <li>Send the video to our official WhatsApp support at <strong>+91 94900 12345</strong> within 2 hours of collection.</li>
                <li>We will immediately verify the video and issue a choice of: (a) Free replacement shipment with the next bus dispatch, or (b) 100% refund for the deceased items.</li>
              </ol>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}

