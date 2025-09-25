// services/steam.ts
import axios from "axios";

const STEAM_API_KEY = process.env.STEAM_API_KEY!;
const STEAM_API_URL = "https://api.steampowered.com";

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number; // in minutes
}

export interface LibraryGame {
  title: string;
  playtimeHours: number;
}

export async function fetchSteamLibrary(
  steamId: string
): Promise<LibraryGame[]> {
  const url = `${STEAM_API_URL}/IPlayerService/GetOwnedGames/v1/`;

  const res = await axios.get(url, {
    params: {
      key: STEAM_API_KEY,
      steamid: steamId,
      include_appinfo: true,
    },
  });

  const games: SteamGame[] = res.data.response?.games || [];

  return games.map((g) => ({
    title: g.name,
    playtimeHours: g.playtime_forever / 60,
  }));
}
