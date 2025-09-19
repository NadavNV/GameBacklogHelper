import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ message: "Missing authorization header" });
    return;
  }

  if (authHeader.split(" ").length !== 2) {
    // expects "Bearer <token>"
    res.status(401).json({ message: "Invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1]; // expects "Bearer <token>"
  if (!token) {
    res.status(401).json({ message: "Invalid authorization header" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
