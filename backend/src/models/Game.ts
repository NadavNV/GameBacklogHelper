import { Schema, model, Document, Types } from "mongoose";
import type { PlatformName } from "../constants/platforms";
import { PLATFORMS } from "../constants/platforms";

export interface IGame extends Document {
  title: string;
  status: "backlog" | "playing" | "finished" | "abandoned";
  length: "short" | "medium" | "long" | "notAvailable";
  platform: PlatformName;
  metacriticScore?: number;
  userId: Types.ObjectId; // reference to User
}

const gameSchema = new Schema<IGame>({
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ["backlog", "playing", "finished", "abandoned"],
    default: "backlog",
  },
  length: {
    type: String,
    enum: ["short", "medium", "long", "notAvailable"],
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
