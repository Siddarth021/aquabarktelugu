# AquaBarkTelugu — Production-Ready Aquarium E-Commerce Platform

A high-performance, mobile-first e-commerce platform purpose-built for an Indian live aquarium business (live fish, aquatic plants, tank accessories, and planted tank combos). Designed specifically for seamless operational management from an Android mobile phone, replacing ad-hoc Instagram/WhatsApp order management with an automated, reliable system.

---

## 🎨 Visual Identity & UI/UX Design

The visual design is directly inspired by premium botanical and aquatic aesthetics:
- **Palette**: Soft sage background (`#F8FCF9`), dark moss green (`#214D36`), mint secondary (`#DDF1E3`), primary sage (`#A8D5B5`), accent jade (`#70B98A`), and warm terracotta (`#A36D4C`).
- **Typography**: Editorial serif typography (`Playfair Display`, `Cormorant Garamond`, `Georgia`) for headings paired with clean modern sans-serif (`Plus Jakarta Sans`, `Inter`) for body text.
- **Components**:
  - **Homepage**: Hero banner with floating reviews badge, floating product teaser pill cards, rounded category showcase cards with circular arrow action buttons, and direct WhatsApp customer support.
  - **Product Details (`/products/[slug]`)**: Large elegant card (`rounded-[2.5rem]`), independent variant selectors (Gender, Size, Pot type), instant price/stock revalidation, feature icon badges (*100% Live Arrival Guaranteed*, *Healthy & Acclimated*, *Pure Oxygen Packing*), and expandable clean accordions.
  - **Mobile-First Admin (`/admin`)**: Fixed 5-tab sticky bottom navigation bar (≥48px touch targets), 1-tap quick status transitions, instant price and stock adjusting modals, and a specialized Bus/Railway parcel dispatch sheet.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, Server Components & Server Actions)
- **Styling**: Tailwind CSS with custom AquaBark theme tokens & Lucide Icons
- **Database & Schema**: PostgreSQL (Supabase compatible) with Prisma ORM
- **Migrations**: `supabase/migrations/20240101000000_init_aquarium_store.sql`
- **Data Layer**: Thread-safe, atomic sequential-mutex data store with zero-downtime resilience and local persistence
- **Payments**: Razorpay UPI / Netbanking / Cards with server-side price calculation, timing-safe crypto HMAC SHA-256 signature verification, and idempotent webhook handlers
- **Testing**: Vitest with 76 automated tests across 8 test suites
- **PWA**: Installable Progressive Web App with manifest and service worker

---

## 📦 Key Business Workflows

### 1. Independent Variant Pricing & Inventory
- Every variant (e.g., Red Dragon Guppy: *Male*, *Female*, *Breeding Pair*) maintains independent pricing and live stock.
- Confirmed orders store immutable price snapshots (`OrderItem.priceSnapshot`). When an admin updates prices dynamically, historical orders are never altered.

### 2. Atomic Inventory & Concurrency Protection
- Sequential mutex lock prevents overselling during simultaneous checkouts.
- Pending orders reserve inventory via `reservedStock`; permanent deduction occurs upon confirmation/payment.
- Combos atomically reserve each component product's underlying inventory.

### 3. Regional Bus & Railway Parcel Dispatch
Conventional couriers do not handle live fish safely. AquaBarkTelugu features manual dispatch management:
- Supported operators: TSRTC Parcel Express, APSRTC Garuda Cargo, Private Travels (Orange, Morning Star), South Central Railway Parcel.
- Station presets: MGBS Hyderabad, PNBS Vijayawada, Visakhapatnam, Tirupati, Rajahmundry, Guntur.
- Tracking numbers generated as `ABT-TRK-XXXXXX` with full public timeline (`/track/[trackingId]`).

### 4. Single-Time Cancellation Stock Restoration
- Customers can request order cancellations with reasons and explanations.
- Upon admin approval, inventory is restored **exactly once** (`isStockRestored: true`), preventing duplicate restorations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd B2C

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run seed script (populates realistic Indian aquarium catalog)
node prisma/seed.js

# Run test suite
npm test

# Start development server
npm run dev
```

Visit:
- Storefront: `http://localhost:3000`
- Mobile Admin Dashboard: `http://localhost:3000/admin` (passcode: `aquabark-telugu-secure-setup-2026`)

---

## 🧪 Automated Test Suite

Run all tests:
```bash
npm test
```

Test coverage includes 76 tests across 8 suites:
1. `src/__tests__/storefront.test.ts` (Storefront UI, pages, catalog, cart)
2. `src/__tests__/pricing.test.ts` (Dynamic pricing, combo discounts, coupon validation, anti-stacking)
3. `src/__tests__/inventory.test.ts` (Stock reservation, overselling prevention, concurrency mutex)
4. `src/__tests__/order-workflow.test.ts` (Status transitions, immutable price snapshots, parcel tracking)
5. `src/__tests__/security.test.ts` (RBAC, price tampering rejection, timing-safe HMAC signatures)
6. `src/__tests__/admin.test.ts` (Mobile admin layout, rapid order fulfillment, dispatch sheets)
7. `src/__tests__/backend.test.ts` (Server actions and data layer operations)
8. `src/__tests__/api-routes.test.ts` (Razorpay order, verify, webhook, and reviews APIs)

---

## 🛡️ Production Launch Checklist

- [x] Strict TypeScript compilation with 0 errors
- [x] Production build generated 46/46 static and dynamic routes
- [x] Timing-safe HMAC signature verification on Razorpay verify & webhook
- [x] Server-side revalidation of order amounts (zero trust in client-side calculations)
- [x] Immutable historical price snapshots on confirmed orders
- [x] Single-time stock restoration on cancellation approval
- [x] Mobile-friendly bottom navigation and touch targets (≥48px) for phone operation
- [x] PWA manifest and service worker caching configured

