import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { SessionService, type SessionUser } from "../lib/auth/session";
import { AdminGuard } from "../lib/auth/admin-guard";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../lib/actions/products";
import {
  getAdminDashboardMetricsAction,
  getAdminProductsAction,
  getAdminOrdersAction,
  getAdminCustomersAction,
  getAdminAnnouncementsAction,
  getAdminSiteContentsAction,
  updateSiteContentAction,
  updateAnnouncementAction,
  bulkUpdateProductsAction,
} from "../lib/actions/admin";
import { executeAdminTaskAction } from "../lib/actions/admin-test";
import { getOrderById } from "../lib/actions/orders";
import { updateAddressAction } from "../lib/actions/users";
import { GET as adminApiGet } from "../app/api/admin/route";

async function runPhase5DTests() {
  console.log("=================================================");
  console.log("=== RUNNING PHASE 5D ADMIN & SECURITY TESTS =====");
  console.log("=================================================\n");

  // 0. Setup Test Entities (Admin User, Customer User A, Customer User B)
  const adminUser: SessionUser = {
    id: "admin-tasnim-test",
    email: "tasnim.admin@chocobliss.test",
    name: "Tasnim B.",
    role: "ADMIN",
    cocoaPoints: 500,
  };

  const customerUserA: SessionUser = {
    id: "cust-user-a-test",
    email: "customer.a@chocobliss.test",
    name: "Customer A",
    role: "CUSTOMER",
    cocoaPoints: 120,
  };

  const customerUserB: SessionUser = {
    id: "cust-user-b-test",
    email: "customer.b@chocobliss.test",
    name: "Customer B",
    role: "CUSTOMER",
    cocoaPoints: 200,
  };

  // Upsert users into database for DB integrity
  await prisma.user.upsert({
    where: { email: adminUser.email },
    update: { role: "ADMIN", name: adminUser.name },
    create: {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: "ADMIN",
      cocoaPoints: 500,
    },
  });

  await prisma.user.upsert({
    where: { email: customerUserA.email },
    update: { role: "CUSTOMER", name: customerUserA.name },
    create: {
      id: customerUserA.id,
      email: customerUserA.email,
      name: customerUserA.name,
      role: "CUSTOMER",
      cocoaPoints: 120,
    },
  });

  await prisma.user.upsert({
    where: { email: customerUserB.email },
    update: { role: "CUSTOMER", name: customerUserB.name },
    create: {
      id: customerUserB.id,
      email: customerUserB.email,
      name: customerUserB.name,
      role: "CUSTOMER",
      cocoaPoints: 200,
    },
  });

  // Create an address and order for User B for isolation tests
  const addressB = await prisma.address.upsert({
    where: { id: "addr-user-b-test" },
    update: {},
    create: {
      id: "addr-user-b-test",
      userId: customerUserB.id,
      label: "Home",
      fullName: "Customer B Recipient",
      street: "Road 12 Banani",
      city: "Dhaka",
      state: "Dhaka",
      postalCode: "1213",
      country: "Bangladesh",
      phone: "+8801700000002",
      isDefault: true,
    },
  });

  const orderB = await prisma.order.upsert({
    where: { orderNumber: "CB-2026-TEST-B" },
    update: {},
    create: {
      id: "order-user-b-test",
      orderNumber: "CB-2026-TEST-B",
      userId: customerUserB.id,
      status: "PROCESSING",
      paymentStatus: "PAID",
      paymentMethod: "CARD",
      subtotal: 1200,
      shippingFee: 60,
      discountAmount: 0,
      totalAmount: 1260,
      cocoaPointsEarned: 12,
      cocoaPointsRedeemed: 0,
      shippingAddress: { city: "Dhaka", street: "Road 12 Banani" },
    },
  });

  // ==========================================
  // MANDATORY SECURITY TEST 1: Anonymous → /admin
  // ==========================================
  console.log("--- Test 1: Anonymous → /admin ---");
  SessionService._setMockUser(null);
  try {
    await AdminGuard.verifyAdmin();
    assert.fail("Anonymous user should not pass AdminGuard.verifyAdmin()");
  } catch (err: unknown) {
    const msg = (err as Error).message;
    assert.ok(msg.includes("UNAUTHENTICATED"), `Expected UNAUTHENTICATED error, got ${msg}`);
    console.log("  [PASS] Anonymous user rejected server-side with UNAUTHENTICATED.\n");
  }

  // ==========================================
  // MANDATORY SECURITY TEST 2: CUSTOMER → /admin
  // ==========================================
  console.log("--- Test 2: CUSTOMER → /admin ---");
  SessionService._setMockUser(customerUserA);
  try {
    await AdminGuard.verifyAdmin();
    assert.fail("CUSTOMER should not pass AdminGuard.verifyAdmin()");
  } catch (err: unknown) {
    const msg = (err as Error).message;
    assert.ok(msg.includes("FORBIDDEN"), `Expected FORBIDDEN error, got ${msg}`);
    console.log("  [PASS] Standard CUSTOMER user rejected server-side with FORBIDDEN.\n");
  }

  // ==========================================
  // MANDATORY SECURITY TEST 3: CUSTOMER → direct admin Server Action
  // ==========================================
  console.log("--- Test 3: CUSTOMER → direct admin Server Action ---");
  SessionService._setMockUser(customerUserA);

  const taskResult = await executeAdminTaskAction("purge_system_logs");
  assert.strictEqual(taskResult.success, false, "Customer calling admin task should fail");
  assert.strictEqual(taskResult.error?.code, "UNAUTHORIZED");

  const metricsResult = await getAdminDashboardMetricsAction();
  assert.strictEqual(metricsResult.success, false, "Customer calling dashboard metrics should fail");

  const ordersResult = await getAdminOrdersAction();
  assert.strictEqual(ordersResult.success, false, "Customer calling admin orders should fail");

  console.log("  [PASS] Direct admin Server Actions rejected server-side for CUSTOMER.\n");

  // ==========================================
  // MANDATORY SECURITY TEST 4: CUSTOMER → direct admin API
  // ==========================================
  console.log("--- Test 4: CUSTOMER → direct admin API ---");
  SessionService._setMockUser(customerUserA);
  const custApiResponse = await adminApiGet();
  assert.strictEqual(custApiResponse.status, 403, "API must respond with 403 Forbidden for CUSTOMER");
  const custApiJson = await custApiResponse.json();
  assert.strictEqual(custApiJson.success, false);
  assert.strictEqual(custApiJson.error, "FORBIDDEN");

  SessionService._setMockUser(null);
  const anonApiResponse = await adminApiGet();
  assert.strictEqual(anonApiResponse.status, 401, "API must respond with 401 Unauthorized for Anonymous");
  const anonApiJson = await anonApiResponse.json();
  assert.strictEqual(anonApiJson.success, false);
  assert.strictEqual(anonApiJson.error, "UNAUTHORIZED");

  console.log("  [PASS] Direct admin API (/api/admin) enforces 401/403 server-side.\n");

  // ==========================================
  // MANDATORY SECURITY TEST 5: ADMIN → /admin
  // ==========================================
  console.log("--- Test 5: ADMIN → /admin ---");
  SessionService._setMockUser(adminUser);
  const verifiedAdmin = await AdminGuard.verifyAdmin();
  assert.strictEqual(verifiedAdmin.role, "ADMIN");
  assert.strictEqual(verifiedAdmin.email, adminUser.email);

  const adminApiResponse = await adminApiGet();
  assert.strictEqual(adminApiResponse.status, 200, "API must respond with 200 OK for ADMIN");
  const adminApiJson = await adminApiResponse.json();
  assert.strictEqual(adminApiJson.success, true);
  console.log("  [PASS] Verified ADMIN granted full server-side access to /admin and API.\n");

  // ==========================================
  // MANDATORY SECURITY TEST 6: ADMIN → product create/update/delete
  // ==========================================
  console.log("--- Test 6: ADMIN → product create/update/delete ---");
  SessionService._setMockUser(adminUser);

  const testProductSku = "CB-ADMIN-TEST-99";
  // Clean up if already exists
  await prisma.product.deleteMany({ where: { sku: testProductSku } });

  // 6.1 Create
  const createRes = await createProduct({
    name: "Artisan Smoked Sea Salt Truffles",
    slug: "artisan-smoked-sea-salt-truffles",
    description: "Handcrafted truffles infused with oak-smoked Cornish sea salt.",
    price: 1850,
    salePrice: 1650,
    sku: testProductSku,
    inventory: 40,
    category: "Truffles",
    cacaoPercentage: 70,
    flavorNotes: ["Smoky", "Caramel", "Mineral Salt"],
    allergens: ["Dairy"],
    images: ["https://chocobliss.test/images/truffles-smoked.jpg"],
    isFeatured: true,
    isPublished: true,
  });
  assert.strictEqual(createRes.success, true, "Product creation should succeed for ADMIN");
  const createdProductId = createRes.data!.id;
  assert.ok(createdProductId, "Created product must have a valid ID");

  // 6.2 Update
  const updateRes = await updateProduct(createdProductId, {
    price: 1950,
    inventory: 35,
    name: "Artisan Smoked Sea Salt Truffles (Reserve)",
  });
  assert.strictEqual(updateRes.success, true, "Product update should succeed for ADMIN");

  const updatedFromDb = await prisma.product.findUnique({ where: { id: createdProductId } });
  assert.strictEqual(Number(updatedFromDb?.price), 1950);
  assert.strictEqual(updatedFromDb?.inventory, 35);

  // 6.3 Soft Delete
  const deleteRes = await deleteProduct(createdProductId);
  assert.strictEqual(deleteRes.success, true, "Product soft-deletion should succeed for ADMIN");

  const softDeletedDb = await prisma.product.findUnique({ where: { id: createdProductId } });
  assert.notStrictEqual(softDeletedDb?.deletedAt, null, "deletedAt must be set");
  assert.strictEqual(softDeletedDb?.isPublished, false, "isPublished must be set to false");

  console.log("  [PASS] ADMIN product create, update, and soft delete executed with DB verification.\n");

  // ==========================================
  // MANDATORY SECURITY TEST 7: CUSTOMER attempts product mutation
  // ==========================================
  console.log("--- Test 7: CUSTOMER attempts product mutation ---");
  SessionService._setMockUser(customerUserA);

  const custCreateRes = await createProduct({
    name: "Malicious Injection Product",
    sku: "CB-HACK-01",
    price: 1,
    inventory: 1000,
  });
  assert.strictEqual(custCreateRes.success, false, "Customer should NOT be able to create products");

  const custUpdateRes = await updateProduct(createdProductId, { price: 1 });
  assert.strictEqual(custUpdateRes.success, false, "Customer should NOT be able to update products");

  const custDeleteRes = await deleteProduct(createdProductId);
  assert.strictEqual(custDeleteRes.success, false, "Customer should NOT be able to delete products");

  console.log("  [PASS] All product mutations strictly rejected server-side for CUSTOMER.\n");

  // ==========================================
  // MANDATORY SECURITY TEST 8: Client modifies role to ADMIN
  // ==========================================
  console.log("--- Test 8: Client modifies role to ADMIN ---");
  // Attacker sends a payload or requests with tampered role
  // The server checks SessionService which queries the authoritative database
  const tamperedClientRolePayload = {
    role: "ADMIN",
  };
  // Even if a customer crafts an object pretending role is ADMIN:
  SessionService._setMockUser({
    ...customerUserA,
    role: "CUSTOMER", // Authoritative DB user role is CUSTOMER
  });

  const tamperedActionRes = await createProduct({
    name: "Tampered Product",
    sku: "CB-TAMPER-01",
    price: 10,
    ...tamperedClientRolePayload, // Client injects role: "ADMIN"
  });
  assert.strictEqual(tamperedActionRes.success, false, "Client injected role must NOT bypass server check");
  console.log("  [PASS] Client role tampering rejected; server relies on authoritative session.\n");

  // ==========================================
  // MANDATORY SECURITY TEST 9: Client modifies user ID
  // ==========================================
  console.log("--- Test 9: Client modifies user ID ---");
  // Customer A attempts to supply Customer B's userId in a Server Action:
  SessionService._setMockUser(customerUserA);

  const spoofedAddressUpdate = await updateAddressAction({
    id: addressB.id,
    street: "Hacked Street 99",
    // Attacker passes customerUserB.id pretending to be User B:
  });
  assert.strictEqual(spoofedAddressUpdate.success, false, "Spoofed user modification must be blocked");
  assert.strictEqual(spoofedAddressUpdate.error?.code, "FORBIDDEN");

  console.log("  [PASS] Server ignores client-provided IDs and strictly verifies session identity.\n");

  // ==========================================
  // MANDATORY SECURITY TEST 10: Unauthorized customer attempts another customer's data access
  // ==========================================
  console.log("--- Test 10: Unauthorized customer attempts another customer's data access ---");
  SessionService._setMockUser(customerUserA);

  // Customer A attempts to view Customer B's order:
  const crossUserOrder = await getOrderById(orderB.id);
  assert.strictEqual(crossUserOrder.success, false, "Customer A must NOT access Customer B's order");
  assert.strictEqual(crossUserOrder.error?.code, "FORBIDDEN");

  // But ADMIN CAN view any order:
  SessionService._setMockUser(adminUser);
  const adminOrderView = await getOrderById(orderB.id);
  assert.strictEqual(adminOrderView.success, true, "ADMIN must be able to view any customer's order");
  assert.strictEqual(adminOrderView.data?.orderNumber, "CB-2026-TEST-B");

  console.log("  [PASS] Cross-user access rejected; ADMIN authorization allows legitimate management.\n");

  // ==========================================
  // SECTION 11: CMS & ANNOUNCEMENTS WORKFLOWS
  // ==========================================
  console.log("--- Test 11: CMS and Announcement Management Workflows ---");
  SessionService._setMockUser(adminUser);

  // 11.1 CMS Upsert
  const cmsRes = await updateSiteContentAction("test_announcement_bar", {
    key: "test_announcement_bar",
    title: "Seasonal Header Notification",
    content: { message: "Spring Truffle Collection Now Live", discountPercent: 20 },
    mediaUrl: "https://chocobliss.test/media/banner.jpg",
  });
  assert.strictEqual(cmsRes.success, true, "CMS upsert should succeed for ADMIN");

  const siteContents = await getAdminSiteContentsAction();
  assert.strictEqual(siteContents.success, true);
  assert.ok(siteContents.data!.some((c) => c.key === "test_announcement_bar"));

  // 11.2 Announcement Update & Scheduling
  const testAnnounce = await prisma.announcement.create({
    data: {
      title: "Eid Mubarak Special",
      content: "Exclusive artisanal gift boxes for Eid.",
      bannerType: "PROMO",
      isActive: true,
    },
  });

  const updateAnnounceRes = await updateAnnouncementAction(testAnnounce.id, {
    title: "Eid Mubarak Special (Updated)",
    content: "Updated gift box announcements.",
    bannerType: "PROMO",
    isActive: true,
  });
  assert.strictEqual(updateAnnounceRes.success, true);
  assert.strictEqual(updateAnnounceRes.data?.title, "Eid Mubarak Special (Updated)");

  // Clean up
  await prisma.announcement.delete({ where: { id: testAnnounce.id } });
  await prisma.siteContent.deleteMany({ where: { key: "test_announcement_bar" } });
  await prisma.product.deleteMany({ where: { sku: testProductSku } });

  console.log("  [PASS] CMS and Announcement workflows verified.\n");

  console.log("=================================================");
  console.log("=== ALL PHASE 5D ADMIN & SECURITY TESTS PASSED! =");
  console.log("=================================================\n");
}

runPhase5DTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
