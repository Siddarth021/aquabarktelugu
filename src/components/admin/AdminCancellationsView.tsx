"use client";

import { useState } from "react";
import { CancellationItem } from "@/lib/admin-store";
import { CancellationModal } from "@/components/admin/CancellationModal";
import { formatINR } from "@/lib/utils";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface AdminCancellationsViewProps {
  initialCancellations: CancellationItem[];
}

export function AdminCancellationsView({
  initialCancellations,
}: AdminCancellationsViewProps) {
  const [cancellations, setCancellations] = useState<CancellationItem[]>(
    initialCancellations
  );
  const [selectedRequest, setSelectedRequest] = useState<CancellationItem | null>(null);

  const handleUpdate = (updated: CancellationItem) => {
    setCancellations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-aquabark-dark">
          Cancellation Requests & Returns
        </h1>
        <p className="text-xs text-aquabark-muted">
          Review customer requests with atomic single-time stock restoration
        </p>
      </div>

      {/* Requests List */}
      {cancellations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-aquabark-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="font-bold text-slate-700 text-base">No pending cancellations</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All customer orders are currently active or processed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cancellations.map((req) => {
            const isRequested = req.status === "REQUESTED";
            const isApproved = req.status === "APPROVED";
            const cleanPhone = req.customerPhone.replace(/[^0-9]/g, "");

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-aquabark-border shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-aquabark-border/60 bg-aquabark-bg/40">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl text-white ${
                        isRequested
                          ? "bg-amber-500"
                          : isApproved
                          ? "bg-emerald-600"
                          : "bg-slate-500"
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-aquabark-dark text-sm sm:text-base">
                          Order #{req.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isRequested
                              ? "bg-amber-100 text-amber-800"
                              : isApproved
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-aquabark-muted">
                        Requested: {new Date(req.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Stock Restored badge */}
                  {req.isStockRestored && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Stock Restored (1x)</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Customer Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Customer</span>
                      <span className="text-sm font-bold text-aquabark-dark">
                        {req.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">{req.customerPhone}</span>
                      <a
                        href={`https://wa.me/91${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <span className="font-semibold text-slate-500 block">Reason:</span>
                    <p className="font-bold text-rose-800">&ldquo;{req.reason}&rdquo;</p>
                    {req.explanation && (
                      <p className="text-slate-600 italic">{req.explanation}</p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Order Items:
                    </span>
                    {req.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>
                          {it.quantity}x {it.productName} ({it.variantTitle})
                        </span>
                        <span className="font-mono">{formatINR(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Admin Response Note if resolved */}
                  {req.adminResponse && (
                    <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-slate-700">
                      <span className="font-semibold">Admin Response: </span>
                      <span>{req.adminResponse}</span>
                    </div>
                  )}

                  {/* Action button */}
                  {isRequested && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="w-full min-h-[44px] py-2.5 px-4 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Review & Decide (Approve / Reject)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRequest && (
        <CancellationModal
          cancellation={selectedRequest}
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          onSuccess={handleUpdate}
        />
      )}
    </div>
  );
}
