import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { CategoryDTO } from "@/types";

export function CategoryCard({ category }: { category: CategoryDTO }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative block overflow-hidden rounded-3xl bg-white border border-aquabark-border shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1.5"
    >
      {/* Category Image Container */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-aquabark-secondary/30">
        <Image
          src={category.imageUrl || "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80"}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      {/* Content & Floating Bottom Arrow Button */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between">
        <div className="text-white drop-shadow-sm pr-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-aquabark-primary block mb-1">
            Collection
          </span>
          <h3 className="font-serif text-2xl font-bold leading-tight group-hover:text-aquabark-primary transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-white/80 line-clamp-1 mt-1 max-w-[220px]">
              {category.description}
            </p>
          )}
        </div>

        {/* Circular Action Arrow Button */}
        <div className="w-12 h-12 rounded-full bg-white/90 text-aquabark-dark flex items-center justify-center shadow-lg group-hover:bg-aquabark-dark group-hover:text-white transition-all duration-300 group-hover:rotate-45 flex-shrink-0">
          <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>
    </Link>
  );
}

