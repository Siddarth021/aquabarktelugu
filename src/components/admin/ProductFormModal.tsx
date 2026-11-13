"use client";

import { useState } from "react";
import { CategoryDTO, ProductDTO } from "@/types";
import { createProductAction } from "@/actions/admin";
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

interface VariantFormItem {
  title: string;
  sku: string;
  gender?: string;
  size?: string;
  plantPotType?: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDTO[];
  onSuccess: (newProduct: ProductDTO) => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: ProductFormModalProps) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [description, setDescription] = useState("");
  const [careGuide, setCareGuide] = useState(
    "Temp: 24-28°C | pH: 6.8 - 7.5 | Tank: 20L+ | Diet: Micro pellets / Live brine shrimp"
  );
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80"
  );
  const [requiresSpecialTransit, setRequiresSpecialTransit] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [minOrderQty, setMinOrderQty] = useState(1);
  const [maxOrderQty, setMaxOrderQty] = useState(10);

  const [variants, setVariants] = useState<VariantFormItem[]>([
    {
      title: "Male",
      sku: "GUP-M-01",
      gender: "Male",
      price: 180,
      originalPrice: 220,
      stock: 20,
    },
    {
      title: "Female",
      sku: "GUP-F-01",
      gender: "Female",
      price: 150,
      originalPrice: 190,
      stock: 25,
    },
    {
      title: "Breeding Pair (1M + 1F)",
      sku: "GUP-PAIR-01",
      gender: "Pair",
      price: 320,
      originalPrice: 400,
      stock: 12,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addVariantPreset = (label: string, genderVal?: string, potVal?: string, priceVal = 200) => {
    const skuCode = name ? name.slice(0, 3).toUpperCase() : "AQUA";
    setVariants((prev) => [
      ...prev,
      {
        title: label,
        sku: `${skuCode}-${label.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        gender: genderVal,
        plantPotType: potVal,
        price: priceVal,
        originalPrice: Math.round(priceVal * 1.25),
        stock: 15,
      },
    ]);
  };

  const updateVariant = (index: number, field: keyof VariantFormItem, val: unknown) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      setError("Product must have at least one variant.");
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || variants.length === 0) {
      setError("Please fill all required fields and provide at least one variant.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createProductAction({
        name: name.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || "Quality ornamental aquatic specimen from Telugu breeders.",
        careGuide: careGuide.trim() || undefined,
        categoryId,
        isActive: true,
        isFeatured,
        requiresSpecialTransit,
        minOrderQty,
        maxOrderQty,
        imageUrl: imageUrl.trim(),
        variants: variants.map((v) => ({
          title: v.title,
          sku: v.sku,
          gender: v.gender,
          size: v.size,
          plantPotType: v.plantPotType,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
          stock: Number(v.stock),
        })),
      });

      if (!res.success || !res.product) {
        setError(res.error || "Failed to create product.");
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.product);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving product.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-aquabark-border flex items-center justify-between bg-aquabark-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-aquabark-dark flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">Add New Product</h3>
              <p className="text-xs text-aquabark-muted">With Independent Variants & Stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Red Dragon Dumbo Ear Guppy"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subtitle / Line Strain
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. High Grade Livebearer | Pure Line Strain"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vibrant colors, active temperament, acclimated to local water conditions..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          {/* Care Guide */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Care & Transit Guide (Water temp, pH, tank size, diet)
            </label>
            <input
              type="text"
              value={careGuide}
              onChange={(e) => setCareGuide(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          {/* Image URL with preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
              {imageUrl && (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Flags */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresSpecialTransit}
                onChange={(e) => setRequiresSpecialTransit(e.target.checked)}
                className="w-4 h-4 rounded text-aquabark-dark"
              />
              <span className="font-semibold text-slate-700">Special Live Transit (Fish)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-aquabark-dark"
              />
              <span className="font-semibold text-slate-700">Featured on Homepage</span>
            </label>
          </div>

          {/* Dynamic Variants Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-aquabark-dark uppercase tracking-wider block">
                  Product Variants & Pricing
                </span>
                <span className="text-[11px] text-slate-400">
                  Each variant has its own price, SKU & live inventory
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[10px] text-slate-500 font-medium">Add Quick:</span>
              <button
                type="button"
                onClick={() => addVariantPreset("Male", "Male", undefined, 180)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
              >
                + Male
              </button>
              <button
                type="button"
                onClick={() => addVariantPreset("Female", "Female", undefined, 150)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100"
              >
                + Female
              </button>
              <button
                type="button"
                onClick={() => addVariantPreset("Pair (1M + 1F)", "Pair", undefined, 320)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
              >
                + Pair
              </button>
              <button
                type="button"
                onClick={() => addVariantPreset("Trio (1M + 2F)", "Trio", undefined, 450)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
              >
                + Trio
              </button>
              <button
                type="button"
                onClick={() => addVariantPreset("2-inch Pot", undefined, "2-inch Pot", 280)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              >
                + Pot
              </button>
            </div>

            {/* Variant Cards List */}
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-aquabark-dark bg-slate-100 px-2 py-0.5 rounded-md">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Variant Title (e.g. Male / 2-inch Pot)"
                      value={v.title}
                      onChange={(e) => updateVariant(idx, "title", e.target.value)}
                      className="flex-1 text-xs font-bold text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Price (₹)</span>
                      <input
                        type="number"
                        min="1"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, "price", e.target.value)}
                        className="w-full px-2 py-1 font-semibold rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Original ₹</span>
                      <input
                        type="number"
                        min="0"
                        value={v.originalPrice || ""}
                        onChange={(e) => updateVariant(idx, "originalPrice", e.target.value)}
                        className="w-full px-2 py-1 text-slate-600 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Stock</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                        className="w-full px-2 py-1 font-bold text-aquabark-dark rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SKU</span>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                        className="w-full px-2 py-1 text-[11px] font-mono rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 pb-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving Product...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Publish Product to Catalog</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
