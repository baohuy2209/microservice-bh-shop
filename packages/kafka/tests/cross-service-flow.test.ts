import { describe, it, expect, vi } from "vitest";
import { OrderType } from "@repo/types";
import { InMemoryKafkaHarness } from "../src/test-harness";

describe("Cross-Service Kafka Event Pipeline (US2)", () => {
  it("orchestrates payment.successful -> order.created -> notification pipeline end-to-end", async () => {
    const harness = new InMemoryKafkaHarness();
    const processedOrders: OrderType[] = [];
    const sentEmails: Array<{ email: string; subject: string }> = [];

    // Consumer in Order Service: subscribes to payment.successful
    harness.subscribe("payment.successful", async ({ value: paymentEvent }) => {
      const order: OrderType = {
        _id: "ord_mock_123",
        userId: paymentEvent.userId,
        email: paymentEvent.email,
        amount: paymentEvent.amount,
        status: paymentEvent.status,
        products: paymentEvent.products,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      processedOrders.push(order);

      // Order service emits order.created
      await harness.send("order.created", {
        value: {
          email: order.email,
          amount: order.amount,
          status: order.status,
        },
      });
    });

    // Consumer in Email Service: subscribes to order.created
    harness.subscribe("order.created", async ({ value: orderEvent }) => {
      sentEmails.push({
        email: orderEvent.email,
        subject: `Order has been created - Total: ${orderEvent.amount}`,
      });
    });

    // Payment Service simulates emitting payment.successful
    const initialPaymentPayload = {
      userId: "usr_buyer_123",
      email: "buyer@domain.com",
      amount: 8900,
      status: "success" as const,
      products: [{ name: "Mechanical Keyboard", quantity: 1, price: 8900 }],
    };

    await harness.send("payment.successful", { value: initialPaymentPayload });

    // Assertions
    expect(processedOrders.length).toBe(1);
    expect(processedOrders[0]?.email).toBe("buyer@domain.com");
    expect(processedOrders[0]?.amount).toBe(8900);

    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0]?.email).toBe("buyer@domain.com");
    expect(sentEmails[0]?.subject).toContain("Total: 8900");

    const allEvents = harness.getAllEvents();
    expect(allEvents.map((e) => e.topic)).toEqual([
      "payment.successful",
      "order.created",
    ]);
  });
});
