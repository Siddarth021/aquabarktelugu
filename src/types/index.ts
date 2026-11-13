export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAYMENT_LINK_SENT'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type TransportMethod =
  | 'BUS_PARCEL'
  | 'RAILWAY_PARCEL'
  | 'PRIVATE_COURIER'
  | 'LOCAL_PICKUP';

export type DiscountType = 'PERCENTAGE' | 'FLAT';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  title: string;
  sku: string;
  gender?: string | null;
  size?: string | null;
  plantPotType?: string | null;
  price: number;
  originalPrice?: number | null;
  isActive: boolean;
  sortOrder: number;
  stock: number;
  reservedStock: number;
}

export interface ProductImageDTO {
  id: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  subtitle?: string | null;
  description: string;
  careGuide?: string | null;
  categoryId: string;
  categoryName?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  requiresSpecialTransit: boolean;
  minOrderQty: number;
  maxOrderQty: number;
  images: ProductImageDTO[];
  variants: ProductVariantDTO[];
  reviewsCount?: number;
  averageRating?: number;
}

export interface ComboItemDTO {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantTitle: string;
  quantity: number;
}

export interface ComboDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  comboPrice: number;
  originalPrice: number;
  stockLimit?: number | null;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  items: ComboItemDTO[];
}

export interface CartItemDTO {
  variantId: string;
  productId: string;
  productName: string;
  variantTitle: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface ShippingAddressDTO {
  recipientName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantTitle: string;
  priceSnapshot: number;
  quantity: number;
  totalSnapshot: number;
}

export interface ShipmentDTO {
  id: string;
  orderId: string;
  trackingNumber: string;
  transportMethod: TransportMethod;
  operatorName: string;
  departureLocation: string;
  destinationStation: string;
  parcelReceiptNumber?: string | null;
  dispatchDate: string;
  expectedArrivalDate?: string | null;
  notes?: string | null;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: ShippingAddressDTO;
  transitMethod?: TransportMethod | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string | null;
  adminNotes?: string | null;
  items: OrderItemDTO[];
  shipment?: ShipmentDTO | null;
  cancellationRequested?: boolean;
  createdAt: string;
}

export type CancellationStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED';

export interface CancellationRequestDTO {
  id: string;
  orderId: string;
  orderNumber: string;
  profileId?: string | null;
  customerName: string;
  customerPhone: string;
  reason: string;
  explanation?: string | null;
  status: CancellationStatus;
  adminResponse?: string | null;
  isStockRestored: boolean;
  refundStatus?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface PromotionDTO {
  id: string;
  title: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  timesUsed: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProductReviewDTO {
  id: string;
  productId: string;
  productName?: string;
  profileId?: string;
  customerName?: string;
  rating: number;
  title?: string | null;
  comment: string;
  imageUrls?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface CartDTO {
  id?: string;
  sessionToken: string;
  items: CartItemDTO[];
  subtotal: number;
  itemCount: number;
}

export interface PricingCalculationResult {
  subtotal: number;
  discountAmount: number;
  appliedCoupon?: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    savings: number;
  } | null;
  shippingFee: number;
  totalAmount: number;
  requiresSpecialTransit: boolean;
  eligibleTransitMethods: TransportMethod[];
  currency: string;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: ShippingAddressDTO;
  transitMethod: TransportMethod;
  cartItems: {
    variantId: string;
    quantity: number;
  }[];
  couponCode?: string;
  adminNotes?: string;
}

export interface CreateShipmentInput {
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


