import type { Response, NextFunction } from "express";
import { fetchMetacriticScore } from "../services/rawgService";
import { fetchGameLengthCategory } from "../services/gameLengthService";
import type { IGame } from "../models/Game";
import { Game } from "../models/Game";
import type { AuthRequest } from "../middleware/authMiddleware";
import type { FilterQuery } from "mongoose";
import { importSteamLibrary } from "../services/gameImportService";

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
    const { title, status, platform } = req.body;

    if (!title || !status || !platform) {
      console.error("Missing required fields");
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [metacriticScore, length] = await Promise.all([
      fetchMetacriticScore(title, platform),
      fetchGameLengthCategory(title),
    ]);

    const game = await Game.create({
      title,
      status,
      length,
      platform,
      metacriticScore,
      userId: req.userId,
    });
    res.status(201).json(game);
  } catch (err) {
    console.error("Error creating game:", err);
    res.status(400).json({ message: "Error creating game", error: err });
  }
};

export const getGamesHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      console.error("Missing user ID");
      res.status(401).json({ error: "Missing user ID" });
      return;
    }
    const games = await Game.find(
      { userId: req.userId },
      { __v: 0, _id: 0, userId: 0 }
    );
    res.status(200).json(games);
  } catch (err) {
    console.error(err);
  }
};

export const deleteGameHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, platform } = req.query;
    const userId = req.userId;
    if (!title || !platform || !userId) {
      console.error("Missing required fields");
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const game = await Game.findOne({ userId, title, platform });
    if (!game) {
      console.error(
        `Game ${title} on platform ${platform} not found for this user`
      );
      res.status(404).json({
        error: `Game ${title} on platform ${platform} not found for this user`,
      });
      return;
    }
    const query = await Game.deleteOne({ userId, title, platform });
    if (query.deletedCount === 1) {
      res.status(200).json({ message: "Game deleted successfully" });
    } else {
      console.error("Failed to delete game");
      res.status(500).json({ error: "Failed to delete game" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error deleting game", error: err });
  }
};

export const updateGameHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, platform, newStatus, newLength } = req.body;
    if (!title || !platform || (!newStatus && !newLength) || !req.userId) {
      console.error("Missing required fields");
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const game = await Game.findOne({
      title: title,
      platform: platform,
      userId: req.userId,
    });
    if (!game) {
      console.error(
        `Game ${title} on platform ${platform} not found for this user`
      );
      res.status(404).json({
        error: `Game ${title} on platform ${platform} not found for this user`,
      });
      return;
    }
    const query = await Game.updateOne(
      {
        title: title,
        platform: platform,
        userId: req.userId,
      },
      { status: newStatus ?? game.status, length: newLength ?? game.length }
    );
    if (query.modifiedCount === 1) {
      res.status(200).json({ message: "Game updated successfully" });
    } else if (query.matchedCount === 1) {
      res.status(200).json({ message: "No change: status/length already set" });
    } else {
      console.error(
        `Game ${title} on platform ${platform} not found for this user`
      );
      res.status(404).json({
        error: `Game ${title} on platform ${platform} not found for this user`,
      });
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
    if (!userId) {
      console.error("Missing required fields");
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    console.log(
      `Suggsting games on ${platform ?? "any platform"} of ${
        length ?? "any"
      } length`
    );
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

export const getNumOfGamesHandler: AuthRequestHandler = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.userId) {
    console.error("Missing user ID");
    res.status(401).json({ error: "Missing user ID" });
  }
  const games = await Game.find({ userId: req.userId });
  res.status(200).json(games.length);
};

export const importLibraryHandler: AuthRequestHandler = async (req, res) => {
  try {
    const inserted = await importSteamLibrary(req);
    res.status(201).json({ insertedCount: inserted.length, games: inserted });
  } catch (err) {
    console.error("Error importing library:", err);
    res.status(500).json({ error: "Error importing Steam library" });
  }
};
