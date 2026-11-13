import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | AquaBark Telugu",
  description: "Terms and conditions of purchasing live ornamental fish, plants, and accessories from AquaBark Telugu.",
};

export default function TermsPage() {
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
              Legal & Conditions
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark mt-1">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-aquabark-muted mt-2">
              Last updated: November 2026 • AquaBark Telugu
            </p>
          </div>

          <div className="space-y-6 text-sm text-aquabark-text leading-relaxed border-t border-aquabark-border pt-6">
            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">1. Ornamental Livestock Care</h2>
              <p>
                All ornamental aquatic species sold by AquaBark Telugu are intended strictly for hobbyist display aquariums. None of our products are meant for consumption or release into natural Indian waterways.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">2. Water Parameter Responsibility</h2>
              <p>
                While our fish are fully acclimated to typical South Indian municipal water (pH 7.0–7.8, TDS 180–300), the hobbyist is responsible for adequately cycling and testing their tank before introducing new livestock.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark">3. Parcel Collection Timeliness</h2>
              <p>
                The buyer agrees to monitor the bus arrival time via the provided tracking LR number and collect the livestock from the bus station within 4 hours of arrival to safeguard animal health.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

