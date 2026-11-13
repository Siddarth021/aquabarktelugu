"use client";

import { useState, useMemo } from "react";
import { ProductDTO, CategoryDTO } from "@/types";
import { formatINR } from "@/lib/utils";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { PriceModal } from "@/components/admin/PriceModal";
import { StockModal } from "@/components/admin/StockModal";
import {
  Search,
  Plus,
  IndianRupee,
  Package,
  Layers,
  Edit2,
  ChevronDown,
  ChevronUp,
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Price & Stock modal targets
  const [priceTarget, setPriceTarget] = useState<{
    productName: string;
    variantId: string;
    variantTitle: string;
    currentPrice: number;
    originalPrice?: number | null;
  } | null>(null);

  const [stockTarget, setStockTarget] = useState<{
    productName: string;
    variantId: string;
    variantTitle: string;
    currentStock: number;
  } | null>(null);

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
    <div className="space-y-6 animate-in fade-in">
      {/* Header with PROMINENT "Add Product" button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-aquabark-dark tracking-tight">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your catalog, independent variants, and live inventory
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-aquabark-dark hover:bg-aquabark-darker text-white text-xs sm:text-sm font-bold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, strain, or SKU..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-white shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === "ALL"
                ? "bg-aquabark-dark text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            All Products ({products.length})
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
      </div>

      {/* CLEAN PRODUCT LISTING (Image, Product Name, Category, Price, Stock, Edit button) */}
      <div className="bg-white rounded-3xl border border-aquabark-border shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No products match your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProducts.map((prod) => {
              const minPrice = Math.min(...prod.variants.map((v) => v.price));
              const maxPrice = Math.max(...prod.variants.map((v) => v.price));
              const totalStock = prod.variants.reduce((sum, v) => sum + v.stock, 0);
              const hasLowStock = prod.variants.some((v) => v.stock <= 5);
              const isExpanded = expandedProduct === prod.id;

              return (
                <div key={prod.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Image, Name & Category */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {prod.images[0]?.imageUrl ? (
                        <img
                          src={prod.images[0].imageUrl}
                          alt={prod.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                            {prod.categoryName}
                          </span>
                        </div>
                        {prod.subtitle && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{prod.subtitle}</p>
                        )}
                        <span className="text-[11px] text-slate-500 font-medium">
                          {prod.variants.length} variant{prod.variants.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Price, Stock & Edit button */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Price */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Price
                        </span>
                        <span className="text-sm font-bold font-mono text-slate-800">
                          {minPrice === maxPrice
                            ? formatINR(minPrice)
                            : `${formatINR(minPrice)} – ${formatINR(maxPrice)}`}
                        </span>
                      </div>

                      {/* Stock */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Stock
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                              hasLowStock
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {totalStock} units
                          </span>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedProduct(isExpanded ? null : prod.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isExpanded
                            ? "bg-aquabark-dark text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isExpanded ? "Close" : "Edit Variants"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Variant Manager */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 animate-in fade-in">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Variant Pricing & Live Stock Control:
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {prod.variants.map((v) => (
                          <div
                            key={v.id}
                            className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-2">
                                <span>{v.title}</span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {v.sku}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Selling: <span className="font-bold font-mono">{formatINR(v.price)}</span>
                                {v.originalPrice && (
                                  <span className="line-through text-slate-400 ml-1.5">
                                    {formatINR(v.originalPrice)}
                                  </span>
                                )}
                                <span className="mx-2">•</span>
                                Stock:{" "}
                                <span
                                  className={`font-bold font-mono ${
                                    v.stock <= 5 ? "text-rose-600" : "text-slate-800"
                                  }`}
                                >
                                  {v.stock}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setPriceTarget({
                                    productName: prod.name,
                                    variantId: v.id,
                                    variantTitle: v.title,
                                    currentPrice: v.price,
                                    originalPrice: v.originalPrice,
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-aquabark-dark font-bold text-slate-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <IndianRupee className="w-3.5 h-3.5" />
                                <span>Edit Price</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setStockTarget({
                                    productName: prod.name,
                                    variantId: v.id,
                                    variantTitle: v.title,
                                    currentStock: v.stock,
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-aquabark-dark font-bold text-slate-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>Update Stock</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal with 5 Collapsible Sections */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onSuccess={handleProductCreated}
      />

      {/* Price Modal */}
      {priceTarget && (
        <PriceModal
          isOpen={true}
          onClose={() => setPriceTarget(null)}
          productName={priceTarget.productName}
          variantId={priceTarget.variantId}
          variantTitle={priceTarget.variantTitle}
          currentPrice={priceTarget.currentPrice}
          originalPrice={priceTarget.originalPrice}
          onSuccess={(newPrice) => handlePriceUpdated(priceTarget.variantId, newPrice)}
        />
      )}

      {/* Stock Modal */}
      {stockTarget && (
        <StockModal
          isOpen={true}
          onClose={() => setStockTarget(null)}
          productName={stockTarget.productName}
          variantId={stockTarget.variantId}
          variantTitle={stockTarget.variantTitle}
          currentStock={stockTarget.currentStock}
          onSuccess={(newStock) => handleStockUpdated(stockTarget.variantId, newStock)}
        />
      )}
    </div>
  );
}
