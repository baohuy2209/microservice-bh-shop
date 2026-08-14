import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock @repo/product-db
vi.mock("@repo/product-db", () => ({
  prisma: {
    product: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  Prisma: {
    SortOrder: { asc: "asc", desc: "desc" },
  },
}));

// Mock Kafka producer
vi.mock("../src/utils/kafka", () => ({
  producer: {
    send: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
  consumer: {
    connect: vi.fn(),
    subscribe: vi.fn(),
    disconnect: vi.fn(),
  },
}));

// Mock Clerk Auth Middleware
vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (req: any, res: any, next: any) => next(),
}));

// Mock Admin Guard
vi.mock("../src/middleware/authMiddleware", () => ({
  shouldBeAdmin: (req: any, res: any, next: any) => {
    if (req.headers["x-test-role"] === "admin") {
      req.userId = "test-admin-id";
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  },
  shouldBeUser: (req: any, res: any, next: any) => {
    if (req.headers["x-test-user-id"]) {
      req.userId = req.headers["x-test-user-id"];
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  },
}));

import productRouter from "../src/routes/product.routes";
import { prisma } from "@repo/product-db";
import { producer } from "../src/utils/kafka";

const app = express();
app.use(express.json());
app.use("/products", productRouter);

describe("Product Service - Product Routes & Events (US1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /products should return products with 200 OK", async () => {
    const mockProducts = [
      { id: "p1", name: "Nike Air Max", price: 150, categorySlug: "shoes" },
    ];
    (prisma.product.findMany as any).mockResolvedValue(mockProducts);

    const res = await request(app).get("/products?category=shoes");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockProducts);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { slug: "shoes" },
        }),
      })
    );
  });

  it("POST /products should block non-admin requests with 403 Forbidden", async () => {
    const res = await request(app)
      .post("/products")
      .send({ name: "Unauthenticated Item" });

    expect(res.status).toBe(403);
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it("POST /products as admin should validate colors and images before creation", async () => {
    const invalidPayload = {
      name: "T-Shirt",
      price: 25.99,
      colors: ["black", "white"],
      images: { black: "img_black.png" }, // missing white
      categorySlug: "apparel",
    };

    const res = await request(app)
      .post("/products")
      .set("x-test-role", "admin")
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Missing images for colors");
  });

  it("POST /products as admin should persist product and emit Kafka product.created event", async () => {
    const payload = {
      name: "T-Shirt",
      shortDescription: "Cotton T-Shirt",
      description: "Premium Cotton T-Shirt",
      price: 25.99,
      sizes: ["S", "M", "L"],
      colors: ["black", "white"],
      images: { black: "img_black.png", white: "img_white.png" },
      categorySlug: "apparel",
    };

    const createdProduct = { id: "prod-123", ...payload };
    (prisma.product.create as any).mockResolvedValue(createdProduct);

    const res = await request(app)
      .post("/products")
      .set("x-test-role", "admin")
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdProduct);
    expect(producer.send).toHaveBeenCalledWith("product.created", {
      value: {
        id: "prod-123",
        name: "T-Shirt",
        price: 25.99,
      },
    });
  });

  it("DELETE /products/:id as admin should delete product and emit product.deleted", async () => {
    (prisma.product.delete as any).mockResolvedValue({ id: "prod-123" });

    const res = await request(app)
      .delete("/products/prod-123")
      .set("x-test-role", "admin");

    expect(res.status).toBe(200);
    expect(prisma.product.delete).toHaveBeenCalledWith({
      where: { id: "prod-123" },
    });
    expect(producer.send).toHaveBeenCalledWith("product.deleted", {
      value: NaN,
    });
  });
});
