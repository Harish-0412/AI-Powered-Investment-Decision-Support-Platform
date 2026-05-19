import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/errors";

const ADMIN_TOKEN = Buffer.from(`${env.ADMIN_EMAIL}:${env.ADMIN_PASSWORD}`).toString("base64");

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  if (email !== env.ADMIN_EMAIL || password !== env.ADMIN_PASSWORD) {
    throw new AppError(401, "Invalid admin credentials");
  }
  res.json({ token: ADMIN_TOKEN });
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || token !== ADMIN_TOKEN) {
    next(new AppError(401, "Admin access required"));
    return;
  }
  next();
};

export const listUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      riskLevel: true,
      createdAt: true,
      _count: { select: { portfolios: true } },
    },
  });
  res.json(users);
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, "User not found");
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
};
