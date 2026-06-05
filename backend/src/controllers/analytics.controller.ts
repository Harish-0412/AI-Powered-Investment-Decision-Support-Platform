import type { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service";
import * as mlService from "../services/ml.service";
import * as optimizerService from "../services/portfolio-optimizer.service";
import { AppError } from "../utils/errors";

const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const getQueryString = (value: unknown) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return typeof normalized === "string" ? normalized : undefined;
};

const getRequiredSymbol = (req: Request) => {
  const symbol = getParam(req.params.symbol);
  if (!symbol) {
    throw new AppError(400, "Stock symbol is required");
  }

  return symbol;
};

const getRange = (req: Request) => getQueryString(req.query.range) || "1y";

const getRiskFreeRate = (req: Request) => {
  const parsed = Number(getQueryString(req.query.riskFreeRate));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export const getStockIndicators = async (req: Request, res: Response) => {
  const result = await analyticsService.getStockTechnicalIndicators(
    getRequiredSymbol(req),
    getRange(req),
    {
      smaPeriod: Number(getQueryString(req.query.smaPeriod)) || undefined,
      emaPeriod: Number(getQueryString(req.query.emaPeriod)) || undefined,
      rsiPeriod: Number(getQueryString(req.query.rsiPeriod)) || undefined,
      macdFastPeriod: Number(getQueryString(req.query.macdFastPeriod)) || undefined,
      macdSlowPeriod: Number(getQueryString(req.query.macdSlowPeriod)) || undefined,
      macdSignalPeriod: Number(getQueryString(req.query.macdSignalPeriod)) || undefined,
      bbPeriod: Number(getQueryString(req.query.bbPeriod)) || undefined,
      bbStdDev: Number(getQueryString(req.query.bbStdDev)) || undefined,
      atrPeriod: Number(getQueryString(req.query.atrPeriod)) || undefined,
      adxPeriod: Number(getQueryString(req.query.adxPeriod)) || undefined
    }
  );

  res.json(result);
};

export const getStockPredictions = async (req: Request, res: Response) => {
  const result = await mlService.getAIPrediction(getRequiredSymbol(req));
  res.json(result);
};

export const getStockRecommendations = async (req: Request, res: Response) => {
  const result = await analyticsService.getStockRecommendations(getRequiredSymbol(req));
  if (!result) throw new AppError(404, "Recommendations not available for this symbol");
  res.json(result);
};

export const getStockRisk = async (req: Request, res: Response) => {
  const result = await analyticsService.getStockRiskMetrics(
    getRequiredSymbol(req),
    getRange(req),
    getRiskFreeRate(req)
  );

  res.json(result);
};

export const getPortfolioAnalytics = async (req: Request, res: Response) => {
  const portfolioId = getParam(req.params.id);
  if (!portfolioId) {
    throw new AppError(400, "Portfolio id is required");
  }

  const result = await analyticsService.getPortfolioAnalytics(
    portfolioId,
    req.user!.id,
    getRange(req),
    getRiskFreeRate(req)
  );

  if (!result) {
    throw new AppError(404, "Portfolio not found");
  }

  res.json(result);
};

export const optimizePortfolio = async (req: Request, res: Response) => {
  const portfolioId = getParam(req.params.id);
  if (!portfolioId) throw new AppError(400, "Portfolio id is required");

  const result = await optimizerService.optimizePortfolio(portfolioId, req.user!.id);
  res.json(result);
};
