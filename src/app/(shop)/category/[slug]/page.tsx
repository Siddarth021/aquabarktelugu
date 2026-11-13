import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { PRODUCTS, CATEGORIES } from "@/data/mockData";
import { CatalogClient } from "@/components/shop/CatalogClient";
import { Metadata } from "next";

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) return { title: "Category Not Found | AquaBark Telugu" };

  return {
    title: `${category.name} | AquaBark Telugu`,
    description: category.description || `Browse ${category.name} from AquaBark Telugu.`,
  };
}

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = CATEGORIES.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-aquabark-muted">Loading category...</div>}>
      <CatalogClient
        initialProducts={PRODUCTS}
        categories={CATEGORIES}
        defaultCategorySlug={category.slug}
      />
    </Suspense>
  );
}

