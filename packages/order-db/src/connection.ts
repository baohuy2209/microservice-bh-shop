import mongoose from "mongoose";
let isConnected = false;
export const connectOrderDB = async () => {
  if (isConnected) return;
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not defined");
  }
  try {
    await mongoose.connect(process.env.MONGO_URL);
    isConnected = true;
    console.log("Connected Mongoose");
  } catch (err) {
    console.log(err);
    throw err;
  }
};
