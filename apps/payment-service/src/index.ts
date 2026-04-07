import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@clerk/hono";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import stripe from "./utils/stripe.js";
const app = new Hono();
app.use("*", clerkMiddleware());
app.get("/pay", shouldBeUser, async (c) => {
  const { products } = await c.req.json();
  const totalPrice = await Promise.all(
    products.map(async (product: any) => {
      const productInDb: any = await fetch(
        `localhost:8000/product/${product.id}`,
      );
      return productInDb.price * product.quantity;
    }),
  );

  return c.json({
    message: "You are logged in!",
    userId: c.get("userId"),
  });
});
app.post("/create-stripe-products", shouldBeUser, async (c) => {
  const res = await stripe.products.create({
    id: "1223",
    name: "Test product",
    default_price_data: {
      currency: "usd",
      unit_amount: 10 * 100,
    },
  });
  return c.json(res);
});
app.get("/stripe-product-price", async (c) => {
  const res = await stripe.prices.list({
    product: "123",
  });
  return c.json(res);
});
serve(
  {
    fetch: app.fetch,
    port: 8002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
