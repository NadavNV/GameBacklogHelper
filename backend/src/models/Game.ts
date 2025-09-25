import { Schema, model, Document, Types } from "mongoose";
import type { PlatformName } from "../constants/platforms";
import { PLATFORMS } from "../constants/platforms";
import { STATUSES, type StatusKey } from "../constants/statuses";
import { LENGTHS, type LengthKey } from "../constants/lengths";

export interface IGame extends Document {
  title: string;
  status: StatusKey;
  length: LengthKey;
  platform: PlatformName;
  metacriticScore?: number;
  userId: Types.ObjectId; // reference to User
}

const gameSchema = new Schema<IGame>({
  title: { type: String, required: true },
  status: {
    type: String,
    enum: Object.keys(STATUSES),
    default: "backlog",
  },
  length: {
    type: String,
    enum: Object.keys(LENGTHS),
    default: "notAvailable",
  },
  platform: {
    type: String,
    enum: Object.keys(PLATFORMS),
    required: true,
  },
  metacriticScore: { type: Number },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Game = model<IGame>("Game", gameSchema);
