import type { PlatformName } from "src/constants/platforms";

export interface SuggestData {
  length?: "short" | "medium" | "long" | "not-available";
  platform?: PlatformName;
}
