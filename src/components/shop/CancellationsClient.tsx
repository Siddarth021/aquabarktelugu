"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  XCircle, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Loader2
} from "lucide-react";
import { requestCancellationAction } from "@/actions/cancellations";

export function CancellationsClient() {
  const searchParams = useSearchParams();
  const prefillOrderId = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(prefillOrderId);
  const [reason, setReason] = useState("Ordered incorrect pair/variant");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cancellationRequests, setCancellationRequests] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("aquabark_cancellations") || "[]");
      setCancellationRequests(saved);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("Please provide an Order ID / Number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await requestCancellationAction(orderId.trim(), reason, explanation);
      if (res.success) {
        setSuccess(true);
        const newReq = res.cancellationRequest || {
          id: `req-${Date.now()}`,
          orderId: orderId.trim(),
          reason,
          explanation,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        };

        const updated = [newReq, ...cancellationRequests];
        setCancellationRequests(updated);
        localStorage.setItem("aquabark_cancellations", JSON.stringify(updated));
      } else {
        setError(res.error || "Unable to submit cancellation request");
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-aquabark-bg min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-aquabark-dark hover:text-aquabark-accent mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>

        {/* Title */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest font-bold text-aquabark-terracotta block mb-1">
            Order Support
          </span>
          <h1 className="font-serif text-3xl font-bold text-aquabark-dark">
            Cancellation & Refund Requests
          </h1>
          <p className="text-xs text-aquabark-muted mt-1">
            Orders can be cancelled prior to oxygen packing and bus cargo departure with zero penalty.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-aquabark-border shadow-soft p-6 sm:p-8 mb-10">
          <div className="flex items-center gap-3 pb-4 border-b border-aquabark-border mb-6">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-aquabark-dark">
                Submit New Cancellation Request
              </h2>
              <p className="text-xs text-aquabark-muted">
                Fast review by dispatch desk. Approved refunds are credited to original payment source.
              </p>
            </div>
          </div>

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-lg font-bold">Request Submitted Successfully</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Your cancellation request for order <strong>{orderId}</strong> has been logged. Our dispatch desk will process it and release your reserved livestock back into farm inventory.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setOrderId("");
                  setExplanation("");
                }}
                className="mt-2 text-xs font-bold underline text-emerald-950"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                  Order Number / Order ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABT-2026-849201"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                  Reason for Cancellation *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                >
                  <option value="Ordered incorrect pair/variant">Ordered incorrect pair / strain variant</option>
                  <option value="Traveling away / unable to pickup from bus counter">Traveling away / unable to pickup from bus counter</option>
                  <option value="Need to change delivery address / station">Need to change delivery address / station</option>
                  <option value="Aquarium water parameters not ready">Aquarium tank water parameters not yet ready</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                  Additional Details / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional details for our dispatch desk..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Policy Notice:</strong> Orders that have already been dispatched on the evening bus/train cannot be recalled while in transit. For assistance with in-transit parcels, please contact our helpline on WhatsApp.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full shadow-soft flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Cancellation...</span>
                  </>
                ) : (
                  <span>SUBMIT CANCELLATION REQUEST</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Existing Requests */}
        {cancellationRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-aquabark-dark">
              Your Cancellation History
            </h3>
            <div className="space-y-3">
              {cancellationRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-white border border-aquabark-border shadow-soft flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-aquabark-dark block">
                      Order #{req.orderId}
                    </span>
                    <span className="text-aquabark-muted">{req.reason}</span>
                    {req.adminResponseNote && (
                      <p className="text-emerald-800 font-medium mt-1">
                        Admin Note: {req.adminResponseNote}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-bold text-[10px] ${
                        req.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-[10px] text-aquabark-muted block mt-1">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN") : "Recent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

