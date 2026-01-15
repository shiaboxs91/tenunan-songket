"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useCart as useCartHook } from "@/hooks/useCart";
import type { CartWithItems, CartItem, CartSummary } from "@/lib/supabase/cart";
import type { Product } from "@/lib/types";

interface CartContextValue {
  // Cart data
  cart: CartWithItems | null;
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  error: string | null;
  
  // Auth state
  isAuthenticated: boolean;
  
  // Legacy compatibility (for existing components)
  totalItems: number;
  subtotal: number;
  
  // Actions
  addItem: (product: Product | string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Sync
  syncLocalCartToSupabase: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const {
    cart,
    items,
    summary,
    isLoading,
    error,
    isAuthenticated,
    addItem: addItemById,
    updateQuantity,
    removeItem,
    clearCart,
    syncLocalCartToSupabase,
    refreshCart,
  } = useCartHook();

  // Wrapper for addItem to support both Product object and productId string
  const addItem = async (productOrId: Product | string, quantity: number = 1) => {
    const productId = typeof productOrId === "string" ? productOrId : productOrId.id;
    await addItemById(productId, quantity);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        summary,
        isLoading,
        error,
        isAuthenticated,
        // Legacy compatibility
        totalItems: summary.itemCount,
        subtotal: summary.subtotal,
        // Actions
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        syncLocalCartToSupabase,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Re-export for backward compatibility
export { CART_STORAGE_KEY } from "@/hooks/useCart";
