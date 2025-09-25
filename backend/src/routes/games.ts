import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  addGameHandler,
  getGamesHandler,
  deleteGameHandler,
  updateGameHandler,
  suggestGamesHandler,
  getNumOfGamesHandler,
  importLibraryHandler,
} from "../controllers/gameController";

const router = Router();

// Add a game to the collection
router.post("/", authMiddleware, addGameHandler);

// Get all games for logged-in user
router.get("/", authMiddleware, getGamesHandler);

// Get the number of games this user has in the collection
router.get("/length", authMiddleware, getNumOfGamesHandler);

// Remove a game from the collection
router.delete("/", authMiddleware, deleteGameHandler);

// Change the status of a game
router.put("/", authMiddleware, updateGameHandler);

// Suggest up to 5 games to play based on the given parameters
router.get("/suggest", authMiddleware, suggestGamesHandler);

// Add Steam library. Request must contain the user's SteamID
router.post("/steam", authMiddleware, importLibraryHandler);

export default router;
