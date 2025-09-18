export const PLATFORMS = {
  PC: 4,
  "PlayStation 5": 187,
  "PlayStation 4": 18,
  "Xbox One": 1,
  "Xbox Series X/S": 186,
  Switch: 7,
  Other: 0,
} as const;

export type PlatformName = keyof typeof PLATFORMS;
