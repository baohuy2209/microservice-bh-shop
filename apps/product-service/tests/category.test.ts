import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock @repo/product-db
vi.mock("@repo/product-db", () => ({
  prisma: {
    category: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
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
}));

import categoryRouter from "../src/routes/category.routes";
import { prisma } from "@repo/product-db";

const app = express();
app.use(express.json());
app.use("/categories", categoryRouter);

describe("Product Service - Category Routes (US1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /categories should return category list with 200 OK", async () => {
    const mockCategories = [
      { id: "c1", name: "Footwear", slug: "footwear" },
      { id: "c2", name: "Apparel", slug: "apparel" },
    ];
    (prisma.category.findMany as any).mockResolvedValue(mockCategories);

    const res = await request(app).get("/categories");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockCategories);
  });

  it("POST /categories as admin should create category", async () => {
    const payload = { name: "Electronics", slug: "electronics" };
    (prisma.category.create as any).mockResolvedValue({ id: "c3", ...payload });

    const res = await request(app)
      .post("/categories")
      .set("x-test-role", "admin")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("electronics");
    expect(prisma.category.create).toHaveBeenCalledWith({ data: payload });
  });

  it("POST /categories as non-admin should be rejected with 403", async () => {
    const res = await request(app)
      .post("/categories")
      .send({ name: "Hats", slug: "hats" });

    expect(res.status).toBe(403);
  });
});
