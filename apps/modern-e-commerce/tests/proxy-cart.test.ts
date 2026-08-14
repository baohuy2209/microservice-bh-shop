import { describe, it, expect, beforeEach, vi } from "vitest";
import type { CartItemType } from "@repo/types";

// Mock localStorage for Zustand persist
const localStorageMock = vi.hoisted(() => {
  let store: Record<string, string> = {};
  const mock = {
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
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
  vi.stubGlobal("localStorage", mock);
  vi.stubGlobal("window", { localStorage: mock });
  return mock;
});



import useCartStore from "../src/stores/cartStore";

const createMockCartItem = (overrides?: Partial<CartItemType>): CartItemType => ({
  id: "prod_1",
  name: "T-Shirt",
  shortDescription: "A nice t-shirt",
  description: "Detailed description",
  price: 29.99,
  sizes: ["S", "M", "L"],
  colors: ["Black", "White"],
  images: { Black: "img.png" },
  createdAt: new Date(),
  updatedAt: new Date(),
  categorySlug: "apparel",
  quantity: 1,
  selectedSize: "M",
  selectedColor: "Black",
  ...overrides,
});

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
    const item = createMockCartItem();

    useCartStore.getState().addToCart(item);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0]?.name).toBe("T-Shirt");
    expect(state.cart[0]?.quantity).toBe(1);
  });

  it("should increment quantity when adding an identical variant", () => {
    const item = createMockCartItem();

    useCartStore.getState().addToCart(item);
    useCartStore.getState().addToCart({ ...item, quantity: 2 });

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0]?.quantity).toBe(3);
  });

  it("should remove item from cart", () => {
    const item = createMockCartItem();

    useCartStore.getState().addToCart(item);
    useCartStore.getState().removeFromCart(item);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(0);
  });

  it("should clear entire cart", () => {
    useCartStore.getState().addToCart(
      createMockCartItem({
        id: "prod_1",
        name: "Item 1",
        price: 10,
        quantity: 1,
        selectedSize: "M",
        selectedColor: "Red",
        images: {},
      }),
    );

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().cart).toEqual([]);
  });
});

