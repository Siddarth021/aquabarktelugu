"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function Accordion({ items, defaultOpenId }: { items: AccordionItem[]; defaultOpenId?: string }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || items[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y divide-aquabark-border border-y border-aquabark-border">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="py-4">
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between text-left group focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="font-serif font-bold text-aquabark-dark text-sm sm:text-base tracking-wide uppercase group-hover:text-aquabark-accent transition-colors">
                {item.title}
              </span>
              <div
                className={`w-8 h-8 rounded-full bg-aquabark-secondary/50 flex items-center justify-center text-aquabark-dark transition-transform duration-200 ${
                  isOpen ? "rotate-180 bg-aquabark-primary/40" : ""
                }`}
              >
                <ChevronDown className="w-4 h-4 stroke-[2]" />
              </div>
            </button>

            {isOpen && (
              <div className="pt-3 pb-1 text-xs sm:text-sm text-aquabark-muted leading-relaxed animate-fade-in">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

