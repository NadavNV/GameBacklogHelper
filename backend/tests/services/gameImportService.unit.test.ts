import axios from "axios";
import { importSteamLibrary } from "../../src/services/gameImportService";
import { Game } from "../../src/models/Game";
import { fetchSteamLibrary } from "../../src/services/steamService";
import { fetchMetacriticScore } from "../../src/services/rawgService";
import { fetchGameLengthByName } from "../../src/services/igdbService";
import { MAX_PLAYTIME_HOURS } from "../../src/constants/config";
import type { AuthRequest } from "../../src/middleware/authMiddleware";

jest.mock("axios");
jest.mock("../../src/models/Game");
jest.mock("../../src/services/steamService");
jest.mock("../../src/services/rawgService");
jest.mock("../../src/services/igdbService");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGame = Game as jest.Mocked<typeof Game>;
const mockedFetchSteamLibrary = fetchSteamLibrary as jest.MockedFunction<
  typeof fetchSteamLibrary
>;
const mockedFetchMetacriticScore = fetchMetacriticScore as jest.MockedFunction<
  typeof fetchMetacriticScore
>;
const mockedFetchGameLengthByName =
  fetchGameLengthByName as jest.MockedFunction<typeof fetchGameLengthByName>;

describe("importSteamLibrary (unit)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws if missing userId", async () => {
    const req = { body: { vanityNameOrId: "123" } } as AuthRequest;
    await expect(importSteamLibrary(req)).rejects.toThrow("Missing userId");
  });

  it("throws if missing vanityNameOrId", async () => {
    const req = { userId: "64a9c7f6d6f0c34a2c7b1a11", body: {} } as AuthRequest;
    await expect(importSteamLibrary(req)).rejects.toThrow(
      "Missing Steam identifier"
    );
  });

  it("filters out long-playtime games", async () => {
    mockedFetchSteamLibrary.mockResolvedValueOnce([
      { title: "Skyrim", playtimeHours: MAX_PLAYTIME_HOURS + 1 },
    ]);
    const req = {
      userId: "64a9c7f6d6f0c34a2c7b1a11",
      body: { vanityNameOrId: "123" },
    } as AuthRequest;
    const result = await importSteamLibrary(req);
    expect(result).toEqual([]);
  });

  it("filters out already-existing games", async () => {
    mockedFetchSteamLibrary.mockResolvedValueOnce([
      { title: "Portal", playtimeHours: 2 },
    ]);
    mockedGame.find.mockReturnValueOnce({
      distinct: jest.fn().mockResolvedValue(["Portal"]),
    } as any);

    const req = {
      userId: "64a9c7f6d6f0c34a2c7b1a11",
      body: { vanityNameOrId: "123" },
    } as AuthRequest;
    const result = await importSteamLibrary(req);
    expect(result).toEqual([]);
  });

  it("imports new games (with mocks)", async () => {
    mockedFetchSteamLibrary.mockResolvedValueOnce([
      { title: "Portal", playtimeHours: 2 },
    ]);
    mockedGame.find.mockReturnValueOnce({
      distinct: jest.fn().mockResolvedValue([]),
    } as any);

    mockedFetchMetacriticScore.mockResolvedValueOnce(88);
    mockedFetchGameLengthByName.mockResolvedValueOnce("medium");
    mockedGame.insertMany.mockResolvedValueOnce([{ title: "Portal" } as any]);

    const req = {
      userId: "64a9c7f6d6f0c34a2c7b1a11",
      body: { vanityNameOrId: "123" },
    } as AuthRequest;
    const result = await importSteamLibrary(req);

    expect(mockedGame.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        title: "Portal",
        metacriticScore: 88,
        length: "medium",
      }),
    ]);
    expect(result).toEqual([{ title: "Portal" }]);
  });
});
