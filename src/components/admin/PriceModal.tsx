"use client";

import { useState } from "react";
import { updateVariantPriceAction } from "@/actions/admin";
import { formatINR } from "@/lib/utils";
import { IndianRupee, X, Check, TrendingUp, AlertCircle } from "lucide-react";

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variantId: string;
  variantTitle: string;
  currentPrice: number;
  originalPrice?: number | null;
  onSuccess: (newPrice: number) => void;
}

export function PriceModal({
  isOpen,
  onClose,
  productName,
  variantId,
  variantTitle,
  currentPrice,
  originalPrice,
  onSuccess,
}: PriceModalProps) {
  const [priceInput, setPriceInput] = useState(currentPrice.toString());
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numericPrice = parseFloat(priceInput) || 0;
  const difference = numericPrice - currentPrice;

  const quickAdjust = (delta: number) => {
    const updated = Math.max(1, numericPrice + delta);
    setPriceInput(updated.toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericPrice <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await updateVariantPriceAction(variantId, numericPrice, reason.trim() || undefined);
      if (!res.success) {
        setError(res.error || "Failed to update price.");
        setIsSubmitting(false);
        return;
      }

      onSuccess(numericPrice);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error updating price.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-aquabark-border flex items-center justify-between bg-aquabark-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-aquabark-dark flex items-center justify-center text-white">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">Edit Dynamic Price</h3>
              <p className="text-xs text-aquabark-muted truncate max-w-[240px]">
                {productName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Variant Label */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Selected Variant</span>
            <span className="text-xs font-bold text-aquabark-dark bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {variantTitle}
            </span>
          </div>

          {/* Price Input & Quick Adjusters */}
          <div>
            <label className="block text-xs font-bold text-aquabark-dark uppercase tracking-wider mb-1.5">
              Live Selling Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-2xl font-bold text-aquabark-dark rounded-2xl border-2 border-slate-200 focus:border-aquabark-dark focus:outline-hidden"
              />
            </div>

            {/* Quick Adjustment Pills */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-aquabark-muted mr-1">Quick:</span>
              {[-50, -20, -10, 10, 20, 50].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => quickAdjust(delta)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                    delta > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          {/* Price Delta Feedback */}
          <div className="p-3 rounded-2xl bg-aquabark-secondary/30 border border-aquabark-primary/40 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-500">Current: </span>
              <span className="font-semibold text-slate-700">{formatINR(currentPrice)}</span>
              {originalPrice && (
                <span className="text-[11px] text-slate-400 line-through ml-1.5">
                  {formatINR(originalPrice)}
                </span>
              )}
            </div>
            <div className="text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {difference === 0 ? (
                <span className="text-slate-600">No change</span>
              ) : difference > 0 ? (
                <span className="text-emerald-700">+{formatINR(difference)}</span>
              ) : (
                <span className="text-rose-600">-{formatINR(Math.abs(difference))}</span>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Price Change Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Festival offer, seasonal breeder discount"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving New Price...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Update Price Now</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-aquabark-muted mt-2">
              * Immediately updates catalog & future purchases. Existing confirmed orders retain their snapshot price.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
