import axios from "axios";
import Bottleneck from "bottleneck";
import {
  SHORT_PLAYTIME_HOURS,
  MEDIUM_PLAYTIME_HOURS,
} from "../constants/config";
import type { LengthKey } from "../constants/lengths";

// IGDB game candidate type
interface IgdbGame {
  id: number;
  name: string;
  rating_count?: number;
  slug?: string;
}

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_GAMES_URL = "https://api.igdb.com/v4/games";
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

/** Normalize for comparisons (lowercase, strip punctuation, articles, trim)
 *  Optional: strip subtitles after colon/dash or in parentheses
 */
function normalizeForMatch(s: string, stripSubtitles = true): string {
  let normalized = s.toLowerCase();

  if (stripSubtitles) {
    // remove parenthetical subtitles
    normalized = normalized.replace(/\(.*?\)/g, "");
    // strip after colon, dash, en-dash, em-dash
    normalized = normalized.replace(/[:\-\–\—].*$/, "");
  }

  normalized = normalized
    .replace(/[^a-z0-9\s]/g, " ") // remove punctuation except numbers/space
    .replace(/\b(the|a|an)\b/g, "") // remove common articles
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

/** Token overlap ratio: how many query tokens appear in candidate */
function tokenOverlapRatio(queryNorm: string, candidateNorm: string): number {
  const queryTokens = queryNorm.split(" ").filter(Boolean);
  const candidateTokens = candidateNorm.split(" ").filter(Boolean);

  if (queryTokens.length === 0 || candidateTokens.length === 0) return 0;

  const candidateSet = new Set(candidateTokens);
  const intersection = queryTokens.filter((t) => candidateSet.has(t)).length;

  const baseOverlap = intersection / queryTokens.length;

  // penalize extra tokens in candidate
  const extraTokens = candidateTokens.length - intersection;
  const penalty = extraTokens / candidateTokens.length;

  return 0.3 + 0.7 * baseOverlap * (1 - penalty); // scale 0.3-1.0
}

/**
 * Compute a candidate score based on exact match, prefix, fuzzy token overlap, and popularity
 */
function scoreCandidate(query: string, candidate: IgdbGame): number {
  const qFull = normalizeForMatch(query, false); // keep subtitles in query
  const fullNorm = normalizeForMatch(candidate.name, false); // full title
  const primaryNorm = normalizeForMatch(candidate.name, true); // strip subtitles for prefix matching

  const strategies: Array<() => number> = [
    // exact match
    () => (fullNorm === qFull ? 1 : 0),
    // prefix
    () =>
      primaryNorm.startsWith(qFull) || qFull.startsWith(primaryNorm) ? 0.95 : 0,
    // fuzzy token overlap
    () => {
      const overlap = tokenOverlapRatio(qFull, fullNorm);
      return 0.3 + 0.7 * overlap;
    },
    // popularity boost
    () =>
      candidate.rating_count
        ? Math.min(0.05, candidate.rating_count / 10000)
        : 0,
  ];

  return Math.min(1, Math.max(...strategies.map((fn) => fn())));
}

/**
 * Find best candidate from IGDB search results.
 * Returns {score, game} where score is [0..1], or null if no candidates
 */
function chooseBestGameCandidate(
  query: string,
  candidates: IgdbGame[]
): { score: number; game: IgdbGame } | null {
  return candidates
    .map((g) => ({ game: g, score: scoreCandidate(query, g) }))
    .reduce<{ score: number; game: IgdbGame } | null>(
      (best, cur) => (!best || cur.score > best.score ? cur : best),
      null
    );
}

/**
 * Fetch length by searching games then querying game_time_to_beats (best-count entry).
 */
export async function fetchGameLengthByName(
  gameName: string
): Promise<LengthKey> {
  console.debug(`Fetching game length for ${gameName}`);
  const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
  const ACCESS_TOKEN = await getValidIgdbToken();

  try {
    // 1) search games (request name + popularity (measured by rating_count) so we can tie-break)
    const gameQuery = `
      search "${gameName}";
      fields id, name, slug, rating_count;
      limit 10;
    `;

    const gameResp = await limiter.schedule(() =>
      axios.post(IGDB_GAMES_URL, gameQuery, {
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      })
    );

    console.debug("IGDB /games response:", JSON.stringify(gameResp.data));

    if (!Array.isArray(gameResp.data) || gameResp.data.length === 0) {
      return "notAvailable";
    }

    // choose best candidate (fuzzy algorithm)
    const best = chooseBestGameCandidate(gameName, gameResp.data);
    if (!best || best.score < 0.35) {
      // match too weak → treat as not found
      return "notAvailable";
    }

    console.debug(`Best candidate: ${best.game.id} - ${best.game.name}`);

    const gameId = best.game.id as number;

    // 2) fetch game_time_to_beats by game_id — pick the entry with highest count
    const ttbQuery = `
      where game_id = ${gameId};
      fields normally, count;
      sort count desc;
      limit 1;
    `;
    const ttbResp = await limiter.schedule(() =>
      axios.post(IGDB_TTB_URL, ttbQuery, {
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      })
    );

    console.debug(
      "IGDB /game_time_to_beats response:",
      JSON.stringify(ttbResp.data)
    );

    if (!Array.isArray(ttbResp.data) || ttbResp.data.length === 0) {
      return "notAvailable";
    }

    const normally = ttbResp.data[0].normally as number | undefined;
    return categorizeTimeToBeat(normally);
  } catch (err: any) {
    // log error details (server error body if present)
    console.error(
      "IGDB fetch error:",
      err.response?.data || err.message || err
    );

    // During integration tests we want this to fail loudly so tests catch malformed queries.
    if (process.env.NODE_ENV === "test") throw err;

    // In production fallback to notAvailable
    return "notAvailable";
  }
}

/**
 * Helper function for testing
 */
export function _expireCachedToken() {
  if (cachedToken) cachedToken.expiresAt = Date.now() - 1000;
}

/**
 * For testing token caching/refresh logic
 *
 * @returns The cached token
 */
export function _getCachedToken() {
  return cachedToken;
}
