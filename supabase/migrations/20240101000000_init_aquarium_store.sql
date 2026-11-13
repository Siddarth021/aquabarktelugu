-- AquaBarkTelugu Database Migration for Supabase / PostgreSQL
-- Generated to match prisma/schema.prisma exactly

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAYMENT_LINK_SENT', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentRecordStatus" AS ENUM ('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "CancellationStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TransportMethod" AS ENUM ('BUS_PARCEL', 'RAILWAY_PARCEL', 'PRIVATE_COURIER', 'LOCAL_PICKUP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "InventoryChangeType" AS ENUM (
    'INITIAL',
    'MANUAL_ADJUSTMENT',
    'ORDER_RESERVATION',
    'ORDER_FULFILLMENT',
    'CANCELLATION_RESTORE',
    'EXPIRED_RELEASE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'SMS', 'IN_APP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "supabase_auth_id" TEXT UNIQUE,
  "email" TEXT UNIQUE,
  "phone" TEXT UNIQUE NOT NULL,
  "full_name" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
  "date_of_birth" TIMESTAMP WITH TIME ZONE,
  "is_age_verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS "customer_addresses" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "profile_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "label" TEXT NOT NULL DEFAULT 'Home',
  "recipient_name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "landmark" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postal_code" TEXT NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS "categories" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "image_url" TEXT,
  "parent_id" UUID REFERENCES "categories"("id") ON DELETE SET NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS "products" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "subtitle" TEXT,
  "description" TEXT NOT NULL,
  "care_guide" TEXT,
  "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "is_new_arrival" BOOLEAN NOT NULL DEFAULT false,
  "requires_special_transit" BOOLEAN NOT NULL DEFAULT false,
  "min_order_qty" INTEGER NOT NULL DEFAULT 1,
  "max_order_qty" INTEGER NOT NULL DEFAULT 20,
  "views_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS "product_images" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "image_url" TEXT NOT NULL,
  "alt_text" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_primary" BOOLEAN NOT NULL DEFAULT false
);

-- 8. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS "product_variants" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "sku" TEXT UNIQUE NOT NULL,
  "gender" TEXT,
  "size" TEXT,
  "plant_pot_type" TEXT,
  "price" NUMERIC(10, 2) NOT NULL,
  "original_price" NUMERIC(10, 2),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. INVENTORY
CREATE TABLE IF NOT EXISTS "inventory" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "variant_id" UUID UNIQUE NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "reserved_stock" INTEGER NOT NULL DEFAULT 0,
  "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. INVENTORY MOVEMENTS (Audit Trail)
CREATE TABLE IF NOT EXISTS "inventory_movements" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "inventory_id" UUID NOT NULL REFERENCES "inventory"("id") ON DELETE CASCADE,
  "change_type" "InventoryChangeType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "remaining_stock" INTEGER NOT NULL,
  "reason" TEXT,
  "reference_id" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 11. PRICE HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS "price_history" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "variant_id" UUID NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
  "old_price" NUMERIC(10, 2) NOT NULL,
  "new_price" NUMERIC(10, 2) NOT NULL,
  "changed_by" TEXT,
  "reason" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 12. COMBOS
CREATE TABLE IF NOT EXISTS "combos" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "image_url" TEXT,
  "combo_price" NUMERIC(10, 2) NOT NULL,
  "original_price" NUMERIC(10, 2) NOT NULL,
  "stock_limit" INTEGER,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "start_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 13. COMBO ITEMS
CREATE TABLE IF NOT EXISTS "combo_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "combo_id" UUID NOT NULL REFERENCES "combos"("id") ON DELETE CASCADE,
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
  "variant_id" UUID NOT NULL REFERENCES "product_variants"("id") ON DELETE RESTRICT,
  "quantity" INTEGER NOT NULL DEFAULT 1
);

-- 14. PROMOTIONS
CREATE TABLE IF NOT EXISTS "promotions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "code" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "discount_type" "DiscountType" NOT NULL,
  "discount_value" NUMERIC(10, 2) NOT NULL,
  "min_order_value" NUMERIC(10, 2),
  "max_discount" NUMERIC(10, 2),
  "usage_limit" INTEGER,
  "times_used" INTEGER NOT NULL DEFAULT 0,
  "start_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 15. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS "carts" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "profile_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "session_token" TEXT UNIQUE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "cart_id" UUID NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE,
  "variant_id" UUID NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE ("cart_id", "variant_id")
);

-- 16. ORDERS
CREATE TABLE IF NOT EXISTS "orders" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_number" TEXT UNIQUE NOT NULL,
  "profile_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "customer_name" TEXT NOT NULL,
  "customer_phone" TEXT NOT NULL,
  "customer_email" TEXT,
  "shipping_address" JSONB NOT NULL,
  "transit_method" "TransportMethod",
  "subtotal" NUMERIC(10, 2) NOT NULL,
  "discount_amount" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "shipping_fee" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "total_amount" NUMERIC(10, 2) NOT NULL,
  "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "razorpay_order_id" TEXT,
  "admin_notes" TEXT,
  "confirmed_at" TIMESTAMP WITH TIME ZONE,
  "shipped_at" TIMESTAMP WITH TIME ZONE,
  "delivered_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 17. ORDER ITEMS (Immutable Snapshots)
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id" UUID NOT NULL REFERENCES "products"("id"),
  "variant_id" UUID NOT NULL REFERENCES "product_variants"("id"),
  "product_name" TEXT NOT NULL,
  "variant_title" TEXT NOT NULL,
  "price_snapshot" NUMERIC(10, 2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "total_snapshot" NUMERIC(10, 2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 18. PAYMENTS
CREATE TABLE IF NOT EXISTS "payments" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "razorpay_order_id" TEXT NOT NULL,
  "razorpay_payment_id" TEXT,
  "razorpay_signature" TEXT,
  "amount" NUMERIC(10, 2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "PaymentRecordStatus" NOT NULL DEFAULT 'CREATED',
  "method" TEXT,
  "error_code" TEXT,
  "error_description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 19. PAYMENT EVENTS (Idempotency)
CREATE TABLE IF NOT EXISTS "payment_events" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "event_id" TEXT UNIQUE NOT NULL,
  "event_type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "processed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 20. CANCELLATION REQUESTS
CREATE TABLE IF NOT EXISTS "cancellation_requests" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_id" UUID UNIQUE NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "profile_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "reason" TEXT NOT NULL,
  "explanation" TEXT,
  "status" "CancellationStatus" NOT NULL DEFAULT 'REQUESTED',
  "admin_response" TEXT,
  "is_stock_restored" BOOLEAN NOT NULL DEFAULT false,
  "refund_status" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "resolved_at" TIMESTAMP WITH TIME ZONE
);

-- 21. SHIPMENTS
CREATE TABLE IF NOT EXISTS "shipments" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_id" UUID UNIQUE NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "tracking_number" TEXT UNIQUE NOT NULL,
  "transport_method" "TransportMethod" NOT NULL,
  "operator_name" TEXT NOT NULL,
  "departure_location" TEXT NOT NULL,
  "destination_station" TEXT NOT NULL,
  "parcel_receipt_number" TEXT,
  "dispatch_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "expected_arrival_date" TIMESTAMP WITH TIME ZONE,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 22. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS "order_status_history" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "from_status" "OrderStatus",
  "to_status" "OrderStatus" NOT NULL,
  "note" TEXT,
  "changed_by" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 23. COUPON REDEMPTIONS
CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "promotion_id" UUID NOT NULL REFERENCES "promotions"("id") ON DELETE RESTRICT,
  "profile_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "discount_amount" NUMERIC(10, 2) NOT NULL,
  "redeemed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 24. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS "product_reviews" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "profile_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL DEFAULT 5,
  "title" TEXT,
  "comment" TEXT NOT NULL,
  "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false,
  "is_approved" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 25. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "recipient_id" UUID,
  "recipient_phone" TEXT,
  "recipient_email" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "error_log" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 26. ADMIN SETTINGS
CREATE TABLE IF NOT EXISTS "admin_settings" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "key" TEXT UNIQUE NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products"("category_id");
CREATE INDEX IF NOT EXISTS "idx_products_slug" ON "products"("slug");
CREATE INDEX IF NOT EXISTS "idx_variants_product" ON "product_variants"("product_id");
CREATE INDEX IF NOT EXISTS "idx_variants_sku" ON "product_variants"("sku");
CREATE INDEX IF NOT EXISTS "idx_orders_customer_phone" ON "orders"("customer_phone");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "idx_orders_order_number" ON "orders"("order_number");
CREATE INDEX IF NOT EXISTS "idx_shipments_tracking" ON "shipments"("tracking_number");
CREATE INDEX IF NOT EXISTS "idx_promotions_code" ON "promotions"("code");
