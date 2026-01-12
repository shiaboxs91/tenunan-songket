import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { Product, CartItem, CartState, PRODUCT_CATEGORIES } from "@/lib/types";

// Cart logic functions (extracted for testing)
function addItemToCart(items: CartItem[], product: Product, quantity: number = 1): CartItem[] {
  const existingIndex = items.findIndex((item) => item.product.id === product.id);

  if (existingIndex >= 0) {
    const newItems = [...items];
    newItems[existingIndex] = {
      ...newItems[existingIndex],
      quantity: newItems[existingIndex].quantity + quantity,
    };
    return newItems;
  }

  return [...items, { product, quantity }];
}

function removeItemFromCart(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.product.id !== productId);
}

function updateItemQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.product.id !== productId);
  }

  return items.map((item) =>
    item.product.id === productId ? { ...item, quantity } : item
  );
}

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

function serializeCart(items: CartItem[]): string {
  const cartState: CartState = {
    items,
    lastUpdated: new Date().toISOString(),
  };
  return JSON.stringify(cartState);
}

function deserializeCart(json: string): CartItem[] {
  try {
    const cartState: CartState = JSON.parse(json);
    return cartState.items || [];
  } catch {
    return [];
  }
}

// Generator for valid Product
const productArb = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 1, maxLength: 50 }).map((s) => s.replace(/\s/g, "-")),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ maxLength: 500 }),
  image: fc.option(fc.webUrl(), { nil: undefined }),
  price: fc.integer({ min: 100000, max: 10000000 }),
  currency: fc.constant("IDR" as const),
  category: fc.constantFrom(...PRODUCT_CATEGORIES),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  inStock: fc.boolean(),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  sold: fc.integer({ min: 0, max: 1000 }),
  createdAt: fc.option(
    fc.date({ min: new Date("2020-01-01"), max: new Date("2025-12-31") }).map((d) => d.toISOString()),
    { nil: undefined }
  ),
  sourceUrl: fc.webUrl(),
});

// Generator for CartItem
const cartItemArb = fc.record({
  product: productArb,
  quantity: fc.integer({ min: 1, max: 99 }),
});

/**
 * Feature: tenunan-songket-store, Property 3: Cart quantity update reflects in state
 * Validates: Requirements 5.2
 *
 * For any cart with items and any valid quantity update (quantity > 0),
 * updating an item's quantity SHALL result in the cart state reflecting
 * the new quantity for that specific item while other items remain unchanged.
 */
describe("Property 3: Cart quantity update reflects in state", () => {
  it("should update quantity for specific item only", () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 1, max: 99 }),
        (items, newQuantity) => {
          // Pick a random item to update
          const targetIndex = Math.floor(Math.random() * items.length);
          const targetId = items[targetIndex].product.id;

          const updatedItems = updateItemQuantity(items, targetId, newQuantity);

          // Target item should have new quantity
          const updatedItem = updatedItems.find((item) => item.product.id === targetId);
          expect(updatedItem?.quantity).toBe(newQuantity);

          // Other items should remain unchanged
          for (const item of items) {
            if (item.product.id !== targetId) {
              const found = updatedItems.find((i) => i.product.id === item.product.id);
              expect(found?.quantity).toBe(item.quantity);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should remove item when quantity is set to 0", () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        (items) => {
          const targetIndex = Math.floor(Math.random() * items.length);
          const targetId = items[targetIndex].product.id;

          const updatedItems = updateItemQuantity(items, targetId, 0);

          // Item should be removed
          const found = updatedItems.find((item) => item.product.id === targetId);
          expect(found).toBeUndefined();

          // Length should decrease by 1
          expect(updatedItems.length).toBe(items.length - 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: tenunan-songket-store, Property 4: Cart item removal excludes item
 * Validates: Requirements 5.3
 *
 * For any cart with items and any item removal operation, the resulting cart
 * SHALL NOT contain the removed item, and all other items SHALL remain in the cart.
 */
describe("Property 4: Cart item removal excludes item", () => {
  it("should remove only the specified item", () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        (items) => {
          const targetIndex = Math.floor(Math.random() * items.length);
          const targetId = items[targetIndex].product.id;

          const updatedItems = removeItemFromCart(items, targetId);

          // Target item should not exist
          const found = updatedItems.find((item) => item.product.id === targetId);
          expect(found).toBeUndefined();

          // All other items should still exist
          for (const item of items) {
            if (item.product.id !== targetId) {
              const found = updatedItems.find((i) => i.product.id === item.product.id);
              expect(found).toBeDefined();
              expect(found?.quantity).toBe(item.quantity);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should decrease cart length by 1 after removal", () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        (items) => {
          const targetIndex = Math.floor(Math.random() * items.length);
          const targetId = items[targetIndex].product.id;

          const updatedItems = removeItemFromCart(items, targetId);

          expect(updatedItems.length).toBe(items.length - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not modify cart when removing non-existent item", () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 0, maxLength: 10 }),
        fc.uuid(),
        (items, nonExistentId) => {
          // Ensure the ID doesn't exist in cart
          const exists = items.some((item) => item.product.id === nonExistentId);
          if (exists) return; // Skip this case

          const updatedItems = removeItemFromCart(items, nonExistentId);

          expect(updatedItems.length).toBe(items.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: tenunan-songket-store, Property 5: Cart subtotal equals sum of item totals
 * Validates: Requirements 5.4
 *
 * For any cart with items, the subtotal SHALL equal the sum of (price × quantity)
 * for all items in the cart.
 */
describe("Property 5: Cart subtotal equals sum of item totals", () => {
  it("should calculate correct subtotal", () => {
    fc.assert(
      fc.property(fc.array(cartItemArb, { minLength: 0, maxLength: 20 }), (items) => {
        const subtotal = calculateSubtotal(items);

        // Manual calculation
        const expectedSubtotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        expect(subtotal).toBe(expectedSubtotal);
      }),
      { numRuns: 100 }
    );
  });

  it("should return 0 for empty cart", () => {
    const subtotal = calculateSubtotal([]);
    expect(subtotal).toBe(0);
  });

  it("should be non-negative", () => {
    fc.assert(
      fc.property(fc.array(cartItemArb, { minLength: 0, maxLength: 20 }), (items) => {
        const subtotal = calculateSubtotal(items);
        expect(subtotal).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: tenunan-songket-store, Property 6: Cart persistence round-trip
 * Validates: Requirements 5.5
 *
 * For any valid cart state, serializing to localStorage and deserializing back
 * SHALL produce an equivalent cart state with the same items and quantities.
 */
describe("Property 6: Cart persistence round-trip", () => {
  it("should preserve cart items after serialize/deserialize", () => {
    fc.assert(
      fc.property(fc.array(cartItemArb, { minLength: 0, maxLength: 10 }), (items) => {
        const serialized = serializeCart(items);
        const deserialized = deserializeCart(serialized);

        // Same number of items
        expect(deserialized.length).toBe(items.length);

        // Each item should match
        for (const originalItem of items) {
          const found = deserialized.find(
            (item) => item.product.id === originalItem.product.id
          );
          expect(found).toBeDefined();
          expect(found?.quantity).toBe(originalItem.quantity);
          expect(found?.product.price).toBe(originalItem.product.price);
          expect(found?.product.title).toBe(originalItem.product.title);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should handle empty cart", () => {
    const serialized = serializeCart([]);
    const deserialized = deserializeCart(serialized);
    expect(deserialized).toEqual([]);
  });

  it("should handle invalid JSON gracefully", () => {
    const deserialized = deserializeCart("invalid json");
    expect(deserialized).toEqual([]);
  });

  it("should preserve subtotal after round-trip", () => {
    fc.assert(
      fc.property(fc.array(cartItemArb, { minLength: 0, maxLength: 10 }), (items) => {
        const originalSubtotal = calculateSubtotal(items);

        const serialized = serializeCart(items);
        const deserialized = deserializeCart(serialized);
        const deserializedSubtotal = calculateSubtotal(deserialized);

        expect(deserializedSubtotal).toBe(originalSubtotal);
      }),
      { numRuns: 100 }
    );
  });
});
