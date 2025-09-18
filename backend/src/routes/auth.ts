import { Router } from "express";
import { registerHandler, loginHandler } from "../handlers/authHandlers.js";

const router = Router();

router.post("/register", registerHandler);

router.post("/login", loginHandler);

export default router;
