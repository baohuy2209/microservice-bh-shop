import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/utils/stripe", () => ({
  default: {
    products: {
      create: vi.fn(),
      del: vi.fn(),
    },
    prices: {
      list: vi.fn(),
    },
  },
}));

import stripe from "../src/utils/stripe";
import {
  createStripeProduct,
  deleteStripeProduct,
  getStripeProductPrice,
} from "../src/utils/stripeProduct";

describe("Payment Service - Stripe Product Sync (US2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createStripeProduct provisions product and default price in cents", async () => {
    const mockProduct = {
      id: "prod_100",
      name: "Smart Watch",
      price: 199.99,
    };

    (stripe.products.create as any).mockResolvedValue({ id: "prod_100" });

    await createStripeProduct(mockProduct);

    expect(stripe.products.create).toHaveBeenCalledWith({
      id: "prod_100",
      name: "Smart Watch",
      default_price_data: {
        currency: "usd",
        unit_amount: 19999,
      },
    });
  });

  it("getStripeProductPrice retrieves unit amount from Stripe", async () => {
    (stripe.prices.list as any).mockResolvedValue({
      data: [{ unit_amount: 19999 }],
    });

    const price = await getStripeProductPrice("prod_100");
    expect(price).toBe(19999);
  });

  it("deleteStripeProduct archives or deletes product in Stripe", async () => {
    (stripe.products.del as any).mockResolvedValue({ id: "100", deleted: true });

    await deleteStripeProduct(100);
    expect(stripe.products.del).toHaveBeenCalledWith("100");
  });
});
