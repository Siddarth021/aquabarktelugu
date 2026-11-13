"use client";

import { useState } from "react";
import { CategoryDTO, ProductDTO } from "@/types";
import { createProductAction } from "@/actions/admin";
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Info,
  Layers,
  Package,
  ShieldCheck,
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
  // Collapsible section toggles
  const [openSections, setOpenSections] = useState({
    basic: true,
    images: true,
    variants: true,
    inventory: false,
    availability: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Form states
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
  const [isActive, setIsActive] = useState(true);
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
      setError("Please fill required fields and provide at least one variant.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createProductAction({
        name: name.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || "Quality ornamental aquatic specimen.",
        careGuide: careGuide.trim() || undefined,
        categoryId,
        isActive,
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
        <div className="px-6 py-4 border-b border-aquabark-border flex items-center justify-between bg-aquabark-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-aquabark-dark flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">Add Product</h3>
              <p className="text-xs text-slate-500">Organized in clean collapsible sections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. SECTION: BASIC INFO */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleSection("basic")}
              className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-aquabark-dark" />
                <span>1. Basic Info</span>
              </div>
              {openSections.basic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.basic && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Red Dragon Dumbo Guppy"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subtitle / Strain Details
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Show-Grade Big Ear Strain | Active Swimmers"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Exotic specimen bred in clean conditions, acclimated to local waters..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Care & Acclimation Guide
                  </label>
                  <input
                    type="text"
                    value={careGuide}
                    onChange={(e) => setCareGuide(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. SECTION: IMAGES */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleSection("images")}
              className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-aquabark-dark" />
                <span>2. Images</span>
              </div>
              {openSections.images ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.images && (
              <div className="p-4 space-y-2">
                <label className="block font-semibold text-slate-700">
                  Primary Image URL
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
                  />
                  {imageUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. SECTION: VARIANTS & PRICING */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleSection("variants")}
              className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-aquabark-dark" />
                <span>3. Variants & Pricing ({variants.length})</span>
              </div>
              {openSections.variants ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.variants && (
              <div className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Quick Add:</span>
                  <button
                    type="button"
                    onClick={() => addVariantPreset("Pair", "Pair", undefined, 320)}
                    className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                  >
                    + Pair
                  </button>
                  <button
                    type="button"
                    onClick={() => addVariantPreset("Trio", "Trio", undefined, 450)}
                    className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-semibold"
                  >
                    + Trio
                  </button>
                  <button
                    type="button"
                    onClick={() => addVariantPreset("2-inch Pot", undefined, "2-inch Pot", 280)}
                    className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                  >
                    + Pot
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                        <input
                          type="text"
                          value={v.title}
                          onChange={(e) => updateVariant(idx, "title", e.target.value)}
                          placeholder="Variant Title (e.g. Male)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Selling Price (₹)</span>
                          <input
                            type="number"
                            min="1"
                            value={v.price}
                            onChange={(e) => updateVariant(idx, "price", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Original Price (₹)</span>
                          <input
                            type="number"
                            value={v.originalPrice || ""}
                            onChange={(e) => updateVariant(idx, "originalPrice", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Stock Qty</span>
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">SKU</span>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. SECTION: INVENTORY LIMITS */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleSection("inventory")}
              className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-aquabark-dark" />
                <span>4. Order Limits & Inventory Controls</span>
              </div>
              {openSections.inventory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.inventory && (
              <div className="p-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Min Order Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minOrderQty}
                    onChange={(e) => setMinOrderQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Order Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxOrderQty}
                    onChange={(e) => setMaxOrderQty(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. SECTION: AVAILABILITY & TRANSIT */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleSection("availability")}
              className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-aquabark-dark" />
                <span>5. Availability & Special Transit</span>
              </div>
              {openSections.availability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.availability && (
              <div className="p-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-aquabark-dark"
                  />
                  <span>Product is Active (Visible on storefront)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={requiresSpecialTransit}
                    onChange={(e) => setRequiresSpecialTransit(e.target.checked)}
                    className="w-4 h-4 rounded text-aquabark-dark"
                  />
                  <span>Requires Special Live Transit (Oxygen pack & thermocol insulation)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-aquabark-dark"
                  />
                  <span>Feature on Homepage Showcase</span>
                </label>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing Product...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Save & Publish Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
