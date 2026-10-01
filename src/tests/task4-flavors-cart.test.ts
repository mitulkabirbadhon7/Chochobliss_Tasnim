import fs from "fs";
import path from "path";
import assert from "assert";
import { configureStore } from "@reduxjs/toolkit";
import {
  cartSlice,
  addItem,
  removeItem,
  selectCartItems,
  selectCartTotalQuantity,
  selectCartSubtotal,
} from "../store/slices/cartSlice";
import { createOrderSchema } from "../lib/validations/order";

async function runTask4Tests() {
  console.log("=== RUNNING TASK 4: PRODUCT FLAVORS & CART INTEGRATION AUDIT ===");

  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  const productFormPath = path.resolve(process.cwd(), "src/components/admin/ProductForm.tsx");
  const productDetailPath = path.resolve(process.cwd(), "src/components/shop/ProductDetailView.tsx");
  const ordersActionPath = path.resolve(process.cwd(), "src/lib/actions/orders.ts");
  const cartDrawerPath = path.resolve(process.cwd(), "src/components/cart/CartDrawer.tsx");

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const productFormContent = fs.readFileSync(productFormPath, "utf-8");
  const productDetailContent = fs.readFileSync(productDetailPath, "utf-8");
  const ordersActionContent = fs.readFileSync(ordersActionPath, "utf-8");
  const cartDrawerContent = fs.readFileSync(cartDrawerPath, "utf-8");

  // 1. Verify Prisma schema
  console.log("Test 1: Verify schema definitions for flavors and selectedFlavor...");
  if (!/flavors\s+String\[\]/.test(schemaContent)) {
    throw new Error("Test 1 Failed: Product model missing `flavors String[]`.");
  }
  if (!/selectedFlavor\s+String\?/.test(schemaContent)) {
    throw new Error("Test 1 Failed: OrderItem model missing `selectedFlavor String?`.");
  }
  console.log("✔ PASS: Prisma Product has `flavors String[]` and OrderItem has `selectedFlavor String?`.");

  // 2. Verify Admin ProductForm
  console.log("Test 2: Verify Admin ProductForm allows managing available flavors...");
  if (!productFormContent.includes("handleAddFlavor") || !productFormContent.includes("handleRemoveFlavor")) {
    throw new Error("Test 2 Failed: ProductForm missing flavor addition/removal handlers.");
  }
  if (!productFormContent.includes("At least one available flavor or type variant is required.")) {
    throw new Error("Test 2 Failed: ProductForm missing validation requiring at least one flavor variant.");
  }
  console.log("✔ PASS: Admin ProductForm enables dynamic flavor management with validation.");

  // 3. Verify ProductDetailView flavor selection
  console.log("Test 3: Verify ProductDetailView requires mandatory flavor selection...");
  if (!productDetailContent.includes("Select Flavor / Confection Type")) {
    throw new Error("Test 3 Failed: ProductDetailView missing flavor selection header.");
  }
  if (!productDetailContent.includes("isFlavorMissing")) {
    throw new Error("Test 3 Failed: ProductDetailView missing isFlavorMissing guard.");
  }
  if (!productDetailContent.includes("disabled={isOutOfStock || isFlavorMissing}")) {
    throw new Error("Test 3 Failed: Add to Cart button not disabled when flavor is missing.");
  }
  console.log("✔ PASS: ProductDetailView renders interactive flavor pills and enforces selection before add-to-bag.");

  // 4. Verify Redux cartSlice composite keys
  console.log("Test 4: Verify Redux cartSlice handles composite keys for distinct flavors...");
  const store = configureStore({
    reducer: { cart: cartSlice.reducer },
  });

  const baseProduct = {
    id: "bar-101",
    productId: "bar-101",
    name: "Artisanal Single-Origin Bar",
    slug: "artisanal-bar",
    price: 15.0,
    salePrice: null,
    image: "https://example.com/bar.jpg",
  };

  // Add Flavor 1: "Dark 72%"
  store.dispatch(
    addItem({
      ...baseProduct,
      selectedFlavor: "Dark 72%",
      quantity: 1,
    })
  );

  // Add Flavor 2: "White Milk"
  store.dispatch(
    addItem({
      ...baseProduct,
      selectedFlavor: "White Milk",
      quantity: 2,
    })
  );

  // Add Flavor 1 again: should increment Dark 72%
  store.dispatch(
    addItem({
      ...baseProduct,
      selectedFlavor: "Dark 72%",
      quantity: 3,
    })
  );

  const cartItems = selectCartItems(store.getState());
  assert.strictEqual(cartItems.length, 2, "Cart must contain 2 distinct items for 2 flavors");

  const darkItem = cartItems.find((i) => i.id === "bar-101-Dark 72%");
  const milkItem = cartItems.find((i) => i.id === "bar-101-White Milk");

  assert(darkItem, "Dark 72% composite item must exist with key 'bar-101-Dark 72%'");
  assert(milkItem, "White Milk composite item must exist with key 'bar-101-White Milk'");
  assert.strictEqual(darkItem.quantity, 4, "Dark 72% quantity should be 1 + 3 = 4");
  assert.strictEqual(milkItem.quantity, 2, "White Milk quantity should be 2");
  assert.strictEqual(selectCartTotalQuantity(store.getState()), 6, "Total quantity must be 6");
  assert.strictEqual(selectCartSubtotal(store.getState()), 90, "Subtotal must be 6 * $15 = $90");
  console.log("✔ PASS: Redux cartSlice isolates flavors into separate line items with accurate quantity updates.");

  // 5. Verify Server-Side order validation
  console.log("Test 5: Verify Server-Side order validation handles selectedFlavor...");
  const validOrderPayload = {
    items: [
      { productId: "prod_1", selectedFlavor: "Dark", quantity: 2 },
      { productId: "prod_1", selectedFlavor: "Milk", quantity: 1 },
    ],
    shippingAddress: {
      fullName: "Tasnim Sultana",
      phone: "+8801712345678",
      street: "Road 12, Banani",
      city: "Dhaka",
      state: "Dhaka",
      postalCode: "1213",
      country: "Bangladesh",
    },
    paymentMethod: "COD",
  };

  const parsedOrder = createOrderSchema.safeParse(validOrderPayload);
  assert.strictEqual(parsedOrder.success, true, "Valid order with selected flavors must pass validation");

  if (!ordersActionContent.includes("product.flavors.includes(item.selectedFlavor)")) {
    throw new Error("Test 5 Failed: orders.ts does not validate selectedFlavor against available product.flavors.");
  }
  if (!ordersActionContent.includes("selectedFlavor: item.selectedFlavor || null")) {
    throw new Error("Test 5 Failed: orders.ts does not include selectedFlavor in OrderItem snapshot.");
  }
  console.log("✔ PASS: Server Action validates flavor availability and records snapshot in OrderItem.");

  // 6. Verify CartDrawer displays selected flavor
  console.log("Test 6: Verify CartDrawer displays flavor badge...");
  if (!cartDrawerContent.includes("item.selectedFlavor")) {
    throw new Error("Test 6 Failed: CartDrawer does not display item.selectedFlavor.");
  }
  console.log("✔ PASS: CartDrawer visualizes selected flavor metadata for customers.");

  console.log("\n>>> ALL TASK 4 TESTS PASSED SUCCESSFULLY! <<<\n");
}

runTask4Tests().catch((err) => {
  console.error("TASK 4 TEST SUITE FAILED:", err);
  process.exit(1);
});
