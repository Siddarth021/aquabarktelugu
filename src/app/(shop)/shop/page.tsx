import React, { Suspense } from "react";
import { PRODUCTS, CATEGORIES } from "@/data/mockData";
import { CatalogClient } from "@/components/shop/CatalogClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Aquarium Fish & Plants | AquaBark Telugu",
  description: "Browse the full catalog of acclimated exotic fish, rosetail bettas, guppy breeder pairs, aquatic flora, and starter combos.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-aquabark-muted">Loading live catalog...</div>}>
      <CatalogClient initialProducts={PRODUCTS} categories={CATEGORIES} />
    </Suspense>
  );
}

