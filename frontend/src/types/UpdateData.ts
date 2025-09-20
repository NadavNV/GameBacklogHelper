import type { PlatformName } from "src/constants/platforms";

export interface UpdateData {
  title: string;
  newStatus?: "backlog" | "playing" | "finished" | "abandoned";
  newLength?: "short" | "medium" | "long" | "notAvailable";
  platform: PlatformName;
}
