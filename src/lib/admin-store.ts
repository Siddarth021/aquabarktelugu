import {
  CategoryDTO,
  ProductDTO,
  ProductVariantDTO,
  ComboDTO,
  OrderDTO,
  OrderStatus,
  TransportMethod,
} from "@/types";
import { generateTrackingNumber } from "@/lib/utils";

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

export interface AdminStoreData {
  categories: CategoryDTO[];
  products: ProductDTO[];
  combos: ComboDTO[];
  orders: OrderDTO[];
  cancellations: CancellationItem[];
  settings: Record<string, string>;
  priceLogs: {
    id: string;
    variantId: string;
    productName: string;
    variantTitle: string;
    oldPrice: number;
    newPrice: number;
    reason: string;
    createdAt: string;
  }[];
  inventoryLogs: {
    id: string;
    variantId: string;
    productName: string;
    variantTitle: string;
    delta: number;
    remainingStock: number;
    reason: string;
    createdAt: string;
  }[];
}

const initialCategories: CategoryDTO[] = [
  {
    id: "cat-1",
    name: "Live Fish",
    slug: "fish",
    description: "Healthy acclimated freshwater ornamental fish suitable for home aquariums.",
    imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=80",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "cat-2",
    name: "Aqua Plants",
    slug: "aqua-plants",
    description: "Snail-free, pesticide-free live aquatic plants for nano and planted aquascapes.",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "cat-3",
    name: "Accessories & Food",
    slug: "accessories",
    description: "Sponge filters, natural driftwood, high-protein pellets, and water conditioners.",
    imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&auto=format&fit=crop&q=80",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "cat-4",
    name: "Combos & Bundles",
    slug: "combos",
    description: "Curated beginner kits and enthusiast combos with bundled savings.",
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=80",
    sortOrder: 4,
    isActive: true,
  },
];

const initialProducts: ProductDTO[] = [
  {
    id: "prod-1",
    name: "Red Dragon Dumbo Ear Guppy",
    slug: "red-dragon-dumbo-ear-guppy",
    subtitle: "High Grade Livebearer | Pure Line Strain",
    description:
      "Vibrant red caudal fin with contrasting white dumbo pectoral fins. Extremely active, peaceful, and hardy for planted aquariums.",
    careGuide: "Temp: 24-28°C | pH: 6.8 - 7.6 | Tank Size: 20L+ | Diet: Micro pellets, Baby brine shrimp",
    categoryId: "cat-1",
    categoryName: "Live Fish",
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    requiresSpecialTransit: true,
    minOrderQty: 1,
    maxOrderQty: 10,
    images: [
      {
        id: "img-1",
        imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80",
        altText: "Red Dragon Guppy male side view",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: "var-1-1",
        productId: "prod-1",
        title: "Male (Select Grade)",
        sku: "GUP-RD-M",
        gender: "Male",
        price: 180,
        originalPrice: 220,
        isActive: true,
        sortOrder: 1,
        stock: 24,
        reservedStock: 2,
      },
      {
        id: "var-1-2",
        productId: "prod-1",
        title: "Female",
        sku: "GUP-RD-F",
        gender: "Female",
        price: 150,
        originalPrice: 190,
        isActive: true,
        sortOrder: 2,
        stock: 30,
        reservedStock: 0,
      },
      {
        id: "var-1-3",
        productId: "prod-1",
        title: "Breeding Pair (1M + 1F)",
        sku: "GUP-RD-PAIR",
        gender: "Pair",
        price: 320,
        originalPrice: 400,
        isActive: true,
        sortOrder: 3,
        stock: 15,
        reservedStock: 1,
      },
      {
        id: "var-1-4",
        productId: "prod-1",
        title: "Breeding Trio (1M + 2F)",
        sku: "GUP-RD-TRIO",
        gender: "Trio",
        price: 450,
        originalPrice: 550,
        isActive: true,
        sortOrder: 4,
        stock: 8,
        reservedStock: 0,
      },
    ],
  },
  {
    id: "prod-2",
    name: "Blue Halfmoon Betta (Show Grade)",
    slug: "blue-halfmoon-betta",
    subtitle: "Show Quality 180° Tail Spread",
    description:
      "Stunning metallic royal blue iridescent scales with a pristine 180-degree halfmoon spread. Hand-selected for health and vigorous flaring.",
    careGuide: "Temp: 26-29°C | pH: 6.5 - 7.5 | Solo Tank 15L+ | Gentle filtration | Leaf hammocks recommended",
    categoryId: "cat-1",
    categoryName: "Live Fish",
    isActive: true,
    isFeatured: true,
    isNewArrival: true,
    requiresSpecialTransit: true,
    minOrderQty: 1,
    maxOrderQty: 3,
    images: [
      {
        id: "img-2",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80",
        altText: "Blue Halfmoon Betta flaring",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: "var-2-1",
        productId: "prod-2",
        title: "Show Grade Male",
        sku: "BET-HM-BL-M",
        gender: "Male",
        price: 450,
        originalPrice: 550,
        isActive: true,
        sortOrder: 1,
        stock: 6,
        reservedStock: 1,
      },
      {
        id: "var-2-2",
        productId: "prod-2",
        title: "Female Sorority",
        sku: "BET-HM-BL-F",
        gender: "Female",
        price: 250,
        originalPrice: 320,
        isActive: true,
        sortOrder: 2,
        stock: 12,
        reservedStock: 0,
      },
    ],
  },
  {
    id: "prod-3",
    name: "Java Fern on Driftwood",
    slug: "java-fern-driftwood",
    subtitle: "Low Tech Hardy Aquatic Plant",
    description:
      "Pre-attached Microsorum pteropus rooted onto cured natural mangrove driftwood. Zero CO2 required, ideal for beginners.",
    careGuide: "Lighting: Low to Moderate | CO2: None needed | Growth: Slow | Placement: Midground to Background",
    categoryId: "cat-2",
    categoryName: "Aqua Plants",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    requiresSpecialTransit: false,
    minOrderQty: 1,
    maxOrderQty: 10,
    images: [
      {
        id: "img-3",
        imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=80",
        altText: "Java fern mounted on wood",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: "var-3-1",
        productId: "prod-3",
        title: "Small Driftwood (4-6 inches)",
        sku: "PLT-JF-SM",
        size: "Small",
        price: 280,
        originalPrice: 350,
        isActive: true,
        sortOrder: 1,
        stock: 18,
        reservedStock: 0,
      },
      {
        id: "var-3-2",
        productId: "prod-3",
        title: "Medium Driftwood (8-10 inches)",
        sku: "PLT-JF-MD",
        size: "Medium",
        price: 420,
        originalPrice: 499,
        isActive: true,
        sortOrder: 2,
        stock: 7,
        reservedStock: 2,
      },
    ],
  },
  {
    id: "prod-4",
    name: "Anubias Nana Petite",
    slug: "anubias-nana-petite",
    subtitle: "Compact Foreground Plant | Very Hardy",
    description:
      "Tiny dark green foliage that attaches to stones or driftwood. Thrives in low light conditions without melting.",
    careGuide: "Do not bury rhizome in gravel. Attach to hardscape using superglue gel or cotton thread.",
    categoryId: "cat-2",
    categoryName: "Aqua Plants",
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    requiresSpecialTransit: false,
    minOrderQty: 1,
    maxOrderQty: 5,
    images: [
      {
        id: "img-4",
        imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&auto=format&fit=crop&q=80",
        altText: "Anubias Nana Petite pot",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: "var-4-1",
        productId: "prod-4",
        title: "2-inch Mesh Pot",
        sku: "PLT-AN-2IN",
        plantPotType: "2-inch Pot",
        price: 320,
        originalPrice: 380,
        isActive: true,
        sortOrder: 1,
        stock: 3, // LOW STOCK ALERT
        reservedStock: 0,
      },
      {
        id: "var-4-2",
        productId: "prod-4",
        title: "Mother Plant (15+ leaves)",
        sku: "PLT-AN-MTH",
        plantPotType: "Mother Plant",
        price: 650,
        originalPrice: 799,
        isActive: true,
        sortOrder: 2,
        stock: 2, // LOW STOCK ALERT
        reservedStock: 0,
      },
    ],
  },
  {
    id: "prod-5",
    name: "Double Head Bio Sponge Filter",
    slug: "double-head-bio-sponge-filter",
    subtitle: "Quiet Gentle Aeration & Biological Filtration",
    description:
      "Multi-layer ribbed sponge with dual ceramic media chambers. Perfect for fry tanks, shrimp breeding, and Betta setups.",
    careGuide: "Rinse sponge only in tank water during water changes. Connect to standard 4mm airline tubing.",
    categoryId: "cat-3",
    categoryName: "Accessories & Food",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    requiresSpecialTransit: false,
    minOrderQty: 1,
    maxOrderQty: 10,
    images: [
      {
        id: "img-5",
        imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80",
        altText: "Sponge filter dual head",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: "var-5-1",
        productId: "prod-5",
        title: "Medium (Up to 60 Litres)",
        sku: "ACC-SPF-MD",
        size: "Medium",
        price: 190,
        originalPrice: 240,
        isActive: true,
        sortOrder: 1,
        stock: 45,
        reservedStock: 3,
      },
      {
        id: "var-5-2",
        productId: "prod-5",
        title: "Large (Up to 120 Litres)",
        sku: "ACC-SPF-LG",
        size: "Large",
        price: 290,
        originalPrice: 350,
        isActive: true,
        sortOrder: 2,
        stock: 30,
        reservedStock: 0,
      },
    ],
  },
  {
    id: "prod-6",
    name: "Hikari Micro Pellets 45g",
    slug: "hikari-micro-pellets-45g",
    subtitle: "Daily Color Enhancing Food for Small Mouth Fish",
    description:
      "Slow sinking multi-colored mini pellets with krill and spirulina. Developed for tetras, guppies, and nano fish.",
    careGuide: "Feed 2 to 3 times daily. Give only as much as fish can consume within 2 minutes.",
    categoryId: "cat-3",
    categoryName: "Accessories & Food",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    requiresSpecialTransit: false,
    minOrderQty: 1,
    maxOrderQty: 5,
    images: [
      {
        id: "img-6",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80",
        altText: "Hikari food bottle",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: "var-6-1",
        productId: "prod-6",
        title: "Standard Pack 45g",
        sku: "ACC-HIK-45G",
        size: "45g",
        price: 260,
        originalPrice: 299,
        isActive: true,
        sortOrder: 1,
        stock: 3, // LOW STOCK ALERT
        reservedStock: 0,
      },
    ],
  },
];

const initialCombos: ComboDTO[] = [
  {
    id: "combo-1",
    title: "Planted Nano Aquarium Starter Combo",
    slug: "planted-nano-starter-combo",
    description:
      "Includes 1 Breeding Pair of Red Dragon Guppies, 1 Java Fern mounted on driftwood, and 1 Double Head Sponge Filter. Perfect healthy start for a 1-foot or 1.5-foot planted tank.",
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=80",
    comboPrice: 680,
    originalPrice: 790,
    stockLimit: 10,
    isActive: true,
    items: [
      {
        id: "ci-1",
        productId: "prod-1",
        productName: "Red Dragon Dumbo Ear Guppy",
        variantId: "var-1-3",
        variantTitle: "Breeding Pair (1M + 1F)",
        quantity: 1,
      },
      {
        id: "ci-2",
        productId: "prod-3",
        productName: "Java Fern on Driftwood",
        variantId: "var-3-1",
        variantTitle: "Small Driftwood (4-6 inches)",
        quantity: 1,
      },
      {
        id: "ci-3",
        productId: "prod-5",
        productName: "Double Head Bio Sponge Filter",
        variantId: "var-5-1",
        variantTitle: "Medium (Up to 60 Litres)",
        quantity: 1,
      },
    ],
  },
  {
    id: "combo-2",
    title: "Betta Paradise Premium Bundle",
    slug: "betta-paradise-bundle",
    description:
      "Everything for a luxury solo Betta tank: 1 Show Grade Blue Halfmoon Male, 1 Anubias Nana Petite pot, and 1 pack Hikari Micro Pellets.",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80",
    comboPrice: 890,
    originalPrice: 1030,
    stockLimit: 5,
    isActive: true,
    items: [
      {
        id: "ci-4",
        productId: "prod-2",
        productName: "Blue Halfmoon Betta (Show Grade)",
        variantId: "var-2-1",
        variantTitle: "Show Grade Male",
        quantity: 1,
      },
      {
        id: "ci-5",
        productId: "prod-4",
        productName: "Anubias Nana Petite",
        variantId: "var-4-1",
        variantTitle: "2-inch Mesh Pot",
        quantity: 1,
      },
      {
        id: "ci-6",
        productId: "prod-6",
        productName: "Hikari Micro Pellets 45g",
        variantId: "var-6-1",
        variantTitle: "Standard Pack 45g",
        quantity: 1,
      },
    ],
  },
];

const initialOrders: OrderDTO[] = [
  {
    id: "ord-101",
    orderNumber: "ABT-2026-10492",
    status: "PENDING",
    customerName: "Suresh Reddy",
    customerPhone: "9848012345",
    customerEmail: "suresh.reddy@gmail.com",
    shippingAddress: {
      recipientName: "Suresh Reddy",
      phone: "9848012345",
      street: "Flat 302, Sri Sai Nilayam, Ring Road",
      landmark: "Near Benz Circle",
      city: "Vijayawada",
      state: "Andhra Pradesh",
      postalCode: "520010",
    },
    transitMethod: "BUS_PARCEL",
    subtotal: 740,
    discountAmount: 0,
    shippingFee: 150,
    totalAmount: 890,
    paymentStatus: "PENDING",
    adminNotes: "Customer requested morning TSRTC bus delivery to Vijayawada RTC Old Bus Stand.",
    cancellationRequested: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    items: [
      {
        id: "item-101-1",
        productId: "prod-1",
        variantId: "var-1-3",
        productName: "Red Dragon Dumbo Ear Guppy",
        variantTitle: "Breeding Pair (1M + 1F)",
        priceSnapshot: 320,
        quantity: 1,
        totalSnapshot: 320,
      },
      {
        id: "item-101-2",
        productId: "prod-3",
        variantId: "var-3-2",
        productName: "Java Fern on Driftwood",
        variantTitle: "Medium Driftwood (8-10 inches)",
        priceSnapshot: 420,
        quantity: 1,
        totalSnapshot: 420,
      },
    ],
  },
  {
    id: "ord-102",
    orderNumber: "ABT-2026-10381",
    status: "CONFIRMED",
    customerName: "Kiran Kumar Varma",
    customerPhone: "9440123456",
    customerEmail: "kiran.v@yahoo.com",
    shippingAddress: {
      recipientName: "Kiran Kumar",
      phone: "9440123456",
      street: "Door 4-12/1, Dwaraka Nagar 3rd Lane",
      landmark: "Opposite RTC Complex",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      postalCode: "530016",
    },
    transitMethod: "RAILWAY_PARCEL",
    subtotal: 640,
    discountAmount: 50,
    shippingFee: 120,
    totalAmount: 710,
    paymentStatus: "PAID",
    razorpayOrderId: "order_rzp_vizag_102",
    adminNotes: "Packing in heavy insulated thermocol with oxygen seal for train transit.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    items: [
      {
        id: "item-102-1",
        productId: "prod-2",
        variantId: "var-2-1",
        productName: "Blue Halfmoon Betta (Show Grade)",
        variantTitle: "Show Grade Male",
        priceSnapshot: 450,
        quantity: 1,
        totalSnapshot: 450,
      },
      {
        id: "item-102-2",
        productId: "prod-5",
        variantId: "var-5-1",
        productName: "Double Head Bio Sponge Filter",
        variantTitle: "Medium (Up to 60 Litres)",
        priceSnapshot: 190,
        quantity: 1,
        totalSnapshot: 190,
      },
    ],
  },
  {
    id: "ord-103",
    orderNumber: "ABT-2026-10275",
    status: "PREPARING",
    customerName: "Venkat Rao Naidu",
    customerPhone: "9989012345",
    customerEmail: "venkat.r@gmail.com",
    shippingAddress: {
      recipientName: "Venkat Rao",
      phone: "9989012345",
      street: "Danavaipeta Main Road",
      landmark: "Near Godavari Bund",
      city: "Rajahmundry",
      state: "Andhra Pradesh",
      postalCode: "533101",
    },
    transitMethod: "BUS_PARCEL",
    subtotal: 770,
    discountAmount: 0,
    shippingFee: 150,
    totalAmount: 920,
    paymentStatus: "PAID",
    razorpayOrderId: "order_rzp_rjy_103",
    adminNotes: "Acclimation complete. Fasting fish before transit packing.",
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    items: [
      {
        id: "item-103-1",
        productId: "prod-1",
        variantId: "var-1-4",
        productName: "Red Dragon Dumbo Ear Guppy",
        variantTitle: "Breeding Trio (1M + 2F)",
        priceSnapshot: 450,
        quantity: 1,
        totalSnapshot: 450,
      },
      {
        id: "item-103-2",
        productId: "prod-4",
        variantId: "var-4-1",
        productName: "Anubias Nana Petite",
        variantTitle: "2-inch Mesh Pot",
        priceSnapshot: 320,
        quantity: 1,
        totalSnapshot: 320,
      },
    ],
  },
  {
    id: "ord-104",
    orderNumber: "ABT-2026-10118",
    status: "SHIPPED",
    customerName: "Pooja Sharma",
    customerPhone: "9876543210",
    customerEmail: "pooja.s@gmail.com",
    shippingAddress: {
      recipientName: "Pooja Sharma",
      phone: "9876543210",
      street: "House 12, KT Road, Bhavani Nagar",
      landmark: "Near Alipiri Gate",
      city: "Tirupati",
      state: "Andhra Pradesh",
      postalCode: "517501",
    },
    transitMethod: "BUS_PARCEL",
    subtotal: 1120,
    discountAmount: 100,
    shippingFee: 150,
    totalAmount: 1170,
    paymentStatus: "PAID",
    razorpayOrderId: "order_rzp_tpty_104",
    shipment: {
      id: "shp-104",
      orderId: "ord-104",
      trackingNumber: "ABT-TRK-749201",
      transportMethod: "BUS_PARCEL",
      operatorName: "APSRTC Garuda Express",
      departureLocation: "MGBS Hyderabad (Bay 14)",
      destinationStation: "Tirupati Central Bus Station (Parcel Counter)",
      parcelReceiptNumber: "LR-APSRTC-99824",
      dispatchDate: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
      expectedArrivalDate: new Date(Date.now() + 3600 * 1000 * 10).toISOString(),
      notes: "Driver: Appa Rao, Bus Reg AP 03 Z 4412. Collect with parcel receipt.",
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    items: [
      {
        id: "item-104-1",
        productId: "prod-1",
        variantId: "var-1-1",
        productName: "Red Dragon Dumbo Ear Guppy",
        variantTitle: "Male (Select Grade)",
        priceSnapshot: 180,
        quantity: 2,
        totalSnapshot: 360,
      },
      {
        id: "item-104-2",
        productId: "prod-2",
        variantId: "var-2-2",
        productName: "Blue Halfmoon Betta (Show Grade)",
        variantTitle: "Female Sorority",
        priceSnapshot: 250,
        quantity: 2,
        totalSnapshot: 500,
      },
      {
        id: "item-104-3",
        productId: "prod-6",
        variantId: "var-6-1",
        productName: "Hikari Micro Pellets 45g",
        variantTitle: "Standard Pack 45g",
        priceSnapshot: 260,
        quantity: 1,
        totalSnapshot: 260,
      },
    ],
  },
  {
    id: "ord-105",
    orderNumber: "ABT-2026-09852",
    status: "DELIVERED",
    customerName: "Chaitanya Varma",
    customerPhone: "9123456780",
    customerEmail: "chaitu.v@gmail.com",
    shippingAddress: {
      recipientName: "Chaitanya Varma",
      phone: "9123456780",
      street: "Plot 88, Arundalpet 14th Cross",
      landmark: "Near Hindu Pharmacy College",
      city: "Guntur",
      state: "Andhra Pradesh",
      postalCode: "522002",
    },
    transitMethod: "BUS_PARCEL",
    subtotal: 590,
    discountAmount: 0,
    shippingFee: 150,
    totalAmount: 740,
    paymentStatus: "PAID",
    razorpayOrderId: "order_rzp_gnt_105",
    shipment: {
      id: "shp-105",
      orderId: "ord-105",
      trackingNumber: "ABT-TRK-612093",
      transportMethod: "BUS_PARCEL",
      operatorName: "TSRTC Super Luxury",
      departureLocation: "MGBS Hyderabad",
      destinationStation: "NTR Bus Stand Guntur",
      parcelReceiptNumber: "LR-TSRTC-51290",
      dispatchDate: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      expectedArrivalDate: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
      notes: "Customer collected in-person from parcel counter.",
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 52).toISOString(),
    items: [
      {
        id: "item-105-1",
        productId: "prod-1",
        variantId: "var-1-3",
        productName: "Red Dragon Dumbo Ear Guppy",
        variantTitle: "Breeding Pair (1M + 1F)",
        priceSnapshot: 320,
        quantity: 1,
        totalSnapshot: 320,
      },
      {
        id: "item-105-2",
        productId: "prod-3",
        variantId: "var-3-1",
        productName: "Java Fern on Driftwood",
        variantTitle: "Small Driftwood (4-6 inches)",
        priceSnapshot: 270,
        quantity: 1,
        totalSnapshot: 270,
      },
    ],
  },
];

const initialCancellations: CancellationItem[] = [
  {
    id: "canc-1",
    orderId: "ord-101",
    orderNumber: "ABT-2026-10492",
    customerName: "Suresh Reddy",
    customerPhone: "9848012345",
    reason: "Ordered wrong plant size",
    explanation: "I mistakenly added the medium driftwood which is too large for my 1-foot nano tank. Want to cancel and reorder with small driftwood.",
    status: "REQUESTED",
    isStockRestored: false,
    totalAmount: 890,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    items: [
      {
        productName: "Red Dragon Dumbo Ear Guppy",
        variantTitle: "Breeding Pair (1M + 1F)",
        variantId: "var-1-3",
        quantity: 1,
        price: 320,
      },
      {
        productName: "Java Fern on Driftwood",
        variantTitle: "Medium Driftwood (8-10 inches)",
        variantId: "var-3-2",
        quantity: 1,
        price: 420,
      },
    ],
  },
];

const initialSettings: Record<string, string> = {
  store_name: "AquaBark Telugu Aquarium Studio",
  store_tagline: "Premier Live Ornamental Fish & Aquascaping in Telugu States",
  store_phone: "+91 94400 12345",
  whatsapp_alert_number: "+91 98480 54321",
  store_email: "support@aquabarktelugu.com",
  departure_hub: "MGBS Hyderabad / PNBS Vijayawada Hub",
  min_order_live_fish: "499",
  min_order_bus_parcel: "799",
  supported_bus_operators: "TSRTC, APSRTC, Orange Travels, Morning Star, Kaveri Travels, Intrcity",
  supported_rail_stations: "Secunderabad (SC), Vijayawada (BZA), Visakhapatnam (VSKP), Tirupati (TPTY), Rajahmundry (RJY), Guntur (GNT), Warangal (WL)",
  live_transit_policy: "100% Live Arrival Guaranteed in insulated thermocol box with pure bottled oxygen and heat/cooling packs. Unboxing video required within 2 hours of pickup.",
  heatwave_advisory_active: "false",
};

// Global in-memory singleton to persist state during dev server lifetime
const globalStore = globalThis as unknown as {
  __AQUABARK_ADMIN_STORE__?: AdminStoreData;
};

if (!globalStore.__AQUABARK_ADMIN_STORE__) {
  globalStore.__AQUABARK_ADMIN_STORE__ = {
    categories: initialCategories,
    products: initialProducts,
    combos: initialCombos,
    orders: initialOrders,
    cancellations: initialCancellations,
    settings: initialSettings,
    priceLogs: [],
    inventoryLogs: [],
  };
}

export const adminStore = globalStore.__AQUABARK_ADMIN_STORE__;

export function getAdminStore(): AdminStoreData {
  return adminStore;
}
