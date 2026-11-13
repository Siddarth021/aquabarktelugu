import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Heart, Layers, MessageCircle } from "lucide-react";
import { Hero } from "@/components/shop/Hero";
import { TrustBadges } from "@/components/shop/TrustBadges";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { TestimonialSection } from "@/components/shop/TestimonialSection";
import { CATEGORIES, PRODUCTS, COMBOS } from "@/data/mockData";
import { formatINR } from "@/lib/utils";

export default function HomePage() {
  const featuredFish = PRODUCTS.filter((p) => p.categoryId === "cat-1");
  const featuredPlants = PRODUCTS.filter((p) => p.categoryId === "cat-2");

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* 1. Hero Section matching Image 2 */}
      <Hero />

      {/* 2. Trust Badges */}
      <TrustBadges />

      {/* 3. Shop by Category (Matching Image 2 rounded cards with arrow button) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-1">
              Curated Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
              Shop By Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-aquabark-dark hover:text-aquabark-accent tracking-wide uppercase group"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3-column category grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {CATEGORIES.slice(0, 3).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 4. Featured Live Fish Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-1">
              Aquarium Livestock
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
              Acclimated Exotic Live Fish
            </h2>
            <p className="text-xs sm:text-sm text-aquabark-muted mt-1">
              Bred for high vitality in South Indian water conditions. Oxygen packed for 48+ hours safety.
            </p>
          </div>
          <Link
            href="/category/live-fish"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-aquabark-dark hover:text-aquabark-accent tracking-wide uppercase group"
          >
            <span>EXPLORE ALL FISH</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredFish.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Aqua Plants & Driftwood Epiphytes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-1">
              Snail-Free Aquascaping
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
              Lush Aquatic Plants & Moss
            </h2>
            <p className="text-xs sm:text-sm text-aquabark-muted mt-1">
              Low-tech friendly ferns and epiphytes tied to volcanic lava rock and mangrove wood.
            </p>
          </div>
          <Link
            href="/category/aqua-plants"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-aquabark-dark hover:text-aquabark-accent tracking-wide uppercase group"
          >
            <span>VIEW ALL PLANTS</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredPlants.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Curated Bundles & Combos Section */}
      <section className="bg-aquabark-secondary/30 py-16 border-y border-aquabark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-2">
              Value Bundles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
              Curated Planted Tank Combos
            </h2>
            <p className="text-xs sm:text-sm text-aquabark-muted mt-2">
              Beginner-friendly starter packages pairing live fish with compatible plants and starter feed at special discount pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COMBOS.map((combo) => {
              const savings = combo.originalPrice - combo.comboPrice;
              const savingsPercent = Math.round((savings / combo.originalPrice) * 100);
              return (
                <div
                  key={combo.id}
                  className="rounded-3xl bg-white border border-aquabark-border overflow-hidden shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row"
                >
                  <div className="relative h-64 md:h-auto md:w-5/12 bg-aquabark-secondary/40 flex-shrink-0">
                    <Image
                      src={combo.imageUrl || "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80"}
                      alt={combo.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-aquabark-terracotta text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Save {savingsPercent}%
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-aquabark-muted">
                        All-in-One Pack
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-aquabark-dark mt-1">
                        {combo.title}
                      </h3>
                      <p className="text-xs text-aquabark-muted mt-2 leading-relaxed">
                        {combo.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-aquabark-border space-y-1.5">
                        <span className="text-[11px] font-bold text-aquabark-dark block">
                          Included in this bundle:
                        </span>
                        {combo.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 text-xs text-aquabark-text"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-aquabark-accent" />
                            <span>
                              {item.quantity}x {item.productName} ({item.variantTitle})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-aquabark-border flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-aquabark-muted block">Bundle Offer</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-aquabark-dark">
                            {formatINR(combo.comboPrice)}
                          </span>
                          <span className="text-xs text-aquabark-muted line-through">
                            {formatINR(combo.originalPrice)}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/products/${combo.items[0]?.productId || 'red-dragon-big-ear-guppy'}`}
                        className="bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs font-bold px-5 py-3 rounded-full flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                      >
                        <span>View Bundle</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Live Transit Feasibility & Bus Parcel Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-aquabark-dark text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-aquabark-accent/10 blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-aquabark-primary backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Bus & Railway Parcel Dispatch</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Fast, Stress-Free Livestock Transit Across South India
            </h2>

            <p className="text-sm sm:text-base text-aquabark-secondary/80 leading-relaxed">
              Live ornamental fish require rapid, gentle transit. We pack every fish in pure medical oxygen and double-layered thermocol coolers, dispatched through TSRTC & APSRTC bus parcel cargo and South Central Railway counter delivery. Your parcel reaches your nearest town depot in under 12–24 hours!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <h4 className="font-serif font-bold text-aquabark-primary text-base">Overnight Transit</h4>
                <p className="text-xs text-white/70 mt-1">Dispatched in evening, arrives next morning at your bus counter.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <h4 className="font-serif font-bold text-aquabark-primary text-base">Oxygen Sealed</h4>
                <p className="text-xs text-white/70 mt-1">Sealed with pure medical oxygen lasting 60+ continuous hours.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <h4 className="font-serif font-bold text-aquabark-primary text-base">DOA Guarantee</h4>
                <p className="text-xs text-white/70 mt-1">Immediate replacement or full refund on rare transit casualties.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/track"
                className="bg-aquabark-primary hover:bg-white text-aquabark-dark font-bold text-xs px-6 py-3.5 rounded-full transition-colors flex items-center gap-2"
              >
                <span>Track An Existing Parcel</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/policies/shipping"
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-semibold text-xs px-6 py-3.5 rounded-full transition-colors"
              >
                <span>Read Shipping Guidelines</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <TestimonialSection />

      {/* 9. WhatsApp Direct Consultation Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-emerald-50 border border-emerald-200/80 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif text-2xl font-bold text-emerald-950">
              Need Telugu Advice on Live Fish Compatibility?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800/80 max-w-xl">
              Talk directly with our breeding team on WhatsApp. Send photos of your aquarium setup, get water parameter advice, or request custom pair photos prior to dispatch.
            </p>
          </div>
          <a
            href="https://wa.me/919490012345"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-7 py-4 rounded-full font-bold text-sm shadow-md transition-transform active:scale-95"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Chat on WhatsApp (+91 94900 12345)</span>
          </a>
        </div>
      </section>
    </div>
  );
}

