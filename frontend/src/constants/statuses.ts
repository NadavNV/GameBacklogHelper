export const STATUSES = {
  backlog: "Backlog",
  abandoned: "Abandoned",
  playing: "Playing",
  finished: "Finished",
} as const;
export const statusOptions = Object.entries(STATUSES) as [
  keyof typeof STATUSES,
  string
][];

export type StatusKey = keyof typeof STATUSES;
