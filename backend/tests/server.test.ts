import mongoose from "mongoose";
import app from "../src/app";

jest.mock("mongoose");

const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;

mockedMongoose.connect.mockResolvedValue(null);
mockedMongoose.disconnect.mockResolvedValue(null);

const mockClose = jest.fn();

jest.mock("../src/app", () => ({
  __esModule: true,
  default: {
    listen: jest.fn((port: number, callback?: Function) => {
      if (callback) callback();
      return { close: mockClose };
    }),
  },
}));

import { startServer } from "../src/server";

describe("server.ts", () => {
  let originalExit: any;
  let processOnMock: any;

  beforeEach(() => {
    // Prevent Jest from exiting
    originalExit = process.exit;
    process.exit = jest.fn() as any;

    processOnMock = jest.spyOn(process, "on");
    mockClose.mockClear();
    (mongoose.disconnect as jest.Mock).mockClear();
  });

  afterEach(() => {
    process.exit = originalExit;
    processOnMock.mockRestore();
  });

  it("connects to MongoDB and starts the server", async () => {
    const server = await startServer();

    expect(mongoose.connect).toHaveBeenCalled();
    expect(app.listen).toHaveBeenCalled();
    expect(server.close).toBeDefined();
  });

  it("registers shutdown handlers for SIGINT and SIGTERM", async () => {
    await startServer();

    expect(processOnMock).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(processOnMock).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });

  it("calls server.close, mongoose.disconnect, and process.exit on shutdown", async () => {
    await startServer();

    // Grab the shutdown callback registered for SIGINT
    const shutdownCallback = (process.on as jest.Mock).mock.calls.find(
      (call) => call[0] === "SIGINT"
    )[1];

    // Call the shutdown function
    await shutdownCallback();

    expect(mockClose).toHaveBeenCalled();
    expect(mongoose.disconnect).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
