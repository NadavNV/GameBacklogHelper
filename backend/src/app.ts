import express = require("express");
import authRoutes from "./routes/auth";
import gameRoutes from "./routes/games";

const app = express();
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api/games", gameRoutes);

export default app;
