import { Router } from "express";
import { Game } from "../models/Game.js";
import type { AuthRequest } from "../middleware/auth.js";
import { authMiddleware } from "../middleware/auth.js";
import { fetchMetacriticScore } from "../services/rawgService.js";

const router = Router();

// Add a game to the collection
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, status, platform } = req.body;

    const criticScore = await fetchMetacriticScore(title, platform);

    const game = new Game({
      title,
      status,
      platform,
      criticScore,
      userId: req.userId,
    });

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(400).json({ message: "Error creating game", error: err });
  }
});

// Get all games for logged-in user
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const games = await Game.find({ userId: req.userId });
  res.json(games);
});
