import { prisma } from "../src/lib/prisma";
import { Prisma } from "@prisma/client";

async function seed() {
  console.log("🌱 Seeding Chocobliss artisanal chocolates and announcements into Neon Postgres...");

  // 1. Seed Products
  const products = [
    {
      name: "72% Single-Origin Madagascar Dark",
      slug: "madagascar-dark-72",
      description:
        "Crafted from rare Sambirano Valley cacao beans. Delivers vibrant aromatic bursts of tart raspberry, crisp citrus, and an unctuous honey finish without added vanilla.",
      price: new Prisma.Decimal("14.50"),
      salePrice: new Prisma.Decimal("12.00"),
      sku: "CB-BAR-MAD72",
      inventory: 35,
      cacaoPercentage: 72,
      origin: "Sambirano Valley, Madagascar",
      flavorNotes: ["Red Fruit", "Citrus", "Honey Blossom"],
      ingredients: "Organic Madagascar cacao beans, organic cane sugar, organic cocoa butter.",
      allergens: [],
      weight: "85g / 3.0 oz",
      images: [
        "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80",
      ],
      category: "Bars",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "85% Single-Origin Ecuador Dark",
      slug: "ecuador-dark-85",
      description:
        "Deep, earthy, and commanding. Sourced from heritage Arriba Nacional trees in Los Ríos, revealing nuanced notes of wild jasmine, toasted walnut, and espresso.",
      price: new Prisma.Decimal("15.50"),
      salePrice: null,
      sku: "CB-BAR-ECU85",
      inventory: 40,
      cacaoPercentage: 85,
      origin: "Los Ríos, Ecuador",
      flavorNotes: ["Wild Jasmine", "Toasted Walnut", "Espresso"],
      ingredients: "Heritage Arriba Nacional cacao beans, organic cane sugar, cocoa butter.",
      allergens: [],
      weight: "85g / 3.0 oz",
      images: [
        "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80",
      ],
      category: "Bars",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "68% Single-Origin Colombia Dark",
      slug: "colombia-dark-68",
      description:
        "Harvested high in the Sierra Nevada mountains. Balanced and velvety with caramel richness, dried fig undertones, and warm clove spice.",
      price: new Prisma.Decimal("14.00"),
      salePrice: null,
      sku: "CB-BAR-COL68",
      inventory: 28,
      cacaoPercentage: 68,
      origin: "Sierra Nevada, Colombia",
      flavorNotes: ["Dried Fig", "Dark Caramel", "Clove"],
      ingredients: "Colombian single-origin cacao, organic cane sugar, cocoa butter.",
      allergens: [],
      weight: "85g / 3.0 oz",
      images: [
        "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80",
      ],
      category: "Bars",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Velvet Ganache Truffle Collection (12 pcs)",
      slug: "velvet-ganache-truffles-12",
      description:
        "Tasnim's signature assorted jewel box. Features Madagascar passionfruit ganache, hazelnut gianduja, and 70% dark smoked sea salt truffles hand-dusted in raw cacao.",
      price: new Prisma.Decimal("28.00"),
      salePrice: null,
      sku: "CB-TRUF-MIX12",
      inventory: 20,
      cacaoPercentage: 70,
      origin: "Madagascar & Ecuador Blend",
      flavorNotes: ["Smoked Sea Salt", "Passionfruit", "Hazelnut Praline"],
      ingredients: "Organic cacao, grass-fed heavy cream, hazelnut paste, passionfruit puree, cane sugar, sea salt.",
      allergens: ["Dairy", "Tree Nuts"],
      weight: "160g / 5.6 oz",
      images: [
        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80",
      ],
      category: "Truffles",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "Artisanal Hazelnut Praline Truffles (8 pcs)",
      slug: "hazelnut-praline-truffles-8",
      description:
        "Slow-roasted Piedmont hazelnuts stone-ground into a silky praline paste, encased in 65% dark chocolate and finished with caramelized cacao nibs.",
      price: new Prisma.Decimal("22.00"),
      salePrice: null,
      sku: "CB-TRUF-HAZ8",
      inventory: 25,
      cacaoPercentage: 65,
      origin: "Piedmont Hazelnuts & Colombian Cacao",
      flavorNotes: ["Roasted Hazelnut", "Vanilla Bean", "Brown Butter"],
      ingredients: "Piedmont hazelnuts, single-origin cacao, cane sugar, cocoa butter, sea salt.",
      allergens: ["Tree Nuts"],
      weight: "110g / 3.8 oz",
      images: [
        "https://images.unsplash.com/photo-1575372587186-500e39546f04?auto=format&fit=crop&w=800&q=80",
      ],
      category: "Truffles",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Grand Cru Tasting Box (24 pcs)",
      slug: "grand-cru-tasting-box",
      description:
        "The definitive connoisseur gift. An opulent two-tier presentation box containing single-origin mini-tablettes and couture truffles with an illustrated tasting companion guide.",
      price: new Prisma.Decimal("55.00"),
      salePrice: new Prisma.Decimal("48.00"),
      sku: "CB-GIFT-GRAND24",
      inventory: 15,
      cacaoPercentage: null,
      origin: "Curated International Terroirs",
      flavorNotes: ["Floral", "Fruity", "Earthy", "Spicy"],
      ingredients: "Selection of dark chocolate, milk chocolate, praline, fresh cream, butter, cane sugar.",
      allergens: ["Dairy", "Tree Nuts"],
      weight: "320g / 11.2 oz",
      images: [
        "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80",
      ],
      category: "Gift Boxes",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "Tasnim Signature Confectionery Hamper",
      slug: "tasnim-signature-hamper",
      description:
        "The ultimate luxury expression. Includes 3 single-origin bars, a 12-piece truffle box, stone-ground drinking chocolate flakes, and hand-dipped candied orange peel.",
      price: new Prisma.Decimal("85.00"),
      salePrice: null,
      sku: "CB-GIFT-HAMP01",
      inventory: 10,
      cacaoPercentage: null,
      origin: "Artisanal Atelier, Dhaka",
      flavorNotes: ["Candied Citrus", "Rich Ganache", "Heritage Cacao"],
      ingredients: "Assorted single-origin confections. See individual labels for full breakdown.",
      allergens: ["Dairy", "Tree Nuts"],
      weight: "650g / 22.9 oz",
      images: [
        "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
      ],
      category: "Gift Boxes",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Spiced Cardamom & Honey Dark Chocolate",
      slug: "cardamom-honey-dark",
      description:
        "A limited seasonal release celebrating regional flavors. Green cardamom pods freshly ground into 70% dark chocolate with sundarban wild forest honey.",
      price: new Prisma.Decimal("16.00"),
      salePrice: null,
      sku: "CB-SEAS-CARD70",
      inventory: 18,
      cacaoPercentage: 70,
      origin: "Madagascar Cacao & Sundarban Honey",
      flavorNotes: ["Green Cardamom", "Wild Honey", "Warm Spice"],
      ingredients: "Cacao beans, cane sugar, wild raw honey, green cardamom, cocoa butter.",
      allergens: [],
      weight: "85g / 3.0 oz",
      images: [
        "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80",
      ],
      category: "Seasonal",
      isFeatured: true,
      isPublished: true,
    },
  ];

  for (const item of products) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  // 2. Seed Announcements
  const announcements = [
    {
      title: "Complimentary Artisanal Shipping",
      content:
        "Enjoy complimentary insulated climate-controlled delivery on all boutique orders of $100 or more.",
      bannerType: "PROMO" as const,
      linkUrl: "/shop",
      isActive: true,
    },
    {
      title: "Fresh Micro-Batch: Madagascar 72% Restocked",
      content:
        "Our latest micro-batch of Sambirano Valley 72% dark chocolate has just completed 72 hours of conching. Fresh bars now ready.",
      bannerType: "ANNOUNCEMENT" as const,
      linkUrl: "/shop/madagascar-dark-72",
      isActive: true,
    },
  ];

  for (const item of announcements) {
    const existing = await prisma.announcement.findFirst({
      where: { title: item.title },
    });
    if (!existing) {
      await prisma.announcement.create({ data: item });
    }
  }

  const finalProductCount = await prisma.product.count();
  const finalAnnouncementCount = await prisma.announcement.count();

  console.log(`✅ Seeding complete! Database contains ${finalProductCount} products and ${finalAnnouncementCount} announcements.`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
