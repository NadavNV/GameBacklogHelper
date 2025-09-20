export const LENGTHS = {
  short: "Short",
  medium: "Medium",
  long: "Long",
  notAvailable: "Not Available",
} as const;
export const lengthsOptions = Object.entries(LENGTHS) as [
  keyof typeof LENGTHS,
  string
][];
export type LengthKey = keyof typeof LENGTHS;
