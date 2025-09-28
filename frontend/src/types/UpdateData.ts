import type { LengthKey } from "src/constants/lengths";
import type { PlatformName } from "src/constants/platforms";
import type { StatusKey } from "src/constants/statuses";

export interface UpdateData {
  title: string;
  newStatus?: StatusKey;
  newLength?: LengthKey;
  platform: PlatformName;
}
