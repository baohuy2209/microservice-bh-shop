import express from "express";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"], // Allow requests from the frontend
    credentials: true,
  }),
);
app.listen(8000, () => {
  console.log("Product service is running on port 8000");
});
