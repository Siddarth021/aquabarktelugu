"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { store } from "@/lib/store";
import {
  ADMIN_COOKIE_NAME,
  isValidAdminToken,
  requireAdmin,
} from "@/lib/admin-auth";
import {
  CategoryDTO,
  ComboDTO,
  OrderDTO,
  OrderStatus,
  ProductDTO,
  ProductVariantDTO,
  TransportMethod,
  CancellationRequestDTO,
} from "@/types";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Safe fallback when running in vitest or unit test contexts
  }
}

// --- Auth Actions ---

export async function loginAdminAction(token: string): Promise<{ success: boolean; error?: string }> {
  if (!token || !isValidAdminToken(token)) {
    return { success: false, error: "Invalid Admin Security Token or Passcode." };
  }

  const cookieStore = cookies();
  const trimmed = token.trim();

  // Set both cookie names so all middlewares and actions recognize the session
  cookieStore.set(ADMIN_COOKIE_NAME, trimmed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  cookieStore.set("aquabark_admin_session", trimmed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true };
}

export async function logoutAdminAction(): Promise<{ success: boolean }> {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete("aquabark_admin_session");
  return { success: true };
}

export async function checkAdminAuthAction(): Promise<{ authenticated: boolean }> {
  try {
    const cookieStore = cookies();
    const token =
      cookieStore.get(ADMIN_COOKIE_NAME)?.value ||
      cookieStore.get("aquabark_admin_session")?.value;
    return { authenticated: isValidAdminToken(token) };
  } catch {
    return { authenticated: false };
  }
}

// --- Dashboard Stats Action ---

export async function getAdminDashboardStats() {
  await requireAdmin();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const orders = await store.getAllOrders();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= startOfDay);
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID" && o.status !== "CANCELLED");
  const totalSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const products = await store.getAllAdminProducts();
  const lowStockItems: {
    productId: string;
    productName: string;
    variantId: string;
    variantTitle: string;
    stock: number;
    categoryName: string;
  }[] = [];

  for (const prod of products) {
    for (const v of prod.variants) {
      if (v.stock <= 5) {
        lowStockItems.push({
          productId: prod.id,
          productName: prod.name,
          variantId: v.id,
          variantTitle: v.title,
          stock: v.stock,
          categoryName: prod.categoryName || "General",
        });
      }
    }
  }

  const cancellations = await store.getCancellationRequests();
  const pendingCancellations = cancellations.filter((c) => c.status === "REQUESTED");

  return {
    todayOrdersCount: todayOrders.length,
    todayOrdersValue: todayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    pendingOrdersCount: pendingOrders.length,
    preparingOrdersCount: preparingOrders.length,
    totalSales,
    totalOrdersCount: orders.length,
    lowStockCount: lowStockItems.length,
    lowStockItems,
    pendingCancellationsCount: pendingCancellations.length,
    recentOrders: orders.slice(0, 5),
  };
}

// --- Orders Actions ---

export async function getAdminOrders(params?: {
  status?: OrderStatus | "ALL";
  search?: string;
}): Promise<OrderDTO[]> {
  await requireAdmin();

  let orders = await store.getAllOrders(
    params?.status && params.status !== "ALL" ? params.status : undefined
  );

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.shippingAddress.city.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q))
    );
  }

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return orders;
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<{ success: boolean; order?: OrderDTO; error?: string }> {
  await requireAdmin();

  const res = await store.updateOrderStatus(orderId, newStatus, notes);
  if (res.success) {
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/orders");
  }
  return res;
}

export interface DispatchInput {
  orderId: string;
  transportMethod: TransportMethod;
  operatorName: string;
  departureLocation: string;
  destinationStation: string;
  parcelReceiptNumber?: string;
  dispatchDate: string;
  expectedArrivalDate?: string;
  notes?: string;
}

export async function dispatchOrderAction(
  input: DispatchInput
): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
  await requireAdmin();

  const res = await store.createShipment({
    orderId: input.orderId,
    transportMethod: input.transportMethod,
    operatorName: input.operatorName,
    departureLocation: input.departureLocation,
    destinationStation: input.destinationStation,
    parcelReceiptNumber: input.parcelReceiptNumber,
    dispatchDate: input.dispatchDate,
    expectedArrivalDate: input.expectedArrivalDate,
    notes: input.notes,
  });

  if (res.success && res.shipment) {
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/orders");
    return { success: true, trackingNumber: res.shipment.trackingNumber };
  }

  return { success: false, error: res.error || "Failed to dispatch order" };
}

// --- Products & Dynamic Pricing Actions ---

export async function getAdminProducts(): Promise<ProductDTO[]> {
  await requireAdmin();
  return store.getAllAdminProducts();
}

export async function updateVariantPriceAction(
  variantId: string,
  newPrice: number,
  reason?: string
): Promise<{ success: boolean; error?: string; variant?: ProductVariantDTO }> {
  await requireAdmin();

  if (newPrice <= 0 || isNaN(newPrice)) {
    return { success: false, error: "Price must be a positive number." };
  }

  try {
    const res = await store.updateVariantPrice(
      variantId,
      newPrice,
      reason || "Admin dynamic pricing update"
    );

    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/products");
    return { success: true, variant: res.variant };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update price",
    };
  }
}

export async function updateVariantStockAction(
  variantId: string,
  delta: number,
  reason: string
): Promise<{ success: boolean; error?: string; newStock?: number }> {
  await requireAdmin();

  const variant = await store.getVariantById(variantId);
  if (!variant) {
    return { success: false, error: "Variant not found." };
  }

  const calculated = variant.stock + delta;
  if (calculated < 0) {
    return { success: false, error: "Stock cannot be negative." };
  }

  try {
    const res = await store.updateVariantStock(variantId, calculated, reason);

    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/products");
    return { success: true, newStock: res.variant.stock };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update stock",
    };
  }
}

export interface CreateProductInput {
  name: string;
  subtitle?: string;
  description: string;
  careGuide?: string;
  categoryId: string;
  isActive: boolean;
  isFeatured?: boolean;
  requiresSpecialTransit?: boolean;
  minOrderQty: number;
  maxOrderQty: number;
  imageUrl: string;
  variants: {
    title: string;
    sku: string;
    gender?: string;
    size?: string;
    plantPotType?: string;
    price: number;
    originalPrice?: number;
    stock: number;
  }[];
}

export async function createProductAction(
  data: CreateProductInput
): Promise<{ success: boolean; error?: string; product?: ProductDTO }> {
  await requireAdmin();

  if (!data.name || !data.categoryId || !data.variants || data.variants.length === 0) {
    return { success: false, error: "Please fill all required fields and at least one variant." };
  }

  const categories = await store.getAllCategories();
  const category = categories.find((c) => c.id === data.categoryId);
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const newId = `prod-${Date.now()}`;

  const variants: ProductVariantDTO[] = data.variants.map((v, idx) => ({
    id: `var-${newId}-${idx + 1}`,
    productId: newId,
    title: v.title,
    sku: v.sku || `SKU-${Date.now()}-${idx + 1}`,
    gender: v.gender || null,
    size: v.size || null,
    plantPotType: v.plantPotType || null,
    price: Number(v.price),
    originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
    isActive: true,
    sortOrder: idx + 1,
    stock: Number(v.stock) || 0,
    reservedStock: 0,
  }));

  const newProduct: ProductDTO = {
    id: newId,
    name: data.name,
    slug,
    subtitle: data.subtitle || null,
    description: data.description,
    careGuide: data.careGuide || null,
    categoryId: data.categoryId,
    categoryName: category?.name || "General",
    isActive: data.isActive,
    isFeatured: !!data.isFeatured,
    isNewArrival: true,
    requiresSpecialTransit: !!data.requiresSpecialTransit,
    minOrderQty: data.minOrderQty || 1,
    maxOrderQty: data.maxOrderQty || 10,
    images: [
      {
        id: `img-${Date.now()}`,
        imageUrl:
          data.imageUrl ||
          "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    variants,
  };

  await store.createProduct(newProduct);

  safeRevalidatePath("/admin");
  safeRevalidatePath("/admin/products");
  return { success: true, product: newProduct };
}

// --- Categories Actions ---

export async function getAdminCategories(): Promise<CategoryDTO[]> {
  await requireAdmin();
  return store.getAllCategories();
}

export async function createCategoryAction(data: {
  name: string;
  description?: string;
  imageUrl?: string;
}): Promise<{ success: boolean; error?: string; category?: CategoryDTO }> {
  await requireAdmin();

  if (!data.name.trim()) {
    return { success: false, error: "Category name is required." };
  }

  const existing = await store.getAllCategories();
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const newCat: CategoryDTO = {
    id: `cat-${Date.now()}`,
    name: data.name.trim(),
    slug,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    sortOrder: existing.length + 1,
    isActive: true,
  };

  await store.createCategory(newCat);

  safeRevalidatePath("/admin/categories");
  return { success: true, category: newCat };
}

export async function toggleCategoryActiveAction(
  categoryId: string
): Promise<{ success: boolean; isActive?: boolean }> {
  await requireAdmin();

  const isActive = await store.toggleCategoryActive(categoryId);
  safeRevalidatePath("/admin/categories");
  return { success: true, isActive };
}

export async function reorderCategoriesAction(
  orderedIds: string[]
): Promise<{ success: boolean }> {
  await requireAdmin();

  await store.reorderCategories(orderedIds);
  safeRevalidatePath("/admin/categories");
  return { success: true };
}

// --- Combos Actions ---

export async function getAdminCombos(): Promise<ComboDTO[]> {
  await requireAdmin();
  return store.getAllCombos();
}

export interface CreateComboInput {
  title: string;
  description: string;
  imageUrl?: string;
  comboPrice: number;
  originalPrice: number;
  stockLimit?: number;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
}

export async function createComboAction(
  data: CreateComboInput
): Promise<{ success: boolean; error?: string; combo?: ComboDTO }> {
  await requireAdmin();

  if (!data.title || !data.comboPrice || !data.items || data.items.length === 0) {
    return { success: false, error: "Title, combo price, and at least one item are required." };
  }

  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const products = await store.getAllAdminProducts();

  const comboItems = data.items.map((it, idx) => {
    const prod = products.find((p) => p.id === it.productId);
    const variant = prod?.variants.find((v) => v.id === it.variantId);
    return {
      id: `ci-${Date.now()}-${idx}`,
      productId: it.productId,
      productName: prod?.name || "Product",
      variantId: it.variantId,
      variantTitle: variant?.title || "Variant",
      quantity: it.quantity || 1,
    };
  });

  const newCombo: ComboDTO = {
    id: `combo-${Date.now()}`,
    title: data.title,
    slug,
    description: data.description,
    imageUrl: data.imageUrl || null,
    comboPrice: Number(data.comboPrice),
    originalPrice: Number(data.originalPrice),
    stockLimit: data.stockLimit ? Number(data.stockLimit) : null,
    isActive: true,
    items: comboItems,
  };

  await store.createCombo(newCombo);

  safeRevalidatePath("/admin/combos");
  return { success: true, combo: newCombo };
}

export async function deleteComboAction(comboId: string): Promise<{ success: boolean }> {
  await requireAdmin();

  await store.deleteCombo(comboId);
  safeRevalidatePath("/admin/combos");
  return { success: true };
}

// --- Cancellations & Single-Time Stock Restoration ---

export interface CancellationItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  reason: string;
  explanation?: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED";
  adminResponse?: string;
  isStockRestored: boolean;
  totalAmount: number;
  createdAt: string;
  items: {
    productName: string;
    variantTitle: string;
    variantId: string;
    quantity: number;
    price: number;
  }[];
}

export async function getAdminCancellations(): Promise<CancellationItem[]> {
  await requireAdmin();

  const requests = await store.getCancellationRequests();
  const orders = await store.getAllOrders();

  return requests.map((req) => {
    const order = orders.find((o) => o.id === req.orderId);
    return {
      id: req.id,
      orderId: req.orderId,
      orderNumber: req.orderNumber,
      customerName: req.customerName,
      customerPhone: req.customerPhone,
      reason: req.reason,
      explanation: req.explanation || undefined,
      status: req.status,
      adminResponse: req.adminResponse || undefined,
      isStockRestored: req.isStockRestored,
      totalAmount: order?.totalAmount || 0,
      createdAt: req.createdAt,
      items:
        order?.items.map((it) => ({
          productName: it.productName,
          variantTitle: it.variantTitle,
          variantId: it.variantId,
          quantity: it.quantity,
          price: it.priceSnapshot,
        })) || [],
    };
  });
}

/**
 * Approves or Rejects a cancellation request.
 * Invokes store.resolveCancellation which guarantees single-time stock restoration.
 */
export async function handleCancellationAction(
  cancellationId: string,
  action: "APPROVE" | "REJECT",
  adminResponse?: string
): Promise<{ success: boolean; error?: string; isRestored?: boolean }> {
  await requireAdmin();

  const requests = await store.getCancellationRequests();
  const request = requests.find((c) => c.id === cancellationId);
  if (!request) {
    return { success: false, error: "Cancellation request not found." };
  }

  const res = await store.resolveCancellation(
    request.orderId,
    action,
    adminResponse || (action === "APPROVE" ? "Cancellation approved" : "Cancellation rejected")
  );

  if (res.success) {
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/orders");
    safeRevalidatePath("/admin/cancellations");
    safeRevalidatePath("/admin/products");
    return { success: true, isRestored: res.isStockRestored };
  }

  return { success: false, error: res.error || "Failed to process cancellation" };
}

// --- Settings Actions ---

export async function getAdminSettings(): Promise<Record<string, string>> {
  await requireAdmin();
  return store.getAdminSettings();
}

export async function updateAdminSettingsAction(
  updates: Record<string, string>
): Promise<{ success: boolean }> {
  await requireAdmin();

  for (const [key, val] of Object.entries(updates)) {
    await store.updateAdminSetting(key, val);
  }

  safeRevalidatePath("/admin/settings");
  return { success: true };
}
