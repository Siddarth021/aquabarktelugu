"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, ShieldCheck, Truck, HeartHandshake, PhoneCall, Mail, MapPin, ArrowRight } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Complete Isolation: Strictly NEVER render public customer footer on admin routes
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-aquabark-darker text-white pt-16 pb-12 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Brand Statement / Editorial Hero in Footer */}
        <div className="pb-14 border-b border-white/10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-aquabark-primary flex items-center justify-center text-aquabark-dark shadow-sm">
                <Fish className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                AquaBark Telugu
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-aquabark-secondary font-normal italic leading-snug">
              "We Bring Living Waters To Your Home."
            </h2>
            <p className="text-aquabark-secondary/70 text-sm leading-relaxed">
              Andhra Pradesh & Telangana's premier breeding farm for acclimated exotic guppies, competition bettas, nano schooling fish, and snail-free tissue culture aquatic plants. Dispatched with pure oxygen in double-insulated thermocol boxes.
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl max-w-md w-full backdrop-blur-sm">
            <h3 className="font-serif text-lg font-bold text-white mb-1">
              Join Our Aquarist Circle
            </h3>
            <p className="text-xs text-aquabark-secondary/70 mb-4">
              Get secret stock alerts, breeding tips, and 10% off your first live order with code <strong>WELCOME10</strong>.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-aquabark-primary flex-1"
              />
              <button
                type="submit"
                className="bg-aquabark-primary hover:bg-white text-aquabark-dark font-bold text-xs px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* 4 Navigation Columns */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm border-b border-white/10">
          
          {/* Col 1: Shop */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-aquabark-primary text-base">Explore Catalog</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/category/live-fish" className="hover:text-aquabark-primary transition-colors">Exotic Live Fish</Link></li>
              <li><Link href="/category/aqua-plants" className="hover:text-aquabark-primary transition-colors">Aquatic Flora & Moss</Link></li>
              <li><Link href="/category/shrimp-inverts" className="hover:text-aquabark-primary transition-colors">Dwarf Shrimp & Snails</Link></li>
              <li><Link href="/category/combos" className="hover:text-aquabark-primary transition-colors">Curated Tank Combos</Link></li>
              <li><Link href="/shop" className="hover:text-aquabark-primary transition-colors">Browse Full Catalog</Link></li>
            </ul>
          </div>

          {/* Col 2: Transit & Guarantees */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-aquabark-primary text-base">Safe Transit</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/track" className="hover:text-aquabark-primary transition-colors">Track Live Parcel</Link></li>
              <li><Link href="/policies/guarantee" className="hover:text-aquabark-primary transition-colors">Live Transit & DOA Policy</Link></li>
              <li><Link href="/policies/shipping" className="hover:text-aquabark-primary transition-colors">Bus & Train Dispatch Info</Link></li>
              <li><Link href="/policies/cancellation" className="hover:text-aquabark-primary transition-colors">Cancellations & Refunds</Link></li>
              <li><span className="text-emerald-400">Oxygen-Packed & Insulated</span></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-aquabark-primary text-base">Customer Account</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/account" className="hover:text-aquabark-primary transition-colors">My Profile & Orders</Link></li>
              <li><Link href="/account/cancellations" className="hover:text-aquabark-primary transition-colors">Order Cancellation</Link></li>
              <li><Link href="/policies/terms" className="hover:text-aquabark-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-aquabark-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/admin" className="text-white/40 hover:text-white transition-colors">Breeder Admin Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Direct Farm Contact */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-aquabark-primary text-base">Direct Farm Hubs</h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-aquabark-primary flex-shrink-0 mt-0.5" />
                <span>Rajahmundry & Vijayawada Livestock Hubs, Andhra Pradesh, India</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-aquabark-primary flex-shrink-0" />
                <span>+91 94900 12345 (WhatsApp Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-aquabark-primary flex-shrink-0" />
                <span>care@aquabarktelugu.com</span>
              </div>
              <div className="pt-2">
                <span className="inline-block bg-aquabark-primary/20 text-aquabark-primary border border-aquabark-primary/30 px-3 py-1 rounded-full font-medium text-[11px]">
                  Telugu & English Support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and guarantees */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} AquaBark Telugu. All rights reserved. Crafted for aquatic enthusiasts.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-aquabark-primary" />
              100% Secure Checkout (Razorpay)
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-aquabark-primary" />
              Express Interstate Transit
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
