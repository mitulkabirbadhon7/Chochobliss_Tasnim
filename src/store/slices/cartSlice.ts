import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string; // Product ID
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  image: string;
  quantity: number;
  weight?: string | null;
  cacaoPercentage?: number | null;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      const addQty = action.payload.quantity && action.payload.quantity > 0 ? action.payload.quantity : 1;

      if (existingItem) {
        existingItem.quantity += addQty;
      } else {
        state.items.push({
          ...action.payload,
          quantity: addQty,
        });
      }
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          item.quantity = Math.min(50, Math.max(1, quantity));
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },

    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      }
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  hydrateCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectIsCartOpen = (state: { cart: CartState }) => state.cart.isOpen;
export const selectCartTotalQuantity = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => {
    const effectivePrice = item.salePrice != null ? item.salePrice : item.price;
    return total + effectivePrice * item.quantity;
  }, 0);

export default cartSlice.reducer;
