import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeAdmin } from "./middleware/authMiddleware";
import userRoute from "./routes/user.route";
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
  res.json("Auth endpoint is working");
});
app.use("/users", shouldBeAdmin, userRoute);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error" });
});
const start = async () => {
  try {
    app.listen(8004, () => {
      console.log("Authentication service is running on port 8004");
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
