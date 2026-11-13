import React from "react";
import Link from "next/link";
import { ShieldCheck, Video, Clock, MessageCircle, ArrowLeft, HeartPulse, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "100% Live Arrival Guarantee | AquaBark Telugu",
  description: "Learn about our unboxing video protocol, oxygen packing standards, and instant replacement guarantee.",
};

export default function GuaranteePage() {
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
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-10 h-10 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Zero Risk Promise
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark mt-2">
                100% Live Arrival Guarantee
              </h1>
            </div>
          </div>

          <p className="text-sm text-aquabark-muted leading-relaxed">
            At AquaBark Telugu, the welfare of our living creatures is our highest priority. We take full financial and logistical responsibility from the moment fish leave our farm tanks until they arrive safe and energetic in your hands.
          </p>

          {/* 3 Step Protocol */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-aquabark-border">
            
            <div className="p-5 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-aquabark-dark flex items-center justify-center font-bold text-sm shadow-sm">
                1
              </div>
              <h3 className="font-serif font-bold text-aquabark-dark text-base">
                Record Unboxing Video
              </h3>
              <p className="text-xs text-aquabark-muted leading-relaxed">
                Take a continuous 30-second video of the unopened, sealed plastic oxygen bag clearly showing the fish inside before cutting the bag open.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-aquabark-dark flex items-center justify-center font-bold text-sm shadow-sm">
                2
              </div>
              <h3 className="font-serif font-bold text-aquabark-dark text-base">
                WhatsApp Us in 2 Hours
              </h3>
              <p className="text-xs text-aquabark-muted leading-relaxed">
                Send the video and your Order Number to our WhatsApp support at <strong>+91 94900 12345</strong> within 2 hours of collecting the parcel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-aquabark-dark flex items-center justify-center font-bold text-sm shadow-sm">
                3
              </div>
              <h3 className="font-serif font-bold text-aquabark-dark text-base">
                Instant Replacement / Refund
              </h3>
              <p className="text-xs text-aquabark-muted leading-relaxed">
                We immediately dispatch a free replacement with the very next bus or issue a 100% refund. Zero arguments, zero hassle.
              </p>
            </div>

          </div>

          {/* Acclimation Tips */}
          <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-3">
            <h4 className="font-serif font-bold text-base text-emerald-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-700" />
              <span>Recommended Floating Acclimation Method:</span>
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-emerald-900/90">
              <li>Float the sealed bag in your aquarium for 15–20 minutes to equalize water temperature.</li>
              <li>Open the bag and slowly add small amounts of aquarium water (approx 20% every 5 minutes).</li>
              <li>Net the fish into your tank; discard the transport water outside your aquarium.</li>
              <li>Keep aquarium lights off for the first 6 hours to reduce excitement and stress.</li>
            </ol>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-aquabark-border">
            <span className="text-xs text-aquabark-muted">Questions about transport safety?</span>
            <a
              href="https://wa.me/919490012345"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-6 py-3 rounded-full shadow-sm hover:bg-[#20ba59] transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contact Breeder Helpline</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}

