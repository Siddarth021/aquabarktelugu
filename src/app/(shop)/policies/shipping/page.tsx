import React from "react";
import Link from "next/link";
import { Truck, Bus, Train, ShieldCheck, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Livestock Shipping Policy | AquaBark Telugu",
  description: "Learn about our express bus and railway parcel shipping procedures, pure oxygen packaging, and transit schedules.",
};

export default function ShippingPolicyPage() {
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
              Safe Livestock Logistics
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark mt-1">
              Shipping & Live Transit Guidelines
            </h1>
            <p className="text-xs sm:text-sm text-aquabark-muted mt-2">
              Last updated: November 2026 • Dispatched from Rajahmundry & Vijayawada Hubs, Andhra Pradesh
            </p>
          </div>

          <div className="space-y-6 text-sm text-aquabark-text leading-relaxed border-t border-aquabark-border pt-6">
            
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark flex items-center gap-2">
                <Bus className="w-5 h-5 text-emerald-800" />
                <span>1. APSRTC & TSRTC Express Bus Parcel Cargo (Primary Live Transit)</span>
              </h2>
              <p>
                Live tropical fish cannot tolerate multi-day sorting center delays associated with standard courier services. To guarantee zero-stress delivery, we dispatch live fish via <strong>APSRTC Express Cargo</strong> and <strong>TSRTC Bus Parcel</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Orders are dispatched between 5:00 PM and 8:00 PM daily.</li>
                <li>Parcels arrive at your designated district or mandal bus station counter next morning (8:00 AM – 11:00 AM).</li>
                <li>You will receive an SMS and WhatsApp update with the Parcel Waybill (LR Number) upon cargo loading.</li>
                <li>Parcels must be picked up within 4 hours of arrival at the counter.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark flex items-center gap-2">
                <Train className="w-5 h-5 text-blue-800" />
                <span>2. South Central Railway (SCR) Express Cargo</span>
              </h2>
              <p>
                For interstate and long-distance deliveries (Karnataka, Tamil Nadu, Maharashtra, Odisha), parcels travel via high-priority express train brake vans.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Packed with extra 60-hour oxygen buffers and thermal ice/heat gel packs depending on seasonal climate.</li>
                <li>Pickup from the destination Railway Parcel Office using a valid government photo ID.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark flex items-center gap-2">
                <Truck className="w-5 h-5 text-aquabark-accent" />
                <span>3. Doorstep Courier (Aquatic Plants & Hardscape Only)</span>
              </h2>
              <p>
                Tissue culture cups, potted plants, mosses, driftwood, and dry feeds can be shipped safely via door-to-door couriers (Bluedart / DTDC / Delhivery). Estimated transit is 2 to 4 business days.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-aquabark-dark flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>4. Free Shipping & Handling Rates</span>
              </h2>
              <p>
                Orders totaling <strong>₹1,499 and above</strong> qualify for <strong>FREE Oxygen Parcel Shipping</strong>! For smaller orders, a flat fee of ₹150 covers double-walled thermocol insulation, pure medical oxygen, and freight charges.
              </p>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}

