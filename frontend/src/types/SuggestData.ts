import type { LengthKey } from "src/constants/lengths";
import type { PlatformName } from "src/constants/platforms";

export interface SuggestData {
  length?: LengthKey;
  platform?: PlatformName;
}
