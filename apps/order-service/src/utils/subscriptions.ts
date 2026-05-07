import { consumer } from "./kafka";
import { createOrder } from "./order";

export const runKafkaSubscriptions = async () => {
  //   consumer.subscribe("product.created", async (message) => {
  //     const product = message.value;
  //     console.log("Received message: product.created", product);
  //     await createStripeProduct(product);
  //   });
  consumer.subscribe([
    {
      topicName: "payment.successful",
      topicHandler: async (message) => {
        console.log("Received message: payment.successful", message);
        const order = message.value;
        await createOrder(order);
      },
    },
  ]);
};
