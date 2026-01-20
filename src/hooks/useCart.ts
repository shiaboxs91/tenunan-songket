"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartWithItems, CartItem, CartSummary } from "@/lib/supabase/cart";
import { calculateCartSummary } from "@/lib/supabase/cart";
import type { Product } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

const CART_STORAGE_KEY = "tenunan-songket-cart";

interface LocalCartItem {
  product: Product;
  quantity: number;
}

interface LocalCartState {
  items: LocalCartItem[];
  lastUpdated: string;
}

interface UseCartReturn {
  // Cart data
  cart: CartWithItems | null;
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  error: string | null;
  
  // Auth state
  isAuthenticated: boolean;
  
  // Actions
  addItem: (productOrId: string | Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Sync
  syncLocalCartToSupabase: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

/**
 * Custom hook for cart management with Supabase integration
 * - Uses localStorage for guest users
 * - Uses Supabase for authenticated users
 * - Supports realtime updates
 * - Implements optimistic updates
 */
export function useCart(): UseCartReturn {
  const supabase = createClient();
  
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Calculate summary from cart
  const summary = calculateCartSummary(cart);
  const items = cart?.items || [];

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user;
        setIsAuthenticated(!!user);
        setUserId(user?.id || null);
        
        // If user just logged in, sync local cart will be handled by the effect
        // that watches isAuthenticated
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch cart from Supabase or localStorage
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated && userId) {
        // Fetch from Supabase
        const { data: cartData, error: cartError } = await supabase
          .from("carts")
          .select(`
            *,
            items:cart_items(
              *,
              product:products(
                *,
                images:product_images(*)
              )
            )
          `)
          .eq("user_id", userId)
          .single();

        if (cartError && cartError.code !== "PGRST116") {
          throw cartError;
        }

        setCart(cartData as CartWithItems | null);
      } else {
        // Load from localStorage for guest users
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const localCart: LocalCartState = JSON.parse(stored);
          // Convert local cart to CartWithItems format
          const convertedCart = convertLocalCartToSupabaseFormat(localCart);
          setCart(convertedCart);
        } else {
          setCart(null);
        }
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Gagal memuat keranjang");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Setup realtime subscription for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      // Cleanup existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Subscribe to cart_items changes
    const channel = supabase
      .channel(`cart-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
        },
        () => {
          // Refresh cart on any change
          fetchCart();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, userId, supabase, fetchCart]);

  // Get or create cart for authenticated user
  const getOrCreateCart = useCallback(async (): Promise<string | null> => {
    if (!isAuthenticated || !userId) return null;

    // Check existing cart
    const { data: existingCart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingCart) return existingCart.id;

    // Create new cart
    const { data: newCart, error } = await supabase
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating cart:", error);
      return null;
    }

    return newCart.id;
  }, [isAuthenticated, userId, supabase]);

  // Add item to cart
  const addItem = useCallback(async (productOrId: string | Product, quantity: number = 1) => {
    setError(null);
    
    // Resolve productId and product object
    const productId = typeof productOrId === "string" ? productOrId : productOrId.id;
    const productObj = typeof productOrId !== "string" ? productOrId : null;

    if (isAuthenticated && userId) {
      // Optimistic update
      const previousCart = cart;
      
      try {
        const cartId = await getOrCreateCart();
        if (!cartId) throw new Error("Could not get cart");

        // Check if item exists
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("*")
          .eq("cart_id", cartId)
          .eq("product_id", productId)
          .single();

        if (existingItem) {
          // Update quantity
          await supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + quantity })
            .eq("id", existingItem.id);
        } else {
          // Insert new item
          await supabase
            .from("cart_items")
            .insert({
              cart_id: cartId,
              product_id: productId,
              quantity,
            });
        }

        // Refresh cart
        await fetchCart();
      } catch (err) {
        console.error("Error adding item:", err);
        setCart(previousCart); // Rollback
        setError("Gagal menambahkan ke keranjang");
      }
    } else {
      // Add to localStorage for guest
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      const localCart: LocalCartState = stored 
        ? JSON.parse(stored) 
        : { items: [], lastUpdated: new Date().toISOString() };

      // Use provided product object OR fetch if missing
      let product = productObj;

      if (!product) {
          const { data: fetchedProduct } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();
            
          if (fetchedProduct) {
             // Convert DB product to Frontend Product (simplified)
             product = {
                 id: fetchedProduct.id,
                 slug: fetchedProduct.slug,
                 title: fetchedProduct.title,
                 description: fetchedProduct.description || "",
                 image: "", // Will Fetch below
                 price: Number(fetchedProduct.price),
                 currency: "IDR",
                 category: "Songket",
                 tags: [],
                 inStock: (fetchedProduct.stock || 0) > 0,
                 rating: Number(fetchedProduct.average_rating) || 0,
                 sold: fetchedProduct.sold || 0,
                 sourceUrl: "",
                 weight: Number(fetchedProduct.weight) || 0.5,
             }
          }
      }

      if (!product) {
        setError("Produk tidak ditemukan");
        return;
      }

      // If we don't have an image yet (passed product might have it, fetched might not)
      let imageUrl = product.image;
      if (!imageUrl || imageUrl === "") {
           const { data: productImages } = await supabase
            .from("product_images")
            .select("*")
            .eq("product_id", productId)
            .order("display_order", { ascending: true });
            
           imageUrl = productImages?.find((img) => img.is_primary)?.url 
              || productImages?.[0]?.url 
              || "/images/placeholder-product.svg";
      }
      
      // Ensure product has image
      const productWithImage = { ...product, image: imageUrl };

      const existingIndex = localCart.items.findIndex(
        (item) => item.product.id === productId
      );

      if (existingIndex >= 0) {
        localCart.items[existingIndex].quantity += quantity;
      } else {
        localCart.items.push({ product: productWithImage, quantity });
      }

      localCart.lastUpdated = new Date().toISOString();
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
      
      // Update state
      setCart(convertLocalCartToSupabaseFormat(localCart));
    }
  }, [isAuthenticated, userId, cart, supabase, getOrCreateCart, fetchCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setError(null);

    if (quantity <= 0) {
      // Handle removal inline instead of calling removeItem
      if (isAuthenticated) {
        const previousCart = cart;
        
        if (cart) {
          setCart({
            ...cart,
            items: cart.items.filter((item) => item.id !== itemId),
          });
        }

        try {
          await supabase
            .from("cart_items")
            .delete()
            .eq("id", itemId);
        } catch (err) {
          console.error("Error removing item:", err);
          setCart(previousCart);
          setError("Gagal menghapus item");
        }
      } else {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (!stored) return;

        const localCart: LocalCartState = JSON.parse(stored);
        const itemIndex = localCart.items.findIndex((_, i) => `local-${i}` === itemId);
        
        if (itemIndex >= 0) {
          localCart.items.splice(itemIndex, 1);
          localCart.lastUpdated = new Date().toISOString();
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
          setCart(convertLocalCartToSupabaseFormat(localCart));
        }
      }
      return;
    }

    if (isAuthenticated) {
      const previousCart = cart;
      
      // Optimistic update
      if (cart) {
        setCart({
          ...cart,
          items: cart.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      }

      try {
        await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", itemId);
      } catch (err) {
        console.error("Error updating quantity:", err);
        setCart(previousCart);
        setError("Gagal mengubah jumlah");
      }
    } else {
      // Update localStorage
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return;

      const localCart: LocalCartState = JSON.parse(stored);
      const itemIndex = localCart.items.findIndex((_, i) => `local-${i}` === itemId);
      
      if (itemIndex >= 0) {
        localCart.items[itemIndex].quantity = quantity;
        localCart.lastUpdated = new Date().toISOString();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
        setCart(convertLocalCartToSupabaseFormat(localCart));
      }
    }
  }, [isAuthenticated, cart, supabase]);

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    setError(null);

    if (isAuthenticated) {
      const previousCart = cart;
      
      // Optimistic update
      if (cart) {
        setCart({
          ...cart,
          items: cart.items.filter((item) => item.id !== itemId),
        });
      }

      try {
        await supabase
          .from("cart_items")
          .delete()
          .eq("id", itemId);
      } catch (err) {
        console.error("Error removing item:", err);
        setCart(previousCart);
        setError("Gagal menghapus item");
      }
    } else {
      // Remove from localStorage
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return;

      const localCart: LocalCartState = JSON.parse(stored);
      const itemIndex = localCart.items.findIndex((_, i) => `local-${i}` === itemId);
      
      if (itemIndex >= 0) {
        localCart.items.splice(itemIndex, 1);
        localCart.lastUpdated = new Date().toISOString();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
        setCart(convertLocalCartToSupabaseFormat(localCart));
      }
    }
  }, [isAuthenticated, cart, supabase]);

  // Clear cart
  const clearCart = useCallback(async () => {
    setError(null);

    if (isAuthenticated && cart) {
      const previousCart = cart;
      
      // Optimistic update
      setCart({ ...cart, items: [] });

      try {
        await supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", cart.id);
      } catch (err) {
        console.error("Error clearing cart:", err);
        setCart(previousCart);
        setError("Gagal mengosongkan keranjang");
      }
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
      setCart(null);
    }
  }, [isAuthenticated, cart, supabase]);

  // Sync local cart to Supabase after login
  const syncLocalCartToSupabase = useCallback(async () => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored || !isAuthenticated || !userId) return;

    const localCart: LocalCartState = JSON.parse(stored);
    if (localCart.items.length === 0) return;

    try {
      const cartId = await getOrCreateCart();
      if (!cartId) return;

      // Add each local item to Supabase cart
      for (const item of localCart.items) {
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("*")
          .eq("cart_id", cartId)
          .eq("product_id", item.product.id)
          .single();

        if (existingItem) {
          await supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq("id", existingItem.id);
        } else {
          await supabase
            .from("cart_items")
            .insert({
              cart_id: cartId,
              product_id: item.product.id,
              quantity: item.quantity,
            });
        }
      }

      // Clear local cart after sync
      localStorage.removeItem(CART_STORAGE_KEY);
      
      // Refresh cart from Supabase
      await fetchCart();
    } catch (err) {
      console.error("Error syncing cart:", err);
    }
  }, [isAuthenticated, userId, supabase, getOrCreateCart, fetchCart]);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  return {
    cart,
    items,
    summary,
    isLoading,
    error,
    isAuthenticated,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    syncLocalCartToSupabase,
    refreshCart,
  };
}

/**
 * Convert local cart format to Supabase CartWithItems format
 */
function convertLocalCartToSupabaseFormat(localCart: LocalCartState): CartWithItems {
  return {
    id: "local",
    user_id: "guest",
    coupon_id: null,
    expires_at: null,
    created_at: localCart.lastUpdated,
    updated_at: localCart.lastUpdated,
    items: localCart.items.map((item, index) => ({
      id: `local-${index}`,
      cart_id: "local",
      product_id: item.product.id,
      quantity: item.quantity,
      created_at: localCart.lastUpdated,
      updated_at: localCart.lastUpdated,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        title: item.product.title,
        description: item.product.description,
        price: item.product.price,
        sale_price: null,
        stock: item.product.inStock ? 10 : 0,
        reserved_stock: 0,
        sold: item.product.sold,
        weight: (item.product as any).weight || 0.5, // Use stored weight
        dimensions: null,
        average_rating: item.product.rating,
        review_count: 0,
        is_active: true,
        is_deleted: false,
        meta_title: null,
        meta_description: null,
        source_url: null,
        category_id: null,
        created_at: null,
        updated_at: null,
        images: [{
          id: `img-${index}`,
          product_id: item.product.id,
          url: item.product.image || "/images/placeholder-product.svg",
          display_order: 0,
          is_primary: true,
          created_at: null,
        }],
      },
    })) as CartItem[],
  };
}

export { CART_STORAGE_KEY };
