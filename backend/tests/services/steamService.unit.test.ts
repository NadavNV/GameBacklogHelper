import axios from "axios";
import { fetchSteamLibrary } from "../../src/services/steamService";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("fetchSteamLibrary", () => {
  it("maps Steam API response to LibraryGame[]", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        response: {
          games: [
            { appid: 1, name: "Half-Life", playtime_forever: 120 },
            { appid: 2, name: "Portal", playtime_forever: 30 },
          ],
        },
      },
    });

    const result = await fetchSteamLibrary("123");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
      expect.objectContaining({
        params: expect.objectContaining({
          key: process.env.STEAM_API_KEY,
          steamid: "123",
          include_appinfo: true,
        }),
      })
    );

    expect(result).toEqual([
      { title: "Half-Life", playtimeHours: 2 },
      { title: "Portal", playtimeHours: 0.5 },
    ]);
  });

  it("returns [] if API has no games", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { response: {} } });
    const result = await fetchSteamLibrary("123");
    expect(result).toEqual([]);
  });
});
