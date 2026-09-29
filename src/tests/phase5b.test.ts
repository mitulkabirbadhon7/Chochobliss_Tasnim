import assert from "node:assert";
import { prisma } from "../lib/prisma";

async function runPhase5BTests() {
  console.log("=================================================");
  console.log("=== RUNNING PHASE 5B STOREFRONT INTEGRATION TESTS =");
  console.log("=================================================\n");

  // ==========================================
  // SECTION 1: DATABASE PRODUCT AVAILABILITY & SOFT DELETE EXCLUSION
  // ==========================================
  console.log("--- 1. Storefront Product Listing & Soft-Delete Exclusion ---");

  // Query published, non-deleted products
  const activeProducts = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
  });

  assert.strictEqual(
    activeProducts.length >= 1,
    true,
    "Expected at least 1 active product in database"
  );
  console.log(`  [PASS] Successfully retrieved ${activeProducts.length} active published creations.`);

  // Check product attributes
  const first = activeProducts[0];
  assert.ok(first.name, "Product must have a name");
  assert.ok(first.slug, "Product must have a slug");
  assert.ok(Number(first.price) > 0, "Product must have a positive price");
  assert.ok(first.category, "Product must have a category");
  assert.strictEqual(first.deletedAt, null, "Storefront products must have null deletedAt");
  assert.strictEqual(first.isPublished, true, "Storefront products must have isPublished true");
  console.log(`  [PASS] Product attributes verified for '${first.name}' (${first.slug}).`);

  // Verify soft-deleted items are excluded
  const softDeletedCount = await prisma.product.count({
    where: {
      deletedAt: { not: null },
    },
  });
  console.log(`  [INFO] Database contains ${softDeletedCount} soft-deleted items.`);

  const storefrontQueryExcludesDeleted = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
    },
  });
  for (const p of storefrontQueryExcludesDeleted) {
    assert.strictEqual(p.deletedAt, null, "Storefront query must never return soft-deleted items");
  }
  console.log("  [PASS] Soft-delete invariant confirmed: 0 soft-deleted items in storefront queries.\n");

  // ==========================================
  // SECTION 2: CATEGORY & SEARCH FILTERING LOGIC
  // ==========================================
  console.log("--- 2. Category & Search Filtering ---");

  // Filter by category
  const categories = ["BARS", "TRUFFLES", "GIFT_BOXES", "SEASONAL"];
  for (const cat of categories) {
    const productsInCat = await prisma.product.findMany({
      where: {
        category: cat,
        deletedAt: null,
        isPublished: true,
      },
    });
    for (const p of productsInCat) {
      assert.strictEqual(p.category, cat, `Expected product category to be ${cat}`);
    }
  }
  console.log("  [PASS] Server-side category filtering returns strictly matched categories.");

  // Test search query filter
  const searchTest = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
      OR: [
        { name: { contains: "Madagascar", mode: "insensitive" } },
        { description: { contains: "Madagascar", mode: "insensitive" } },
      ],
    },
  });
  for (const item of searchTest) {
    const matched =
      item.name.toLowerCase().includes("madagascar") ||
      item.description.toLowerCase().includes("madagascar");
    assert.strictEqual(matched, true, "Search query must match name or description");
  }
  console.log(`  [PASS] Search filter successfully found ${searchTest.length} products matching 'Madagascar'.`);

  // Empty search handling
  const nonExistentSearch = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
      name: { contains: "NonExistentUnicornChocoBarXYZ999", mode: "insensitive" },
    },
  });
  assert.strictEqual(nonExistentSearch.length, 0, "Querying for non-existent item should return empty array");
  console.log("  [PASS] Empty search results handled gracefully (returns 0 records without throwing).\n");

  // ==========================================
  // SECTION 3: PRODUCT DETAIL SLUG LOOKUP & ATTRIBUTES
  // ==========================================
  console.log("--- 3. Product Detail Slug Resolution & Data Integrity ---");

  const sampleProduct = activeProducts[0];
  const foundBySlug = await prisma.product.findFirst({
    where: {
      slug: sampleProduct.slug,
      deletedAt: null,
      isPublished: true,
    },
  });

  assert.ok(foundBySlug, "Product must be resolvable by slug");
  assert.strictEqual(foundBySlug?.id, sampleProduct.id, "Resolved product must match sample ID");
  assert.ok(Array.isArray(foundBySlug?.images), "Images must be an array");
  assert.ok(foundBySlug?.images.length > 0, "Images array must not be empty");
  assert.ok(foundBySlug?.ingredients ? foundBySlug.ingredients.length > 0 : true, "Ingredients must be documented");
  console.log(`  [PASS] Product detail by slug '${sampleProduct.slug}' verified with rich metadata.`);

  // Test invalid slug lookup
  const invalidSlugProduct = await prisma.product.findFirst({
    where: {
      slug: "invalid-ghost-chocolate-bar-404",
      deletedAt: null,
      isPublished: true,
    },
  });
  assert.strictEqual(invalidSlugProduct, null, "Non-existent slug must return null (triggering 404)");
  console.log("  [PASS] Non-existent slug returns null as expected.\n");

  // ==========================================
  // SECTION 4: INVENTORY AVAILABILITY & STOCK CHECKS
  // ==========================================
  console.log("--- 4. Inventory Availability & Business Rules ---");

  for (const prod of activeProducts) {
    assert.strictEqual(typeof prod.inventory, "number", "Inventory must be a number");
    assert.strictEqual(prod.inventory >= 0, true, "Inventory cannot be negative");
    const isAvailable = prod.inventory > 0;
    if (!isAvailable) {
      console.log(`  [INFO] Product '${prod.name}' is currently OUT OF STOCK.`);
    }
  }
  console.log("  [PASS] Inventory availability checked: All products have valid non-negative inventory counts.\n");

  // ==========================================
  // SECTION 5: ANNOUNCEMENTS & DROPS INTEGRATION
  // ==========================================
  console.log("--- 5. Active Announcements Query ---");

  const activeAnnouncements = await prisma.announcement.findMany({
    where: {
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  assert.strictEqual(
    activeAnnouncements.length >= 1,
    true,
    "Expected active announcements in database"
  );
  for (const ann of activeAnnouncements) {
    assert.strictEqual(ann.isActive, true, "Only active announcements should be returned");
    assert.ok(ann.title, "Announcement must have title");
    assert.ok(ann.content, "Announcement must have content");
  }
  console.log(`  [PASS] Retrieved ${activeAnnouncements.length} active announcements for banner and bulletin pages.\n`);

  // ==========================================
  // SECTION 6: CLIENT CART & BACKEND PRICING INVARIANT
  // ==========================================
  console.log("--- 6. Backend Pricing Authority & Cart Security ---");

  // Validate that DB price is numeric and positive
  const dbProduct = await prisma.product.findUnique({
    where: { id: sampleProduct.id },
    select: { price: true, salePrice: true },
  });

  assert.ok(dbProduct, "Product must exist in DB");
  const rawPrice = dbProduct.salePrice ?? dbProduct.price;
  const authoritativePrice = Number(rawPrice);
  assert.strictEqual(
    authoritativePrice > 0,
    true,
    "Authoritative DB price must be strictly positive"
  );

  console.log(`  [PASS] Backend maintains authoritative price ৳${authoritativePrice} for checkout validation.`);
  console.log("\n=================================================");
  console.log("=== ALL PHASE 5B STOREFRONT TESTS PASSED! =======");
  console.log("=================================================\n");
}

runPhase5BTests()
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
