import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AquaBark Telugu",
  description: "Our privacy practices regarding customer personal information, shipping addresses, and payment data.",
};

export default function PrivacyPolicyPage() {
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
              Your Data Privacy
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-aquabark-muted mt-2">
              Last updated: November 2026 • AquaBark Telugu
            </p>
          </div>

          <div className="space-y-6 text-sm text-aquabark-text leading-relaxed border-t border-aquabark-border pt-6">
            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">1. Information We Collect</h2>
              <p>
                We only collect information necessary to fulfill your aquatic order: recipient full name, contact phone number, WhatsApp number, delivery destination station or address, and email for notifications.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">2. Payment Security</h2>
              <p>
                We do not store your credit card, debit card, or net banking credentials. All payments are processed through Razorpay's PCI-DSS Level 1 certified gateway.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">3. Logistics Data Sharing</h2>
              <p>
                Your phone number and recipient name are provided to the designated transport operator (TSRTC, APSRTC, or Indian Railways parcel clerk) solely for baggage labelling and SMS collection notices.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

