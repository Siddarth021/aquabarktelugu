"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Search, 
  Fish, 
  Leaf, 
  Layers,
  Wrench,
  Home
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // If on admin route, do not render storefront navbar
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  // Simplified navigation links strictly according to specification:
  // Logo, Home, Fish, Aqua Plants, Accessories, Combos, Search, Account, Cart
  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Fish", href: "/category/live-fish", icon: Fish },
    { name: "Aqua Plants", href: "/category/aqua-plants", icon: Leaf },
    { name: "Accessories", href: "/category/accessories", icon: Wrench },
    { name: "Combos", href: "/category/combos", icon: Layers },
  ];

  return (
    <>
      {/* Main Sticky Navbar - Minimalist & Spacious */}
      <header className="sticky top-0 z-40 bg-aquabark-bg/95 backdrop-blur-md border-b border-aquabark-border/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl text-aquabark-dark hover:bg-aquabark-secondary/50 lg:hidden"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary shadow-soft group-hover:scale-105 transition-transform">
              <Fish className="w-5 h-5 stroke-[2.2]" />
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

          {/* Simplified Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-aquabark-dark text-white shadow-soft"
                      : "text-aquabark-text hover:bg-aquabark-secondary/60 hover:text-aquabark-dark"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Search, Account, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-full text-aquabark-dark hover:bg-aquabark-secondary/50 transition-colors"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Customer Account */}
            <Link
              href="/account"
              className="p-2.5 rounded-full text-aquabark-dark hover:bg-aquabark-secondary/50 transition-colors"
              aria-label="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
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
              <span className="text-xs font-semibold tracking-wide hidden sm:inline">CART</span>
            </button>
          </div>
        </div>

        {/* Expandable Minimal Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-aquabark-border bg-white px-4 py-3 shadow-inner animate-fade-in">
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
                placeholder="Search Guppies, Bettas, Anubias on Lava Rock, Combos..."
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
                  <div className="w-8 h-8 rounded-xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary">
                    <Fish className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-bold text-lg text-aquabark-dark">
                    AquaBark Telugu
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-aquabark-text hover:bg-aquabark-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Simplified Mobile Nav Links */}
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

            {/* Bottom contact info */}
            <div className="pt-6 border-t border-aquabark-border text-xs text-aquabark-muted space-y-1">
              <p className="font-semibold text-aquabark-dark">Breeding Farm Hubs:</p>
              <p>Rajahmundry & Vijayawada</p>
              <p>WhatsApp: +91 94900 12345</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
