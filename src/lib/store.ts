import fs from "fs";
import path from "path";
import { INITIAL_SEED_DATA } from "@/data/seed-data";
import {
  CategoryDTO,
  ProductDTO,
  ProductVariantDTO,
  ComboDTO,
  PromotionDTO,
  CartDTO,
  CartItemDTO,
  OrderDTO,
  OrderItemDTO,
  ShipmentDTO,
  CancellationRequestDTO,
  ProductReviewDTO,
  OrderStatus,
  PaymentStatus,
  TransportMethod,
  PricingCalculationResult,
  CreateOrderInput,
  CreateShipmentInput,
} from "@/types";
import { generateOrderNumber, generateTrackingNumber } from "@/lib/utils";

// Store file persistence location for local resilience
const DATA_DIR = path.join(process.cwd(), "src", "data");
const STORE_FILE = path.join(DATA_DIR, "store-state.json");

interface InternalState {
  categories: CategoryDTO[];
  products: ProductDTO[];
  combos: ComboDTO[];
  promotions: PromotionDTO[];
  carts: Record<string, { sessionToken: string; items: { variantId: string; quantity: number }[] }>;
  orders: OrderDTO[];
  shipments: ShipmentDTO[];
  cancellations: CancellationRequestDTO[];
  reviews: ProductReviewDTO[];
  priceHistory: {
    id: string;
    variantId: string;
    oldPrice: number;
    newPrice: number;
    changedBy: string;
    reason: string;
    createdAt: string;
  }[];
  inventoryMovements: {
    id: string;
    variantId: string;
    changeType: string;
    quantity: number;
    remainingStock: number;
    reason: string;
    referenceId?: string;
    createdAt: string;
  }[];
  processedPaymentEvents: string[];
  adminSettings: Record<string, string>;
}

class ResilientDataStore {
  private state: InternalState;
  private initialized = false;
  private mutex: Promise<void> = Promise.resolve();

  private async synchronized<T>(task: () => Promise<T>): Promise<T> {
    const prev = this.mutex;
    let release: () => void;
    this.mutex = new Promise<void>((resolve) => {
      release = resolve;
    });
    await prev;
    try {
      return await task();
    } finally {
      release!();
    }
  }

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): InternalState {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.categories && parsed.products) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed reading persisted store file, re-initializing from seed data:", err);
    }

    // Initialize from seed data
    const categories: CategoryDTO[] = INITIAL_SEED_DATA.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      parentId: c.parentId || null,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
    }));

    const products: ProductDTO[] = INITIAL_SEED_DATA.products.map((p) => {
      const category = categories.find((c) => c.id === p.categoryId);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        subtitle: p.subtitle,
        description: p.description,
        careGuide: p.careGuide,
        categoryId: p.categoryId,
        categoryName: category?.name,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        requiresSpecialTransit: p.requiresSpecialTransit,
        minOrderQty: p.minOrderQty,
        maxOrderQty: p.maxOrderQty,
        images: p.images.map((img: any) => ({
          id: img.id || `img-${Math.random()}`,
          imageUrl: img.imageUrl,
          altText: img.altText || null,
          sortOrder: img.sortOrder || 0,
          isPrimary: !!img.isPrimary,
        })),
        variants: p.variants.map((v: any) => ({
          id: v.id,
          productId: p.id,
          title: v.title,
          sku: v.sku,
          gender: v.gender || null,
          size: v.size || null,
          plantPotType: v.plantPotType || null,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
          isActive: v.isActive ?? true,
          sortOrder: v.sortOrder || 0,
          stock: Number(v.stock),
          reservedStock: Number(v.reservedStock || 0),
        })),
        reviewsCount: 3,
        averageRating: 4.9,
      };
    });

    const combos: ComboDTO[] = INITIAL_SEED_DATA.combos.map((cb) => ({
      id: cb.id,
      title: cb.title,
      slug: cb.slug,
      description: cb.description,
      imageUrl: cb.imageUrl,
      comboPrice: Number(cb.comboPrice),
      originalPrice: Number(cb.originalPrice),
      stockLimit: cb.stockLimit,
      isActive: cb.isActive,
      items: cb.items,
    }));

    const promotions: PromotionDTO[] = INITIAL_SEED_DATA.promotions.map((pr) => ({
      id: pr.id,
      title: pr.title,
      code: pr.code,
      description: pr.description,
      discountType: pr.discountType,
      discountValue: Number(pr.discountValue),
      minOrderValue: pr.minOrderValue ? Number(pr.minOrderValue) : null,
      maxDiscount: pr.maxDiscount ? Number(pr.maxDiscount) : null,
      usageLimit: pr.usageLimit,
      timesUsed: pr.timesUsed || 0,
      isActive: pr.isActive,
    }));

    const shipments: ShipmentDTO[] = INITIAL_SEED_DATA.shipments.map((s) => ({
      id: s.id,
      orderId: s.orderId,
      trackingNumber: s.trackingNumber,
      transportMethod: s.transportMethod,
      operatorName: s.operatorName,
      departureLocation: s.departureLocation,
      destinationStation: s.destinationStation,
      parcelReceiptNumber: s.parcelReceiptNumber,
      dispatchDate: s.dispatchDate,
      expectedArrivalDate: s.expectedArrivalDate,
      notes: s.notes,
    }));

    const orders: OrderDTO[] = INITIAL_SEED_DATA.orders.map((o) => {
      const ship = shipments.find((s) => s.orderId === o.id);
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail,
        shippingAddress: o.shippingAddress,
        transitMethod: o.transitMethod,
        subtotal: Number(o.subtotal),
        discountAmount: Number(o.discountAmount),
        shippingFee: Number(o.shippingFee),
        totalAmount: Number(o.totalAmount),
        paymentStatus: o.paymentStatus,
        razorpayOrderId: o.razorpayOrderId,
        adminNotes: o.adminNotes,
        items: o.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          variantTitle: i.variantTitle,
          priceSnapshot: Number(i.priceSnapshot),
          quantity: Number(i.quantity),
          totalSnapshot: Number(i.totalSnapshot),
        })),
        shipment: ship || null,
        cancellationRequested: false,
        createdAt: o.createdAt,
      };
    });

    const reviews: ProductReviewDTO[] = INITIAL_SEED_DATA.reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: products.find((p) => p.id === r.productId)?.name,
      profileId: r.profileId,
      customerName: r.customerName,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      imageUrls: r.imageUrls || [],
      isVerifiedPurchase: r.isVerifiedPurchase,
      isApproved: r.isApproved,
      createdAt: r.createdAt,
    }));

    const adminSettings: Record<string, string> = {};
    INITIAL_SEED_DATA.adminSettings.forEach((s) => {
      adminSettings[s.key] = s.value;
    });

    const initialState: InternalState = {
      categories,
      products,
      combos,
      promotions,
      carts: {},
      orders,
      shipments,
      cancellations: [],
      reviews,
      priceHistory: [],
      inventoryMovements: [],
      processedPaymentEvents: [],
      adminSettings,
    };

    this.persist(initialState);
    return initialState;
  }

  private persist(stateToSave?: InternalState) {
    if (process.env.NODE_ENV === "test") {
      return; // Fast in-memory state during concurrent vitest runners
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        STORE_FILE,
        JSON.stringify(stateToSave || this.state, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.error("Failed persisting store state to disk:", e);
    }
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<CategoryDTO[]> {
    return this.state.categories.filter((c) => c.isActive);
  }

  async getAllCategories(): Promise<CategoryDTO[]> {
    return [...this.state.categories];
  }

  async createCategory(cat: CategoryDTO): Promise<CategoryDTO> {
    this.state.categories.push(cat);
    this.persist();
    return cat;
  }

  async toggleCategoryActive(id: string): Promise<boolean> {
    const cat = this.state.categories.find((c) => c.id === id);
    if (cat) {
      cat.isActive = !cat.isActive;
      this.persist();
      return cat.isActive;
    }
    return false;
  }

  async reorderCategories(orderedIds: string[]): Promise<void> {
    orderedIds.forEach((id, index) => {
      const cat = this.state.categories.find((c) => c.id === id);
      if (cat) cat.sortOrder = index + 1;
    });
    this.state.categories.sort((a, b) => a.sortOrder - b.sortOrder);
    this.persist();
  }

  async getCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
    const cat = this.state.categories.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase() && c.isActive
    );
    return cat || null;
  }

  // --- PRODUCTS & VARIANTS ---
  async getProducts(params?: {
    categorySlug?: string;
    featured?: boolean;
    search?: string;
  }): Promise<ProductDTO[]> {
    let result = this.state.products.filter((p) => p.isActive);

    if (params?.categorySlug) {
      const cat = await this.getCategoryBySlug(params.categorySlug);
      if (cat) {
        result = result.filter((p) => p.categoryId === cat.id);
      }
    }

    if (params?.featured) {
      result = result.filter((p) => p.isFeatured);
    }

    if (params?.search) {
      const query = params.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.subtitle?.toLowerCase().includes(query) ||
          p.variants.some((v) => v.title.toLowerCase().includes(query) || v.sku.toLowerCase().includes(query))
      );
    }

    return result;
  }

  async getAllAdminProducts(): Promise<ProductDTO[]> {
    return [...this.state.products];
  }

  async createProduct(product: ProductDTO): Promise<ProductDTO> {
    this.state.products.unshift(product);
    this.persist();
    return product;
  }

  async getProductBySlug(slug: string): Promise<ProductDTO | null> {
    const prod = this.state.products.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() && p.isActive
    );
    return prod || null;
  }

  async getProductById(id: string): Promise<ProductDTO | null> {
    const prod = this.state.products.find((p) => p.id === id);
    return prod || null;
  }

  async getVariantById(variantId: string): Promise<ProductVariantDTO | null> {
    for (const prod of this.state.products) {
      const variant = prod.variants.find((v) => v.id === variantId);
      if (variant) return variant;
    }
    return null;
  }

  // Dynamic Pricing Update: affects future sales only, does not rewrite past orders
  async updateVariantPrice(
    variantId: string,
    newPrice: number,
    reason: string = "Dynamic pricing update",
    changedBy: string = "Admin"
  ): Promise<{ success: boolean; variant: ProductVariantDTO; oldPrice: number }> {
    if (newPrice < 0) {
      throw new Error("Price cannot be negative");
    }

    let foundVariant: ProductVariantDTO | null = null;
    let oldPrice = 0;

    for (const prod of this.state.products) {
      const variant = prod.variants.find((v) => v.id === variantId);
      if (variant) {
        foundVariant = variant;
        oldPrice = variant.price;
        variant.price = Number(newPrice);
        break;
      }
    }

    if (!foundVariant) {
      throw new Error(`Variant not found with ID ${variantId}`);
    }

    this.state.priceHistory.push({
      id: `ph-${Date.now()}`,
      variantId,
      oldPrice,
      newPrice: Number(newPrice),
      changedBy,
      reason,
      createdAt: new Date().toISOString(),
    });

    this.persist();
    return { success: true, variant: foundVariant, oldPrice };
  }

  // Manual Stock Adjustment
  async updateVariantStock(
    variantId: string,
    newStock: number,
    reason: string = "Manual inventory adjustment"
  ): Promise<{ success: boolean; variant: ProductVariantDTO }> {
    if (newStock < 0) {
      throw new Error("Stock cannot be negative");
    }

    let foundVariant: ProductVariantDTO | null = null;

    for (const prod of this.state.products) {
      const variant = prod.variants.find((v) => v.id === variantId);
      if (variant) {
        foundVariant = variant;
        const diff = newStock - variant.stock;
        variant.stock = Number(newStock);

        this.state.inventoryMovements.push({
          id: `im-${Date.now()}`,
          variantId,
          changeType: "MANUAL_ADJUSTMENT",
          quantity: diff,
          remainingStock: variant.stock,
          reason,
          createdAt: new Date().toISOString(),
        });
        break;
      }
    }

    if (!foundVariant) {
      throw new Error(`Variant not found with ID ${variantId}`);
    }

    this.persist();
    return { success: true, variant: foundVariant };
  }

  // --- COMBOS ---
  async getCombos(): Promise<ComboDTO[]> {
    return this.state.combos.filter((c) => c.isActive);
  }

  async getAllCombos(): Promise<ComboDTO[]> {
    return [...this.state.combos];
  }

  async createCombo(combo: ComboDTO): Promise<ComboDTO> {
    this.state.combos.push(combo);
    this.persist();
    return combo;
  }

  async deleteCombo(id: string): Promise<boolean> {
    const idx = this.state.combos.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.state.combos.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }

  async getComboBySlug(slug: string): Promise<ComboDTO | null> {
    const c = this.state.combos.find(
      (cb) => cb.slug.toLowerCase() === slug.toLowerCase() && cb.isActive
    );
    return c || null;
  }

  async getComboById(id: string): Promise<ComboDTO | null> {
    const c = this.state.combos.find((cb) => cb.id === id);
    return c || null;
  }

  // --- PROMOTIONS ---
  async getPromotions(): Promise<PromotionDTO[]> {
    return this.state.promotions.filter((p) => p.isActive);
  }

  async getPromotionByCode(code: string): Promise<PromotionDTO | null> {
    const promo = this.state.promotions.find(
      (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.isActive
    );
    return promo || null;
  }

  async validatePromotion(
    code: string,
    subtotal: number
  ): Promise<{
    valid: boolean;
    message?: string;
    promotion?: PromotionDTO;
    discountAmount: number;
  }> {
    const promo = await this.getPromotionByCode(code);
    if (!promo) {
      return { valid: false, message: "Invalid or expired coupon code", discountAmount: 0 };
    }

    if (promo.minOrderValue && subtotal < promo.minOrderValue) {
      return {
        valid: false,
        message: `Coupon ${promo.code} requires a minimum order value of ₹${promo.minOrderValue}`,
        discountAmount: 0,
      };
    }

    if (promo.usageLimit && promo.timesUsed >= promo.usageLimit) {
      return {
        valid: false,
        message: `Coupon ${promo.code} usage limit reached`,
        discountAmount: 0,
      };
    }

    let discountAmount = 0;
    if (promo.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else if (promo.discountType === "FLAT") {
      discountAmount = promo.discountValue;
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }

    // Round to 2 decimals
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      promotion: promo,
      discountAmount,
    };
  }

  // --- CART MANAGEMENT ---
  async getCart(sessionToken: string): Promise<CartDTO> {
    const cartRecord = this.state.carts[sessionToken] || { sessionToken, items: [] };

    const items: CartItemDTO[] = [];
    let subtotal = 0;

    for (const item of cartRecord.items) {
      const variant = await this.getVariantById(item.variantId);
      if (!variant) continue;
      const product = await this.getProductById(variant.productId);
      if (!product) continue;

      const unitPrice = variant.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      const primaryImg =
        product.images.find((img) => img.isPrimary)?.imageUrl ||
        product.images[0]?.imageUrl ||
        "";

      items.push({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        variantTitle: variant.title,
        imageUrl: primaryImg,
        unitPrice,
        quantity: item.quantity,
        maxStock: Math.max(0, variant.stock - variant.reservedStock),
      });
    }

    return {
      sessionToken,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  }

  async addToCart(
    sessionToken: string,
    variantId: string,
    quantity: number = 1
  ): Promise<{ success: boolean; cart: CartDTO; error?: string }> {
    if (quantity <= 0) {
      return { success: false, cart: await this.getCart(sessionToken), error: "Quantity must be at least 1" };
    }

    const variant = await this.getVariantById(variantId);
    if (!variant) {
      return { success: false, cart: await this.getCart(sessionToken), error: "Item not found" };
    }

    const available = variant.stock - variant.reservedStock;
    if (available < quantity) {
      return {
        success: false,
        cart: await this.getCart(sessionToken),
        error: `Only ${available} item(s) currently available in stock`,
      };
    }

    if (!this.state.carts[sessionToken]) {
      this.state.carts[sessionToken] = { sessionToken, items: [] };
    }

    const cart = this.state.carts[sessionToken];
    const existing = cart.items.find((i) => i.variantId === variantId);

    if (existing) {
      const totalQty = existing.quantity + quantity;
      if (totalQty > available) {
        return {
          success: false,
          cart: await this.getCart(sessionToken),
          error: `Cannot add more. You have ${existing.quantity} in cart and only ${available} are in stock.`,
        };
      }
      existing.quantity = totalQty;
    } else {
      cart.items.push({ variantId, quantity });
    }

    this.persist();
    return { success: true, cart: await this.getCart(sessionToken) };
  }

  async updateCartItem(
    sessionToken: string,
    variantId: string,
    quantity: number
  ): Promise<{ success: boolean; cart: CartDTO; error?: string }> {
    const cart = this.state.carts[sessionToken];
    if (!cart) {
      return { success: false, cart: await this.getCart(sessionToken), error: "Cart not found" };
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.variantId !== variantId);
      this.persist();
      return { success: true, cart: await this.getCart(sessionToken) };
    }

    const variant = await this.getVariantById(variantId);
    if (!variant) {
      return { success: false, cart: await this.getCart(sessionToken), error: "Item not found" };
    }

    const available = variant.stock - variant.reservedStock;
    if (quantity > available) {
      return {
        success: false,
        cart: await this.getCart(sessionToken),
        error: `Only ${available} in stock`,
      };
    }

    const item = cart.items.find((i) => i.variantId === variantId);
    if (item) {
      item.quantity = quantity;
    } else {
      cart.items.push({ variantId, quantity });
    }

    this.persist();
    return { success: true, cart: await this.getCart(sessionToken) };
  }

  async removeFromCart(
    sessionToken: string,
    variantId: string
  ): Promise<{ success: boolean; cart: CartDTO }> {
    if (this.state.carts[sessionToken]) {
      this.state.carts[sessionToken].items = this.state.carts[sessionToken].items.filter(
        (i) => i.variantId !== variantId
      );
      this.persist();
    }
    return { success: true, cart: await this.getCart(sessionToken) };
  }

  async clearCart(sessionToken: string): Promise<void> {
    if (this.state.carts[sessionToken]) {
      this.state.carts[sessionToken].items = [];
      this.persist();
    }
  }

  // --- PRICING CALCULATION ---
  async calculatePricing(
    items: { variantId: string; quantity: number }[],
    couponCode?: string,
    transitMethod: TransportMethod = "BUS_PARCEL"
  ): Promise<PricingCalculationResult> {
    let subtotal = 0;
    let requiresSpecialTransit = false;

    for (const item of items) {
      const variant = await this.getVariantById(item.variantId);
      if (!variant) {
        throw new Error(`Variant ${item.variantId} does not exist`);
      }
      const prod = await this.getProductById(variant.productId);
      if (prod?.requiresSpecialTransit) {
        requiresSpecialTransit = true;
      }
      subtotal += variant.price * item.quantity;
    }

    subtotal = Math.round(subtotal * 100) / 100;

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const couponValidation = await this.validatePromotion(couponCode, subtotal);
      if (couponValidation.valid && couponValidation.promotion) {
        discountAmount = couponValidation.discountAmount;
        appliedCoupon = {
          code: couponValidation.promotion.code,
          discountType: couponValidation.promotion.discountType,
          discountValue: couponValidation.promotion.discountValue,
          savings: discountAmount,
        };
      }
    }

    // Shipping fee calculation:
    // Base Bus parcel: ₹100; Railway parcel: ₹120; Private Courier: ₹80; Local pickup: ₹0
    // If order subtotal >= ₹1500, offer free shipping
    let shippingFee = 0;
    if (subtotal > 0) {
      if (transitMethod === "BUS_PARCEL") shippingFee = 100;
      else if (transitMethod === "RAILWAY_PARCEL") shippingFee = 120;
      else if (transitMethod === "PRIVATE_COURIER") shippingFee = 80;
      else if (transitMethod === "LOCAL_PICKUP") shippingFee = 0;

      // Free shipping threshold for non-special or high value
      if (subtotal >= 2000 && !requiresSpecialTransit) {
        shippingFee = 0;
      }
    }

    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100) / 100);

    const eligibleTransitMethods: TransportMethod[] = requiresSpecialTransit
      ? ["BUS_PARCEL", "RAILWAY_PARCEL", "LOCAL_PICKUP"]
      : ["BUS_PARCEL", "RAILWAY_PARCEL", "PRIVATE_COURIER", "LOCAL_PICKUP"];

    return {
      subtotal,
      discountAmount,
      appliedCoupon,
      shippingFee,
      totalAmount,
      requiresSpecialTransit,
      eligibleTransitMethods,
      currency: "INR",
    };
  }

  // --- ORDERS & ATOMIC RESERVATIONS ---
  async createOrder(
    input: CreateOrderInput,
    profileId?: string
  ): Promise<{ success: boolean; order?: OrderDTO; error?: string }> {
    return this.synchronized(async () => {
      if (!input.cartItems || input.cartItems.length === 0) {
        return { success: false, error: "Cart is empty" };
      }

      // 1. Calculate authoritative pricing strictly on server
      const pricing = await this.calculatePricing(
        input.cartItems,
        input.couponCode,
        input.transitMethod
      );

      // 2. Atomic Pre-check: Verify all variants exist and have sufficient available stock
      for (const item of input.cartItems) {
        const variant = await this.getVariantById(item.variantId);
        if (!variant) {
          return { success: false, error: `Variant ${item.variantId} not found` };
        }
        const available = variant.stock - variant.reservedStock;
        if (available < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for "${variant.title}". Available: ${available}, requested: ${item.quantity}`,
          };
        }
      }

      // 3. Atomically reserve inventory
      for (const item of input.cartItems) {
        const variant = await this.getVariantById(item.variantId);
        if (variant) {
          variant.reservedStock += item.quantity;
          this.state.inventoryMovements.push({
            id: `im-res-${Date.now()}-${variant.id}`,
            variantId: variant.id,
            changeType: "ORDER_RESERVATION",
            quantity: item.quantity,
            remainingStock: variant.stock - variant.reservedStock,
            reason: `Reserved for checkout`,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // 4. Create immutable OrderItem snapshots
      const orderItems: OrderItemDTO[] = [];
      for (const item of input.cartItems) {
        const variant = (await this.getVariantById(item.variantId))!;
        const prod = (await this.getProductById(variant.productId))!;
        const priceSnapshot = variant.price;
        const totalSnapshot = priceSnapshot * item.quantity;

        orderItems.push({
          id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: prod.id,
          variantId: variant.id,
          productName: prod.name,
          variantTitle: variant.title,
          priceSnapshot,
          quantity: item.quantity,
          totalSnapshot,
        });
      }

      // 5. Update coupon redemption if applicable
      if (pricing.appliedCoupon) {
        const promo = await this.getPromotionByCode(pricing.appliedCoupon.code);
        if (promo) {
          promo.timesUsed += 1;
        }
      }

      const orderNumber = generateOrderNumber();
      const newOrder: OrderDTO = {
        id: `ord-${Date.now()}`,
        orderNumber,
        status: "PENDING",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail || null,
        shippingAddress: input.shippingAddress,
        transitMethod: input.transitMethod,
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        shippingFee: pricing.shippingFee,
        totalAmount: pricing.totalAmount,
        paymentStatus: "PENDING",
        razorpayOrderId: null,
        adminNotes: input.adminNotes || null,
        items: orderItems,
        shipment: null,
        cancellationRequested: false,
        createdAt: new Date().toISOString(),
      };

      this.state.orders.unshift(newOrder);
      this.persist();

      return { success: true, order: newOrder };
    });
  }

  async getOrderById(orderId: string): Promise<OrderDTO | null> {
    const o = this.state.orders.find((ord) => ord.id === orderId);
    return o || null;
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderDTO | null> {
    const o = this.state.orders.find(
      (ord) => ord.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase()
    );
    return o || null;
  }

  async getCustomerOrders(phoneOrEmail: string): Promise<OrderDTO[]> {
    const query = phoneOrEmail.trim().toLowerCase();
    return this.state.orders.filter(
      (o) =>
        o.customerPhone.toLowerCase().includes(query) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(query))
    );
  }

  async getAllOrders(status?: OrderStatus): Promise<OrderDTO[]> {
    if (status) {
      return this.state.orders.filter((o) => o.status === status);
    }
    return [...this.state.orders];
  }

  // Update order status with valid state machine flow:
  // PENDING -> CONFIRMED -> PREPARING -> SHIPPED -> DELIVERED (or CANCELLED)
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    changedBy: string = "Admin"
  ): Promise<{ success: boolean; order?: OrderDTO; error?: string }> {
    return this.synchronized(async () => {
      const order = await this.getOrderById(orderId);
      if (!order) {
        return { success: false, error: "Order not found" };
      }

      if (order.status === "CANCELLED") {
        return { success: false, error: "Cannot modify a cancelled order" };
      }

      const prevStatus = order.status;
      order.status = newStatus;

      if (note) {
        order.adminNotes = order.adminNotes ? `${order.adminNotes} | ${note}` : note;
      }

      // If transitioning from PENDING to CONFIRMED or PAID:
      // Commit the reserved stock into permanently deducted stock
      if (prevStatus === "PENDING" && newStatus === "CONFIRMED") {
        for (const item of order.items) {
          const variant = await this.getVariantById(item.variantId);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
            variant.reservedStock = Math.max(0, variant.reservedStock - item.quantity);

            this.state.inventoryMovements.push({
              id: `im-ful-${Date.now()}-${variant.id}`,
              variantId: variant.id,
              changeType: "ORDER_FULFILLMENT",
              quantity: -item.quantity,
              remainingStock: variant.stock,
              reason: `Order ${order.orderNumber} confirmed`,
              referenceId: order.id,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      this.persist();
      return { success: true, order };
    });
  }

  // Confirm Razorpay payment and commit order
  async confirmOrderPayment(
    orderId: string,
    paymentDetails: {
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    }
  ): Promise<{ success: boolean; order?: OrderDTO; error?: string }> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    order.paymentStatus = "PAID";
    order.razorpayOrderId = paymentDetails.razorpayOrderId;

    // Transition to CONFIRMED if pending
    if (order.status === "PENDING") {
      await this.updateOrderStatus(orderId, "CONFIRMED", "Payment received via Razorpay");
    }

    this.persist();
    return { success: true, order };
  }

  // Set Razorpay Order ID on Order
  async setRazorpayOrderId(orderId: string, razorpayOrderId: string): Promise<void> {
    const order = await this.getOrderById(orderId);
    if (order) {
      order.razorpayOrderId = razorpayOrderId;
      this.persist();
    }
  }

  // --- CANCELLATIONS & SINGLE RESTORATION ---
  async requestCancellation(
    orderId: string,
    reason: string,
    explanation?: string,
    profileId?: string
  ): Promise<{ success: boolean; cancellationRequest?: CancellationRequestDTO; error?: string }> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status === "CANCELLED") {
      return { success: false, error: "Order is already cancelled" };
    }

    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return {
        success: false,
        error: "Cannot cancel order that has already been dispatched/delivered. Contact support via WhatsApp.",
      };
    }

    const existingReq = this.state.cancellations.find((c) => c.orderId === orderId);
    if (existingReq) {
      return { success: false, error: "A cancellation request is already pending for this order" };
    }

    const newReq: CancellationRequestDTO = {
      id: `canc-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      profileId: profileId || null,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      reason,
      explanation: explanation || null,
      status: "REQUESTED",
      adminResponse: null,
      isStockRestored: false,
      refundStatus: order.paymentStatus === "PAID" ? "REFUND_PENDING" : "NO_PAYMENT",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    this.state.cancellations.unshift(newReq);
    order.cancellationRequested = true;
    this.persist();

    return { success: true, cancellationRequest: newReq };
  }

  async getCancellationRequests(): Promise<CancellationRequestDTO[]> {
    return [...this.state.cancellations];
  }

  async getCancellationRequestByOrderId(orderId: string): Promise<CancellationRequestDTO | null> {
    const req = this.state.cancellations.find((c) => c.orderId === orderId);
    return req || null;
  }

  // Admin approves or rejects cancellation
  // CRITICAL INVARIANT: Single-time stock restoration!
  async resolveCancellation(
    orderId: string,
    decision: "APPROVE" | "REJECT",
    responseNote?: string,
    adminUser: string = "Admin"
  ): Promise<{
    success: boolean;
    message: string;
    isStockRestored: boolean;
    error?: string;
  }> {
    return this.synchronized(async () => {
      const req = await this.getCancellationRequestByOrderId(orderId);
      if (!req) {
        return { success: false, message: "", isStockRestored: false, error: "Cancellation request not found" };
      }

      if (req.status !== "REQUESTED") {
        return {
          success: false,
          message: "",
          isStockRestored: req.isStockRestored,
          error: `Cancellation already resolved with status ${req.status}`,
        };
      }

      const order = await this.getOrderById(orderId);
      if (!order) {
        return { success: false, message: "", isStockRestored: false, error: "Order not found" };
      }

      req.resolvedAt = new Date().toISOString();
      req.adminResponse = responseNote || null;

      if (decision === "REJECT") {
        req.status = "REJECTED";
        order.cancellationRequested = false;
        this.persist();
        return {
          success: true,
          message: "Cancellation request rejected",
          isStockRestored: false,
        };
      }

      // APPROVE
      req.status = "APPROVED";
      let stockRestoredCount = 0;

      // Single-time restoration guarantee
      if (!req.isStockRestored) {
        for (const item of order.items) {
          const variant = await this.getVariantById(item.variantId);
          if (variant) {
            if (order.status === "PENDING") {
              // It was only reserved, not fulfilled
              variant.reservedStock = Math.max(0, variant.reservedStock - item.quantity);
            } else {
              // It was fulfilled or preparing: restore physical stock
              variant.stock += item.quantity;
            }

            this.state.inventoryMovements.push({
              id: `im-rst-${Date.now()}-${variant.id}`,
              variantId: variant.id,
              changeType: "CANCELLATION_RESTORE",
              quantity: item.quantity,
              remainingStock: variant.stock,
              reason: `Order ${order.orderNumber} cancelled by admin`,
              referenceId: order.id,
              createdAt: new Date().toISOString(),
            });
            stockRestoredCount += item.quantity;
          }
        }
        req.isStockRestored = true;
      }

      order.status = "CANCELLED";
      order.cancellationRequested = false;
      if (order.paymentStatus === "PAID") {
        order.paymentStatus = "REFUNDED";
        req.refundStatus = "REFUND_INITIATED";
      }

      this.persist();
      return {
        success: true,
        message: `Cancellation approved. Restored ${stockRestoredCount} item(s) to inventory.`,
        isStockRestored: true,
      };
    });
  }

  // --- SHIPPING & TRACKING ---
  async createShipment(
    input: CreateShipmentInput,
    adminUser: string = "Admin"
  ): Promise<{ success: boolean; shipment?: ShipmentDTO; error?: string }> {
    const order = await this.getOrderById(input.orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status === "CANCELLED") {
      return { success: false, error: "Cannot ship a cancelled order" };
    }

    if (order.shipment) {
      return { success: false, error: "Shipment already created for this order" };
    }

    const trackingNumber = generateTrackingNumber();

    const shipment: ShipmentDTO = {
      id: `ship-${Date.now()}`,
      orderId: order.id,
      trackingNumber,
      transportMethod: input.transportMethod,
      operatorName: input.operatorName,
      departureLocation: input.departureLocation,
      destinationStation: input.destinationStation,
      parcelReceiptNumber: input.parcelReceiptNumber || null,
      dispatchDate: input.dispatchDate || new Date().toISOString(),
      expectedArrivalDate: input.expectedArrivalDate || null,
      notes: input.notes || null,
    };

    this.state.shipments.unshift(shipment);
    order.shipment = shipment;
    order.status = "SHIPPED";

    this.persist();
    return { success: true, shipment };
  }

  async getShipmentByTrackingNumber(
    trackingNumber: string
  ): Promise<{ shipment: ShipmentDTO; order: OrderDTO } | null> {
    const ship = this.state.shipments.find(
      (s) => s.trackingNumber.toUpperCase() === trackingNumber.trim().toUpperCase()
    );
    if (!ship) return null;

    const order = await this.getOrderById(ship.orderId);
    if (!order) return null;

    return { shipment: ship, order };
  }

  async getShipmentByOrderId(orderId: string): Promise<ShipmentDTO | null> {
    const ship = this.state.shipments.find((s) => s.orderId === orderId);
    return ship || null;
  }

  // --- REVIEWS ---
  async getReviewsForProduct(productId: string): Promise<ProductReviewDTO[]> {
    return this.state.reviews.filter(
      (r) => r.productId === productId && r.isApproved
    );
  }

  async getAllReviews(): Promise<ProductReviewDTO[]> {
    return [...this.state.reviews];
  }

  async createReview(input: {
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
    const prod = await this.getProductById(input.productId);
    if (!prod) {
      return { success: false, isVerifiedPurchase: false, error: "Product not found" };
    }

    // Check if customer has a delivered or paid order containing this product
    let isVerified = false;
    if (input.customerPhone || input.customerEmail) {
      const matchOrders = this.state.orders.filter(
        (o) =>
          (input.customerPhone && o.customerPhone === input.customerPhone) ||
          (input.customerEmail && o.customerEmail === input.customerEmail)
      );

      for (const ord of matchOrders) {
        if (
          (ord.status === "DELIVERED" || ord.paymentStatus === "PAID") &&
          ord.items.some((i) => i.productId === input.productId)
        ) {
          isVerified = true;
          break;
        }
      }
    }

    const review: ProductReviewDTO = {
      id: `rev-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      customerName: input.customerName,
      rating: Math.min(5, Math.max(1, input.rating)),
      title: input.title || null,
      comment: input.comment,
      imageUrls: input.imageUrls || [],
      isVerifiedPurchase: isVerified,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    this.state.reviews.unshift(review);
    this.persist();

    return { success: true, review, isVerifiedPurchase: isVerified };
  }

  // --- ADMIN SETTINGS ---
  async getAdminSettings(): Promise<Record<string, string>> {
    return { ...this.state.adminSettings };
  }

  async updateAdminSetting(key: string, value: string): Promise<void> {
    this.state.adminSettings[key] = value;
    this.persist();
  }

  // --- IDEMPOTENCY FOR WEBHOOKS ---
  async recordPaymentEvent(eventId: string): Promise<boolean> {
    if (this.state.processedPaymentEvents.includes(eventId)) {
      return false; // Already processed
    }
    this.state.processedPaymentEvents.push(eventId);
    this.persist();
    return true; // Newly processed
  }
}

// Global singleton instance so memory state persists across hot-reloads
const globalForStore = globalThis as unknown as {
  aquabarkStore: ResilientDataStore | undefined;
};

export const store = globalForStore.aquabarkStore ?? new ResilientDataStore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.aquabarkStore = store;
}
