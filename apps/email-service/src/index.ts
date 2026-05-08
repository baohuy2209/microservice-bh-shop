import { createConsumer, createKafkaClient } from "@repo/kafka";
import sendMail from "./utils/mailer";
const kafka = createKafkaClient("email-service");
const consumer = createConsumer(kafka, "email-service");
const start = async () => {
  try {
    await consumer.subscribe([
      {
        topicName: "user.created",
        topicHandler: async (message) => {
          const { email, username } = message.value;
          if (email) {
            await sendMail({
              email,
              subject: "Welcome to BH Shop",
              text: `Welcome ${username}. You account has been created`,
            });
          }
        },
      },
      {
        topicName: "order.created",
        topicHandler: async (message) => {
          const { email, amount, status } = message.value;
          if (email) {
            await sendMail({
              email,
              subject: "Order has been created",
              text: `Hello. Your order: Amount: ${amount}, Status: ${status}`,
            });
          }
        },
      },
    ]);
    await consumer.connect();
  } catch (error) {
    console.log(error);
  }
};
start();
