import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../services/token.service";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.header("Authorization");
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

    if (!token) {
      return next(new AppError(401, "Authentication token is required"));
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      riskLevel: payload.riskLevel as Express.User["riskLevel"],
    };

    next();
  } catch (err) {
    // Passes TokenExpiredError / JsonWebTokenError to the error handler
    next(err);
  }
};
