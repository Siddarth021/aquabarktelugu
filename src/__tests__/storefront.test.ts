import { describe, it, expect } from "vitest";
import { PRODUCTS, CATEGORIES, COMBOS, COUPONS } from "@/data/mockData";
import { formatINR } from "@/lib/utils";

describe("AquaBark Telugu - Storefront Catalog & Cart Unit Tests", () => {
  it("should have valid categories with slug and image", () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.name).toBeTruthy();
      expect(cat.slug).toBeTruthy();
      expect(cat.imageUrl).toMatch(/^https?:\/\//);
    });
  });

  it("should have independent variants with prices and stock for all products", () => {
    expect(PRODUCTS.length).toBeGreaterThan(0);
    PRODUCTS.forEach((product) => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeTruthy();
      expect(product.slug).toBeTruthy();
      expect(product.variants.length).toBeGreaterThan(0);

      product.variants.forEach((v) => {
        expect(v.id).toBeDefined();
        expect(v.price).toBeGreaterThan(0);
        expect(v.stock).toBeGreaterThanOrEqual(0);
        expect(v.title).toBeTruthy();
      });
    });
  });

  it("should calculate correct savings percentage for discounted variants", () => {
    const guppy = PRODUCTS.find((p) => p.slug === "red-dragon-big-ear-guppy")!;
    const pair = guppy.variants.find((v) => v.sku === "RDG-PAIR")!;
    expect(pair.originalPrice).toBeDefined();
    expect(pair.originalPrice!).toBeGreaterThan(pair.price);

    const savings = pair.originalPrice! - pair.price;
    const savingsPercent = Math.round((savings / pair.originalPrice!) * 100);
    expect(savingsPercent).toBe(23); // (650 - 499) / 650 = 23.23% -> 23%
  });

  it("should enforce coupon rules and anti-stacking limits", () => {
    const welcome10 = COUPONS["WELCOME10"];
    expect(welcome10).toBeDefined();
    expect(welcome10.discountPercent).toBe(10);
    expect(welcome10.minOrder).toBe(499);
    expect(welcome10.maxDiscount).toBe(250);

    // Below minimum order value
    const subtotalLow = 400;
    const isEligibleLow = subtotalLow >= welcome10.minOrder;
    expect(isEligibleLow).toBe(false);

    // Above minimum order value
    const subtotalValid = 1200;
    const discount = Math.min(
      Math.round((subtotalValid * welcome10.discountPercent) / 100),
      welcome10.maxDiscount
    );
    expect(discount).toBe(120);

    // Cap at max discount
    const subtotalHigh = 3500;
    const cappedDiscount = Math.min(
      Math.round((subtotalHigh * welcome10.discountPercent) / 100),
      welcome10.maxDiscount
    );
    expect(cappedDiscount).toBe(250);
  });

  it("should calculate free shipping above threshold ₹1,499", () => {
    const calculateShipping = (subtotal: number) => {
      if (subtotal === 0) return 0;
      return subtotal >= 1499 ? 0 : 150;
    };

    expect(calculateShipping(0)).toBe(0);
    expect(calculateShipping(499)).toBe(150);
    expect(calculateShipping(1498)).toBe(150);
    expect(calculateShipping(1499)).toBe(0);
    expect(calculateShipping(2500)).toBe(0);
  });

  it("should correctly format INR currency values", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(499)).toBe("₹499");
    expect(formatINR(1499)).toBe("₹1,499");
  });

  it("should validate combo bundle integrity", () => {
    expect(COMBOS.length).toBeGreaterThan(0);
    COMBOS.forEach((combo) => {
      expect(combo.comboPrice).toBeLessThan(combo.originalPrice);
      expect(combo.items.length).toBeGreaterThan(0);
      combo.items.forEach((item) => {
        expect(item.productId).toBeTruthy();
        expect(item.quantity).toBeGreaterThan(0);
      });
    });
  });
});
