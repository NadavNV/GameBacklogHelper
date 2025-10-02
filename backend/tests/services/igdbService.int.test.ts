import {
  fetchGameLengthByName,
  _expireCachedToken,
  _getCachedToken,
} from "../../src/services/igdbService";

describe("IGDB Service Integration", () => {
  it("requests a new token if none cached", async () => {
    // Clear cache manually
    _expireCachedToken();

    await fetchGameLengthByName("Portal 2");
    const tokenInfo = _getCachedToken();

    expect(tokenInfo).not.toBeNull();
    expect(typeof tokenInfo!.token).toBe("string");
    expect(tokenInfo!.expiresAt).toBeGreaterThan(Date.now());
  }, 20000);

  it("reuses the cached token for subsequent requests", async () => {
    const firstToken = _getCachedToken()?.token;

    await fetchGameLengthByName("Half-Life 2");
    const secondToken = _getCachedToken()?.token;

    expect(firstToken).toBe(secondToken); // same token reused
  }, 20000);

  it("refreshes the token when expired", async () => {
    const oldToken = _getCachedToken()?.token;
    _expireCachedToken(); // force expiry

    await fetchGameLengthByName("The Witcher 3");
    const newToken = _getCachedToken()?.token;

    expect(newToken).not.toBe(oldToken); // got a new token
  }, 20000);

  it("fetches length for a known game", async () => {
    const length = await fetchGameLengthByName("The Witcher 3: Wild Hunt");
    expect(["short", "medium", "long"]).toContain(length);
  });

  it("returns notAvailable for nonsense names", async () => {
    const length = await fetchGameLengthByName("gibberish_game_12345");
    expect(length).toBe("notAvailable");
  });
});
