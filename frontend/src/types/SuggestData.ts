import type { PlatformName } from "src/constants/platforms";

export interface SuggestData {
  length?: "short" | "medium" | "long" | "notAvailable";
  platform?: PlatformName;
}
