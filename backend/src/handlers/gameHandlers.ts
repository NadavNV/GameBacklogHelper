import type { Response, NextFunction } from "express";
import { fetchMetacriticScore } from "../services/rawgService.js";
import type { IGame } from "../models/Game.js";
import { Game } from "../models/Game.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { FilterQuery } from "mongoose";

type AuthRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const addGameHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, status, length, platform } = req.body;

    const criticScore = await fetchMetacriticScore(title, platform);

    const game = new Game({
      title,
      status,
      length,
      platform,
      criticScore,
      userId: req.userId,
    });

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(400).json({ message: "Error creating game", error: err });
  }
};

export const getGamesHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const games = await Game.find({ userId: req.userId }, { _id: 0 });
  res.json(games);
};

export const deleteGameHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, platform } = req.body;
    const userId = req.userId;
    const game = await Game.findOne({ userId, title, platform });
    if (!game) {
      res.status(404).json({
        message: `Game ${title} on platform ${platform} not found for this user`,
      });
      return;
    }
    const query = await Game.deleteOne({ userId, title, platform });
    if (query.deletedCount === 1) {
      res.status(200).json({ message: "Game deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete game" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error deleting game", error: err });
  }
};

export const updateStatusHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, platform, newStatus } = req.body;
    const game = await Game.findOne({
      title: title,
      platform: platform,
      userId: req.userId,
    });
    if (!game) {
      res.status(404).json({
        message: `Game ${title} on platform ${platform} not found for this user`,
      });
      return;
    }
    const query = await Game.updateOne(
      {
        title: title,
        platform: platform,
        userId: req.userId,
      },
      { status: newStatus }
    );
    if (query.modifiedCount === 1) {
      res.status(200).json({ message: "Status updated successfully" });
    } else if (query.matchedCount === 1) {
      res.status(200).json({ message: "No change: status already set" });
    } else {
      res.status(404).json({ message: "Game not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error changing status", error: err });
  }
};

export const suggestGamesHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { platform, length } = req.query;
    const userId = req.userId;
    const filters: FilterQuery<IGame> = {
      userId: userId,
      status: { $in: ["backlog", "abandoned"] },
    };
    if (platform) {
      filters.platform = platform as string;
    }
    if (length) {
      filters.length = length as string;
    }
    const suggestions = await Game.find(filters)
      .sort({ metacriticScore: -1 })
      .limit(5)
      .exec();
    res.status(200).json(suggestions);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error generating suggestions", error: err });
  }
};
