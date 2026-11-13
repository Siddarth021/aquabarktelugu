"use client";

import { useState } from "react";
import { updateVariantStockAction } from "@/actions/admin";
import { Package, X, Check, Plus, Minus, AlertTriangle, AlertCircle } from "lucide-react";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variantId: string;
  variantTitle: string;
  currentStock: number;
  onSuccess: (newStock: number) => void;
}

export function StockModal({
  isOpen,
  onClose,
  productName,
  variantId,
  variantTitle,
  currentStock,
  onSuccess,
}: StockModalProps) {
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState("Restock from breeder / farm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resultingStock = currentStock + delta;

  const reasons = [
    "Restock from breeder / farm",
    "Customer offline studio sale",
    "Mortality / Transit loss",
    "Inventory recount & audit",
    "Defective / quarantine hold",
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delta === 0) {
      setError("Please adjust the stock quantity before saving.");
      return;
    }

    if (resultingStock < 0) {
      setError("Remaining stock cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await updateVariantStockAction(variantId, delta, reason);
      if (!res.success || res.newStock === undefined) {
        setError(res.error || "Failed to update stock.");
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.newStock);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error updating stock.");
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
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">Adjust Inventory</h3>
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

          {/* Current Stock Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">Variant</span>
              <span className="font-bold text-aquabark-dark text-sm">{variantTitle}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Current Stock</span>
              <span
                className={`text-base font-extrabold ${
                  currentStock <= 5 ? "text-rose-600" : "text-slate-800"
                }`}
              >
                {currentStock} units
              </span>
            </div>
          </div>

          {/* Stepper & Counter */}
          <div className="p-4 rounded-2xl border-2 border-slate-200 bg-aquabark-bg/40 text-center space-y-3">
            <label className="text-xs font-bold text-aquabark-dark uppercase tracking-wider block">
              Stock Adjustment
            </label>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setDelta((prev) => prev - 1)}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="w-24 text-center">
                <span
                  className={`text-3xl font-extrabold font-mono ${
                    delta > 0
                      ? "text-emerald-700"
                      : delta < 0
                      ? "text-rose-700"
                      : "text-slate-400"
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
                <span className="block text-[11px] text-slate-400">units delta</span>
              </div>

              <button
                type="button"
                onClick={() => setDelta((prev) => prev + 1)}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Adjustment Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {[-10, -5, -1, 1, 5, 10, 25].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDelta((prev) => prev + val)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                    val > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDelta(0)}
                className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
              >
                Reset
              </button>
            </div>

            {/* Resulting stock preview */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">New Stock after save:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-lg ${
                  resultingStock <= 0
                    ? "bg-rose-100 text-rose-800"
                    : resultingStock <= 5
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {resultingStock} units
              </span>
            </div>
          </div>

          {/* Reason Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Adjustment *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || delta === 0}
              className="w-full py-3.5 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Updating Inventory...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Confirm Stock Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
