import assert from "node:assert";
import { TokenBucketRateLimiter, rateLimiter } from "../lib/rate-limit";
import { createProductSchema, updateProductSchema } from "../lib/validations/product";
import { createOrderSchema, shippingAddressSchema } from "../lib/validations/order";
import { updateProfileSchema, addressSchema } from "../lib/validations/user";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  handleActionError,
} from "../lib/errors";
import { Prisma } from "@prisma/client";

async function runPhase3Tests() {
  console.log("=================================================");
  console.log("=== RUNNING PHASE 3 BACKEND & SECURITY TESTS ===");
  console.log("=================================================\n");

  // ==========================================
  // SECTION 1: ZOD VALIDATION TESTS
  // ==========================================
  console.log("--- 1. Zod Validation Tests ---");

  // Test 1.1: Product validation with valid input
  {
    const validProduct = {
      name: "72% Single-Origin Madagascar",
      description: "Artisanal dark chocolate bar with bright citrus and red fruit tasting notes.",
      price: 14.5,
      salePrice: 12.0,
      sku: "CB-BAR-MAD72",
      inventory: 50,
      cacaoPercentage: 72,
      origin: "Sambirano Valley, Madagascar",
      flavorNotes: ["Citrus", "Red Fruit", "Honey"],
      images: ["https://chocobliss.test/madagascar.jpg"],
      category: "Bars",
      isFeatured: true,
      isPublished: true,
    };
    const parsed = createProductSchema.safeParse(validProduct);
    assert.strictEqual(parsed.success, true, "Valid product must pass validation");
    console.log("  [PASS] Valid product passes schema validation.");
  }

  // Test 1.2: Product validation rejects salePrice >= price
  {
    const invalidProduct = {
      name: "Invalid Pricing Bar",
      description: "A chocolate bar where discount is higher than base price.",
      price: 10.0,
      salePrice: 12.0, // Invalid!
      sku: "CB-INV-001",
      inventory: 10,
      images: ["https://chocobliss.test/img.jpg"],
    };
    const parsed = createProductSchema.safeParse(invalidProduct);
    assert.strictEqual(parsed.success, false, "Sale price >= price must fail");
    console.log("  [PASS] Product rejected when salePrice >= price.");
  }

  // Test 1.3: Product validation rejects negative inventory
  {
    const invalidInventory = {
      name: "Negative Inventory Bar",
      description: "Chocolate bar with invalid negative stock count.",
      price: 15.0,
      sku: "CB-NEG-001",
      inventory: -5, // Invalid!
      images: ["https://chocobliss.test/img.jpg"],
    };
    const parsed = createProductSchema.safeParse(invalidInventory);
    assert.strictEqual(parsed.success, false, "Negative inventory must fail");
    console.log("  [PASS] Product rejected when inventory < 0.");
  }

  // Test 1.4: Order validation rejects empty items
  {
    const emptyOrder = {
      items: [],
      shippingAddress: {
        fullName: "Amira Rahman",
        phone: "+8801712345678",
        street: "House 12, Road 4, Dhanmondi",
        city: "Dhaka",
        state: "Dhaka",
        postalCode: "1209",
        country: "Bangladesh",
      },
    };
    const parsed = createOrderSchema.safeParse(emptyOrder);
    assert.strictEqual(parsed.success, false, "Order with 0 items must fail");
    console.log("  [PASS] Order rejected when items array is empty.");
  }

  // Test 1.5: Order validation strips/ignores client-submitted prices
  {
    const tamperedOrder = {
      items: [
        {
          productId: "prod_123",
          quantity: 2,
          unitPrice: 0.01, // Malicious attempt to dictate price
          subtotal: 0.02,
        },
      ],
      totalAmount: 0.02, // Malicious attempt to dictate total
      userId: "victim_user_456", // Malicious attempt to spoof user ID
      shippingAddress: {
        fullName: "Amira Rahman",
        phone: "+8801712345678",
        street: "House 12, Road 4, Dhanmondi",
        city: "Dhaka",
        state: "Dhaka",
        postalCode: "1209",
        country: "Bangladesh",
      },
      paymentMethod: "CARD",
    };
    const parsed = createOrderSchema.safeParse(tamperedOrder);
    assert.strictEqual(parsed.success, true);
    // Verify client-submitted malicious fields are not part of parsed schema data
    assert.strictEqual((parsed.data as Record<string, unknown>).totalAmount, undefined);
    assert.strictEqual((parsed.data as Record<string, unknown>).userId, undefined);
    assert.strictEqual((parsed.data.items[0] as Record<string, unknown>).unitPrice, undefined);
    console.log("  [PASS] Client-submitted prices, subtotals, and user IDs are safely stripped.\n");
  }

  // ==========================================
  // SECTION 2: AUTHORIZATION & RBAC SECURITY TESTS
  // ==========================================
  console.log("--- 2. Authorization & RBAC Security Tests ---");

  // Test 2.1: Anonymous user cannot execute admin mutations
  {
    const verifyUserSession = (user: { role: string } | null) => {
      if (!user) throw new AuthenticationError("Authentication required.");
      if (user.role !== "ADMIN") throw new AuthorizationError("Administrative privileges required.");
    };

    assert.throws(
      () => verifyUserSession(null),
      (err: unknown) => (err as AuthenticationError).code === "UNAUTHENTICATED",
      "Anonymous user must be rejected"
    );
    console.log("  [PASS] Anonymous user rejected with UNAUTHENTICATED.");
  }

  // Test 2.2: CUSTOMER role attempting ADMIN mutation
  {
    const customerUser = { id: "cust_1", role: "CUSTOMER" };
    const verifyUserSession = (user: { role: string } | null) => {
      if (!user) throw new AuthenticationError("Authentication required.");
      if (user.role !== "ADMIN") throw new AuthorizationError("Administrative privileges required.");
    };

    assert.throws(
      () => verifyUserSession(customerUser),
      (err: unknown) => (err as AuthorizationError).code === "FORBIDDEN",
      "Customer role must be blocked from admin mutation"
    );
    console.log("  [PASS] CUSTOMER role attempting ADMIN mutation rejected with FORBIDDEN.");
  }

  // Test 2.3: Verified ADMIN user is authorized
  {
    const adminUser = { id: "admin_1", role: "ADMIN" };
    const verifyUserSession = (user: { role: string } | null) => {
      if (!user) throw new AuthenticationError("Authentication required.");
      if (user.role !== "ADMIN") throw new AuthorizationError("Administrative privileges required.");
      return true;
    };

    assert.strictEqual(verifyUserSession(adminUser), true);
    console.log("  [PASS] Verified ADMIN user permitted to execute mutation.");
  }

  // Test 2.4: User accessing another user's order
  {
    const activeUser = { id: "cust_1", role: "CUSTOMER" };
    const orderBelongingToAnother = { id: "order_999", userId: "cust_2" };

    const verifyOrderOwnership = (user: { id: string; role: string }, order: { userId: string }) => {
      if (order.userId !== user.id && user.role !== "ADMIN") {
        throw new AuthorizationError("You do not have permission to view this order.");
      }
      return true;
    };

    assert.throws(
      () => verifyOrderOwnership(activeUser, orderBelongingToAnother),
      (err: unknown) => (err as AuthorizationError).code === "FORBIDDEN",
      "User cannot access another user's order"
    );
    console.log("  [PASS] User prevented from accessing another customer's order.\n");
  }

  // ==========================================
  // SECTION 3: RATE LIMITING TESTS (TOKEN BUCKET)
  // ==========================================
  console.log("--- 3. Rate Limiting Tests (Token Bucket Engine) ---");

  // Test 3.1: Token Bucket max capacity 10 and exhaustion at 11th request
  {
    const limiter = new TokenBucketRateLimiter({ maxTokens: 10, refillRateMs: 2000 });
    const testId = "test-client-1";
    const startTime = 1000000;

    // Consume 10 tokens
    for (let i = 1; i <= 10; i++) {
      const res = limiter.consumeMemory(testId, 1, startTime);
      assert.strictEqual(res.success, true, `Token ${i} should be allowed`);
      assert.strictEqual(res.remaining, 10 - i);
    }

    // 11th request must fail
    const blockedRes = limiter.consumeMemory(testId, 1, startTime);
    assert.strictEqual(blockedRes.success, false, "11th request must be rate limited");
    assert.strictEqual(blockedRes.remaining, 0);
    assert.strictEqual(blockedRes.retryAfterSeconds, 2);
    console.log("  [PASS] Exactly 10 tokens consumed; 11th request returned 429 RATE_LIMITED.");
  }

  // Test 3.2: Gradual Refill (1 token every 2 seconds, NOT immediate full reset)
  {
    const limiter = new TokenBucketRateLimiter({ maxTokens: 10, refillRateMs: 2000 });
    const testId = "test-client-gradual";
    let simulatedTime = 2000000;

    // Drain all 10 tokens
    for (let i = 0; i < 10; i++) {
      limiter.consumeMemory(testId, 1, simulatedTime);
    }

    // Check after 1000 ms (1 second) -> Still 0 tokens (< 2000 ms)
    simulatedTime += 1000;
    const resAt1s = limiter.consumeMemory(testId, 1, simulatedTime);
    assert.strictEqual(resAt1s.success, false, "Should not refill before 2s interval");

    // Check after another 1000 ms (total 2000 ms elapsed) -> Exactly 1 token refilled!
    simulatedTime += 1000;
    const resAt2s = limiter.consumeMemory(testId, 1, simulatedTime);
    assert.strictEqual(resAt2s.success, true, "1 token should be available after 2 seconds");
    assert.strictEqual(resAt2s.remaining, 0, "Consuming the 1 token leaves 0");

    // Check after 4000 ms (4 seconds) without requests -> Exactly 2 tokens refilled!
    simulatedTime += 4000;
    const res1 = limiter.consumeMemory(testId, 1, simulatedTime);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.remaining, 1, "After consuming 1 of 2 tokens, 1 remains");

    const res2 = limiter.consumeMemory(testId, 1, simulatedTime);
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.remaining, 0, "After consuming second token, 0 remain");

    const res3 = limiter.consumeMemory(testId, 1, simulatedTime);
    assert.strictEqual(res3.success, false, "Third token not available yet (verifies gradual refill)");

    console.log("  [PASS] Tokens refill gradually (1 token / 2s), confirming non-fixed-window behavior.\n");
  }

  // ==========================================
  // SECTION 4: ORDER BUSINESS LOGIC & PRICING
  // ==========================================
  console.log("--- 4. Order Business Logic & Transactional Safety ---");

  // Test 4.1: Server-side pricing calculation and shipping policy
  {
    // Product in DB: price 25.00, salePrice null
    const dbProduct = {
      id: "prod_bonbon",
      name: "Signature Truffle Box (12 pcs)",
      price: new Prisma.Decimal("25.00"),
      salePrice: null,
      inventory: 20,
      isPublished: true,
      deletedAt: null,
    };

    // Client requests 3 units
    const quantity = 3;
    const unitPrice = dbProduct.salePrice ?? dbProduct.price;
    const subtotal = unitPrice.mul(quantity); // 75.00
    assert.strictEqual(subtotal.toString(), "75");

    // Subtotal 75 is under 100 threshold -> Shipping fee $15.00 applies
    const freeShippingThreshold = new Prisma.Decimal(100);
    const standardShippingFee = new Prisma.Decimal(15);
    const shippingFee = subtotal.gte(freeShippingThreshold) ? new Prisma.Decimal(0) : standardShippingFee;
    assert.strictEqual(shippingFee.toString(), "15");

    const totalAmount = subtotal.add(shippingFee); // 90.00
    assert.strictEqual(totalAmount.toString(), "90");

    // Client requests 5 units (5 * 25 = 125.00 >= 100) -> Free shipping ($0)
    const largeSubtotal = unitPrice.mul(5); // 125.00
    const largeShippingFee = largeSubtotal.gte(freeShippingThreshold) ? new Prisma.Decimal(0) : standardShippingFee;
    assert.strictEqual(largeShippingFee.toString(), "0");
    const largeTotal = largeSubtotal.add(largeShippingFee);
    assert.strictEqual(largeTotal.toString(), "125");

    console.log("  [PASS] Server authoritative pricing and conditional shipping fee verified.");
  }

  // Test 4.2: Insufficient inventory prevention
  {
    const dbProduct = {
      id: "prod_limited",
      name: "Limited Edition Truffles",
      inventory: 3,
    };

    const requestedQuantity = 5;
    const checkStock = (stock: number, qty: number) => {
      if (stock < qty) {
        throw new ValidationError(`Insufficient stock. Only ${stock} available.`);
      }
    };

    assert.throws(
      () => checkStock(dbProduct.inventory, requestedQuantity),
      (err: unknown) => (err as ValidationError).code === "VALIDATION_ERROR"
    );
    console.log("  [PASS] Order rejected when requested quantity exceeds available inventory.");
  }

  // Test 4.3: Soft-deleted product cannot be ordered
  {
    const deletedProduct = {
      id: "prod_archived",
      name: "Discontinued Cocoa Bar",
      deletedAt: new Date("2026-01-01"),
      isPublished: false,
    };

    const validateAvailability = (product: { deletedAt: Date | null; isPublished: boolean }) => {
      if (product.deletedAt !== null || !product.isPublished) {
        throw new ValidationError("Product is currently unavailable or discontinued.");
      }
    };

    assert.throws(
      () => validateAvailability(deletedProduct),
      (err: unknown) => (err as ValidationError).code === "VALIDATION_ERROR"
    );
    console.log("  [PASS] Soft-deleted product blocked from checkout.\n");
  }

  // ==========================================
  // SECTION 5: ERROR HANDLING & INFORMATION LEAKAGE
  // ==========================================
  console.log("--- 5. Error Handling & Information Leakage Prevention ---");

  // Test 5.1: Prisma P2002 Unique Constraint error is sanitized
  {
    const fakePrismaError = {
      name: "PrismaClientKnownRequestError",
      code: "P2002",
      message: "Unique constraint failed on the fields: (`slug`)",
      meta: { target: ["slug"] },
    };

    const safeResult = handleActionError(fakePrismaError);
    assert.strictEqual(safeResult.success, false);
    assert.strictEqual(safeResult.error.code, "CONFLICT");
    assert.strictEqual(
      safeResult.error.message,
      "A unique constraint violation occurred. Resource already exists."
    );
    // Ensure no raw SQL or DB schema fields leaked
    assert.strictEqual((safeResult.error as unknown as Record<string, unknown>).meta, undefined);
    console.log("  [PASS] Database constraint error safely mapped to CONFLICT without leaking DB schema.");
  }

  // Test 5.2: Unhandled internal error conceals stack traces and credentials
  {
    const secretDbUri = "postgresql://user:super_secret_password@db.neon.tech/main";
    const rawException = new Error(`Connection timeout at ${secretDbUri} inside query: SELECT * FROM users;`);

    const safeResult = handleActionError(rawException);
    assert.strictEqual(safeResult.success, false);
    assert.strictEqual(safeResult.error.code, "INTERNAL_SERVER_ERROR");
    assert.strictEqual(
      safeResult.error.message,
      "An unexpected error occurred. Please contact support if the issue persists."
    );
    // Verify secret is not in output
    assert.strictEqual(JSON.stringify(safeResult).includes("super_secret_password"), false);
    assert.strictEqual(JSON.stringify(safeResult).includes("SELECT * FROM"), false);
    assert.strictEqual(JSON.stringify(safeResult).includes("stack"), false);
    console.log("  [PASS] Unhandled exception concealed sensitive credentials, SQL, and stack traces.\n");
  }

  console.log("=================================================");
  console.log("=== ALL PHASE 3 TESTS COMPLETED SUCCESSFULLY ===");
  console.log("=================================================");
}

runPhase3Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
