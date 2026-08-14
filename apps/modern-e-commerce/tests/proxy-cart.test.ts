import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage for Zustand persist
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

import useCartStore from "../src/stores/cartStore";

describe("Modern E-Commerce - Zustand Cart Store (US1)", () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCartStore.getState().clearCart();
  });

  it("should initialize with an empty cart", () => {
    const state = useCartStore.getState();
    expect(state.cart).toEqual([]);
  });

  it("should add a new product to cart", () => {
    const item = {
      id: "prod_1",
      name: "T-Shirt",
      price: 29.99,
      quantity: 1,
      selectedSize: "M",
      selectedColor: "Black",
      images: { Black: "img.png" },
    };

    useCartStore.getState().addToCart(item);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].name).toBe("T-Shirt");
    expect(state.cart[0].quantity).toBe(1);
  });

  it("should increment quantity when adding an identical variant", () => {
    const item = {
      id: "prod_1",
      name: "T-Shirt",
      price: 29.99,
      quantity: 1,
      selectedSize: "M",
      selectedColor: "Black",
      images: { Black: "img.png" },
    };

    useCartStore.getState().addToCart(item);
    useCartStore.getState().addToCart({ ...item, quantity: 2 });

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].quantity).toBe(3);
  });

  it("should remove item from cart", () => {
    const item = {
      id: "prod_1",
      name: "T-Shirt",
      price: 29.99,
      quantity: 1,
      selectedSize: "M",
      selectedColor: "Black",
      images: { Black: "img.png" },
    };

    useCartStore.getState().addToCart(item);
    useCartStore.getState().removeFromCart(item);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(0);
  });

  it("should clear entire cart", () => {
    useCartStore.getState().addToCart({
      id: "prod_1",
      name: "Item 1",
      price: 10,
      quantity: 1,
      selectedSize: "M",
      selectedColor: "Red",
      images: {},
    });

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().cart).toEqual([]);
  });
});
