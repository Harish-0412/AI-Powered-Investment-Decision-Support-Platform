import type { Request, Response } from "express";
import * as newsService from "../services/news.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getTopNews = asyncHandler(async (req: Request, res: Response) => {
  const country = (req.query.country as string) || "in";
  const category = (req.query.category as string) || "business";
  const articles = await newsService.getTopMarketNews(category, country);
  res.json(articles);
});

export const getStockNews = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.q as string);
  if (!query) {
    res.status(400).json({ message: "Search query 'q' is required" });
    return;
  }
  const articles = await newsService.searchStockNews(query);
  res.json(articles);
});
