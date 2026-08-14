import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import webhookRoute from "../src/routes/webhooks.route";
import stripe from "../src/utils/stripe";
import { producer } from "../src/utils/kafka";

vi.mock("../src/utils/stripe", () => ({
  default: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        listLineItems: vi.fn(),
      },
    },
  },
}));

vi.mock("../src/utils/kafka", () => ({
  producer: {
    send: vi.fn(),
    connect: vi.fn(),
  },
}));

describe("Payment Service - Stripe Webhooks & Event Flow (US1 & US2)", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route("/webhooks", webhookRoute);
  });

  it("GET /webhooks returns status ok", async () => {
    const res = await app.request("/webhooks");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok webhook");
  });

  it("POST /webhooks/stripe returns 400 when webhook signature is invalid", async () => {
    (stripe.webhooks.constructEvent as any).mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await app.request("/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "bad_sig" },
      body: JSON.stringify({ id: "evt_123" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Webhook verification failed!" });
    expect(producer.send).not.toHaveBeenCalled();
  });

  it("POST /webhooks/stripe processes checkout.session.completed and emits payment.successful", async () => {
    const mockSession = {
      id: "cs_test_123",
      client_reference_id: "user_789",
      customer_details: { email: "customer@example.com" },
      amount_total: 9900,
      payment_status: "paid",
    };

    const mockEvent = {
      type: "checkout.session.completed",
      data: { object: mockSession },
    };

    const mockLineItems = {
      data: [
        { description: "Running Shoes", quantity: 1, price: { unit_amount: 9900 } },
      ],
    };

    (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);
    (stripe.checkout.sessions.listLineItems as any).mockResolvedValue(mockLineItems);

    const res = await app.request("/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "valid_sig" },
      body: JSON.stringify(mockEvent),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(producer.send).toHaveBeenCalledWith("payment.successful", {
      value: {
        userId: "user_789",
        email: "customer@example.com",
        amount: 9900,
        status: "success",
        products: [
          { name: "Running Shoes", quantity: 1, price: 9900 },
        ],
      },
    });
  });
});
