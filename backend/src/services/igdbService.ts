import axios from "axios";
import Bottleneck from "bottleneck";
import {
  SHORT_PLAYTIME_HOURS,
  MEDIUM_PLAYTIME_HOURS,
} from "../constants/config";
import type { LengthKey } from "../constants/lengths";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_TTB_URL = "https://api.igdb.com/v4/game_time_to_beats";

const limiter = new Bottleneck({
  minTime: 250, // wait 250ms between requests
  maxConcurrent: 1, // serialize requests to IGDB
});

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Request a new IGDB app access token from Twitch
 */
async function requestIgdbToken(): Promise<{
  token: string;
  expiresAt: number;
}> {
  // TODO: Register the app with twitch
  const CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";

  const resp = await axios.post(TWITCH_OAUTH_URL, null, {
    params: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    },
  });

  const { access_token, expires_in } = resp.data;

  return {
    token: access_token,
    expiresAt: Date.now() + expires_in * 1000, // ms timestamp
  };
}

/**
 * Get a valid IGDB token (refresh if needed)
 */
async function getValidIgdbToken(): Promise<string> {
  if (!cachedToken || Date.now() >= cachedToken.expiresAt) {
    cachedToken = await requestIgdbToken();
  }
  return cachedToken.token;
}

/**
 * Convert IGDB normally-seconds into our length category
 */
function categorizeTimeToBeat(normallySeconds?: number): LengthKey {
  if (!normallySeconds) return "notAvailable";

  const hours = normallySeconds / 3600;
  if (hours <= SHORT_PLAYTIME_HOURS) return "short";
  if (hours <= MEDIUM_PLAYTIME_HOURS) return "medium";
  return "long";
}

/**
 * Public function to fetch game length by name
 */
export async function fetchGameLengthByName(
  gameName: string
): Promise<LengthKey> {
  const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
  const ACCESS_TOKEN = await getValidIgdbToken();

  const query = `
    search "${gameName}";
    fields game, normally;
    limit 1;
  `;

  try {
    const resp = await limiter.schedule(() =>
      axios.post(IGDB_TTB_URL, query, {
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      })
    );

    if (resp.data.length === 0) return "notAvailable";
    const normally = resp.data[0].normally as number | undefined;

    return categorizeTimeToBeat(normally);
  } catch (err: any) {
    console.error("IGDB fetch error:", err.response?.data || err.message);
    return "notAvailable";
  }
}

/**
 * Helper function for testing
 */
export function _expireCachedToken() {
  if (cachedToken) cachedToken.expiresAt = Date.now() - 1000;
}
