"use server";

import { store } from "@/lib/store";
import { CategoryDTO, ProductDTO, ComboDTO, ProductReviewDTO } from "@/types";

export async function getCategoriesAction(): Promise<CategoryDTO[]> {
  return store.getCategories();
}

export async function getCategoryBySlugAction(slug: string): Promise<CategoryDTO | null> {
  return store.getCategoryBySlug(slug);
}

export async function getProductsAction(params?: {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
}): Promise<ProductDTO[]> {
  return store.getProducts(params);
}

export async function getProductBySlugAction(slug: string): Promise<ProductDTO | null> {
  return store.getProductBySlug(slug);
}

export async function getCombosAction(): Promise<ComboDTO[]> {
  return store.getCombos();
}

export async function getComboBySlugAction(slug: string): Promise<ComboDTO | null> {
  return store.getComboBySlug(slug);
}

export async function getProductReviewsAction(productId: string): Promise<ProductReviewDTO[]> {
  return store.getReviewsForProduct(productId);
}

export async function submitReviewAction(input: {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  imageUrls?: string[];
}): Promise<{
  success: boolean;
  review?: ProductReviewDTO;
  isVerifiedPurchase: boolean;
  error?: string;
}> {
  if (!input.productId || !input.comment || !input.customerName) {
    return {
      success: false,
      isVerifiedPurchase: false,
      error: "Product ID, comment, and your name are required",
    };
  }

  return store.createReview(input);
}
