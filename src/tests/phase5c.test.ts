import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { SessionService } from "../lib/auth/session";
import {
  getUserOrders,
  getOrderById,
} from "../lib/actions/orders";
import {
  getUserAddressesAction,
  addAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "../lib/actions/users";
import {
  getWishlistAction,
  toggleWishlistAction,
  removeFromWishlistAction,
} from "../lib/actions/wishlist";
import {
  maskPhone,
  maskEmail,
  maskStreet,
} from "../lib/utils/masking";

async function runPhase5CTests() {
  console.log("=================================================");
  console.log("=== RUNNING PHASE 5C DASHBOARD & SECURITY TESTS ===");
  console.log("=================================================\n");

  // Setup test users: User A and User B
  const testUserAId = "test-user-a-dash";
  const testUserBId = "test-user-b-dash";

  const userA = await prisma.user.upsert({
    where: { email: "usera.dash@chocobliss.test" },
    update: { name: "User A Connoisseur" },
    create: {
      id: testUserAId,
      email: "usera.dash@chocobliss.test",
      name: "User A Connoisseur",
      phone: "+8801711111111",
      role: "CUSTOMER",
      cocoaPoints: 250,
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: "userb.dash@chocobliss.test" },
    update: { name: "User B Connoisseur" },
    create: {
      id: testUserBId,
      email: "userb.dash@chocobliss.test",
      name: "User B Connoisseur",
      phone: "+8801722222222",
      role: "CUSTOMER",
      cocoaPoints: 750,
    },
  });

  // Get a sample active product for wishlist & order tests
  const sampleProduct = await prisma.product.findFirst({
    where: { deletedAt: null, isPublished: true },
  });
  assert.ok(sampleProduct, "Need at least 1 active product for tests");

  // Create an order belonging exclusively to User B
  const orderB = await prisma.order.upsert({
    where: { orderNumber: "CB-TEST-ORDER-B99" },
    update: {},
    create: {
      orderNumber: "CB-TEST-ORDER-B99",
      userId: userB.id,
      status: "PROCESSING",
      paymentStatus: "PAID",
      paymentMethod: "CARD",
      subtotal: 35.0,
      shippingFee: 0.0,
      discountAmount: 0.0,
      totalAmount: 35.0,
      cocoaPointsEarned: 3,
      cocoaPointsRedeemed: 0,
      shippingAddress: {
        fullName: "User B Connoisseur",
        street: "Secret Road 42",
        city: "Dhaka",
        phone: "+8801722222222",
      },
    },
  });

  // ==========================================
  // SECTION 1: ANONYMOUS ACCESS REJECTION
  // ==========================================
  console.log("--- 1. Anonymous Access Restrictions ---");

  // Clear mock session
  SessionService._setMockUser(null);

  const anonOrders = await getUserOrders();
  assert.strictEqual(anonOrders.success, false);
  assert.strictEqual(anonOrders.error?.code, "UNAUTHENTICATED");
  console.log("  [PASS] Anonymous access to orders rejected with UNAUTHENTICATED.");

  const anonAddresses = await getUserAddressesAction();
  assert.strictEqual(anonAddresses.success, false);
  assert.strictEqual(anonAddresses.error?.code, "UNAUTHENTICATED");
  console.log("  [PASS] Anonymous access to addresses rejected with UNAUTHENTICATED.");

  const anonWishlist = await getWishlistAction();
  assert.strictEqual(anonWishlist.success, false);
  assert.strictEqual(anonWishlist.error?.code, "UNAUTHENTICATED");
  console.log("  [PASS] Anonymous access to wishlist rejected with UNAUTHENTICATED.\n");

  // ==========================================
  // SECTION 2: MANDATORY CROSS-USER SECURITY TESTS
  // ==========================================
  console.log("--- 2. Mandatory Cross-User Isolation (User A -> User B) ---");

  // Set active session to User A
  SessionService._setMockUser({
    id: userA.id,
    email: userA.email,
    name: userA.name,
    role: "CUSTOMER",
    cocoaPoints: userA.cocoaPoints,
  });

  // Test 2a: User A accessing User B's order ID
  const crossOrderAttempt = await getOrderById(orderB.id);
  assert.strictEqual(crossOrderAttempt.success, false);
  assert.strictEqual(crossOrderAttempt.error?.code, "FORBIDDEN");
  console.log("  [PASS] User A blocked from accessing User B's order (returned FORBIDDEN).");

  // Create an address belonging to User B
  const addressB = await prisma.address.create({
    data: {
      userId: userB.id,
      label: "User B Secret Villa",
      fullName: "User B",
      street: "Private Lane 9",
      city: "Dhaka",
      state: "Dhaka",
      postalCode: "1212",
      phone: "+8801722222222",
    },
  });

  // Test 2b: User A attempting to update User B's address
  const crossAddressUpdate = await updateAddressAction({
    id: addressB.id,
    label: "Hacked Label",
  });
  assert.strictEqual(crossAddressUpdate.success, false);
  assert.strictEqual(crossAddressUpdate.error?.code, "FORBIDDEN");
  console.log("  [PASS] User A blocked from updating User B's address (returned FORBIDDEN).");

  // Test 2c: User A attempting to delete User B's address
  const crossAddressDelete = await deleteAddressAction(addressB.id);
  assert.strictEqual(crossAddressDelete.success, false);
  assert.strictEqual(crossAddressDelete.error?.code, "FORBIDDEN");
  console.log("  [PASS] User A blocked from deleting User B's address (returned FORBIDDEN).");

  // Create a wishlist item belonging to User B
  const wishlistItemB = await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: userB.id,
        productId: sampleProduct.id,
      },
    },
    update: {},
    create: {
      userId: userB.id,
      productId: sampleProduct.id,
    },
  });

  // Test 2d: User A attempting to delete User B's wishlist item
  const crossWishlistDelete = await removeFromWishlistAction(wishlistItemB.id);
  assert.strictEqual(crossWishlistDelete.success, false);
  assert.strictEqual(crossWishlistDelete.error?.code, "FORBIDDEN");
  console.log("  [PASS] User A blocked from deleting User B's wishlist item (returned FORBIDDEN).\n");

  // ==========================================
  // SECTION 3: NORMAL AUTHENTICATED ACCESS & CRUD
  // ==========================================
  console.log("--- 3. Normal Authenticated Operations (User A) ---");

  // User A address creation
  const addAddrRes = await addAddressAction({
    label: "Atelier Residence",
    fullName: "User A Connoisseur",
    street: "Road 7A, House 12, Dhanmondi",
    city: "Dhaka",
    state: "Dhaka",
    postalCode: "1205",
    country: "Bangladesh",
    phone: "+8801711111111",
    isDefault: true,
  });
  assert.strictEqual(addAddrRes.success, true);
  const createdAddrId = addAddrRes.data?.id;
  assert.ok(createdAddrId);
  console.log("  [PASS] User A successfully created address.");

  // User A address update
  const updateAddrRes = await updateAddressAction({
    id: createdAddrId,
    label: "Primary Residence",
  });
  assert.strictEqual(updateAddrRes.success, true);
  console.log("  [PASS] User A successfully updated their own address.");

  // User A list addresses
  const userAAddresses = await getUserAddressesAction();
  assert.strictEqual(userAAddresses.success, true);
  const foundUserAAddr = userAAddresses.data?.find((a) => a.id === createdAddrId);
  assert.ok(foundUserAAddr);
  assert.strictEqual(foundUserAAddr.label, "Primary Residence");
  assert.strictEqual(foundUserAAddr.isDefault, true);
  console.log("  [PASS] User A address listing verified.");

  // User A set default address
  const setDefaultRes = await setDefaultAddressAction(createdAddrId);
  assert.strictEqual(setDefaultRes.success, true);
  console.log("  [PASS] User A set default address verified.");

  // User A address deletion
  const deleteAddrRes = await deleteAddressAction(createdAddrId);
  assert.strictEqual(deleteAddrRes.success, true);
  console.log("  [PASS] User A deleted own address successfully.");

  // User A Wishlist CRUD
  const toggleRes1 = await toggleWishlistAction(sampleProduct.id);
  assert.strictEqual(toggleRes1.success, true);
  assert.strictEqual(toggleRes1.data?.inWishlist, true);
  console.log("  [PASS] Product added to User A wishlist.");

  const listWishlistRes = await getWishlistAction();
  assert.strictEqual(listWishlistRes.success, true);
  const userAWishlistItem = listWishlistRes.data?.find(
    (w) => w.productId === sampleProduct.id
  );
  assert.ok(userAWishlistItem);
  assert.strictEqual(userAWishlistItem.product.name, sampleProduct.name);
  console.log("  [PASS] User A retrieved their own wishlist.");

  const toggleRes2 = await toggleWishlistAction(sampleProduct.id);
  assert.strictEqual(toggleRes2.success, true);
  assert.strictEqual(toggleRes2.data?.inWishlist, false);
  console.log("  [PASS] Product removed from User A wishlist via toggle.\n");

  // ==========================================
  // SECTION 4: EMPTY STATES VERIFICATION
  // ==========================================
  console.log("--- 4. Empty State Verification ---");

  // New clean user with 0 records
  const cleanUser = await prisma.user.upsert({
    where: { email: "cleanuser.dash@chocobliss.test" },
    update: {},
    create: {
      email: "cleanuser.dash@chocobliss.test",
      name: "Clean User",
      role: "CUSTOMER",
    },
  });

  SessionService._setMockUser({
    id: cleanUser.id,
    email: cleanUser.email,
    name: cleanUser.name,
    role: "CUSTOMER",
    cocoaPoints: 0,
  });

  const emptyOrdersRes = await getUserOrders();
  assert.strictEqual(emptyOrdersRes.success, true);
  assert.strictEqual(Array.isArray(emptyOrdersRes.data), true);
  assert.strictEqual(emptyOrdersRes.data?.length, 0);
  console.log("  [PASS] Empty order history returns empty array [] without throwing.");

  const emptyWishlistRes = await getWishlistAction();
  assert.strictEqual(emptyWishlistRes.success, true);
  assert.strictEqual(Array.isArray(emptyWishlistRes.data), true);
  assert.strictEqual(emptyWishlistRes.data?.length, 0);
  console.log("  [PASS] Empty wishlist returns empty array [] without throwing.");

  const emptyAddressesRes = await getUserAddressesAction();
  assert.strictEqual(emptyAddressesRes.success, true);
  assert.strictEqual(Array.isArray(emptyAddressesRes.data), true);
  assert.strictEqual(emptyAddressesRes.data?.length, 0);
  console.log("  [PASS] Empty address list returns empty array [] without throwing.\n");

  // ==========================================
  // SECTION 5: SENSITIVE DATA MASKING & INFORMATION LEAKAGE
  // ==========================================
  console.log("--- 5. Sensitive Information Masking ---");

  const maskedPhoneResult = maskPhone("+8801712345678");
  assert.strictEqual(maskedPhoneResult.includes("••••"), true);
  assert.strictEqual(maskedPhoneResult.startsWith("+880"), true);
  assert.strictEqual(maskedPhoneResult.endsWith("5678"), true);
  console.log(`  [PASS] Phone masking verified: '+8801712345678' -> '${maskedPhoneResult}'.`);

  const maskedEmailResult = maskEmail("tasnim.chocobliss@gmail.com");
  assert.strictEqual(maskedEmailResult.includes("••••"), true);
  assert.strictEqual(maskedEmailResult.endsWith("@gmail.com"), true);
  console.log(`  [PASS] Email masking verified: 'tasnim.chocobliss@gmail.com' -> '${maskedEmailResult}'.`);

  const maskedStreetResult = maskStreet("House 14 Road 4 Dhanmondi");
  assert.strictEqual(maskedStreetResult.includes("••••"), true);
  console.log(`  [PASS] Street address masking verified: 'House 14 Road 4 Dhanmondi' -> '${maskedStreetResult}'.`);

  // Verify no password or internal secret exists on User object
  const dbUser = await prisma.user.findUnique({ where: { id: userA.id } });
  assert.strictEqual(
    (dbUser as unknown as Record<string, unknown>).password,
    undefined,
    "User table must never contain password column"
  );
  assert.strictEqual(
    (dbUser as unknown as Record<string, unknown>).secret,
    undefined,
    "User table must never contain secret column"
  );
  console.log("  [PASS] Sensitive field isolation verified: 0 credentials in DB models.\n");

  // Clean up created test items
  await prisma.address.deleteMany({
    where: { id: { in: [addressB.id] } },
  });
  await prisma.wishlistItem.deleteMany({
    where: { id: { in: [wishlistItemB.id] } },
  });

  console.log("=================================================");
  console.log("=== ALL PHASE 5C DASHBOARD TESTS PASSED! ========");
  console.log("=================================================\n");
}

runPhase5CTests()
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
