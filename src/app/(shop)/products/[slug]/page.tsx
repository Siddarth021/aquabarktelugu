import React from "react";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/mockData";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import { Metadata } from "next";

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return { title: "Product Not Found | AquaBark Telugu" };

  return {
    title: `${product.name} | AquaBark Telugu`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0]?.imageUrl ? [product.images[0].imageUrl] : [],
    },
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const related = PRODUCTS.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId
  );

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={related.length > 0 ? related : PRODUCTS.filter((p) => p.id !== product.id)}
    />
  );
}

