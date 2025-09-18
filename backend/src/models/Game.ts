import { Schema, model, Document, Types } from "mongoose";
import type { PlatformName } from "../constants/platforms.js";
import { PLATFORMS } from "../constants/platforms.js";

export interface IGame extends Document {
  title: string;
  status: "backlog" | "playing" | "finished" | "abandoned";
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
  platform: {
    type: String,
    enum: Object.keys(PLATFORMS),
    required: true,
  },
  metacriticScore: { type: Number },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Game = model<IGame>("Game", gameSchema);
