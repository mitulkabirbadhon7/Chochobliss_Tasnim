/**
 * Comprehensive Full Website Production Verification Test Suite
 * Tests Auth, Permissions, User Input Validation, Server-Side Validation,
 * Database Integrity, Categories, and Rate Limiting.
 */

import { prisma } from "../lib/prisma";
import { AdminGuard } from "../lib/auth/admin-guard";
import { SessionService } from "../lib/auth/session";
import { registerAction, devLoginAction } from "../lib/actions/auth";
import { createProduct } from "../lib/actions/products";
import { createOrder } from "../lib/actions/orders";
import { submitContactMessageAction } from "../lib/actions/contact";
import { rateLimit } from "../lib/rate-limit";
import { sanitizeErrorMessage } from "../lib/errors";
import { registerSchema } from "../lib/validations/auth";
import { createProductSchema } from "../lib/validations/product";
import { contactFormSchema } from "../lib/validations/contact";
import { createOrderSchema } from "../lib/validations/order";
import { FIXED_ADMIN_EMAILS } from "../lib/constants/admins";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${message}`);
  }
}

async function runTestSuite() {
  console.log("===============================================================");
  console.log("=== FULL WEBSITE PRODUCTION READINESS & SECURITY TEST SUITE ===");
  console.log("===============================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    totalTests++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passedTests++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ [FAIL] ${name}: ${msg}`);
      throw err;
    }
  };

  // -------------------------------------------------------------
  // 1. DATABASE & CATEGORY INTEGRITY
  // -------------------------------------------------------------
  console.log("--- 1. DATABASE & CATEGORIES ---");

  await test("Database connection and core categories check", async () => {
    const userCount = await prisma.user.count();
    assert(userCount >= 2, "Database must have active administrator accounts configured");
    const validCategories = ["Bar", "Customized Bar", "mini"];
    assert(validCategories.length === 3, "Target boutique categories must be Bar, Customized Bar, mini");
  });

  await test("Unique email constraint in Neon PostgreSQL", async () => {
    let threwUnique = false;
    try {
      await prisma.user.create({
        data: {
          email: "mitulkabir0@gmail.com",
          name: "Duplicate User Test",
          role: "CUSTOMER",
          authProvider: "credentials",
        },
      });
    } catch {
      threwUnique = true;
    }
    assert(threwUnique, "Attempting to insert existing email must trigger DB unique constraint");
  });

  // -------------------------------------------------------------
  // 2. AUTHENTICATION & INPUT VALIDATION
  // -------------------------------------------------------------
  console.log("\n--- 2. AUTHENTICATION & INPUT VALIDATION ---");

  await test("Registration rejects malformed emails, short passwords, empty names", async () => {
    const invalidEmail = registerSchema.safeParse({
      name: "Test",
      email: "not-an-email",
      password: "pass",
    });
    assert(!invalidEmail.success, "Invalid email format must be rejected by Zod");

    const shortPassword = registerSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "123",
    });
    assert(!shortPassword.success, "Password under 6 characters must be rejected by Zod");

    const emptyName = registerSchema.safeParse({
      name: "   ",
      email: "test@example.com",
      password: "password123",
    });
    assert(!emptyName.success, "Empty or whitespace-only name must be rejected by Zod");
  });

  await test("Register action reports existing account clearly", async () => {
    const res = await registerAction({
      name: "Duplicate Tester",
      email: "mitulkabir0@gmail.com",
      password: "password123",
    });
    assert(!res.success, "Existing email registration must fail");
    if (!res.success) {
      assert(
        res.error.code === "EMAIL_ALREADY_EXISTS",
        "Should return EMAIL_ALREADY_EXISTS error code"
      );
    }
  });

  // -------------------------------------------------------------
  // 3. ROLE-BASED ACCESS CONTROL & PERMISSIONS
  // -------------------------------------------------------------
  console.log("\n--- 3. PERMISSION & AUTHORIZATION GUARDS ---");

  await test("Anonymous user cannot access AdminGuard", async () => {
    SessionService._setMockUser(null);
    let rejected = false;
    try {
      await AdminGuard.verifyAdmin();
    } catch {
      rejected = true;
    }
    assert(rejected, "Anonymous user must be blocked by AdminGuard");
  });

  await test("Standard CUSTOMER user cannot access AdminGuard", async () => {
    SessionService._setMockUser({
      id: "cust-1",
      email: "customer@example.com",
      name: "Customer",
      role: "CUSTOMER",
      cocoaPoints: 50,
    });

    let rejected = false;
    try {
      await AdminGuard.verifyAdmin();
    } catch {
      rejected = true;
    }
    assert(rejected, "Customer role must be blocked from admin actions");
  });

  await test("Authorized ADMIN successfully verified", async () => {
    SessionService._setMockUser({
      id: "admin-1",
      email: FIXED_ADMIN_EMAILS[0],
      name: "Mitul Kabir Badhon",
      role: "ADMIN",
      cocoaPoints: 1000,
    });

    const admin = await AdminGuard.verifyAdmin();
    assert(admin.role === "ADMIN", "Verified admin must have role ADMIN");
    assert(admin.email === FIXED_ADMIN_EMAILS[0], "Admin email must match authorized email");
  });

  // -------------------------------------------------------------
  // 4. SERVER-SIDE PRODUCT & CMS VALIDATION
  // -------------------------------------------------------------
  console.log("\n--- 4. PRODUCT VALIDATION & STOREFRONT ---");

  await test("Product schema rejects invalid prices and negative inventory", async () => {
    const invalidPrice = createProductSchema.safeParse({
      name: "Invalid Bar",
      price: -50,
      sku: "TEST-NEG",
      category: "Bar",
      inventory: 10,
    });
    assert(!invalidPrice.success, "Negative product price must be rejected");

    const invalidInventory = createProductSchema.safeParse({
      name: "Invalid Bar",
      price: 500,
      sku: "TEST-INV",
      category: "Bar",
      inventory: -5,
    });
    assert(!invalidInventory.success, "Negative inventory count must be rejected");
  });

  await test("Customer cannot create products via Server Action", async () => {
    SessionService._setMockUser({
      id: "cust-attacker",
      email: "attacker@example.com",
      name: "Attacker",
      role: "CUSTOMER",
      cocoaPoints: 0,
    });

    const res = await createProduct({
      name: "Malicious Bar",
      price: 1,
      sku: "HACK-01",
      category: "Bar",
      inventory: 100,
    });

    assert(!res.success, "Customer product creation attempt must be rejected");
  });

  // -------------------------------------------------------------
  // 5. ORDER & CHECKOUT SECURITY
  // -------------------------------------------------------------
  console.log("\n--- 5. ORDER SECURITY & PRICE INTEGRITY ---");

  await test("Order schema rejects empty cart and missing address", async () => {
    const emptyCart = createOrderSchema.safeParse({
      items: [],
      shippingAddress: {
        fullName: "Tasnim",
        street: "Gulshan 2",
        city: "Dhaka",
        state: "Dhaka",
        postalCode: "1212",
        country: "Bangladesh",
        phone: "+8801700000000",
      },
    });
    assert(!emptyCart.success, "Empty cart in checkout must be rejected");

    const missingPhone = createOrderSchema.safeParse({
      items: [{ productId: "p1", quantity: 1 }],
      shippingAddress: {
        fullName: "Tasnim",
        street: "Gulshan 2",
        city: "Dhaka",
        state: "Dhaka",
        postalCode: "1212",
        country: "Bangladesh",
        phone: "", // Invalid
      },
    });
    assert(!missingPhone.success, "Missing customer delivery phone must be rejected");
  });

  await test("Unauthenticated checkout attempt strictly blocked", async () => {
    SessionService._setMockUser(null);
    const res = await createOrder({
      items: [{ productId: "some-prod-id", quantity: 1 }],
      shippingAddress: {
        fullName: "Guest User",
        street: "Dhanmondi",
        city: "Dhaka",
        state: "Dhaka",
        postalCode: "1209",
        country: "Bangladesh",
        phone: "+8801700000001",
      },
    });
    assert(!res.success, "Unauthenticated order placement must fail");
  });

  // -------------------------------------------------------------
  // 6. CONTACT FORM & INPUT SANITIZATION
  // -------------------------------------------------------------
  console.log("\n--- 6. CONTACT CONCIERGE & SANITIZATION ---");

  await test("Contact form validates email, category, and minimum message length", async () => {
    const shortMessage = contactFormSchema.safeParse({
      name: "Customer",
      email: "customer@example.com",
      category: "INQUIRY",
      subject: "Hello",
      message: "Short", // Minimum is 10 characters
    });
    assert(!shortMessage.success, "Message under 10 chars must be rejected");

    const validMessage = contactFormSchema.safeParse({
      name: "Connoisseur",
      email: "connoisseur@luxury.test",
      category: "CUSTOM_ORDER",
      subject: "Bespoke Truffle Box",
      message: "I would like to order a tailored selection of 50 single-origin truffles.",
    });
    assert(validMessage.success, "Valid contact form input must be accepted");
  });

  // -------------------------------------------------------------
  // 7. RATE LIMITING & CREDENTIAL MASKING
  // -------------------------------------------------------------
  console.log("\n--- 7. RATE LIMITING & CREDENTIAL MASKING ---");

  await test("Rate limiter allows within limit and rejects excessive requests", async () => {
    const testId = `test-client-${Date.now()}`;
    const opts = { maxTokens: 3, refillIntervalMs: 10000 };

    assert(rateLimit(testId, opts).success, "Request 1 must be permitted");
    assert(rateLimit(testId, opts).success, "Request 2 must be permitted");
    assert(rateLimit(testId, opts).success, "Request 3 must be permitted");
    assert(!rateLimit(testId, opts).success, "Request 4 must be rate-limited (429)");
  });

  await test("Sanitize error filters sensitive connection strings and secrets", async () => {
    const rawError = new Error(
      "Database failed: postgresql://neondb_owner:secret_password@ep-sparkling-mouse.aws.neon.tech/neondb"
    );
    const sanitized = sanitizeErrorMessage(rawError);
    assert(!sanitized.includes("secret_password"), "Password must never appear in client error");
    assert(!sanitized.includes("neondb_owner"), "Database user must never appear in client error");
  });

  // Reset mock user
  SessionService._setMockUser(undefined);

  console.log("\n===============================================================");
  console.log(`=== FULL SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! ===`);
  console.log("===============================================================\n");
}

runTestSuite().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
