import axios from "axios";
import cheerio from "cheerio";
import type { LengthKey } from "../constants/lengths";

const hltbClient = axios.create({
  baseURL: "https://howlongtobeat.com",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "GameBacklogHelper/1.0",
  },
});

/**
 * Fetches the main story length category for a game from HowLongToBeat.
 * Returns one of LengthKey: "short", "medium", "long", or "notAvailable".
 */
export async function fetchGameLengthCategory(
  title: string
): Promise<LengthKey> {
  if (!title) return "notAvailable";

  const parseMainTime = (timeStr: string): number | null => {
    const match = timeStr.match(/Main Story\s+([\d½]+)/i);
    if (!match) {
      return null;
    } else {
      return parseFloat(match[1]!.replace("½", ".5"));
    }
  };

  const categorizeTime = (hours: number): LengthKey => {
    if (hours < 4) return "short";
    if (hours < 10) return "medium";
    return "long";
  };

  try {
    const formData = new URLSearchParams();
    formData.append("queryString", title);
    formData.append("t", "games");
    formData.append("sorthead", "popular");
    formData.append("sortd", "Normal Order");
    formData.append("plat", "");
    formData.append("length_type", "main");
    formData.append("length_min", "");
    formData.append("length_max", "");
    formData.append("detail", "");

    const res = await hltbClient.post(
      "/search_results?page=1",
      formData.toString()
    );

    const $ = cheerio.load(res.data);
    const firstResult = $(".back_green").first();
    if (!firstResult.length) return "notAvailable";

    const timesText = firstResult
      .find(".game_times")
      .text()
      .trim()
      .replace(/\s+/g, " ");
    const mainHours = parseMainTime(timesText);
    if (mainHours === null) return "notAvailable";

    return categorizeTime(mainHours);
  } catch (err) {
    console.error("Error fetching game length:", err);
    return "notAvailable";
  }
}
