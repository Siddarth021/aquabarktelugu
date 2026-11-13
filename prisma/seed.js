const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    id: "cat-fish-001",
    name: "Live Ornamental Fish",
    slug: "fish",
    description: "Healthy, disease-free, home-bred exotic freshwater fishes acclimatized to Indian water conditions.",
    imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "cat-plants-002",
    name: "Aqua Plants",
    slug: "aqua-plants",
    description: "Submerged cultivated, snail-free live aquatic plants for lush aquascapes and natural filtration.",
    imageUrl: "https://images.unsplash.com/photo-1544943910-4c1dc44a053c?auto=format&fit=crop&w=800&q=80",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "cat-acc-003",
    name: "Accessories & Nutrition",
    slug: "accessories",
    description: "Tested biological filters, Japanese fish nutrition, full-spectrum lights, and safe water conditioners.",
    imageUrl: "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80",
    sortOrder: 3,
    isActive: true,
  },
];

const PRODUCTS = [
  {
    id: "prod-fish-001",
    categoryId: "cat-fish-001",
    name: "Red Dragon Dumbo Guppy",
    slug: "red-dragon-guppy",
    subtitle: "Show-Grade Big Ear Strain | Active Swimmers",
    description: "Vibrant high-grade Red Dragon Dumbo Guppies bred in clean Godavari waters. Acclimated to Indian tap water conditions. Features spectacular dorsal fins with shimmering metallic red and platinum scales. Extremely hardy, peaceful community fish.",
    careGuide: "Temperature: 24-28°C | pH: 6.8-7.8 | Diet: Micro pellets, daphnia, live baby brine shrimp | Tank Size: Minimum 10 Gallons, gentle sponge filter recommended.",
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    requiresSpecialTransit: true,
    minOrderQty: 1,
    maxOrderQty: 20,
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80",
        altText: "Red Dragon Guppy Pair in planted aquarium",
        isPrimary: true,
        sortOrder: 1,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80",
        altText: "Male Red Dragon Guppy dorsal fin closeup",
        isPrimary: false,
        sortOrder: 2,
      },
    ],
    variants: [
      {
        id: "var-rdg-male",
        title: "Male (Show Grade)",
        sku: "RDG-M",
        gender: "Male",
        size: "Adult (1.5 inch)",
        price: 180,
        originalPrice: 220,
        stock: 35,
        reservedStock: 0,
        sortOrder: 1,
      },
      {
        id: "var-rdg-female",
        title: "Female (Gravid)",
        sku: "RDG-F",
        gender: "Female",
        size: "Adult (1.8 inch)",
        price: 150,
        originalPrice: 180,
        stock: 28,
        reservedStock: 0,
        sortOrder: 2,
      },
      {
        id: "var-rdg-pair",
        title: "Breeding Pair (1M + 1F)",
        sku: "RDG-PAIR",
        gender: "Pair",
        size: "Adult Pair",
        price: 320,
        originalPrice: 400,
        stock: 22,
        reservedStock: 0,
        sortOrder: 3,
      },
      {
        id: "var-rdg-trio",
        title: "Breeding Trio (1M + 2F)",
        sku: "RDG-TRIO",
        gender: "Trio",
        size: "Adult Trio",
        price: 450,
        originalPrice: 550,
        stock: 14,
        reservedStock: 0,
        sortOrder: 4,
      },
    ],
  },
  {
    id: "prod-fish-002",
    categoryId: "cat-fish-001",
    name: "Dumbo Ear Halfmoon Betta",
    slug: "dumbo-ear-betta",
    subtitle: "180° Tail Spread | Feather Pectoral Fins",
    description: "Purebred Dumbo Ear (Big Ear) Halfmoon Betta with a stunning 180-degree tail spread and oversized white pectoral fins that flutter like elephant ears. Hand-selected for intense coloration, active vitality, and symmetrical finnage.",
    careGuide: "Temperature: 25-30°C | pH: 6.5-7.5 | Diet: Carnivorous micro-pellets, freeze-dried bloodworms | Tank Size: Minimum 5 Gallons, low current, conditioned with Indian almond leaf.",
    isActive: true,
    isFeatured: true,
    isNewArrival: true,
    requiresSpecialTransit: true,
    minOrderQty: 1,
    maxOrderQty: 5,
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80",
        altText: "Dumbo Ear Halfmoon Betta flaring",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-deb-male",
        title: "Male Show Grade",
        sku: "DEB-M-SHOW",
        gender: "Male",
        size: "Full Grown (2.2 inch)",
        price: 450,
        originalPrice: 550,
        stock: 12,
        reservedStock: 0,
        sortOrder: 1,
      },
      {
        id: "var-deb-female",
        title: "Female Plakat",
        sku: "DEB-FEMALE",
        gender: "Female",
        size: "Full Grown (2.0 inch)",
        price: 280,
        originalPrice: 350,
        stock: 10,
        reservedStock: 0,
        sortOrder: 2,
      },
    ],
  },
  {
    id: "prod-plant-001",
    categoryId: "cat-plants-002",
    name: "Java Fern (Microsorum Pteropus)",
    slug: "java-fern",
    subtitle: "Indestructible Beginner Plant | Snail-Free",
    description: "The gold standard of beginner aquatic plants. Does not require nutrient-rich soil substrate; simply tie or glue the green rhizome to driftwood or porous aquarium stone. Tolerates a broad range of lighting and water parameters.",
    careGuide: "Lighting: Low to Moderate | CO2: Not required | Placement: Midground or Hardscape attachment. Never bury the rhizome in gravel or substrate.",
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    requiresSpecialTransit: false,
    minOrderQty: 1,
    maxOrderQty: 25,
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1544943910-4c1dc44a053c?auto=format&fit=crop&w=800&q=80",
        altText: "Lush green Java Fern leaf structure",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-jf-bare",
        title: "Bare Root Rhizome (5-7 leaves)",
        sku: "JF-BARE",
        plantPotType: "Bare Root",
        price: 140,
        originalPrice: 180,
        stock: 45,
        reservedStock: 0,
        sortOrder: 1,
      },
      {
        id: "var-jf-wood",
        title: "Mounted on Natural Driftwood (Ready-to-place)",
        sku: "JF-WOOD",
        plantPotType: "Driftwood Mounted",
        price: 290,
        originalPrice: 350,
        stock: 25,
        reservedStock: 0,
        sortOrder: 2,
      },
      {
        id: "var-jf-pot",
        title: "Terracotta Pot with Rockwool",
        sku: "JF-POT",
        plantPotType: "Clay Pot",
        price: 220,
        originalPrice: 260,
        stock: 30,
        reservedStock: 0,
        sortOrder: 3,
      },
    ],
  },
  {
    id: "prod-plant-002",
    categoryId: "cat-plants-002",
    name: "Amazon Sword (Echinodorus Bleheri)",
    slug: "amazon-sword",
    subtitle: "Broad Leaf Centerpiece | Heavy Nutrient Absorber",
    description: "Magnificent broad emerald leaves that reach towards the surface, creating natural green curtains. Excellent for absorbing excess nitrates and providing shelter for shy fish and shrimp.",
    careGuide: "Lighting: Moderate | Substrate: Heavy root feeder, responds well to root fertilizer tabs | Temperature: 22-28°C.",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    requiresSpecialTransit: false,
    minOrderQty: 1,
    maxOrderQty: 15,
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1544943910-4c1dc44a053c?auto=format&fit=crop&w=800&q=80",
        altText: "Amazon sword plant submerged",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-as-std",
        title: "Standard Pot (6-8 Leaves, 15cm)",
        sku: "AS-STD",
        plantPotType: "Standard Pot",
        price: 180,
        originalPrice: 220,
        stock: 35,
        reservedStock: 0,
        sortOrder: 1,
      },
      {
        id: "var-as-xl",
        title: "Mother Plant XL (12+ Leaves, 25cm)",
        sku: "AS-XL",
        plantPotType: "Mother Pot",
        price: 350,
        originalPrice: 420,
        stock: 15,
        reservedStock: 0,
        sortOrder: 2,
      },
    ],
  },
  {
    id: "prod-acc-001",
    categoryId: "cat-acc-003",
    name: "Ultra-Quiet Biochemical Sponge Filter",
    slug: "sponge-filter",
    subtitle: "Safe for Fry & Shrimp | Multi-Layer Porous Foam",
    description: "High performance biochemical sponge filter powered by an aquarium air pump. Traps floating debris while cultivating billions of beneficial nitrifying bacteria. Gentle flow protects tiny guppy fry and dwarf shrimp.",
    careGuide: "Rinse foam with aquarium tank water during water changes every 3-4 weeks. Never rinse in chlorinated tap water.",
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    requiresSpecialTransit: false,
    minOrderQty: 1,
    maxOrderQty: 30,
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80",
        altText: "Aquarium biochemical sponge filter",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-spf-single",
        title: "Single Sponge Nano (Tanks up to 40L)",
        sku: "SPF-SINGLE",
        size: "Single Sponge",
        price: 190,
        originalPrice: 240,
        stock: 50,
        reservedStock: 0,
        sortOrder: 1,
      },
      {
        id: "var-spf-double",
        title: "Double Sponge with Ceramic Media Chambers (Up to 120L)",
        sku: "SPF-DOUBLE",
        size: "Double Sponge + Media",
        price: 340,
        originalPrice: 420,
        stock: 40,
        reservedStock: 0,
        sortOrder: 2,
      },
    ],
  },
  {
    id: "prod-acc-002",
    categoryId: "cat-acc-003",
    name: "Hikari Micro Pellets Tropical Diet",
    slug: "hikari-micro-pellets",
    subtitle: "Multi-Colored Micro Granules | Made in Japan",
    description: "World-renowned daily diet formulated specifically for small-mouthed tropical fish. Features 3 distinct color pellets: red for animal protein, green for vegetable nutrients, and yellow for vital vitamins and spirulina.",
    careGuide: "Feed 2-3 times daily the amount your fish will consume completely in 2 minutes. Does not cloud water.",
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    requiresSpecialTransit: false,
    minOrderQty: 1,
    maxOrderQty: 20,
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80",
        altText: "Hikari Micro Pellets fish food pack",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-hmp-45g",
        title: "45g Stay-Fresh Resealable Pouch",
        sku: "HMP-45G",
        size: "45g",
        price: 380,
        originalPrice: 450,
        stock: 75,
        reservedStock: 0,
        sortOrder: 1,
      },
      {
        id: "var-hmp-100g",
        title: "100g Economy Tub (Best Per-Gram Value)",
        sku: "HMP-100G",
        size: "100g",
        price: 720,
        originalPrice: 850,
        stock: 35,
        reservedStock: 0,
        sortOrder: 2,
      },
    ],
  },
];

const PROMOTIONS = [
  {
    id: "promo-welcome10",
    title: "Welcome Aqua Enthusiast (10% Off)",
    code: "WELCOME10",
    description: "10% off your entire order on purchases above ₹499 (Max savings ₹200).",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 200,
    usageLimit: 1000,
    isActive: true,
  },
  {
    id: "promo-aqua50",
    title: "Flat ₹50 Aqua Discount",
    code: "AQUA50",
    description: "Flat ₹50 instant discount on orders above ₹500.",
    discountType: "FLAT",
    discountValue: 50,
    minOrderValue: 500,
    maxDiscount: 50,
    usageLimit: 500,
    isActive: true,
  },
];

const COMBOS = [
  {
    id: "combo-starter-001",
    title: "Beginner Aquarium Combo",
    slug: "beginner-aquarium-combo",
    description: "Complete all-in-one starter package for aspiring fish keepers: 1 Pair Red Dragon Guppies, 1 Mounted Java Fern on Natural Driftwood, 1 Double Biochemical Sponge Filter, and 1 pouch Hikari Micro Pellets (45g). Everything needed to start a thriving planted tank!",
    imageUrl: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80",
    comboPrice: 1049,
    originalPrice: 1330,
    stockLimit: 15,
    isActive: true,
    items: [
      { productId: "prod-fish-001", variantId: "var-rdg-pair", quantity: 1 },
      { productId: "prod-plant-001", variantId: "var-jf-wood", quantity: 1 },
      { productId: "prod-acc-001", variantId: "var-spf-double", quantity: 1 },
      { productId: "prod-acc-002", variantId: "var-hmp-45g", quantity: 1 },
    ],
  },
];

async function seed() {
  console.log("Starting AquaBark Telugu database seeding...");

  try {
    // 1. Seed Categories
    for (const cat of CATEGORIES) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          imageUrl: cat.imageUrl,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
        },
      });
    }
    console.log(`✓ Seeded ${CATEGORIES.length} Categories`);

    // 2. Seed Products & Variants & Inventory
    for (const prod of PRODUCTS) {
      const { variants, images, categoryId, ...productData } = prod;

      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {
          ...productData,
          categoryId,
        },
        create: {
          ...productData,
          id: prod.id,
          categoryId,
        },
      });

      // Images
      for (const img of images) {
        const existingImg = await prisma.productImage.findFirst({
          where: { productId: prod.id, imageUrl: img.imageUrl },
        });
        if (!existingImg) {
          await prisma.productImage.create({
            data: {
              productId: prod.id,
              imageUrl: img.imageUrl,
              altText: img.altText,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
            },
          });
        }
      }

      // Variants & Inventory
      for (const v of variants) {
        const { stock, reservedStock, ...variantData } = v;
        const variant = await prisma.productVariant.upsert({
          where: { sku: v.sku },
          update: {
            ...variantData,
            productId: prod.id,
          },
          create: {
            ...variantData,
            productId: prod.id,
          },
        });

        await prisma.inventory.upsert({
          where: { variantId: variant.id },
          update: {
            stock,
            reservedStock: reservedStock || 0,
          },
          create: {
            variantId: variant.id,
            stock,
            reservedStock: reservedStock || 0,
          },
        });
      }
    }
    console.log(`✓ Seeded ${PRODUCTS.length} Products with Variants and Inventory`);

    // 3. Seed Combos
    for (const combo of COMBOS) {
      const { items, ...comboData } = combo;
      const c = await prisma.combo.upsert({
        where: { slug: combo.slug },
        update: comboData,
        create: {
          id: combo.id,
          ...comboData,
        },
      });

      // Remove existing items and re-insert
      await prisma.comboItem.deleteMany({ where: { comboId: c.id } });
      for (const item of items) {
        await prisma.comboItem.create({
          data: {
            comboId: c.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }
    console.log(`✓ Seeded ${COMBOS.length} Combos`);

    // 4. Seed Promotions
    for (const promo of PROMOTIONS) {
      await prisma.promotion.upsert({
        where: { code: promo.code },
        update: promo,
        create: promo,
      });
    }
    console.log(`✓ Seeded ${PROMOTIONS.length} Promotions`);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.warn("Notice: Prisma database connection could not be established or failed:", error.message);
    console.log("The system will use the built-in resilient in-memory/JSON store fallback seamlessly.");
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed, CATEGORIES, PRODUCTS, COMBOS, PROMOTIONS };
