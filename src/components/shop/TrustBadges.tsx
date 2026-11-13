import React from "react";
import { ShieldCheck, Truck, HeartPulse, PackageCheck } from "lucide-react";

export function TrustBadges() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Pure Oxygen Packaging",
      desc: "Conditioned and packed with pure oxygen for regional transit across South India.",
    },
    {
      icon: Truck,
      title: "Bus & Rail Parcel Dispatch",
      desc: "Direct regional transit via TSRTC, APSRTC, and South Central Railway counter pick-up.",
    },
    {
      icon: HeartPulse,
      title: "14-Day Farm Quarantine",
      desc: "Every batch undergoes quarantine and conditioning prior to release.",
    },
    {
      icon: PackageCheck,
      title: "Insulated Boxes",
      desc: "Double-walled thermocol boxes help shield livestock from outdoor temperature fluctuations.",
    },
  ];

  return (
    <section className="py-12 bg-aquabark-secondary/30 border-y border-aquabark-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-5 rounded-3xl bg-white/90 border border-aquabark-border shadow-soft backdrop-blur-sm transition-transform hover:-translate-y-1 duration-200"
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
