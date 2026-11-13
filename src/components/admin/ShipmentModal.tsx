"use client";

import { useState } from "react";
import { TransportMethod, OrderDTO } from "@/types";
import { dispatchOrderAction } from "@/actions/admin";
import {
  Bus,
  Train,
  Truck,
  MapPin,
  FileText,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface ShipmentModalProps {
  order: OrderDTO;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trackingNumber: string) => void;
}

export function ShipmentModal({ order, isOpen, onClose, onSuccess }: ShipmentModalProps) {
  const [method, setMethod] = useState<TransportMethod>(
    order.transitMethod || "BUS_PARCEL"
  );
  const [operator, setOperator] = useState(
    method === "BUS_PARCEL" ? "TSRTC Parcel Express" : "South Central Railway (SCR)"
  );
  const [departure, setDeparture] = useState("MGBS Hyderabad (Parcel Counter)");
  const [destination, setDestination] = useState(
    `${order.shippingAddress.city} Central Station/Stand`
  );
  const [receiptNumber, setReceiptNumber] = useState("");
  const [dispatchDate, setDispatchDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const busOperators = [
    "TSRTC Parcel Express",
    "APSRTC Garuda Parcel",
    "Orange Travels Logistics",
    "Morning Star Travels",
    "Kaveri Travels",
  ];

  const railOperators = [
    "South Central Railway (SCR)",
    "East Coast Railway (ECoR)",
    "Indian Railways Luggage/Parcel",
  ];

  const departurePresets = [
    "MGBS Hyderabad",
    "Jubilee Bus Station (JBS)",
    "PNBS Vijayawada",
    "Secunderabad Railway Parcel Office",
    "Kacheguda Railway Station",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operator.trim() || !destination.trim()) {
      setError("Please specify operator and destination station.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await dispatchOrderAction({
        orderId: order.id,
        transportMethod: method,
        operatorName: operator.trim(),
        departureLocation: departure.trim(),
        destinationStation: destination.trim(),
        parcelReceiptNumber: receiptNumber.trim() || undefined,
        dispatchDate,
        notes: notes.trim() || undefined,
      });

      if (!res.success || !res.trackingNumber) {
        setError(res.error || "Failed to create shipment tracking.");
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.trackingNumber);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error dispatching order.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-aquabark-border flex items-center justify-between bg-aquabark-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-aquabark-dark flex items-center justify-center text-white">
              {method === "BUS_PARCEL" ? (
                <Bus className="w-5 h-5" />
              ) : method === "RAILWAY_PARCEL" ? (
                <Train className="w-5 h-5" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">
                Dispatch Order #{order.orderNumber}
              </h3>
              <p className="text-xs text-aquabark-muted">
                Recipient: {order.customerName} ({order.shippingAddress.city})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Transport Method Segmented Control */}
          <div>
            <label className="block text-xs font-bold text-aquabark-dark uppercase tracking-wider mb-2">
              Transport Service
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod("BUS_PARCEL");
                  setOperator("TSRTC Parcel Express");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  method === "BUS_PARCEL"
                    ? "bg-aquabark-dark text-white border-aquabark-dark shadow-sm"
                    : "bg-white text-aquabark-muted border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Bus className="w-4 h-4" />
                <span>Bus Parcel (Fastest)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("RAILWAY_PARCEL");
                  setOperator("South Central Railway (SCR)");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  method === "RAILWAY_PARCEL"
                    ? "bg-aquabark-dark text-white border-aquabark-dark shadow-sm"
                    : "bg-white text-aquabark-muted border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Train className="w-4 h-4" />
                <span>Railway Parcel</span>
              </button>
            </div>
          </div>

          {/* Operator Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operator / Transporter Name *
            </label>
            <input
              type="text"
              required
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="e.g. TSRTC Parcel Express / APSRTC Garuda"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {(method === "BUS_PARCEL" ? busOperators : railOperators).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperator(op)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                    operator === op
                      ? "bg-aquabark-secondary text-aquabark-dark font-medium border-aquabark-primary"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* Departure Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Departure Station / Bus Stand
            </label>
            <input
              type="text"
              required
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {departurePresets.map((dep) => (
                <button
                  key={dep}
                  type="button"
                  onClick={() => setDeparture(dep)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                >
                  {dep}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Station */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Station / Parcel Office *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Vijayawada PNBS Parcel Counter"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
            </div>
          </div>

          {/* Parcel Receipt / LR Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Parcel Receipt / LR Number
              </label>
              <span className="text-[10px] text-aquabark-muted">Customer needs this to claim parcel</span>
            </div>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g. LR-APSRTC-99234"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono uppercase rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
            </div>
          </div>

          {/* Dispatch Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Date & Time
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="datetime-local"
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bus / Train / Driver Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bus #AP03Z1234, Driver ph: 9848..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
            </div>
          </div>

          {/* Automatic Tracking ID Generation preview note */}
          <div className="p-3 bg-aquabark-secondary/40 border border-aquabark-primary/30 rounded-2xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-aquabark-dark shrink-0 mt-0.5" />
            <div className="text-xs text-aquabark-dark">
              <span className="font-bold">Automatic Tracking ID: </span>
              A unique <span className="font-mono font-semibold">ABT-TRK-XXXXXX</span> code will be generated immediately for the customer to track live.
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Tracking & Dispatching...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm Dispatch & Mark SHIPPED</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
