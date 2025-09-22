import express = require("express");
import cors = require("cors");
import authRoutes from "./routes/auth";
import gameRoutes from "./routes/games";

const app = express();
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://gamebackloghelper-production.up.railway.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api/games", gameRoutes);

export default app;
