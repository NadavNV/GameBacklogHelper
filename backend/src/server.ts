import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");

  // Stop accepting new connections
  server.close(() => {
    console.log("HTTP server closed");
  });

  // Close MongoDB connection
  await mongoose.disconnect();

  process.exit(0);
};

// Listen for termination signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
