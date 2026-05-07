import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import { shouldBeUser } from "./middleware/authMiddleware";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order";
import { consumer, producer } from "./utils/kafka";
import { runKafkaSubscriptions } from "./utils/subscriptions";
const fastify = Fastify({
  logger: true,
});

fastify.register(clerkPlugin);
fastify.get("/", async (request, reply) => {
  return reply.send("Order endpoint is working");
});
fastify.get(
  "/protected",
  { preHandler: shouldBeUser },
  async (request, reply) => {
    try {
      return reply.send({
        message: "User retrieved successfully",
        userId: request.userId,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Failed to retrieve user" });
    }
  },
);
fastify.register(orderRoute);
const start = async () => {
  try {
    Promise.all([
      await producer.connect(),
      await consumer.connect(),
      await connectOrderDB(),
    ]);
    await runKafkaSubscriptions();
    await fastify.listen({ port: 8001 });
    console.log("Order service is running on port 8001");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
start();
