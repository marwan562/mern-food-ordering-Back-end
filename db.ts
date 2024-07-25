import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGODB_CONNECTION as string)
  .then(() => console.log("Connected to MongoDB database"))
  .catch((err) => console.log("Failed to connect to MongoDB database", err));
