import type { RequestHandler, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { User } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const registerHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.error("Missing required fields");
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Check for duplicates
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      console.error("Username or email already in use");
      res.status(400).json({ message: "Username or email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({ username, email, passwordHash });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Error registering user", error: err });
  }
};

export const loginHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    // identifier can be either email or username
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      console.error("Missing required fields");
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      console.error("Invalid credentials");
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in", error: err });
  }
};
