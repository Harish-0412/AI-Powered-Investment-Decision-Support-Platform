import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthTokenPayload = {
  sub: string;
  email: string;
  riskLevel: string;
};

export const signAccessToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

export const signRefreshToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const persistRefreshToken = async (userId: string, refreshToken: string) => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt
    }
  });
};

export const revokeRefreshToken = async (refreshToken: string) => {
  await prisma.refreshToken.updateMany({
    where: {
      tokenHash: hashToken(refreshToken),
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

export const rotateRefreshToken = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() }
  });

  const payload: AuthTokenPayload = {
    sub: storedToken.user.id,
    email: storedToken.user.email,
    riskLevel: storedToken.user.riskLevel
  };
  const nextAccessToken = signAccessToken(payload);
  const nextRefreshToken = signRefreshToken(payload);
  await persistRefreshToken(storedToken.user.id, nextRefreshToken);

  return {
    user: storedToken.user,
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken
  };
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload;
