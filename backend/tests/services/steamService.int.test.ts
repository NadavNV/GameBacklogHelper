import { fetchSteamLibrary } from "../../src/services/steamService";

describe("fetchSteamLibrary (integration)", () => {
  it("fetches real Steam library from API", async () => {
    const steamId = process.env.TEST_STEAM_ID;
    if (!steamId) throw new Error("Missing TEST_STEAM_ID in env");

    const library = await fetchSteamLibrary(steamId);
    expect(Array.isArray(library)).toBe(true);
    if (library.length) {
      expect(library[0]).toHaveProperty("title");
      expect(library[0]).toHaveProperty("playtimeHours");
    }
  });
});
