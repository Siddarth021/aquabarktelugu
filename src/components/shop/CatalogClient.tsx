"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, SlidersHorizontal, Check, RefreshCw, X } from "lucide-react";
import { ProductDTO, CategoryDTO } from "@/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCart } from "@/context/CartContext";

export function CatalogClient({
  initialProducts,
  categories,
  defaultCategorySlug,
}: {
  initialProducts: ProductDTO[];
  categories: CategoryDTO[];
  defaultCategorySlug?: string;
}) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialFilterParam = searchParams.get("filter") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultCategorySlug || "all"
  );
  const [sortBy, setSortBy] = useState<string>("featured");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(
    initialFilterParam === "wishlist"
  );

  const { wishlist } = useCart();

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Category check
        if (selectedCategory !== "all") {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && product.categoryId !== cat.id) return false;
        }

        // Search text check
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchSub = product.subtitle?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSub) return false;
        }

        // In-stock only
        if (inStockOnly) {
          const stock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
          if (stock <= 0) return false;
        }

        // Wishlist only
        if (wishlistOnly) {
          if (!wishlist.includes(product.id)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const getMinPrice = (p: ProductDTO) =>
          Math.min(...(p.variants?.map((v) => v.price) || [0]));

        if (sortBy === "price-asc") {
          return getMinPrice(a) - getMinPrice(b);
        }
        if (sortBy === "price-desc") {
          return getMinPrice(b) - getMinPrice(a);
        }
        if (sortBy === "rating") {
          return (b.averageRating || 0) - (a.averageRating || 0);
        }
        // Default: featured first
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [initialProducts, categories, selectedCategory, search, inStockOnly, wishlistOnly, sortBy, wishlist]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="py-10 bg-aquabark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-1">
            AquaBark Livestock Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-aquabark-dark">
            {activeCategoryObj ? activeCategoryObj.name : "All Aquatic Collections"}
          </h1>
          <p className="text-xs sm:text-sm text-aquabark-muted mt-2">
            {activeCategoryObj?.description ||
              "Explore acclimated pure-strain guppies, halfmoon bettas, algae cleaner shrimp, and healthy aquatic plants."}
          </p>
        </div>

        {/* Filter Bar Controls */}
        <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-4 sm:p-6 mb-10 space-y-4">
          
          {/* Top row: Search and Sort */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-aquabark-muted" />
              <input
                type="text"
                placeholder="Search guppies, bettas, plants, shrimp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-full text-xs text-aquabark-dark placeholder-aquabark-muted focus:outline-none focus:border-aquabark-dark"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-aquabark-muted hover:text-aquabark-dark"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & Checkbox Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              
              {/* In stock toggle */}
              <label className="flex items-center gap-2 text-xs text-aquabark-dark cursor-pointer select-none bg-aquabark-bg px-3 py-2 rounded-full border border-aquabark-border">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-aquabark-dark focus:ring-aquabark-primary"
                />
                <span>In Stock Only</span>
              </label>

              {/* Wishlist toggle */}
              <button
                onClick={() => setWishlistOnly(!wishlistOnly)}
                className={`text-xs px-3.5 py-2 rounded-full border transition-colors flex items-center gap-1.5 ${
                  wishlistOnly
                    ? "bg-red-50 text-red-600 border-red-200 font-semibold"
                    : "bg-aquabark-bg text-aquabark-dark border-aquabark-border hover:bg-aquabark-secondary/50"
                }`}
              >
                <span>Saved Wishlist ({wishlist.length})</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-aquabark-bg px-3 py-2 rounded-full border border-aquabark-border text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-aquabark-muted" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-aquabark-dark font-medium focus:outline-none text-xs"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

            </div>
          </div>

          {/* Bottom row: Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-aquabark-border/60">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-aquabark-dark text-white shadow-soft"
                  : "bg-aquabark-bg text-aquabark-text hover:bg-aquabark-secondary/60"
              }`}
            >
              All Items ({initialProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-aquabark-dark text-white shadow-soft"
                    : "bg-aquabark-bg text-aquabark-text hover:bg-aquabark-secondary/60"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>

        {/* Product Count Result Indicator */}
        <div className="flex items-center justify-between text-xs text-aquabark-muted mb-6">
          <span>Showing {filteredProducts.length} items</span>
          {(search || selectedCategory !== "all" || inStockOnly || wishlistOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setInStockOnly(false);
                setWishlistOnly(false);
              }}
              className="text-aquabark-terracotta hover:underline font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-aquabark-border p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-aquabark-secondary flex items-center justify-center mx-auto text-aquabark-dark">
              <Filter className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="font-serif text-xl font-bold text-aquabark-dark">
              No matching livestock found
            </h3>
            <p className="text-xs text-aquabark-muted max-w-sm mx-auto">
              Try adjusting your search terms or clearing the active filters to explore more items.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setInStockOnly(false);
                setWishlistOnly(false);
              }}
              className="mt-2 bg-aquabark-dark text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-aquabark-darker transition-colors"
            >
              Show All Products
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

