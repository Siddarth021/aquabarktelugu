import { describe, it, expect, beforeEach } from "vitest";
import { store } from "@/lib/store";
import {
  calculateCheckoutPricingAction,
  validateCouponAction,
  updateDynamicPriceAction,
  getPromotionsAction,
} from "@/actions/pricing";
import { createOrderAction } from "@/actions/orders";

describe("Pricing, Combos & Dynamic Pricing Verification", () => {
  const adminSecret = "aquabark-telugu-secure-setup-2026";

  beforeEach(() => {
    process.env.ADMIN_BOOTSTRAP_SECRET = adminSecret;
  });

  describe("1. Dynamic Pricing & Price Audit Integrity", () => {
    it("dynamically updates price for future checkouts while keeping existing order price snapshot immutable", async () => {
      // Pick variant var-spf-single (sponge filter single)
      const variant = await store.getVariantById("var-spf-single");
      expect(variant).toBeDefined();
      const initialPrice = variant!.price;

      // Place Order #1 at initial price
      const orderRes = await createOrderAction({
        customerName: "Dynamic Price Customer",
        customerPhone: "+919848011223",
        shippingAddress: {
          recipientName: "Dynamic Price Customer",
          phone: "+919848011223",
          street: "Main Bazar",
          city: "Rajahmundry",
          state: "Andhra Pradesh",
          postalCode: "533101",
        },
        transitMethod: "BUS_PARCEL",
        cartItems: [{ variantId: "var-spf-single", quantity: 2 }],
      });

      expect(orderRes.success).toBe(true);
      const order1 = orderRes.order!;
      const itemSnapshot1 = order1.items.find((i) => i.variantId === "var-spf-single");
      expect(itemSnapshot1?.priceSnapshot).toBe(initialPrice);
      expect(itemSnapshot1?.totalSnapshot).toBe(initialPrice * 2);

      // Admin updates variant price dynamically (+ ₹60)
      const newPrice = initialPrice + 60;
      const updateRes = await updateDynamicPriceAction(
        "var-spf-single",
        newPrice,
        "Import tariff and raw ingredient price hike",
        adminSecret
      );
      expect(updateRes.success).toBe(true);
      expect(updateRes.variant?.price).toBe(newPrice);

      // Verify variant updated in catalog store
      const updatedVariant = await store.getVariantById("var-spf-single");
      expect(updatedVariant?.price).toBe(newPrice);

      // Future checkout calculation must reflect the NEW price
      const futurePricing = await calculateCheckoutPricingAction(
        [{ variantId: "var-spf-single", quantity: 2 }],
        undefined,
        "BUS_PARCEL"
      );
      expect(futurePricing.subtotal).toBe(newPrice * 2);

      // INVARIANT: Historical Order #1 snapshot MUST REMAIN UNTOUCHED!
      const historicalOrder = await store.getOrderById(order1.id);
      const historicalItem = historicalOrder?.items.find((i) => i.variantId === "var-spf-single");
      expect(historicalItem?.priceSnapshot).toBe(initialPrice);
      expect(historicalItem?.totalSnapshot).toBe(initialPrice * 2);

      // Revert price back to initial
      await updateDynamicPriceAction("var-spf-single", initialPrice, "Test teardown revert", adminSecret);
    });

    it("rejects invalid, zero, or negative dynamic price updates", async () => {
      const resZero = await updateDynamicPriceAction("var-spf-single", 0, "Zero test", adminSecret);
      expect(resZero.success).toBe(false);
      expect(resZero.error).toMatch(/greater than zero/i);

      const resNegative = await updateDynamicPriceAction("var-spf-single", -150, "Negative test", adminSecret);
      expect(resNegative.success).toBe(false);
      expect(resNegative.error).toMatch(/greater than zero/i);
    });
  });

  describe("2. Combo Discounts & Multi-Item Bundles", () => {
    it("validates combo discounts, savings calculations, and item listings", async () => {
      const combos = await store.getCombos();
      expect(combos.length).toBeGreaterThan(0);

      for (const combo of combos) {
        expect(combo.title).toBeDefined();
        expect(combo.comboPrice).toBeGreaterThan(0);
        expect(combo.originalPrice).toBeGreaterThanOrEqual(combo.comboPrice);
        expect(combo.items.length).toBeGreaterThan(0);

        // Verify underlying variants for combo items exist
        for (const item of combo.items) {
          const variant = await store.getVariantById(item.variantId);
          expect(variant).toBeDefined();
          expect(item.quantity).toBeGreaterThan(0);
        }

        // Verify savings calculation
        const savings = combo.originalPrice - combo.comboPrice;
        expect(savings).toBeGreaterThanOrEqual(0);
      }
    });

    it("calculates checkout pricing for combo constituent items accurately", async () => {
      const beginnerCombo = (await store.getCombos()).find((c) => c.slug === "beginner-aquarium-combo");
      expect(beginnerCombo).toBeDefined();

      const cartLines = beginnerCombo!.items.map((it) => ({
        variantId: it.variantId,
        quantity: it.quantity,
      }));

      const pricing = await calculateCheckoutPricingAction(cartLines, undefined, "BUS_PARCEL");
      expect(pricing.subtotal).toBeGreaterThan(0);
      expect(pricing.totalAmount).toBe(pricing.subtotal + pricing.shippingFee);
    });
  });

  describe("3. Promotion & Coupon Rules with Anti-Stacking", () => {
    it("applies WELCOME10 coupon correctly when subtotal satisfies min order value", async () => {
      // WELCOME10 gives 10% discount, minOrder is ₹499
      const res = await validateCouponAction("WELCOME10", 800);
      expect(res.valid).toBe(true);
      expect(res.discountAmount).toBe(80); // 10% of 800
      expect(res.promotion?.code).toBe("WELCOME10");
    });

    it("strictly rejects coupon stacking attempts (e.g. WELCOME10+AQUA50, comma-separated, ampersand)", async () => {
      const plusStack = await validateCouponAction("WELCOME10+AQUA50", 1500);
      expect(plusStack.valid).toBe(false);
      expect(plusStack.message).toMatch(/anti-stacking|multiple coupon stacking is not permitted/i);
      expect(plusStack.discountAmount).toBe(0);

      const commaStack = await validateCouponAction("WELCOME10,AQUA50", 1500);
      expect(commaStack.valid).toBe(false);
      expect(commaStack.message).toMatch(/anti-stacking|multiple coupon stacking is not permitted/i);

      const ampStack = await validateCouponAction("WELCOME10&AQUA50", 1500);
      expect(ampStack.valid).toBe(false);
      expect(ampStack.message).toMatch(/anti-stacking|multiple coupon stacking is not permitted/i);
    });

    it("rejects coupon when subtotal is below minimum order value", async () => {
      // AQUA50 requires minOrder ₹500
      const res = await validateCouponAction("AQUA50", 300);
      expect(res.valid).toBe(false);
      expect(res.message).toMatch(/minimum order value/i);
      expect(res.discountAmount).toBe(0);
    });

    it("respects max discount caps on promotions", async () => {
      const promos = await getPromotionsAction();
      const promoWithCap = promos.find((p) => p.maxDiscount && p.maxDiscount > 0);
      if (promoWithCap) {
        const hugeSubtotal = 100000;
        const res = await validateCouponAction(promoWithCap.code, hugeSubtotal);
        expect(res.valid).toBe(true);
        expect(res.discountAmount).toBeLessThanOrEqual(promoWithCap.maxDiscount!);
      }
    });

    it("rejects invalid or non-existent coupon codes", async () => {
      const res = await validateCouponAction("INVALID_HACK_99", 1000);
      expect(res.valid).toBe(false);
      expect(res.message).toMatch(/invalid or expired/i);
      expect(res.discountAmount).toBe(0);
    });

    it("handles empty or whitespace-only coupon code safely", async () => {
      const res = await validateCouponAction("   ", 500);
      expect(res.valid).toBe(false);
      expect(res.discountAmount).toBe(0);
    });
  });

  describe("4. Transit Logistics & Boundary Pricing Conditions", () => {
    it("handles empty cart line items cleanly", async () => {
      const pricing = await calculateCheckoutPricingAction([], undefined, "BUS_PARCEL");
      expect(pricing.subtotal).toBe(0);
      expect(pricing.discountAmount).toBe(0);
      expect(pricing.shippingFee).toBe(0);
      expect(pricing.totalAmount).toBe(0);
    });

    it("calculates accurate transit shipping fees based on selected method", async () => {
      // var-spf-single is an accessory (doesn't require live transit)
      const busPricing = await calculateCheckoutPricingAction(
        [{ variantId: "var-spf-single", quantity: 1 }],
        undefined,
        "BUS_PARCEL"
      );
      expect(busPricing.shippingFee).toBe(100);

      const railPricing = await calculateCheckoutPricingAction(
        [{ variantId: "var-spf-single", quantity: 1 }],
        undefined,
        "RAILWAY_PARCEL"
      );
      expect(railPricing.shippingFee).toBe(120);

      const courierPricing = await calculateCheckoutPricingAction(
        [{ variantId: "var-spf-single", quantity: 1 }],
        undefined,
        "PRIVATE_COURIER"
      );
      expect(courierPricing.shippingFee).toBe(80);

      const pickupPricing = await calculateCheckoutPricingAction(
        [{ variantId: "var-spf-single", quantity: 1 }],
        undefined,
        "LOCAL_PICKUP"
      );
      expect(pickupPricing.shippingFee).toBe(0);
    });

    it("restricts courier transit when cart contains live fish requiring special transit", async () => {
      // Live fish requiring special transit
      const fishPricing = await calculateCheckoutPricingAction(
        [{ variantId: "var-rdg-pair", quantity: 1 }],
        undefined,
        "BUS_PARCEL"
      );
      expect(fishPricing.requiresSpecialTransit).toBe(true);
      expect(fishPricing.eligibleTransitMethods).not.toContain("PRIVATE_COURIER");
      expect(fishPricing.eligibleTransitMethods).toContain("BUS_PARCEL");
      expect(fishPricing.eligibleTransitMethods).toContain("RAILWAY_PARCEL");
    });
  });
});
