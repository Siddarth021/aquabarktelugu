"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const pathname = usePathname();

  // Strictly NEVER render WhatsApp floating button on admin pages
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const phone = "919490012345";
  const defaultMessage = encodeURIComponent(
    "Namaskaram! I am browsing AquaBark Telugu and would like details about live fish bus/train parcel dispatch to my location."
  );

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <a
        href={`https://wa.me/${phone}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-[#25D366]" />
      </a>
    </div>
  );
}
