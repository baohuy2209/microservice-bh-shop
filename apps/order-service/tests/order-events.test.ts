import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @repo/order-db
const mockSave = vi.fn();
vi.mock("@repo/order-db", () => {
  return {
    Order: class MockOrder {
      public email: string;
      public amount: number;
      public status: string;
      constructor(data: any) {
        this.email = data.email;
        this.amount = data.amount;
        this.status = data.status;
      }
      public save = mockSave;
    },
  };
});

// Mock Kafka producer
vi.mock("../src/utils/kafka", () => ({
  producer: {
    send: vi.fn(),
  },
  consumer: {
    subscribe: vi.fn(),
  },
}));

import { createOrder } from "../src/utils/order";
import { producer } from "../src/utils/kafka";

describe("Order Service - Event Subscriptions & Emission (US2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createOrder saves order and emits order.created Kafka event", async () => {
    const mockOrderData = {
      userId: "usr_1",
      email: "test@example.com",
      amount: 8900,
      status: "success" as const,
      products: [{ name: "Keyboard", quantity: 1, price: 8900 }],
      createdAt: new Date(),
    };

    mockSave.mockResolvedValue({
      email: "test@example.com",
      amount: 8900,
      status: "success",
    });

    await createOrder(mockOrderData);

    expect(mockSave).toHaveBeenCalled();
    expect(producer.send).toHaveBeenCalledWith("order.created", {
      value: {
        email: "test@example.com",
        amount: 8900,
        status: "success",
      },
    });
  });
});
