import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import {
  persistRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../services/token.service";
import { AppError } from "../utils/errors";
import { ensureProfileForUser } from "../services/profile.service";

const SALT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = "refreshToken";

const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(120).optional()
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth"
} as const;

const toPublicUser = (user: { id: string; email: string; name: string | null; riskLevel: string }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  riskLevel: user.riskLevel
});

const issueAuthTokens = async (user: { id: string; email: string; riskLevel: string }) => {
  const payload = {
    sub: user.id,
    email: user.email,
    riskLevel: user.riskLevel
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await persistRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash
    }
  });

  await ensureProfileForUser(user.id, user.email, user.name);

  const { accessToken, refreshToken } = await issueAuthTokens(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  res.status(201).json({
    user: toPublicUser(user),
    accessToken
  });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  await ensureProfileForUser(user.id, user.email, user.name);

  const { accessToken, refreshToken } = await issueAuthTokens(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  res.json({
    user: toPublicUser(user),
    accessToken
  });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    throw new AppError(401, "Refresh token is required");
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Refresh token is invalid or expired");
  }

  const rotation = await rotateRefreshToken(refreshToken);

  if (!rotation) {
    throw new AppError(401, "Refresh token is invalid or expired");
  }

  res.cookie(REFRESH_COOKIE_NAME, rotation.refreshToken, refreshCookieOptions);
  res.json({
    user: toPublicUser(rotation.user),
    accessToken: rotation.accessToken
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  res.status(204).send();
};
