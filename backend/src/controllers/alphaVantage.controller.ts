import type { Request, Response } from "express";
import * as alphaVantageService from "../services/alphaVantage.service";
import { AppError } from "../utils/errors";

const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const getQuery = (value: unknown) => Array.isArray(value) ? value[0] : value;

const getRequiredSymbol = (req: Request) => {
  const symbol = getParam(req.params.symbol);
  if (!symbol) {
    throw new AppError(400, "Stock symbol is required");
  }

  return symbol;
};

const sendAlphaVantageResponse = async (res: Response, request: Promise<unknown>) => {
  try {
    res.json(await request);
  } catch (error) {
    throw new AppError(502, error instanceof Error ? error.message : "Alpha Vantage request failed");
  }
};

export const getAlphaQuote = async (req: Request, res: Response) => {
  await sendAlphaVantageResponse(res, alphaVantageService.getAlphaVantageQuote(getRequiredSymbol(req)));
};

export const getAlphaDailyHistory = async (req: Request, res: Response) => {
  const outputsize = getQuery(req.query.outputsize) === "full" ? "full" : "compact";
  await sendAlphaVantageResponse(
    res,
    alphaVantageService.getAlphaVantageDailyHistory(getRequiredSymbol(req), outputsize)
  );
};

export const getCompanyOverview = async (req: Request, res: Response) => {
  await sendAlphaVantageResponse(res, alphaVantageService.getCompanyOverview(getRequiredSymbol(req)));
};

export const getCompanyEarnings = async (req: Request, res: Response) => {
  await sendAlphaVantageResponse(res, alphaVantageService.getCompanyEarnings(getRequiredSymbol(req)));
};

export const getNewsSentiment = async (req: Request, res: Response) => {
  const limitQuery = Number(getQuery(req.query.limit));
  const limit = Number.isFinite(limitQuery) && limitQuery > 0 ? Math.min(limitQuery, 1000) : 50;

  await sendAlphaVantageResponse(
    res,
    alphaVantageService.getNewsSentiment(getRequiredSymbol(req), limit)
  );
};

export const getTechnicalIndicator = async (req: Request, res: Response) => {
  const indicator = getParam(req.params.indicator)?.toUpperCase();
  if (!indicator || !["SMA", "EMA", "RSI", "MACD"].includes(indicator)) {
    throw new AppError(400, "Indicator must be one of SMA, EMA, RSI, or MACD");
  }

  const timePeriodQuery = Number(getQuery(req.query.time_period));
  await sendAlphaVantageResponse(
    res,
    alphaVantageService.getTechnicalIndicator(
      getRequiredSymbol(req),
      indicator as "SMA" | "EMA" | "RSI" | "MACD",
      {
        interval: String(getQuery(req.query.interval) || "daily"),
        timePeriod: Number.isFinite(timePeriodQuery) && timePeriodQuery > 0 ? timePeriodQuery : undefined,
        seriesType: String(getQuery(req.query.series_type) || "close")
      }
    )
  );
};
