"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";
import { ProductDTO } from "@/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: ProductDTO }) {
  const { toggleWishlist, isInWishlist, addItem } = useCart();
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80";

  // Compute lowest price and original price from variants
  const minPrice =
    product.variants?.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : 0;

  const minVariant = product.variants?.find((v) => v.price === minPrice) || product.variants?.[0];
  const originalPrice = minVariant?.originalPrice;
  const discountPercent =
    originalPrice && originalPrice > minPrice
      ? Math.round(((originalPrice - minPrice) / originalPrice) * 100)
      : null;

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const isOutOfStock = totalStock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!minVariant || isOutOfStock) return;
    addItem({
      variantId: minVariant.id,
      productId: product.id,
      productName: product.name,
      variantTitle: minVariant.title,
      imageUrl: primaryImage,
      unitPrice: minVariant.price,
      quantity: 1,
      maxStock: minVariant.stock,
    });
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-aquabark-border p-4 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1">
      
      {/* Top Media Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-aquabark-secondary/20">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges on top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.requiresSpecialTransit && (
            <span className="inline-flex items-center gap-1 bg-aquabark-dark text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              <ShieldCheck className="w-3 h-3 text-aquabark-primary" />
              Oxygen Dispatch
            </span>
          )}
          {discountPercent && (
            <span className="inline-block bg-aquabark-terracotta text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Save {discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-block bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button on top-right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all z-10 shadow-sm ${
            isInWishlist(product.id)
              ? "bg-red-50 text-red-500"
              : "bg-white/80 text-aquabark-dark hover:bg-white hover:text-red-500"
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`w-4 h-4 ${
              isInWishlist(product.id) ? "fill-red-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Product Details */}
      <div className="pt-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-aquabark-muted mb-1.5">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-aquabark-dark">
              {product.averageRating || 4.9}
            </span>
            <span>({product.reviewsCount || 24})</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">
              Acclimated
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-lg font-bold text-aquabark-dark leading-snug group-hover:text-aquabark-accent transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle */}
          {product.subtitle && (
            <p className="text-xs text-aquabark-muted line-clamp-1 mt-0.5">
              {product.subtitle}
            </p>
          )}

          {/* Available Variants hint */}
          {product.variants?.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.variants.slice(0, 3).map((v) => (
                <span
                  key={v.id}
                  className="text-[10px] bg-aquabark-secondary/50 text-aquabark-dark px-2 py-0.5 rounded-md"
                >
                  {v.gender || v.plantPotType || v.size || v.title}
                </span>
              ))}
              {product.variants.length > 3 && (
                <span className="text-[10px] text-aquabark-muted">
                  +{product.variants.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Quick CTA */}
        <div className="pt-4 mt-2 border-t border-aquabark-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-aquabark-muted block">Starting at</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg text-aquabark-dark">
                {formatINR(minPrice)}
              </span>
              {originalPrice && originalPrice > minPrice && (
                <span className="text-xs text-aquabark-muted line-through">
                  {formatINR(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="flex items-center gap-1 bg-aquabark-dark hover:bg-aquabark-darker disabled:opacity-40 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full transition-transform active:scale-95 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

      </div>

    </div>
  );
}

