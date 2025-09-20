import express = require("express");
import cors = require("cors");
import authRoutes from "./routes/auth";
import gameRoutes from "./routes/games";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api/games", gameRoutes);

export default app;
