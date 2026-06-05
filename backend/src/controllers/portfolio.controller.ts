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

export const updatePortfolio = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  if (!id) throw new AppError(400, "Portfolio id is required");
  
  const data = createPortfolioSchema.partial().parse(req.body);
  const portfolio = await portfolioService.updatePortfolio(id, req.user!.id, data);
  res.json(portfolio);
};

export const deletePortfolio = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  if (!id) throw new AppError(400, "Portfolio id is required");
  
  await portfolioService.deletePortfolio(id, req.user!.id);
  res.status(204).send();
};

export const getTransactions = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  if (!id) throw new AppError(400, "Portfolio id is required");
  
  const transactions = await portfolioService.getTransactions(id, req.user!.id);
  res.json(transactions);
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const portfolioId = getParam(req.params.id);
  const transactionId = getParam(req.params.transactionId);
  if (!portfolioId || !transactionId) throw new AppError(400, "Portfolio id and transaction id are required");
  
  await portfolioService.deleteTransaction(transactionId, portfolioId, req.user!.id);
  res.status(204).send();
};

export const batchAddTransactions = async (req: Request, res: Response) => {
  const portfolioId = getParam(req.params.id);
  if (!portfolioId) throw new AppError(400, "Portfolio id is required");
  
  const transactions = z.array(transactionSchema).parse(req.body);
  const results = await portfolioService.batchAddTransactions(portfolioId, req.user!.id, transactions);
  res.status(201).json(results);
};
