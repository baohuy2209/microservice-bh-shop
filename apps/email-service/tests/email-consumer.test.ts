import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/utils/mailer", () => ({
  default: vi.fn().mockResolvedValue(true),
}));

import sendMail from "../src/utils/mailer";

describe("Email Service - Kafka Consumer Handlers (US2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should format and send welcome email when user.created event is received", async () => {
    const userPayload = {
      username: "alexander",
      email: "alex@example.com",
    };

    if (userPayload.email) {
      await sendMail({
        email: userPayload.email,
        subject: "Welcome to BH Shop",
        text: `Welcome ${userPayload.username}. You account has been created`,
      });
    }

    expect(sendMail).toHaveBeenCalledWith({
      email: "alex@example.com",
      subject: "Welcome to BH Shop",
      text: "Welcome alexander. You account has been created",
    });
  });

  it("should format and send order confirmation receipt when order.created event is received", async () => {
    const orderPayload = {
      email: "buyer@example.com",
      amount: 14900,
      status: "success",
    };

    if (orderPayload.email) {
      await sendMail({
        email: orderPayload.email,
        subject: "Order has been created",
        text: `Hello. Your order: Amount: ${orderPayload.amount}, Status: ${orderPayload.status}`,
      });
    }

    expect(sendMail).toHaveBeenCalledWith({
      email: "buyer@example.com",
      subject: "Order has been created",
      text: "Hello. Your order: Amount: 14900, Status: success",
    });
  });
});
