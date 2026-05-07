import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeUser } from "./middleware/authMiddleware";
import productRouter from "./routes/product.routes";
import categoryRouter from "./routes/category.routes";
import { consumer, producer } from "./utils/kafka";
const app = express();
app.use(clerkMiddleware());
app.use(
  cors({
    origin: ["http://localhost:3000"], // Allow requests from the frontend
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json("Product endpoint is working");
});
app.get("/test", shouldBeUser, (req: Request, res: Response) => {
  res.json({ message: "This is a protected route", userId: req.userId });
});
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error" });
});
const start = async () => {
  try {
    Promise.all([await producer.connect(), await consumer.connect()]);
    app.listen(8000, () => {
      console.log("Product service is running on port 8000");
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
