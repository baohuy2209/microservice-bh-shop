import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@clerk/hono";
import sessionRoute from "./routes/session.route";
import { cors } from "hono/cors";
import webhookRoute from "./routes/webhooks.route";
import { consumer, producer } from "./utils/kafka";
import { runKafkaSubscriptions } from "./utils/subscriptions";
const app = new Hono();
app.use("*", clerkMiddleware());
app.use("*", cors({ origin: ["http://localhost:3000"] }));
app.route("/session", sessionRoute);
app.route("/webhooks", webhookRoute);
// app.get("/pay", shouldBeUser, async (c) => {
//   const { products } = await c.req.json();
//   const totalPrice = await Promise.all(
//     products.map(async (product: any) => {
//       const productInDb: any = await fetch(
//         `localhost:8000/product/${product.id}`,
//       );
//       return productInDb.price * product.quantity;
//     }),
//   );

//   return c.json({
//     message: "You are logged in!",
//     userId: c.get("userId"),
//   });
// });
// app.post("/create-stripe-products", shouldBeUser, async (c) => {
//   const res = await stripe.products.create({
//     id: "1223",
//     name: "Test product",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     },
//   });
//   return c.json(res);
// });
// app.get("/stripe-product-price", async (c) => {
//   const res = await stripe.prices.list({
//     product: "123",
//   });
//   return c.json(res);
// });

const start = async () => {
  try {
    Promise.all([await producer.connect(), await consumer.connect()]);
    await runKafkaSubscriptions();
    serve(
      {
        fetch: app.fetch,
        port: 8002,
      },
      (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
      },
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
