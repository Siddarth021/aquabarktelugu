"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-aquabark-bg via-[#F2FAF5] to-aquabark-bg">
      {/* Decorative subtle backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-aquabark-primary/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Subtle Regional Transit Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-aquabark-border shadow-soft text-xs text-aquabark-dark backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-aquabark-accent" />
            <span className="font-semibold text-aquabark-dark">Regional Aquaculture Dispatch</span>
            <span className="text-aquabark-muted">•</span>
            <span className="text-aquabark-muted">APSRTC, TSRTC & South Central Railway</span>
          </div>
        </div>

        {/* Two-column Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-aquabark-dark leading-[1.08]">
              We Bring Living Waters To Your Home.
            </h1>

            <p className="text-base sm:text-lg text-aquabark-muted max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Conditioned and packed with pure oxygen for regional transit. Discover healthy exotic guppies, competition bettas, and snail-free tissue-cultured aquatic flora raised for South Indian water conditions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-aquabark-dark hover:bg-aquabark-darker text-white text-sm font-bold tracking-wide shadow-card transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>SHOP LIVE CATALOG</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/category/combos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white hover:bg-aquabark-secondary/50 text-aquabark-dark border border-aquabark-border text-sm font-semibold shadow-soft transition-all"
              >
                <span>EXPLORE STARTER COMBOS</span>
              </Link>
            </div>

            {/* Factual, honest transit points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-aquabark-muted">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Pure Medical Oxygen Sealed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>14-Day Farm Quarantine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Insulated Thermocol Packing</span>
              </div>
            </div>

          </div>

          {/* Right Column: Clean, Elegant Featured Showcase Image (No Clutter) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=1200&q=85"
                alt="Exotic Red Dragon Guppy and Planted Aquarium"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Bottom Card Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-bold tracking-wider uppercase text-aquabark-primary">
                  Breeding Strain
                </span>
                <h3 className="font-serif text-2xl font-bold">Red Dragon Big Ear Guppy</h3>
                <p className="text-xs text-white/80 mt-1">
                  Conditioned to Indian municipal tap water parameters
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
