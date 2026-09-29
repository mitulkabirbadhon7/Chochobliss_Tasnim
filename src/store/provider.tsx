"use client";

import React, { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";
import { hydrateCart, type CartItem } from "./slices/cartSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (!storeRef.current) return;

    // 1. Hydrate cart from localStorage on mount
    try {
      const savedCart = localStorage.getItem("chocobliss_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsed)) {
          storeRef.current.dispatch(hydrateCart(parsed));
        }
      }
    } catch {
      // LocalStorage access failure / private browsing mode
    }

    // 2. Persist cart changes to localStorage
    const unsubscribe = storeRef.current.subscribe(() => {
      const state = storeRef.current?.getState();
      if (state?.cart?.items) {
        try {
          localStorage.setItem("chocobliss_cart", JSON.stringify(state.cart.items));
        } catch {
          // LocalStorage quota exceeded or restricted
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
