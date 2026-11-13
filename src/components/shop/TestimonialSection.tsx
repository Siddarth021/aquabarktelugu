import React from "react";
import { Star, CheckCircle, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/data/mockData";

export function TestimonialSection() {
  return (
    <section className="py-20 bg-aquabark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-2">
            Loved By Aquarists
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
            Real Reviews From Telugu Aquascapers
          </h2>
          <p className="text-xs sm:text-sm text-aquabark-muted mt-2">
            See how our live oxygen parcels and rail transit arrive at bus stations and doorstep deliveries across South India.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="relative p-7 rounded-3xl bg-white border border-aquabark-border shadow-soft flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-aquabark-secondary/80 mb-3" />
                <div className="flex text-amber-400 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-aquabark-text leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-aquabark-border flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-aquabark-dark text-sm">
                    {t.author}
                  </h4>
                  <p className="text-xs text-aquabark-muted">{t.location}</p>
                </div>
                {t.verified && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Buyer</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

