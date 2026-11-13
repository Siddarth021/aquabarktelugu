"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Check, 
  AlertCircle,
  Clock,
  PackageCheck,
  ChevronRight,
  Fish,
  Share2
} from "lucide-react";
import { ProductDTO, ProductVariantDTO } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";
import { Accordion } from "@/components/shop/Accordion";
import { ProductCard } from "@/components/shop/ProductCard";

export function ProductDetailClient({
  product,
  relatedProducts = [],
}: {
  product: ProductDTO;
  relatedProducts?: ProductDTO[];
}) {
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  
  // Selected variant state (defaults to primary/first active variant)
  const defaultVariant = product.variants?.find((v) => v.isActive) || product.variants?.[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDTO | undefined>(defaultVariant);
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=1000&q=85"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);

  const currentPrice = selectedVariant?.price || 0;
  const originalPrice = selectedVariant?.originalPrice;
  const currentStock = selectedVariant?.stock || 0;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantTitle: selectedVariant.title,
      imageUrl: selectedImage,
      unitPrice: currentPrice,
      quantity,
      maxStock: currentStock,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  // Accordion content configuration
  const accordionItems = [
    {
      id: "details-care",
      title: "DETAILS & CARE GUIDE",
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">{product.description}</p>
          {product.careGuide && (
            <div className="p-3.5 bg-aquabark-secondary/30 rounded-2xl border border-aquabark-border/60">
              <span className="font-semibold text-aquabark-dark block mb-1">
                Water Parameters & Diet:
              </span>
              <p className="text-xs text-aquabark-text">{product.careGuide}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "whats-included",
      title: "WHAT'S INCLUDED",
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Selected Variant:</strong> {selectedVariant?.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Heavy-duty round bottom oxygen packing bag with Indian almond leaf extract</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Step-by-step tank acclimation guide card (Telugu & English)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Complimentary sample packet of high-protein micro floating pellets</span>
          </div>
        </div>
      ),
    },
    {
      id: "delivery-guarantee",
      title: "DELIVERY & 100% LIVE GUARANTEE",
      content: (
        <div className="space-y-3">
          <p>
            We take complete responsibility for the transit safety of your live fish. In the rare event of transit DOA (Dead on Arrival):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Record a clear 30-second unboxing video of the unopened oxygen bag.</li>
            <li>Send the video to our WhatsApp (+91 94900 12345) within 2 hours of pickup/delivery.</li>
            <li>We issue an immediate free replacement dispatch or 100% refund without questions.</li>
            <li>Shipped via TSRTC/APSRTC Bus Parcel or South Central Railway Express for fast pickup.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="py-8 sm:py-12 bg-aquabark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-aquabark-muted mb-8 overflow-x-auto pb-1">
          <Link href="/" className="hover:text-aquabark-dark transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-aquabark-dark transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/category/${product.categoryId === "cat-1" ? "live-fish" : "aqua-plants"}`}
            className="hover:text-aquabark-dark transition-colors"
          >
            {product.categoryName || "Livestock"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-aquabark-dark font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Main Product Showcase Card matching Image 1 */}
        <div className="bg-white rounded-[2.5rem] border border-aquabark-border shadow-card p-6 sm:p-10 lg:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Left Column: Media Gallery */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Primary Image Display */}
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-aquabark-secondary/20 border border-aquabark-border shadow-soft group">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Floating pill badge on image */}
                {discountPercent && (
                  <div className="absolute top-4 left-4 bg-aquabark-terracotta text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                    Save {discountPercent}%
                  </div>
                )}

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                    isInWishlist(product.id)
                      ? "bg-red-50 text-red-500"
                      : "bg-white/80 text-aquabark-dark hover:bg-white hover:text-red-500"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? "fill-red-500" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.imageUrl)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImage === img.imageUrl
                          ? "border-aquabark-dark ring-2 ring-aquabark-primary/50"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.imageUrl}
                        alt={img.altText || product.name}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Feature Icon Badges Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60">
                  <ShieldCheck className="w-5 h-5 text-aquabark-dark mb-1" />
                  <span className="text-[11px] font-bold text-aquabark-dark">Live Arrival</span>
                  <span className="text-[9px] text-aquabark-muted">Guaranteed</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60">
                  <Truck className="w-5 h-5 text-aquabark-dark mb-1" />
                  <span className="text-[11px] font-bold text-aquabark-dark">Rail & Bus</span>
                  <span className="text-[9px] text-aquabark-muted">Overnight Cargo</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60">
                  <Sparkles className="w-5 h-5 text-aquabark-dark mb-1" />
                  <span className="text-[11px] font-bold text-aquabark-dark">Acclimated</span>
                  <span className="text-[9px] text-aquabark-muted">Indian Water</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-border/60">
                  <PackageCheck className="w-5 h-5 text-aquabark-dark mb-1" />
                  <span className="text-[11px] font-bold text-aquabark-dark">Pure O₂</span>
                  <span className="text-[9px] text-aquabark-muted">Thermocol Box</span>
                </div>
              </div>

            </div>

            {/* Right Column: Title, Variant Selectors, Pricing & Accordions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              <div>
                {/* Category & Rating */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-aquabark-terracotta">
                    {product.categoryName || "Freshwater Livestock"}
                  </span>
                  
                  {/* Reviews Star Rating */}
                  <div className="flex items-center gap-1.5 text-xs text-aquabark-muted">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="font-bold text-aquabark-dark">
                      {product.averageRating || 4.9}
                    </span>
                    <span>({product.reviewsCount || 38} reviews)</span>
                  </div>
                </div>

                {/* Editorial Serif Product Title */}
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-aquabark-dark tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Subtitle */}
                {product.subtitle && (
                  <p className="text-sm text-aquabark-muted mt-2 font-medium">
                    {product.subtitle}
                  </p>
                )}

                {/* Dynamic Price Display */}
                <div className="flex items-baseline gap-3 mt-4 pt-2">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-aquabark-dark">
                    {formatINR(currentPrice)}
                  </span>
                  {originalPrice && originalPrice > currentPrice && (
                    <span className="text-lg text-aquabark-muted line-through font-normal">
                      {formatINR(originalPrice)}
                    </span>
                  )}
                  {originalPrice && originalPrice > currentPrice && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Save {formatINR(originalPrice - currentPrice)}
                    </span>
                  )}
                </div>

                {/* Stock Alert Badge */}
                <div className="mt-3">
                  {isOutOfStock ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      <span>Out of Stock — New Batch Acclimating Soon</span>
                    </div>
                  ) : currentStock <= 5 ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Low Stock Alert — Only {currentStock} left in this batch!</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>In Stock — Acclimated & Ready For Pure Oxygen Dispatch</span>
                    </div>
                  )}
                </div>

                {/* Variant Selector Pills */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-aquabark-border space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-aquabark-dark">
                        Select Variant / Pair:
                      </label>
                      <span className="text-xs text-aquabark-muted">
                        Selected: <strong>{selectedVariant?.title}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {product.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setSelectedVariant(v);
                              setQuantity(1);
                            }}
                            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? "border-aquabark-dark bg-aquabark-secondary/40 ring-1 ring-aquabark-dark shadow-sm"
                                : "border-aquabark-border bg-white hover:border-aquabark-primary"
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-aquabark-dark">
                                {v.title}
                              </div>
                              <div className="text-[10px] text-aquabark-muted">
                                {v.size ? `Size: ${v.size}` : ""}
                                {v.plantPotType ? ` • ${v.plantPotType}` : ""}
                              </div>
                            </div>
                            <div className="text-xs font-bold text-aquabark-dark">
                              {formatINR(v.price)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity and 'ADD TO CART' Button Section */}
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  
                  {/* Quantity selector */}
                  <div className="flex items-center justify-between border border-aquabark-border rounded-full bg-white px-3 py-2 sm:w-36">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-1.5 text-aquabark-dark hover:text-aquabark-accent disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-aquabark-dark">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      disabled={quantity >= currentStock || isOutOfStock}
                      className="p-1.5 text-aquabark-dark hover:text-aquabark-accent disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Terracotta/Forest Green 'ADD TO CART' Button matching Image 1 */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 bg-aquabark-terracotta hover:bg-aquabark-terracottaHover disabled:opacity-40 text-white font-bold text-sm tracking-wide py-4 px-8 rounded-full shadow-card flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>{isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}</span>
                  </button>
                </div>

                {/* Added to cart toast confirmation */}
                {addedToast && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Added {quantity}x {product.name} ({selectedVariant?.title}) to basket!</span>
                    </div>
                    <Link href="/cart" className="underline font-bold text-emerald-900">
                      View Cart
                    </Link>
                  </div>
                )}

              </div>

              {/* Clean Expandable Accordions matching Image 1 */}
              <div className="pt-6 border-t border-aquabark-border mt-8">
                <Accordion items={accordionItems} defaultOpenId="details-care" />
              </div>

            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-1">
                  You May Also Like
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-aquabark-dark">
                  Compatible Flora & Tankmates
                </h3>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-aquabark-dark hover:text-aquabark-accent flex items-center gap-1 uppercase tracking-wider"
              >
                <span>View More</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProducts.slice(0, 3).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
