import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock Clerk SDK
vi.mock("../src/utils/clerk", () => ({
  default: {
    users: {
      getUserList: vi.fn(),
      getUser: vi.fn(),
      createUser: vi.fn(),
      deleteUser: vi.fn(),
    },
  },
}));

// Mock Kafka Producer
vi.mock("../src/utils/kafka", () => ({
  producer: {
    send: vi.fn(),
    connect: vi.fn(),
  },
}));

// Mock Auth Middleware
vi.mock("../src/middleware/authMiddleware", () => ({
  shouldBeAdmin: (req: any, res: any, next: any) => {
    if (req.headers["x-test-role"] === "admin") {
      req.userId = "test-admin-id";
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  },
}));

import userRoute from "../src/routes/user.route";
import clerkClient from "../src/utils/clerk";
import { producer } from "../src/utils/kafka";

const app = express();
app.use(express.json());
app.use("/users", userRoute);

describe("Auth Service - User Directory Operations (US1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /users should return user list from Clerk", async () => {
    const mockUsers = [
      { id: "usr_1", username: "alice", emailAddresses: [{ emailAddress: "alice@example.com" }] },
    ];
    (clerkClient.users.getUserList as any).mockResolvedValue(mockUsers);

    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUsers);
    expect(clerkClient.users.getUserList).toHaveBeenCalled();
  });

  it("GET /users/:id should return single user", async () => {
    const mockUser = { id: "usr_123", username: "bob" };
    (clerkClient.users.getUser as any).mockResolvedValue(mockUser);

    const res = await request(app).get("/users/usr_123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser);
    expect(clerkClient.users.getUser).toHaveBeenCalledWith("usr_123");
  });

  it("POST /users should create user in Clerk and emit user.created Kafka event", async () => {
    const newUserParams = {
      username: "charlie",
      emailAddress: ["charlie@example.com"],
      password: "SuperSecretPassword123!",
    };

    const createdClerkUser = {
      id: "usr_charlie",
      username: "charlie",
      emailAddresses: [{ emailAddress: "charlie@example.com" }],
    };

    (clerkClient.users.createUser as any).mockResolvedValue(createdClerkUser);

    const res = await request(app)
      .post("/users")
      .send(newUserParams);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdClerkUser);
    expect(producer.send).toHaveBeenCalledWith("user.created", {
      value: {
        username: "charlie",
        email: "charlie@example.com",
      },
    });
  });

  it("DELETE /users/:id should delete user in Clerk", async () => {
    (clerkClient.users.deleteUser as any).mockResolvedValue({ id: "usr_del" });

    const res = await request(app).delete("/users/usr_del");

    expect(res.status).toBe(200);
    expect(clerkClient.users.deleteUser).toHaveBeenCalledWith("usr_del");
  });
});
