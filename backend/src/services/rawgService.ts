import axios from "axios";
import type { PlatformName } from "../constants/platforms";
import { PLATFORMS } from "../constants/platforms";

const RAWG_API_KEY = process.env.RAWG_API_KEY || "";

const rawgClient = axios.create({
  baseURL: "https://api.rawg.io/api",
  headers: {
    "User-Agent":
      "GameBacklogHelper/1.0 (https://github.com/NadavNV/GameBacklogHelper)",
  },
});

export async function fetchMetacriticScore(
  title: string,
  platform: PlatformName
): Promise<number | undefined> {
  try {
    const platformId = PLATFORMS[platform];

    const res = await rawgClient.get("/games", {
      params: {
        key: RAWG_API_KEY,
        search: title,
        ...(platformId ? { platforms: platformId } : {}),
      },
    });
    const results = res.data.results;

    if (results && results.length > 0) {
      return results[0].metacritic;
    }
    return undefined;
  } catch (err) {
    console.error("Error fetching metacritic score:", err);
    return undefined;
  }
}
