import type { Request, Response } from "express";
import * as dividendService from "../services/dividend.service";
import * as taxLossService from "../services/taxLoss.service";
import * as sentimentService from "../services/sentiment.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getDividends = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = await dividendService.getPortfolioDividends(userId);
  res.json(data);
});

export const getTaxLossOpportunities = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = await taxLossService.getTaxLossOpportunities(userId);
  res.json(data);
});

export const getSentiment = asyncHandler(async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const data = await sentimentService.getSocialSentiment(symbol);
  res.json(data);
});

export const getTrendingMemes = asyncHandler(async (req: Request, res: Response) => {
  const data = await sentimentService.getTrendingMemeStocks();
  res.json(data);
});
