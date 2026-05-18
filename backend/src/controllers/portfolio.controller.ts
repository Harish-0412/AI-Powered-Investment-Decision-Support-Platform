import type { Request, Response } from "express";
import * as portfolioService from "../services/portfolio.service";
import { AppError } from "../utils/errors";
import { z } from "zod";

const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const createPortfolioSchema = z.object({
  name: z.string().min(1).max(100)
});

const transactionSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  type: z.enum(["BUY", "SELL"]),
  quantity: z.number().positive(),
  price: z.number().positive(),
  date: z.string().datetime().optional()
});

export const getPortfolios = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const portfolios = await portfolioService.getPortfoliosByUser(userId);
  res.json(portfolios);
};

export const createPortfolio = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name } = createPortfolioSchema.parse(req.body);
  const portfolio = await portfolioService.createPortfolio(userId, name);
  res.status(201).json(portfolio);
};

export const getPortfolioDetails = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  if (!id) {
    throw new AppError(400, "Portfolio id is required");
  }

  const portfolio = await portfolioService.getPortfolioDetails(id, req.user!.id);
  
  if (!portfolio) {
    throw new AppError(404, "Portfolio not found");
  }

  res.json(portfolio);
};

export const addTransaction = async (req: Request, res: Response) => {
  const portfolioId = getParam(req.params.id);
  if (!portfolioId) {
    throw new AppError(400, "Portfolio id is required");
  }

  const data = transactionSchema.parse(req.body);

  try {
    const transaction = await portfolioService.addTransaction(
      portfolioId,
      req.user!.id,
      data.symbol,
      data.type,
      data.quantity,
      data.price,
      data.date ? new Date(data.date) : new Date()
    );
    res.status(201).json(transaction);
  } catch (error: any) {
    throw new AppError(400, error.message);
  }
};
