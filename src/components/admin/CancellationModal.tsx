"use client";

import { useState } from "react";
import { CancellationItem } from "@/lib/admin-store";
import { handleCancellationAction } from "@/actions/admin";
import { formatINR } from "@/lib/utils";
import {
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Phone,
  MessageCircle,
} from "lucide-react";

interface CancellationModalProps {
  cancellation: CancellationItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: CancellationItem) => void;
}

export function CancellationModal({
  cancellation,
  isOpen,
  onClose,
  onSuccess,
}: CancellationModalProps) {
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    setIsProcessing(true);
    setError(null);

    try {
      const res = await handleCancellationAction(cancellation.id, action, adminNote.trim() || undefined);
      if (!res.success) {
        setError(res.error || "Failed to process cancellation.");
        setIsProcessing(false);
        return;
      }

      onSuccess({
        ...cancellation,
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        adminResponse: adminNote.trim() || (action === "APPROVE" ? "Approved by admin" : "Rejected by admin"),
        isStockRestored: action === "APPROVE" ? true : cancellation.isStockRestored,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error processing cancellation.");
      setIsProcessing(false);
    }
  };

  const cleanPhone = cancellation.customerPhone.replace(/[^0-9]/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-aquabark-border flex items-center justify-between bg-aquabark-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">
                Cancellation Request #{cancellation.orderNumber}
              </h3>
              <p className="text-xs text-aquabark-muted">{cancellation.customerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer info & Reason */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Customer:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{cancellation.customerName}</span>
                <a
                  href={`https://wa.me/91${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  title="WhatsApp customer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-500 block mb-0.5">Stated Reason:</span>
              <p className="font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                &ldquo;{cancellation.reason}&rdquo;
              </p>
            </div>

            {cancellation.explanation && (
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Details:</span>
                <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-100">
                  {cancellation.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Items to be Restored */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-aquabark-dark mb-1.5 uppercase tracking-wider">
              <span>Items in this Order ({cancellation.items.length})</span>
              <span>Total: {formatINR(cancellation.totalAmount)}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 text-xs">
              {cancellation.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-slate-700">
                    <span className="font-bold text-aquabark-dark">{it.quantity}x</span>{" "}
                    {it.productName} ({it.variantTitle})
                  </span>
                  <span className="font-mono text-slate-600">{formatINR(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Restoration Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <Package className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automatic Single-Time Stock Restoration: </span>
              Approving will immediately return these items back to the live product inventory and mark the order as CANCELLED.
            </div>
          </div>

          {/* Admin response input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Note / Reason to Customer
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Cancellation approved. Razorpay refund initiated within 2-3 business days."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction("REJECT")}
              className="min-h-[46px] py-2.5 px-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Reject Request</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction("APPROVE")}
              className="min-h-[46px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Restore Stock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
