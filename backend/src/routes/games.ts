import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  addGameHandler,
  getGamesHandler,
  deleteGameHandler,
  updateStatusHandler,
  suggestGamesHandler,
} from "../controllers/gameController";

const router = Router();

// Add a game to the collection
router.post("/", authMiddleware, addGameHandler);

// Get all games for logged-in user
router.get("/", authMiddleware, getGamesHandler);

// Remove a game from the collection
router.delete("/", authMiddleware, deleteGameHandler);

// Change the status of a game
router.post("/", authMiddleware, updateStatusHandler);

// Suggest up to 5 games to play based on the given parameters
router.get("/suggest", authMiddleware, suggestGamesHandler);

export default router;
