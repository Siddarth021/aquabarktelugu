"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Search, 
  Compass, 
  ShieldCheck, 
  Fish, 
  Leaf, 
  Layers,
  Truck
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, wishlist, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { name: "Live Fish", href: "/category/live-fish", icon: Fish },
    { name: "Aqua Plants", href: "/category/aqua-plants", icon: Leaf },
    { name: "Combos", href: "/category/combos", icon: Layers },
    { name: "All Shop", href: "/shop", icon: Compass },
    { name: "Track Order", href: "/track", icon: Truck },
    { name: "Live Guarantee", href: "/policies/guarantee", icon: ShieldCheck },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-aquabark-dark text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-aquabark-accent animate-pulse" />
            <span>🚚 Express Bus & Rail Parcel Dispatch Across AP, Telangana & Pan-India</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200">
            <span>100% Live Arrival Guaranteed</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Free Shipping on Orders Over ₹1,499</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-aquabark-bg/95 backdrop-blur-md border-b border-aquabark-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl text-aquabark-dark hover:bg-aquabark-secondary/50 lg:hidden"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary shadow-soft group-hover:scale-105 transition-transform">
              <Fish className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-aquabark-dark leading-none">
                AquaBark
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-aquabark-terracotta mt-0.5">
                తెలుగు • Livestock Co.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-aquabark-dark text-white shadow-soft"
                      : "text-aquabark-text hover:bg-aquabark-secondary/60 hover:text-aquabark-dark"
                  }`}
                >
                  <link.icon className="w-4 h-4 opacity-80" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-full text-aquabark-dark hover:bg-aquabark-secondary/50 transition-colors"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/shop?filter=wishlist"
              className="p-2.5 rounded-full text-aquabark-dark hover:bg-aquabark-secondary/50 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-aquabark-terracotta text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Customer Account */}
            <Link
              href="/account"
              className="p-2.5 rounded-full text-aquabark-dark hover:bg-aquabark-secondary/50 transition-colors hidden sm:flex"
              aria-label="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-aquabark-dark hover:bg-aquabark-darker text-white px-4 py-2.5 rounded-full transition-transform active:scale-95 shadow-soft ml-1"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-aquabark-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold tracking-wide hidden md:inline">CART</span>
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-aquabark-border bg-white px-4 py-3 shadow-inner">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <Search className="w-5 h-5 text-aquabark-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                placeholder="Search Guppies, Rosetail Bettas, Anubias on Lava Rock, Combos..."
                className="w-full bg-transparent border-none text-aquabark-text placeholder-aquabark-muted focus:outline-none text-sm py-1"
                autoFocus
              />
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="bg-aquabark-dark text-white text-xs px-4 py-2 rounded-full font-medium"
              >
                Search
              </button>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-aquabark-muted hover:text-aquabark-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Slide-Over */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-aquabark-bg shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-aquabark-border">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary">
                    <Fish className="w-5 h-5" />
                  </div>
                  <span className="font-serif font-bold text-lg text-aquabark-dark">
                    AquaBark Telugu
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-aquabark-text hover:bg-aquabark-secondary"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation items */}
              <div className="py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-2xl text-aquabark-text hover:bg-aquabark-secondary/70 font-medium text-sm transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span>{link.name}</span>
                  </Link>
                ))}
                
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl text-aquabark-text hover:bg-aquabark-secondary/70 font-medium text-sm transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-aquabark-secondary flex items-center justify-center text-aquabark-dark">
                    <User className="w-4 h-4" />
                  </div>
                  <span>My Account & Orders</span>
                </Link>
              </div>
            </div>

            {/* Bottom info */}
            <div className="pt-6 border-t border-aquabark-border text-xs text-aquabark-muted space-y-2">
              <p className="font-semibold text-aquabark-dark">Transit Guarantee Helpline:</p>
              <p>WhatsApp: +91 94900 12345</p>
              <p>Rajahmundry & Vijayawada Hubs</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

