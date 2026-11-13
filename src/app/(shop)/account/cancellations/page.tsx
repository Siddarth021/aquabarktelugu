import React, { Suspense } from "react";
import { CancellationsClient } from "@/components/shop/CancellationsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Cancellation & Refunds | AquaBark Telugu",
  description: "Request cancellation or view refund status for your live ornamental fish orders.",
};

export default function CancellationsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-xs text-aquabark-muted">Loading cancellations portal...</div>}>
      <CancellationsClient />
    </Suspense>
  );
}
