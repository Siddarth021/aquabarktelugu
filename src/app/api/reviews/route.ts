import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let reviews;
    if (productId) {
      reviews = await store.getReviewsForProduct(productId);
    } else {
      reviews = await store.getAllReviews();
    }

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      rating,
      title,
      comment,
      customerName,
      customerPhone,
      customerEmail,
      imageUrls,
    } = body;

    if (!productId || !comment || !customerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: productId, comment, and customerName are required.",
        },
        { status: 400 }
      );
    }

    const numRating = Number(rating) || 5;
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5 stars." },
        { status: 400 }
      );
    }

    const result = await store.createReview({
      productId,
      rating: numRating,
      title,
      comment,
      customerName,
      customerPhone,
      customerEmail,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to submit review" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        review: result.review,
        isVerifiedPurchase: result.isVerifiedPurchase,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
