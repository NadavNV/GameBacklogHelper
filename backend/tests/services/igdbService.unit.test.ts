import axios from "axios";
import {
  fetchGameLengthByName,
  _expireCachedToken,
} from "../../src/services/igdbService";
import {
  SHORT_PLAYTIME_HOURS,
  MEDIUM_PLAYTIME_HOURS,
} from "../../src/constants/config";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Bottleneck so limiter.schedule(fn) just calls fn
jest.mock("Bottleneck", () => {
  return jest.fn().mockImplementation(() => ({
    schedule: (fn: any) => fn(),
  }));
});

describe("fetchGameLengthByName", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      TWITCH_CLIENT_ID: "fake_id",
      TWITCH_CLIENT_SECRET: "fake_secret",
    };
    jest.clearAllMocks();
    _expireCachedToken();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns 'short' when normally <= SHORT_PLAYTIME_HOURS", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "token123", expires_in: 3600 },
    });
    mockedAxios.post.mockResolvedValueOnce({
      data: [{ normally: SHORT_PLAYTIME_HOURS * 3600 }],
    });

    const result = await fetchGameLengthByName("Test Game");
    expect(result).toBe("short");
  });

  it("returns 'medium' when normally > SHORT_PLAYTIME_HOURS and <= MEDIUM_PLAYTIME_HOURS", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "token123", expires_in: 3600 },
    });
    mockedAxios.post.mockResolvedValueOnce({
      data: [{ normally: MEDIUM_PLAYTIME_HOURS * 3600 }], // use constant
    });

    const result = await fetchGameLengthByName("Another Game");
    expect(result).toBe("medium");
  });

  it("returns 'long' when normally > MEDIUM_PLAYTIME_HOURS", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "token123", expires_in: 3600 },
    });
    mockedAxios.post.mockResolvedValueOnce({
      data: [{ normally: (MEDIUM_PLAYTIME_HOURS + 5) * 3600 }],
    });

    const result = await fetchGameLengthByName("Big RPG");
    expect(result).toBe("long");
  });

  it("returns 'notAvailable' if IGDB returns empty array", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "token123", expires_in: 3600 },
    });
    mockedAxios.post.mockResolvedValueOnce({ data: [] });

    const result = await fetchGameLengthByName("Unknown Game");
    expect(result).toBe("notAvailable");
  });

  it("returns 'notAvailable' on request error", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "token123", expires_in: 3600 },
    });
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchGameLengthByName("Broken Game");
    expect(result).toBe("notAvailable");
  });
});
