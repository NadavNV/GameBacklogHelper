import type { PlatformName } from "src/constants/platforms";

export interface GameData {
  title: string;
  platform: PlatformName;
  status: "backlog" | "playing" | "finished" | "abandoned";
  length: "short" | "medium" | "long" | "notAvailable";
  metacriticScore?: number;
}
