import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";

const app = express();
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api/games", gameRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
