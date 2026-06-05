import type { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export const notFoundHandler = () => {
  throw new AppError(404, "Route not found");
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("[ERROR]", error instanceof Error ? error.message : error);
  if (error instanceof Error && error.stack) {
    console.error("[STACK]", error.stack);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues
    });
  }

  if (error instanceof TokenExpiredError) {
    return res.status(401).json({ message: "Token expired" });
  }

  if (error instanceof JsonWebTokenError) {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};
