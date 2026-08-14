import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import sessionRoute from "../src/routes/session.route";
import stripe from "../src/utils/stripe";
import * as stripeProductUtil from "../src/utils/stripeProduct";

vi.mock("../src/utils/stripe", () => ({
  default: {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
  },
}));

vi.mock("../src/utils/stripeProduct", () => ({
  getStripeProductPrice: vi.fn(),
}));

// Mock Auth Middleware
vi.mock("../src/middleware/authMiddleware", () => ({
  shouldBeUser: async (c: any, next: any) => {
    const testUserId = c.req.header("x-test-user-id");
    if (!testUserId) {
      return c.json({ message: "You are not logged in" }, 401);
    }
    c.set("userId", testUserId);
    await next();
  },
}));

describe("Payment Service - Checkout Session Routes (US1)", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route("/session", sessionRoute);
  });

  it("POST /session/create-checkout-session without auth should return 401", async () => {
    const res = await app.request("/session/create-checkout-session", {
      method: "POST",
      body: JSON.stringify([{ id: "item1", name: "Shoe", quantity: 1 }]),
    });

    expect(res.status).toBe(401);
  });

  it("POST /session/create-checkout-session as user creates checkout session with Stripe", async () => {
    (stripeProductUtil.getStripeProductPrice as any).mockResolvedValue(4500);
    (stripe.checkout.sessions.create as any).mockResolvedValue({
      client_secret: "cs_secret_test_123",
    });

    const cart = [{ id: "prod_1", name: "Hoodie", quantity: 2 }];

    const res = await app.request("/session/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-user-id": "usr_999",
      },
      body: JSON.stringify(cart),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clientSecret: "cs_secret_test_123" });
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: "usr_999",
        mode: "payment",
      })
    );
  });

  it("GET /session/:session_id returns session status", async () => {
    (stripe.checkout.sessions.retrieve as any).mockResolvedValue({
      status: "complete",
      payment_status: "paid",
    });

    const res = await app.request("/session/sess_123");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "complete",
      paymentStatus: "paid",
    });
  });
});
