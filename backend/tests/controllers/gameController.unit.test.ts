import {
  addGameHandler,
  deleteGameHandler,
  getGamesHandler,
  updateStatusHandler,
  suggestGamesHandler,
} from "../../src/controllers/gameController";
import { AuthRequest } from "../../src/middleware/authMiddleware";
import { connectTestDB, clearTestDB, closeTestDB } from "../setup";
import mongoose from "mongoose";
import { Game } from "../../src/models/Game";

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe("Game Controller", () => {
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let res: any;
  const fakeUserId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = { status: statusMock };
  });

  it("adds a game to the database", async () => {
    const req = {
      body: {
        title: "Mass Effect",
        status: "finished",
        length: "long",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;

    await addGameHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        __v: expect.any(Number),
        _id: expect.any(mongoose.Types.ObjectId),
        title: "Mass Effect",
        status: "finished",
        length: "long",
        platform: "PC",
        metacriticScore: expect.any(Number),
        userId: fakeUserId,
      })
    );
  });

  it("retrieves all games for the logged in user", async () => {
    let req = {
      body: {
        title: "Mass Effect",
        status: "finished",
        length: "long",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;
    await addGameHandler(req, res, jest.fn());
    req = {
      body: {
        title: "Mass Effect 2",
        status: "finished",
        length: "long",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;
    await addGameHandler(req, res, jest.fn());

    await getGamesHandler(req, res, jest.fn());
    expect(statusMock).toHaveBeenLastCalledWith(200);
    expect(jsonMock).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.anything()])
    );
    expect(jsonMock.mock.calls[2][0]).toHaveLength(2);
  });

  it("doesn't retrieve games from other users", async () => {
    let req = {
      body: {
        title: "Mass Effect",
        status: "finished",
        length: "long",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;
    await addGameHandler(req, res, jest.fn());
    req = {
      body: {
        title: "Mass Effect 2",
        status: "finished",
        length: "long",
        platform: "PC",
      },
      userId: otherUserId,
    } as any;
    await addGameHandler(req, res, jest.fn());

    await getGamesHandler(req, res, jest.fn());
    expect(statusMock).toHaveBeenLastCalledWith(200);
    expect(jsonMock).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Mass Effect 2",
          status: "finished",
          length: "long",
          platform: "PC",
          metacriticScore: expect.any(Number),
          userId: otherUserId,
        }),
      ])
    );
  });

  it("deletes a game from the database", async () => {
    let req = {
      body: {
        title: "Mass Effect",
        status: "finished",
        length: "long",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;
    await addGameHandler(req, res, jest.fn());

    req = {
      body: {
        title: "Mass Effect",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;

    await deleteGameHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(2, 200);
    expect(jsonMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        message: "Game deleted successfully",
      })
    );

    await getGamesHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(3, 200);
    expect(jsonMock).toHaveBeenNthCalledWith(3, []);
  });

  it("returns 400 when deleting a game without providing title", async () => {
    const req = {
      body: {
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;

    await deleteGameHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
      })
    );
  });

  it("returns 400 when deleting a game without providing platform", async () => {
    const req = {
      body: {
        title: "Mass Effect",
      },
      userId: fakeUserId,
    } as any;

    await deleteGameHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
      })
    );
  });

  it("returns 400 when deleting a game without providing userId", async () => {
    const req = {
      body: {
        title: "Mass Effect",
        platform: "PC",
      },
    } as any;

    await deleteGameHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
      })
    );
  });

  it("returns 404 when deleting a non-existing game", async () => {
    const req = {
      body: {
        title: "Mass Effect",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;

    await deleteGameHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `Game ${req.body.title} on platform ${req.body.platform} not found for this user`,
      })
    );
  });

  it("updates the status of an existing game", async () => {
    let req = {
      body: {
        title: "Mass Effect",
        status: "finished",
        length: "long",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;
    await addGameHandler(req, res, jest.fn());

    req = {
      body: {
        title: "Mass Effect",
        platform: "PC",
        newStatus: "backlog",
      },
      userId: fakeUserId,
    };

    await updateStatusHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(2, 200);
    expect(jsonMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        message: "Status updated successfully",
      })
    );

    await getGamesHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenLastCalledWith(200);
    expect(jsonMock).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Mass Effect",
          status: "backlog",
          length: "long",
          platform: "PC",
          metacriticScore: expect.any(Number),
          userId: fakeUserId,
        }),
      ])
    );
  });

  it("returns 200 when status hasn't changed", async () => {
    let req = {
      body: {
        title: "Mass Effect",
        status: "finished",
        length: "long",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;
    await addGameHandler(req, res, jest.fn());

    req = {
      body: {
        title: "Mass Effect",
        platform: "PC",
        newStatus: "finished",
      },
      userId: fakeUserId,
    };

    await updateStatusHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(2, 200);
    expect(jsonMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        message: "No change: status already set",
      })
    );

    await getGamesHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenLastCalledWith(200);
    expect(jsonMock).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Mass Effect",
          status: "finished",
          length: "long",
          platform: "PC",
          metacriticScore: expect.any(Number),
          userId: fakeUserId,
        }),
      ])
    );
  });

  it("returns 400 when updating without a title", async () => {
    const req = {
      body: {
        platform: "PC",
        newStatus: "backlog",
      },
      userId: fakeUserId,
    } as any;

    await updateStatusHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
      })
    );
  });

  it("returns 400 when updating without a platform", async () => {
    const req = {
      body: {
        title: "Mass Effect",
        newStatus: "backlog",
      },
      userId: fakeUserId,
    } as any;

    await updateStatusHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
      })
    );
  });

  it("returns 400 when updating without a new status", async () => {
    const req = {
      body: {
        title: "Mass Effect",
        platform: "PC",
      },
      userId: fakeUserId,
    } as any;

    await updateStatusHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
      })
    );
  });

  it("returns 400 when updating without a user ID", async () => {
    const req = {
      body: {
        title: "Mass Effect",
        platform: "PC",
        newStatus: "backlog",
      },
    } as any;

    await updateStatusHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing required fields",
      })
    );
  });

  it("returns 404 when updating a non-existing game", async () => {
    const req = {
      body: {
        title: "Mass Effect",
        platform: "PC",
        newStatus: "backlog",
      },
      userId: fakeUserId,
    } as any;

    await updateStatusHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `Game ${req.body.title} on platform ${req.body.platform} not found for this user`,
      })
    );
  });
});

describe("suggestGameHandler", () => {
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let res: any;
  const fakeUserId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = { status: statusMock };

    // Insert test games
    await Game.insertMany([
      {
        title: "Short PC",
        status: "backlog",
        length: "short",
        platform: "PC",
        metacriticScore: 90,
        userId: fakeUserId,
      },
      {
        title: "Medium PS5",
        status: "backlog",
        length: "medium",
        platform: "PlayStation 5",
        metacriticScore: 88,
        userId: fakeUserId,
      },
      {
        title: "Long Xbox",
        status: "abandoned",
        length: "long",
        platform: "Xbox One",
        metacriticScore: 70,
        userId: fakeUserId,
      },
      {
        title: "Finished Game",
        status: "finished",
        length: "short",
        platform: "PC",
        metacriticScore: 95,
        userId: fakeUserId,
      }, // should be ignored
      {
        title: "Low Score",
        status: "backlog",
        length: "long",
        platform: "PC",
        metacriticScore: 40,
        userId: fakeUserId,
      },
      {
        title: "Another High Score",
        status: "backlog",
        length: "short",
        platform: "PC",
        metacriticScore: 92,
        userId: fakeUserId,
      },
      {
        title: "Other User Game",
        status: "backlog",
        length: "short",
        platform: "PC",
        metacriticScore: 99,
        userId: otherUserId,
      }, // should be ignored
    ]);
  });

  it("suggests top 5 backlog/abandoned games sorted by score", async () => {
    const req = {
      query: {},
      userId: fakeUserId,
    } as any;

    await suggestGamesHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(200);
    const suggestions = jsonMock.mock.calls[0][0];
    const titles = suggestions.map((g: any) => g.title);

    expect(titles).toEqual([
      "Another High Score",
      "Short PC",
      "Medium PS5",
      "Long Xbox",
      "Low Score",
    ]);
  });

  it("applies platform filter", async () => {
    const req = {
      query: { platform: "PC" },
      userId: fakeUserId,
    } as any;

    await suggestGamesHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(200);
    const suggestions = jsonMock.mock.calls[0][0];
    const titles = suggestions.map((g: any) => g.title);

    expect(titles).toEqual(["Another High Score", "Short PC", "Low Score"]);
  });

  it("applies length filter", async () => {
    const req = {
      query: { length: "medium" },
      userId: fakeUserId,
    } as any;

    await suggestGamesHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(200);
    const suggestions = jsonMock.mock.calls[0][0];
    const titles = suggestions.map((g: any) => g.title);

    expect(titles).toEqual(["Medium PS5"]);
  });
});
