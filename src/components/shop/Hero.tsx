"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, ShieldCheck, Sparkles, Check, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-aquabark-bg via-[#F2FAF5] to-aquabark-bg">
      
      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-aquabark-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Subtle Social & Announcement Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-aquabark-border shadow-soft text-xs text-aquabark-dark backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-aquabark-accent" />
            <span className="font-semibold text-aquabark-terracotta">Andhra & Telangana Direct</span>
            <span className="text-aquabark-muted">•</span>
            <span>Overnight Bus & Train Cargo Available</span>
          </div>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-medium hover:bg-emerald-100 transition-colors"
          >
            <Play className="w-3 h-3 fill-emerald-800" />
            <span>Watch Farm Tour in Telugu</span>
          </a>
        </div>

        {/* Two-column Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            <div className="inline-block">
              <span className="text-xs uppercase tracking-widest font-bold text-aquabark-dark/80 bg-aquabark-secondary px-3.5 py-1.5 rounded-full">
                🌿 Pure Oxygen Sealed Livestock
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-aquabark-dark leading-[1.08]">
              We Bring Living Waters To Your Home.
            </h1>

            <p className="text-base sm:text-lg text-aquabark-muted max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Discover ethically raised, disease-quarantined exotic guppies, competition-grade bettas, and snail-free tissue-cultured aquatic flora. Dispatched daily with 100% Live Arrival Guarantee across South India.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-aquabark-dark hover:bg-aquabark-darker text-white text-sm font-bold tracking-wide shadow-card transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>SHOP CURATED LIVESTOCK</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/category/combos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white hover:bg-aquabark-secondary/50 text-aquabark-dark border border-aquabark-border text-sm font-semibold shadow-soft transition-all"
              >
                <span>EXPLORE STARTER COMBOS</span>
              </Link>
            </div>

            {/* Micro Guarantees List */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-aquabark-muted">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Pure Medical Oxygen Packs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>14-Day Prophylactic Quarantine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Zero Snail Guarantee</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual with Floating Pill Badges */}
          <div className="lg:col-span-5 relative">
            
            {/* Main Featured Showcase Card */}
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=1200&q=85"
                alt="Exotic Red Dragon Guppy and Planted Aquarium"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

              {/* Bottom Card Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-bold tracking-wider uppercase text-aquabark-primary">
                  Featured Breeding Line
                </span>
                <h3 className="font-serif text-2xl font-bold">Red Dragon Big Ear Guppy</h3>
                <p className="text-xs text-white/80 mt-1">
                  Locally conditioned to Indian tap water parameters • Starting at ₹499/pair
                </p>
              </div>
            </div>

            {/* Floating Trustpilot / Google Reviews Pill Badge (Top Left / Offset) */}
            <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md border border-aquabark-border shadow-card rounded-2xl p-3.5 flex items-center gap-3 animate-fade-in z-20">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                4.9
              </div>
              <div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs font-bold text-aquabark-dark mt-0.5">
                  1,200+ Verified Aquarists
                </p>
                <p className="text-[10px] text-aquabark-muted">TSRTC & South Central Rail</p>
              </div>
            </div>

            {/* Floating Product Teaser Pill Card (Bottom Right / Offset) */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md border border-aquabark-border shadow-card rounded-2xl p-4 flex items-center gap-3 max-w-xs z-20">
              <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 bg-aquabark-secondary/50">
                <Image
                  src="https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=200&q=80"
                  alt="Rosetail Betta"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Live Stock Alert
                </span>
                <h4 className="font-serif text-xs font-bold text-aquabark-dark line-clamp-1 mt-0.5">
                  Royal Blue Rosetail Betta
                </h4>
                <p className="text-[11px] font-semibold text-aquabark-terracotta">
                  Only 3 Pairs Left
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

