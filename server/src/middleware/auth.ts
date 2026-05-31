import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { AuthenticatedRequestUser } from "../types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
    }
  }
}

export function createToken(user: AuthenticatedRequestUser) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ message: "Missing authorization token." });
    return;
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret) as AuthenticatedRequestUser;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}
