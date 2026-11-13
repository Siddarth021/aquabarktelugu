import React from "react";
import { CheckCircle2, Clock, Truck, Package, Bus, Train, AlertCircle } from "lucide-react";
import { OrderDTO, TransportMethod } from "@/types";

export function TrackingTimeline({ order }: { order: OrderDTO }) {
  const shipment = order.shipment;
  const isBus = order.transitMethod === "BUS_PARCEL" || shipment?.transportMethod === "BUS_PARCEL";
  const isTrain = order.transitMethod === "RAILWAY_PARCEL" || shipment?.transportMethod === "RAILWAY_PARCEL";

  // Stages
  const steps = [
    {
      title: "Order Placed & Confirmed",
      desc: "Live order confirmed and reserved in aquaculture farm tanks.",
      status: "COMPLETED",
      time: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Day 1",
    },
    {
      title: "Conditioning & Oxygen Packaging",
      desc: "Fish conditioned without feed for 12 hours, packed in medical pure oxygen.",
      status: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].includes(order.status)
        ? "COMPLETED"
        : "CURRENT",
      time: "Farm Hub",
    },
    {
      title: "Dispatched from Farm Hub",
      desc: shipment
        ? `Loaded onto ${shipment.operatorName} from ${shipment.departureLocation}`
        : "Pending dispatch schedule",
      status: ["SHIPPED", "DELIVERED"].includes(order.status)
        ? "COMPLETED"
        : order.status === "PREPARING"
        ? "CURRENT"
        : "PENDING",
      time: shipment?.dispatchDate ? new Date(shipment.dispatchDate).toLocaleDateString("en-IN") : "In Schedule",
    },
    {
      title: isBus ? "In Transit on Bus Cargo" : isTrain ? "In Transit on Train Cargo" : "In Courier Transit",
      desc: shipment?.destinationStation
        ? `En route to ${shipment.destinationStation} counter.`
        : "En route to destination parcel office.",
      status: ["SHIPPED", "DELIVERED"].includes(order.status)
        ? order.status === "DELIVERED"
          ? "COMPLETED"
          : "CURRENT"
        : "PENDING",
      time: "Overnight Cargo",
    },
    {
      title: "Arrived at Station Counter / Handed Over",
      desc: isBus
        ? "Ready for customer collection at RTC Bus Parcel Counter."
        : isTrain
        ? "Ready for pickup at Railway Parcel Office with Photo ID."
        : "Delivered to recipient address.",
      status: order.status === "DELIVERED" ? "COMPLETED" : "PENDING",
      time: shipment?.expectedArrivalDate ? new Date(shipment.expectedArrivalDate).toLocaleDateString("en-IN") : "Estimated 12-24h",
    },
  ];

  return (
    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-aquabark-border">
      {steps.map((step, idx) => {
        const isCompleted = step.status === "COMPLETED";
        const isCurrent = step.status === "CURRENT";

        return (
          <div key={idx} className="relative flex items-start gap-4">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-xs z-10 transition-transform ${
                isCompleted
                  ? "bg-emerald-600 ring-4 ring-emerald-100"
                  : isCurrent
                  ? "bg-aquabark-terracotta ring-4 ring-amber-100 animate-pulse"
                  : "bg-gray-300 ring-4 ring-gray-100 text-gray-500"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isCurrent ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 bg-white p-4 rounded-2xl border border-aquabark-border shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <h4
                  className={`font-serif font-bold text-sm sm:text-base ${
                    isCompleted
                      ? "text-aquabark-dark"
                      : isCurrent
                      ? "text-aquabark-terracotta"
                      : "text-aquabark-muted"
                  }`}
                >
                  {step.title}
                </h4>
                <span className="text-[11px] font-semibold text-aquabark-muted">
                  {step.time}
                </span>
              </div>
              <p className="text-xs text-aquabark-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

