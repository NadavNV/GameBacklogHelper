import { Game } from "../models/Game";
import { fetchMetacriticScore } from "./rawgService";
import { fetchGameLengthByName } from "./igdbService";
import { fetchSteamLibrary } from "./steamService";
import { MAX_PLAYTIME_HOURS } from "../constants/config";
import { Types } from "mongoose";
import pLimit from "p-limit";
import type { AuthRequest } from "../middleware/authMiddleware";
import axios from "axios";

export async function importSteamLibrary(req: AuthRequest) {
  if (!req.userId) throw new Error("Missing userId in request");
  const { vanityNameOrId } = req.body;
  if (!vanityNameOrId) throw new Error("Missing Steam identifier in request");

  const userId = new Types.ObjectId(req.userId);

  // Resolve vanity URL if needed
  let steamId = vanityNameOrId;
  if (!/^\d+$/.test(vanityNameOrId)) {
    const resp = await axios.get(
      "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/",
      {
        params: {
          key: process.env.STEAM_API_KEY,
          vanityurl: vanityNameOrId,
        },
      }
    );
    if (resp.data.response.success !== 1)
      throw new Error("Could not resolve Steam ID");
    steamId = resp.data.response.steamid;
  }

  const library = await fetchSteamLibrary(steamId);
  const newGames = library.filter((g) => g.playtimeHours < MAX_PLAYTIME_HOURS);
  if (!newGames.length) return [];

  // Remove duplicates already in DB
  const existingTitles = await Game.find({
    userId,
    title: { $in: newGames.map((g) => g.title) },
  }).distinct("title");
  const uniqueGames = newGames.filter((g) => !existingTitles.includes(g.title));
  if (!uniqueGames.length) return [];

  // Throttle concurrent requests to 5
  const limit = pLimit(5);
  const gameDocs = await Promise.all(
    uniqueGames.map((g) =>
      limit(async () => {
        const [metacriticScore, length] = await Promise.all([
          fetchMetacriticScore(g.title, "PC"),
          fetchGameLengthByName(g.title),
        ]);

        return {
          title: g.title,
          status: "backlog",
          length, // fetched from IGDB
          platform: "PC",
          metacriticScore,
          userId,
        };
      })
    )
  );

  return Game.insertMany(gameDocs);
}
