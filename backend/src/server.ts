import app from "./app";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;

// Extracted function to start the server
export const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down server...");
      server.close(() => console.log("HTTP server closed"));
      await mongoose.disconnect();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    return server;
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}
