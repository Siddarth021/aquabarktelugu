"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(true);

  const phone = "919490012345";
  const defaultMessage = encodeURIComponent(
    "Namaskaram! I am browsing AquaBark Telugu and would like details about live fish bus/train parcel dispatch to my location."
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="bg-white border border-aquabark-border shadow-card rounded-2xl p-3 max-w-[240px] text-xs relative animate-bounce">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -right-1.5 bg-gray-100 rounded-full p-0.5 text-gray-500 hover:text-black"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="font-bold text-aquabark-dark">Need Live Transit Advice?</p>
          <p className="text-aquabark-muted text-[11px] mt-0.5">
            Chat with our breeder team on WhatsApp for Andhra & Telangana parcel timings!
          </p>
        </div>
      )}

      {/* Floating button */}
      <a
        href={`https://wa.me/${phone}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all group relative"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
      </a>
    </div>
  );
}

