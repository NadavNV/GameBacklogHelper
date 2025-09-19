import mongoose from "mongoose";

describe("MongoDB URI connection test", () => {
  it("should connect successfully to the MongoDB server using .env URI", async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not defined in .env");

    await mongoose.connect(mongoUri);

    expect(mongoose.connection.readyState).toBe(1); // 1 = connected

    // Disconnect after test
    await mongoose.disconnect();
  });
});
