import { describe, it, expect, vi, beforeEach } from "vitest";
import Fastify from "fastify";
import { orderRoute } from "../src/routes/order";

// Mock @repo/order-db
vi.mock("@repo/order-db", () => ({
  Order: {
    find: vi.fn(),
    aggregate: vi.fn(),
  },
  connectOrderDB: vi.fn(),
}));

// Mock Fastify Auth Middleware
vi.mock("../src/middleware/authMiddleware", () => ({
  shouldBeAdmin: async (request: any, reply: any) => {
    if (request.headers["x-test-role"] !== "admin") {
      return reply.code(403).send({ error: "Admin access required" });
    }
  },
  shouldBeUser: async (request: any, reply: any) => {
    const userId = request.headers["x-test-user-id"];
    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    request.userId = userId;
  },
}));

import { Order } from "@repo/order-db";

describe("Order Service - Fastify Routes & Analytics (US1)", () => {
  let app: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(orderRoute);
  });

  it("GET /user-orders should retrieve orders for authenticated user", async () => {
    const mockOrders = [
      { _id: "ord-1", userId: "user-123", amount: 5000, status: "success" },
    ];
    (Order.find as any).mockResolvedValue(mockOrders);

    const response = await app.inject({
      method: "GET",
      url: "/user-orders",
      headers: { "x-test-user-id": "user-123" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockOrders);
    expect(Order.find).toHaveBeenCalledWith({ userId: "user-123" });
  });

  it("GET /user-orders without auth headers should return 401 Unauthorized", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/user-orders",
    });

    expect(response.statusCode).toBe(401);
  });

  it("GET /orders should reject non-admin request with 403 Forbidden", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/orders",
    });

    expect(response.statusCode).toBe(403);
  });

  it("GET /orders as admin should return orders sorted by recency", async () => {
    const mockOrders = [
      { _id: "ord-1", amount: 100 },
      { _id: "ord-2", amount: 200 },
    ];
    (Order.find as any).mockReturnValue({
      limit: () => ({
        sort: () => Promise.resolve(mockOrders),
      }),
    });

    const response = await app.inject({
      method: "GET",
      url: "/orders?limit=10",
      headers: { "x-test-role": "admin" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockOrders);
  });

  it("GET /order-chart as admin should return 6-month aggregation data", async () => {
    (Order.aggregate as any).mockResolvedValue([
      { year: 2026, month: 8, total: 15, successful: 12 },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/order-chart",
      headers: { "x-test-role": "admin" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(6);
    expect(body[body.length - 1]).toHaveProperty("month");
    expect(body[body.length - 1]).toHaveProperty("total");
    expect(body[body.length - 1]).toHaveProperty("successful");
  });
});
