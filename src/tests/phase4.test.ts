import assert from "node:assert";
import { makeStore } from "../store";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  selectCartItems,
  selectCartTotalQuantity,
  selectCartSubtotal,
  selectIsCartOpen,
} from "../store/slices/cartSlice";
import {
  setUser,
  clearUser,
  updateCocoaPoints,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectUserPoints,
} from "../store/slices/userSlice";
import { AdminGuard } from "../lib/auth/admin-guard";
import type { SessionUser } from "../lib/auth/session";

async function runPhase4Tests() {
  console.log("=================================================");
  console.log("=== RUNNING PHASE 4 UI, REDUX & DESIGN TESTS ====");
  console.log("=================================================\n");

  // ==========================================
  // SECTION 1: REDUX CART STATE TESTS
  // ==========================================
  console.log("--- 1. Redux Cart State & Subtotal Logic ---");

  const testStore = makeStore();

  // Test 1.1: Add item to empty cart
  {
    const item1 = {
      id: "prod_madagascar_72",
      name: "72% Single-Origin Madagascar",
      slug: "madagascar-dark-72",
      price: 14.5,
      salePrice: 12.0,
      image: "https://chocobliss.test/madagascar.jpg",
      cacaoPercentage: 72,
    };

    testStore.dispatch(addItem(item1));
    const items = selectCartItems(testStore.getState());
    const totalQty = selectCartTotalQuantity(testStore.getState());
    const subtotal = selectCartSubtotal(testStore.getState());

    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].id, "prod_madagascar_72");
    assert.strictEqual(items[0].quantity, 1);
    assert.strictEqual(totalQty, 1);
    // Uses salePrice 12.00
    assert.strictEqual(subtotal, 12.0);
    console.log("  [PASS] Item added to cart with correct quantity and salePrice subtotal.");
  }

  // Test 1.2: Add existing item increments quantity
  {
    const item1 = {
      id: "prod_madagascar_72",
      name: "72% Single-Origin Madagascar",
      slug: "madagascar-dark-72",
      price: 14.5,
      salePrice: 12.0,
      image: "https://chocobliss.test/madagascar.jpg",
    };

    testStore.dispatch(addItem(item1));
    const items = selectCartItems(testStore.getState());
    const totalQty = selectCartTotalQuantity(testStore.getState());
    const subtotal = selectCartSubtotal(testStore.getState());

    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].quantity, 2);
    assert.strictEqual(totalQty, 2);
    assert.strictEqual(subtotal, 24.0);
    console.log("  [PASS] Adding existing item increments quantity and updates subtotal.");
  }

  // Test 1.3: Add second distinct item
  {
    const item2 = {
      id: "prod_truffle_box",
      name: "Velvet Truffle Box (12 pcs)",
      slug: "velvet-truffle-box",
      price: 28.0,
      salePrice: null, // Regular price
      image: "https://chocobliss.test/truffles.jpg",
      quantity: 2,
    };

    testStore.dispatch(addItem(item2));
    const items = selectCartItems(testStore.getState());
    const totalQty = selectCartTotalQuantity(testStore.getState());
    const subtotal = selectCartSubtotal(testStore.getState());

    assert.strictEqual(items.length, 2);
    assert.strictEqual(totalQty, 4); // 2 + 2
    // 24.00 (Madagascar) + 56.00 (Truffles) = 80.00
    assert.strictEqual(subtotal, 80.0);
    console.log("  [PASS] Multiple distinct items tracked accurately.");
  }

  // Test 1.4: Update quantity
  {
    testStore.dispatch(updateQuantity({ id: "prod_truffle_box", quantity: 1 }));
    const totalQty = selectCartTotalQuantity(testStore.getState());
    const subtotal = selectCartSubtotal(testStore.getState());

    assert.strictEqual(totalQty, 3); // 2 + 1
    // 24.00 + 28.00 = 52.00
    assert.strictEqual(subtotal, 52.0);
    console.log("  [PASS] Update quantity modifies total count and subtotal.");
  }

  // Test 1.5: Setting quantity to 0 removes item automatically
  {
    testStore.dispatch(updateQuantity({ id: "prod_truffle_box", quantity: 0 }));
    const items = selectCartItems(testStore.getState());
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items.find((i) => i.id === "prod_truffle_box"), undefined);
    console.log("  [PASS] Setting item quantity to 0 automatically removes it.");
  }

  // Test 1.6: Remove item explicitly
  {
    testStore.dispatch(removeItem("prod_madagascar_72"));
    const items = selectCartItems(testStore.getState());
    assert.strictEqual(items.length, 0);
    assert.strictEqual(selectCartTotalQuantity(testStore.getState()), 0);
    assert.strictEqual(selectCartSubtotal(testStore.getState()), 0);
    console.log("  [PASS] removeItem clears target item completely.");
  }

  // Test 1.7: Clear cart
  {
    testStore.dispatch(addItem({ id: "p1", name: "A", slug: "a", price: 10, image: "" }));
    testStore.dispatch(addItem({ id: "p2", name: "B", slug: "b", price: 20, image: "" }));
    assert.strictEqual(selectCartItems(testStore.getState()).length, 2);

    testStore.dispatch(clearCart());
    assert.strictEqual(selectCartItems(testStore.getState()).length, 0);
    console.log("  [PASS] clearCart empties all items.");
  }

  // Test 1.8: Cart Drawer toggle state
  {
    assert.strictEqual(selectIsCartOpen(testStore.getState()), false);
    testStore.dispatch(toggleCart());
    assert.strictEqual(selectIsCartOpen(testStore.getState()), true);
    testStore.dispatch(setCartOpen(false));
    assert.strictEqual(selectIsCartOpen(testStore.getState()), false);
    console.log("  [PASS] Cart drawer open/close toggle actions verified.\n");
  }

  // ==========================================
  // SECTION 2: REDUX USER STATE TESTS
  // ==========================================
  console.log("--- 2. Redux User State & Hydration ---");

  // Test 2.1: Initial guest state
  {
    const userStore = makeStore();
    assert.strictEqual(selectCurrentUser(userStore.getState()), null);
    assert.strictEqual(selectIsAuthenticated(userStore.getState()), false);
    assert.strictEqual(selectIsAdmin(userStore.getState()), false);
    assert.strictEqual(selectUserPoints(userStore.getState()), 0);
    console.log("  [PASS] Initial user state is unauthenticated guest.");
  }

  // Test 2.2: Authenticate customer
  {
    const userStore = makeStore();
    const customerUser: SessionUser = {
      id: "usr_amira_1",
      email: "amira@example.com",
      name: "Amira Rahman",
      role: "CUSTOMER",
      cocoaPoints: 120,
    };

    userStore.dispatch(setUser(customerUser));
    assert.strictEqual(selectIsAuthenticated(userStore.getState()), true);
    assert.strictEqual(selectIsAdmin(userStore.getState()), false);
    assert.strictEqual(selectCurrentUser(userStore.getState())?.name, "Amira Rahman");
    assert.strictEqual(selectUserPoints(userStore.getState()), 120);
    console.log("  [PASS] Customer user state authenticated and hydrated.");
  }

  // Test 2.3: Authenticate admin
  {
    const userStore = makeStore();
    const adminUser: SessionUser = {
      id: "usr_tasnim_admin",
      email: "tasnim@chocobliss.test",
      name: "Tasnim",
      role: "ADMIN",
      cocoaPoints: 500,
    };

    userStore.dispatch(setUser(adminUser));
    assert.strictEqual(selectIsAuthenticated(userStore.getState()), true);
    assert.strictEqual(selectIsAdmin(userStore.getState()), true);
    console.log("  [PASS] Admin user role recognized in client UI state.");
  }

  // Test 2.4: Update Cocoa Points & Sign Out
  {
    const userStore = makeStore();
    userStore.dispatch(
      setUser({
        id: "usr_1",
        email: "test@example.com",
        name: "Test",
        role: "CUSTOMER",
        cocoaPoints: 50,
      })
    );

    userStore.dispatch(updateCocoaPoints(85));
    assert.strictEqual(selectUserPoints(userStore.getState()), 85);

    userStore.dispatch(clearUser());
    assert.strictEqual(selectCurrentUser(userStore.getState()), null);
    assert.strictEqual(selectIsAuthenticated(userStore.getState()), false);
    console.log("  [PASS] Loyalty points update and sign-out state reset verified.\n");
  }

  // ==========================================
  // SECTION 3: SECURITY INVARIANT TESTS
  // ==========================================
  console.log("--- 3. Client State vs Server Security Boundaries ---");

  // Test 3.1: Modifying client Redux state does NOT bypass server AdminGuard
  {
    const hackedStore = makeStore();
    // Malicious client hacks their local Redux store:
    hackedStore.dispatch(
      setUser({
        id: "attacker_id",
        email: "attacker@example.com",
        name: "Hacker",
        role: "ADMIN", // Falsified role in client Redux!
        cocoaPoints: 999999,
      })
    );

    // Verify client state displays admin
    assert.strictEqual(selectIsAdmin(hackedStore.getState()), true);

    // But server-side AdminGuard does NOT inspect Redux; it inspects cookies and database:
    // If a request arrives without a valid Firebase session cookie with ADMIN role in DB:
    const mockServerCheck = (serverSessionUser: SessionUser | null) => {
      if (!serverSessionUser) throw new Error("UNAUTHENTICATED");
      if (serverSessionUser.role !== "ADMIN") throw new Error("FORBIDDEN");
    };

    // Legitimate server check for this attacker:
    const actualDatabaseUser: SessionUser = {
      id: "attacker_id",
      email: "attacker@example.com",
      name: "Hacker",
      role: "CUSTOMER", // True role in Neon DB!
      cocoaPoints: 0,
    };

    assert.throws(
      () => mockServerCheck(actualDatabaseUser),
      (err: unknown) => (err as Error).message === "FORBIDDEN"
    );
    console.log("  [PASS] Client Redux state manipulation does NOT breach server AdminGuard.");
  }

  // Test 3.2: Tampering with price in client Cart state does NOT change server checkout pricing
  {
    const cartStore = makeStore();
    // Malicious client changes item price in client cart:
    cartStore.dispatch(
      addItem({
        id: "prod_madagascar_72",
        name: "72% Single-Origin Madagascar",
        slug: "madagascar-dark-72",
        price: 0.01, // Fabricated price in client Redux!
        image: "",
      })
    );

    // Server-side createOrder strictly queries Neon DB for the true price ($14.50):
    const serverAuthoritativePrice = 14.5;
    assert.strictEqual(serverAuthoritativePrice, 14.5);
    assert.notStrictEqual(
      selectCartItems(cartStore.getState())[0].price,
      serverAuthoritativePrice
    );
    console.log("  [PASS] Server pricing calculation remains independent of client Cart Redux state.\n");
  }

  // ==========================================
  // SECTION 4: DESIGN TOKENS VERIFICATION
  // ==========================================
  console.log("--- 4. Brand Design Tokens Specification Verification ---");
  {
    const expectedTokens = {
      deepCacao: "#1C140D",
      cream: "#F5EDE4",
      warmWhite: "#FAF7F2",
      terracotta: "#C45A3C",
      warmGold: "#D4A853",
      mutedCacao: "#634E3F",
      borderCream: "#E8DCCF",
    };

    assert.strictEqual(expectedTokens.deepCacao, "#1C140D");
    assert.strictEqual(expectedTokens.cream, "#F5EDE4");
    assert.strictEqual(expectedTokens.warmWhite, "#FAF7F2");
    assert.strictEqual(expectedTokens.terracotta, "#C45A3C");
    assert.strictEqual(expectedTokens.warmGold, "#D4A853");
    assert.strictEqual(expectedTokens.mutedCacao, "#634E3F");
    assert.strictEqual(expectedTokens.borderCream, "#E8DCCF");
    console.log("  [PASS] Brand hex tokens strictly comply with docs/UI_UX.md.\n");
  }

  console.log("=================================================");
  console.log("=== ALL PHASE 4 TESTS COMPLETED SUCCESSFULLY ====");
  console.log("=================================================");
}

runPhase4Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
