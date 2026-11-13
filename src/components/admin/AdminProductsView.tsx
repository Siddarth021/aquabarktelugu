"use client";

import { useState, useMemo } from "react";
import { ProductDTO, CategoryDTO, ProductVariantDTO } from "@/types";
import { formatINR } from "@/lib/utils";
import { PriceModal } from "@/components/admin/PriceModal";
import { StockModal } from "@/components/admin/StockModal";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import {
  Search,
  Plus,
  IndianRupee,
  Package,
  Layers,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldCheck,
} from "lucide-react";

interface AdminProductsViewProps {
  initialProducts: ProductDTO[];
  categories: CategoryDTO[];
}

export function AdminProductsView({
  initialProducts,
  categories,
}: AdminProductsViewProps) {
  const [products, setProducts] = useState<ProductDTO[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modal states
  const [priceModalTarget, setPriceModalTarget] = useState<{
    productName: string;
    variantId: string;
    variantTitle: string;
    currentPrice: number;
    originalPrice?: number | null;
  } | null>(null);

  const [stockModalTarget, setStockModalTarget] = useState<{
    productName: string;
    variantId: string;
    variantTitle: string;
    currentStock: number;
  } | null>(null);

  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "ALL" && p.categoryId !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesVariant = p.variants.some(
          (v) => v.title.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesVariant) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handlePriceUpdated = (variantId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((prod) => ({
        ...prod,
        variants: prod.variants.map((v) =>
          v.id === variantId ? { ...v, price: newPrice } : v
        ),
      }))
    );
  };

  const handleStockUpdated = (variantId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((prod) => ({
        ...prod,
        variants: prod.variants.map((v) =>
          v.id === variantId ? { ...v, stock: newStock } : v
        ),
      }))
    );
  };

  const handleProductCreated = (newProd: ProductDTO) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-aquabark-dark">
            Products & Dynamic Pricing
          </h1>
          <p className="text-xs text-aquabark-muted">
            Manage live inventory, individual variants, and instantaneous price adjustments
          </p>
        </div>

        <button
          onClick={() => setIsNewProductModalOpen(true)}
          className="py-2.5 px-4 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by title, strain, or variant SKU..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-white shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
        />
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === "ALL"
              ? "bg-aquabark-dark text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          All Categories ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === c.id
                ? "bg-aquabark-dark text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-3xl border border-aquabark-border shadow-xs hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Product Top Header */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-aquabark-border/60">
              <div className="flex items-start gap-3">
                {product.images[0]?.imageUrl ? (
                  <img
                    src={product.images[0].imageUrl}
                    alt={product.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-aquabark-secondary/50 flex items-center justify-center text-aquabark-dark shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-aquabark-dark text-base">{product.name}</h3>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {product.categoryName}
                    </span>
                    {product.requiresSpecialTransit && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Live Fish Transit</span>
                      </span>
                    )}
                  </div>
                  {product.subtitle && (
                    <p className="text-xs text-aquabark-muted mt-0.5">{product.subtitle}</p>
                  )}
                  {product.careGuide && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                      Care: {product.careGuide}
                    </p>
                  )}
                </div>
              </div>

              {/* Variant count */}
              <div className="text-xs text-aquabark-muted flex items-center gap-1 self-start sm:self-auto font-medium">
                <span>{product.variants.length} Variants</span>
              </div>
            </div>

            {/* Variants Matrix */}
            <div className="p-4 sm:p-5 space-y-2.5 bg-aquabark-bg/20">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Variant Pricing & Live Stock
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {product.variants.map((v) => {
                  const isLowStock = v.stock <= 5;
                  return (
                    <div
                      key={v.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-aquabark-primary/60 transition-colors"
                    >
                      {/* Variant Info */}
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-aquabark-dark text-sm">{v.title}</h4>
                            <span className="text-[10px] font-mono text-slate-400">
                              {v.sku}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            {v.gender && <span>Gender: {v.gender}</span>}
                            {v.plantPotType && <span>Pot: {v.plantPotType}</span>}
                            {v.size && <span>Size: {v.size}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Price, Stock & Quick Action Buttons */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Live Price Display */}
                        <div className="text-right">
                          <div className="font-extrabold text-base text-aquabark-dark font-mono">
                            {formatINR(v.price)}
                          </div>
                          {v.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatINR(v.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Stock status pill */}
                        <div
                          className={`text-center px-2.5 py-1 rounded-xl border text-xs font-bold ${
                            isLowStock
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-emerald-50 border-emerald-200 text-emerald-800"
                          }`}
                        >
                          <span className="block font-mono text-sm leading-tight">{v.stock}</span>
                          <span className="text-[9px] uppercase tracking-tight block">
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setPriceModalTarget({
                                productName: product.name,
                                variantId: v.id,
                                variantTitle: v.title,
                                currentPrice: v.price,
                                originalPrice: v.originalPrice,
                              })
                            }
                            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-aquabark-secondary/80 text-aquabark-dark border border-slate-200 hover:border-aquabark-primary text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit Price on the fly"
                          >
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span>Edit Price</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setStockModalTarget({
                                productName: product.name,
                                variantId: v.id,
                                variantTitle: v.title,
                                currentStock: v.stock,
                              })
                            }
                            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Adjust inventory"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Stock</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Price Modal */}
      {priceModalTarget && (
        <PriceModal
          isOpen={true}
          onClose={() => setPriceModalTarget(null)}
          productName={priceModalTarget.productName}
          variantId={priceModalTarget.variantId}
          variantTitle={priceModalTarget.variantTitle}
          currentPrice={priceModalTarget.currentPrice}
          originalPrice={priceModalTarget.originalPrice}
          onSuccess={(newPrice) => handlePriceUpdated(priceModalTarget.variantId, newPrice)}
        />
      )}

      {/* Update Stock Modal */}
      {stockModalTarget && (
        <StockModal
          isOpen={true}
          onClose={() => setStockModalTarget(null)}
          productName={stockModalTarget.productName}
          variantId={stockModalTarget.variantId}
          variantTitle={stockModalTarget.variantTitle}
          currentStock={stockModalTarget.currentStock}
          onSuccess={(newStock) => handleStockUpdated(stockModalTarget.variantId, newStock)}
        />
      )}

      {/* Add Product Modal */}
      <ProductFormModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        categories={categories}
        onSuccess={handleProductCreated}
      />
    </div>
  );
}
