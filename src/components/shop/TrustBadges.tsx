import React from "react";
import { ShieldCheck, Truck, HeartPulse, PackageCheck } from "lucide-react";

export function TrustBadges() {
  const items = [
    {
      icon: ShieldCheck,
      title: "100% Live Arrival Guarantee",
      desc: "Pure medical-grade oxygen packing ensures pristine arrival. Instant DOA replacement guarantee.",
    },
    {
      icon: Truck,
      title: "Express Bus & Rail Transit",
      desc: "Direct overnight parcel via TSRTC, APSRTC, and South Central Railway counter pick-up.",
    },
    {
      icon: HeartPulse,
      title: "14-Day Farm Quarantine",
      desc: "Every batch undergoes strict botanical quarantine & salt prophylaxis. Zero disease risk.",
    },
    {
      icon: PackageCheck,
      title: "Thermal Insulated Pack",
      desc: "Double-walled thermocol boxes shield delicate livestock from temperature swings.",
    },
  ];

  return (
    <section className="py-12 bg-aquabark-secondary/30 border-y border-aquabark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-5 rounded-3xl bg-white/80 border border-aquabark-border/80 shadow-soft backdrop-blur-sm transition-transform hover:-translate-y-1 duration-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark flex-shrink-0">
                <item.icon className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-aquabark-dark text-base leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-aquabark-muted mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

