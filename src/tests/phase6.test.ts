import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { TokenBucketRateLimiter } from "../lib/rate-limit";
import { AdminGuard } from "../lib/auth/admin-guard";
import { SessionService, type SessionUser } from "../lib/auth/session";
import { createProductSchema } from "../lib/validations/product";
import { createOrderSchema } from "../lib/validations/order";
import { addressSchema } from "../lib/validations/user";
import { handleActionError, ValidationError, AuthenticationError, AuthorizationError } from "../lib/errors";

async function runPhase6Tests() {
  console.log("=================================================");
  console.log("=== RUNNING PHASE 6 PRODUCTION-READINESS TESTS ==");
  console.log("=================================================\n");

  // ==========================================
  // SECTION 1: DATABASE INTEGRITY & CONSTRAINTS
  // ==========================================
  console.log("--- 1. Database Integrity & Constraints ---");

  // 1.1 Unique Email Constraint Test
  {
    const testEmail = "phase6.unique.test@chocobliss.test";
    await prisma.user.upsert({
      where: { email: testEmail },
      update: {},
      create: {
        id: "phase6-user-unique-1",
        email: testEmail,
        name: "Unique User 1",
        role: "CUSTOMER",
      },
    });

    let duplicateFailed = false;
    try {
      await prisma.user.create({
        data: {
          id: "phase6-user-unique-2",
          email: testEmail,
          name: "Unique User Duplicate",
          role: "CUSTOMER",
        },
      });
    } catch (err: any) {
      // Prisma error P2002: Unique constraint failed
      if (err.code === "P2002" || String(err).includes("Unique constraint")) {
        duplicateFailed = true;
      }
    }
    assert.strictEqual(duplicateFailed, true, "Duplicate email creation must be rejected by unique constraint.");
    console.log("  [PASS] Unique constraint on User email enforced by Neon PostgreSQL.");
  }

  // 1.2 Unique Product Slug Constraint Test
  {
    const testSlug = "phase6-artisan-truffle-slug";
    await prisma.product.upsert({
      where: { slug: testSlug },
      update: {},
      create: {
        id: "phase6-prod-1",
        name: "Phase 6 Artisan Truffle",
        slug: testSlug,
        sku: "PH6-TRUFFLE-01",
        description: "Handcrafted artisan chocolate truffle made with single-origin beans.",
        price: 24.50,
        inventory: 50,
        cacaoPercentage: 70,
        category: "Truffles",
        images: ["https://chocobliss.test/truffle.jpg"],
      },
    });

    let duplicateSlugFailed = false;
    try {
      await prisma.product.create({
        data: {
          id: "phase6-prod-2",
          name: "Duplicate Slug Truffle",
          slug: testSlug,
          sku: "PH6-TRUFFLE-02",
          description: "Duplicate truffle description.",
          price: 19.99,
          inventory: 20,
          category: "Truffles",
          images: ["https://chocobliss.test/truffle2.jpg"],
        },
      });
    } catch (err: any) {
      if (err.code === "P2002" || String(err).includes("Unique constraint")) {
        duplicateSlugFailed = true;
      }
    }
    assert.strictEqual(duplicateSlugFailed, true, "Duplicate product slug must be rejected by unique constraint.");
    console.log("  [PASS] Unique constraint on Product slug enforced by Neon PostgreSQL.");
  }

  // 1.3 Unique Wishlist Item Constraint Test (@@unique([userId, productId]))
  {
    const userId = "phase6-user-unique-1";
    const prodId = "phase6-prod-1";

    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: { userId, productId: prodId },
      },
      update: {},
      create: {
        userId,
        productId: prodId,
      },
    });

    let duplicateWishlistFailed = false;
    try {
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId: prodId,
        },
      });
    } catch (err: any) {
      if (err.code === "P2002" || String(err).includes("Unique constraint")) {
        duplicateWishlistFailed = true;
      }
    }
    assert.strictEqual(duplicateWishlistFailed, true, "Duplicate wishlist item for same user and product must be rejected.");
    console.log("  [PASS] Compound unique constraint @@unique([userId, productId]) on WishlistItem verified.");
  }

  // 1.4 Foreign Key Constraint Enforcement
  {
    let foreignKeyFailed = false;
    try {
      await prisma.address.create({
        data: {
          id: "phase6-addr-orphan",
          userId: "non-existent-user-id-99999",
          label: "Home",
          fullName: "Orphan Recipient",
          street: "Road 1",
          city: "Dhaka",
          state: "Dhaka",
          postalCode: "1205",
          phone: "+8801700000000",
        },
      });
    } catch (err: any) {
      if (err.code === "P2003" || String(err).includes("Foreign key constraint")) {
        foreignKeyFailed = true;
      }
    }
    assert.strictEqual(foreignKeyFailed, true, "Foreign key violation must be rejected.");
    console.log("  [PASS] Foreign key relation integrity strictly enforced by database.");
  }

  // 1.5 Decimal Values & Soft Delete Invariants
  {
    const prod = await prisma.product.findUnique({
      where: { slug: "phase6-artisan-truffle-slug" },
    });
    assert(prod != null);
    assert.strictEqual(Number(prod.price), 24.50);
    assert.strictEqual(prod.deletedAt, null);
    console.log("  [PASS] Decimal currency fields handled accurately with no float rounding distortion.");
    console.log("  [PASS] Active product soft-delete invariant verified (deletedAt === null).");
  }

  // ==========================================
  // SECTION 2: ZOD SERVER-SIDE VALIDATION
  // ==========================================
  console.log("\n--- 2. Server-Side Zod Validation Rigor ---");

  // 2.1 Product Validation (Negative price, empty name, bad slug)
  {
    const invalidProduct = {
      name: "",
      slug: "invalid slug with spaces!",
      price: -15,
      inventory: -5,
      category: "InvalidCategory",
    };
    const parsed = createProductSchema.safeParse(invalidProduct);
    assert.strictEqual(parsed.success, false, "Invalid product payload must fail Zod validation.");
    console.log("  [PASS] Negative price, malformed slug, and negative inventory rejected by Zod.");
  }

  // 2.2 Order Validation (Empty items, invalid shipping address)
  {
    const invalidOrder = {
      items: [],
      shippingAddress: {
        fullName: "",
        phone: "12",
        street: "St",
        city: "",
        state: "",
        postalCode: "",
      },
    };
    const parsed = createOrderSchema.safeParse(invalidOrder);
    assert.strictEqual(parsed.success, false, "Empty order items and invalid address must fail Zod validation.");
    console.log("  [PASS] Empty order items and malformed shipping fields rejected by Zod.");
  }

  // 2.3 Address Validation
  {
    const invalidAddress = {
      label: "",
      fullName: "",
      street: "",
      city: "",
      postalCode: "",
    };
    const parsed = addressSchema.safeParse(invalidAddress);
    assert.strictEqual(parsed.success, false, "Empty address fields must fail Zod validation.");
    console.log("  [PASS] Missing address fields rejected by Zod.");
  }

  // ==========================================
  // SECTION 3: AUTHENTICATION & AUTHORIZATION
  // ==========================================
  console.log("\n--- 3. Authentication & Authorization Security ---");

  // 3.1 Anonymous User Access Restrictions
  {
    SessionService._setMockUser(null);
    let rejected = false;
    try {
      await AdminGuard.verifyAdmin();
    } catch (err: any) {
      if (err.message.includes("UNAUTHENTICATED")) rejected = true;
    }
    assert.strictEqual(rejected, true, "Anonymous user must be rejected with UNAUTHENTICATED.");
    console.log("  [PASS] Anonymous user rejected server-side when accessing AdminGuard.");
  }

  // 3.2 Customer Attempting Admin Privileges
  {
    const customerUser: SessionUser = {
      id: "phase6-customer-user",
      email: "cust.phase6@chocobliss.test",
      name: "Customer Phase6",
      role: "CUSTOMER",
      cocoaPoints: 50,
    };
    SessionService._setMockUser(customerUser);

    let forbidden = false;
    try {
      await AdminGuard.verifyAdmin();
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) forbidden = true;
    }
    assert.strictEqual(forbidden, true, "Customer must be rejected with FORBIDDEN when accessing AdminGuard.");
    console.log("  [PASS] CUSTOMER role strictly rejected server-side for admin privileges.");
  }

  // 3.3 Admin User Authorized
  {
    const adminUser: SessionUser = {
      id: "phase6-admin-user",
      email: "admin.phase6@chocobliss.test",
      name: "Admin Phase6",
      role: "ADMIN",
      cocoaPoints: 1000,
    };
    SessionService._setMockUser(adminUser);

    const verifiedAdmin = await AdminGuard.verifyAdmin();
    assert.strictEqual(verifiedAdmin.role, "ADMIN");
    assert.strictEqual(verifiedAdmin.id, "phase6-admin-user");
    console.log("  [PASS] ADMIN role verified authoritatively by AdminGuard.");
  }

  // Reset SessionService mock
  SessionService._setMockUser(null);

  // ==========================================
  // SECTION 4: TOKEN BUCKET RATE LIMITING
  // ==========================================
  console.log("\n--- 4. Token Bucket Rate Limiting (Capacity: 10, Refill: 1 / 2s) ---");

  {
    // Create dedicated rate limiter instance (Capacity: 10, Refill: 2000ms)
    const limiter = new TokenBucketRateLimiter({
      maxTokens: 10,
      refillRateMs: 2000,
    });
    const testId = `phase6-ratelimit-test-${Date.now()}`;
    const startTime = 1000000;

    // Step 4.1: Consume all 10 tokens at T0
    for (let i = 1; i <= 10; i++) {
      const result = limiter.consumeMemory(testId, 1, startTime);
      assert.strictEqual(result.success, true, `Token ${i} consumption should succeed.`);
      assert.strictEqual(result.remaining, 10 - i);
    }
    console.log("  [PASS] Capacity check: 10 tokens successfully consumed from fresh bucket.");

    // Step 4.2: 11th token at same timestamp T0 must be rejected
    const rejectedResult = limiter.consumeMemory(testId, 1, startTime);
    assert.strictEqual(rejectedResult.success, false, "11th token request must be rejected when bucket is empty.");
    assert.strictEqual(rejectedResult.remaining, 0);
    assert(rejectedResult.retryAfterSeconds > 0, "retryAfterSeconds must be positive.");
    console.log("  [PASS] Rejection check: 11th token request strictly rejected with 429 semantics.");

    // Step 4.3: Advance time by 2000ms (1 refill interval) -> exactly 1 token refilled
    const after2sResult = limiter.consumeMemory(testId, 1, startTime + 2000);
    assert.strictEqual(after2sResult.success, true, "1 token should be refilled after 2000ms.");
    assert.strictEqual(after2sResult.remaining, 0, "Bucket had 1 refilled token and it was consumed.");
    console.log("  [PASS] Gradual refill check: Exactly 1 token refilled after 2000ms.");

    // Step 4.4: Immediately request another token at T0 + 2000ms -> should fail (not full reset)
    const immediateNext = limiter.consumeMemory(testId, 1, startTime + 2000);
    assert.strictEqual(immediateNext.success, false, "Bucket must NOT completely reset all 10 tokens at once.");
    console.log("  [PASS] No instant bucket reset invariant verified (strictly gradual refill).");

    // Step 4.5: Advance time by 6000ms (T0 + 8000ms) -> 3 tokens refilled
    const after6s = limiter.consumeMemory(testId, 3, startTime + 8000);
    assert.strictEqual(after6s.success, true, "3 tokens refilled over 6000ms (3 * 2000ms).");
    console.log("  [PASS] Cumulative refill verified (3 tokens over 6 seconds).");
  }

  // ==========================================
  // SECTION 5: SECURITY AUDIT & SECRET EXPOSURE
  // ==========================================
  console.log("\n--- 5. Security & Secret Exposure Audit ---");

  // 5.1 Check .gitignore contains environment files
  const gitignorePath = path.resolve(process.cwd(), ".gitignore");
  assert(fs.existsSync(gitignorePath), ".gitignore must exist.");
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
  assert(gitignoreContent.includes(".env"), ".gitignore must ignore .env files.");
  assert(gitignoreContent.includes(".env.local"), ".gitignore must ignore .env.local.");
  console.log("  [PASS] .gitignore strictly prevents committing .env and .env.local files.");

  // 5.2 Verify error sanitation (never leak stack traces or internal DB credentials)
  const simulatedDbError = new Error("Connection failed at postgresql://chocobliss:secret_password@db.neon.tech/main");
  const sanitized = handleActionError(simulatedDbError);
  assert.strictEqual(sanitized.success, false);
  assert(!sanitized.error.message.includes("secret_password"), "Database credentials must never be in client error.");
  assert(!sanitized.error.message.includes("neon.tech"), "Database hostname must never be in client error.");
  console.log("  [PASS] Sensitive database credentials and hostnames filtered out from client error output.");

  // Clean up test data
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: "phase6-user-unique-1" },
    });
    await prisma.product.deleteMany({
      where: { slug: "phase6-artisan-truffle-slug" },
    });
    await prisma.user.deleteMany({
      where: { email: "phase6.unique.test@chocobliss.test" },
    });
  } catch {}

  console.log("\n=================================================");
  console.log("=== ALL PHASE 6 PRODUCTION-READINESS TESTS PASSED! ==");
  console.log("=================================================\n");
}

runPhase6Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Phase 6 Test Failure:", err);
    process.exit(1);
  });
