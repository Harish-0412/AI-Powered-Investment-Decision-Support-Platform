import type { Request, Response } from "express";
import { getStockQuote, getHistoricalData } from "../services/stock.service";
import { AppError } from "../utils/errors";

const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const getQueryString = (value: unknown) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return typeof normalized === "string" ? normalized : undefined;
};

export const getQuote = async (req: Request, res: Response) => {
  const symbol = getParam(req.params.symbol);
  if (!symbol) {
    throw new AppError(400, "Stock symbol is required");
  }

  const quote = await getStockQuote(symbol);
  res.json(quote);
};

export const getHistory = async (req: Request, res: Response) => {
  const symbol = getParam(req.params.symbol);
  const { range } = req.query;
  
  if (!symbol) {
    throw new AppError(400, "Stock symbol is required");
  }

  const history = await getHistoricalData(symbol, getQueryString(range) || "1mo");
  res.json(history);
};
