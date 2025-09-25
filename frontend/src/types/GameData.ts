import type { PlatformName } from "src/constants/platforms";
import type { StatusKey } from "src/constants/statuses";

export interface GameData {
  title: string;
  platform: PlatformName;
  status: StatusKey;
  metacriticScore?: number;
}
