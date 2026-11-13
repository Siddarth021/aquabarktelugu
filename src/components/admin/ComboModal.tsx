"use client";

import { useState } from "react";
import { ProductDTO, ComboDTO } from "@/types";
import { createComboAction } from "@/actions/admin";
import { formatINR } from "@/lib/utils";
import { X, Sparkles, Plus, Trash2, Check, AlertCircle, Percent } from "lucide-react";

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductDTO[];
  onSuccess: (newCombo: ComboDTO) => void;
}

interface SelectedComboItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export function ComboModal({ isOpen, onClose, products, onSuccess }: ComboModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=80"
  );
  const [comboPriceInput, setComboPriceInput] = useState("");
  const [stockLimitInput, setStockLimitInput] = useState("10");

  const [selectedItems, setSelectedItems] = useState<SelectedComboItem[]>([
    {
      productId: products[0]?.id || "",
      variantId: products[0]?.variants[0]?.id || "",
      quantity: 1,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate sum of original prices
  let computedOriginalPrice = 0;
  for (const item of selectedItems) {
    const prod = products.find((p) => p.id === item.productId);
    const variant = prod?.variants.find((v) => v.id === item.variantId);
    if (variant) {
      computedOriginalPrice += variant.price * item.quantity;
    }
  }

  const numericComboPrice = parseFloat(comboPriceInput) || 0;
  const savings = computedOriginalPrice - numericComboPrice;
  const savingsPercent =
    computedOriginalPrice > 0 ? Math.round((savings / computedOriginalPrice) * 100) : 0;

  const addItemRow = () => {
    setSelectedItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id || "",
        variantId: products[0]?.variants[0]?.id || "",
        quantity: 1,
      },
    ]);
  };

  const updateItemRow = (
    index: number,
    field: keyof SelectedComboItem,
    val: string | number
  ) => {
    setSelectedItems((prev) => {
      const copy = [...prev];
      if (field === "productId") {
        const prod = products.find((p) => p.id === val);
        copy[index] = {
          productId: val as string,
          variantId: prod?.variants[0]?.id || "",
          quantity: copy[index].quantity,
        };
      } else {
        copy[index] = { ...copy[index], [field]: val };
      }
      return copy;
    });
  };

  const removeItemRow = (index: number) => {
    if (selectedItems.length <= 1) {
      setError("A combo bundle must have at least one product item.");
      return;
    }
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numericComboPrice <= 0 || selectedItems.length === 0) {
      setError("Please enter a title, valid combo price, and bundle items.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createComboAction({
        title: title.trim(),
        description: description.trim() || "Exclusive curated bundle pack with live arrival guarantee.",
        imageUrl: imageUrl.trim() || undefined,
        comboPrice: numericComboPrice,
        originalPrice: computedOriginalPrice,
        stockLimit: stockLimitInput ? parseInt(stockLimitInput) : undefined,
        items: selectedItems,
      });

      if (!res.success || !res.combo) {
        setError(res.error || "Failed to create combo.");
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.combo);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating combo offer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="px-5 py-4 border-b border-aquabark-border flex items-center justify-between bg-aquabark-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-aquabark-dark flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">Create Combo Offer</h3>
              <p className="text-xs text-aquabark-muted">Bundle products with instant discount</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Combo Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Planted Nano Aquarium Starter Pack"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this bundle great for aquarium keepers..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          {/* Bundle Items Builder */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-aquabark-dark uppercase tracking-wider">
                Bundled Products & Variants
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-semibold text-aquabark-dark hover:text-aquabark-darker flex items-center gap-1 bg-aquabark-secondary/60 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItemRow(idx, "productId", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={item.variantId}
                        onChange={(e) => updateItemRow(idx, "variantId", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        {prod?.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.title} — {formatINR(v.price)} (Stock: {v.stock})
                          </option>
                        ))}
                      </select>

                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemRow(idx, "quantity", parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2 py-1.5 text-center font-bold rounded-lg border border-slate-200 bg-white"
                          title="Quantity"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Savings calculation */}
          <div className="p-4 bg-aquabark-secondary/30 rounded-2xl border border-aquabark-primary/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Calculated Original Value:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {formatINR(computedOriginalPrice)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-aquabark-dark mb-1">
                  Combo Special Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={comboPriceInput}
                    onChange={(e) => setComboPriceInput(e.target.value)}
                    placeholder="e.g. 699"
                    className="w-full pl-7 pr-3 py-2 font-bold text-base text-aquabark-dark rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Limit (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockLimitInput}
                  onChange={(e) => setStockLimitInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            {numericComboPrice > 0 && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-aquabark-primary/30">
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  <span>Customer Savings:</span>
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                  {formatINR(savings)} ({savingsPercent}% OFF)
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing Combo...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Publish Combo Offer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
