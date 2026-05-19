import { Router } from "express";
import { getQuote, getHistory, getStockList, getStockDetail } from "../controllers/stock.controller";
import * as alphaVantageController from "../controllers/alphaVantage.controller";
import * as analyticsController from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

export const stockRouter = Router();

stockRouter.use(requireAuth);

stockRouter.get("/", asyncHandler(getStockList));
stockRouter.get("/:symbol/detail", asyncHandler(getStockDetail));
stockRouter.get("/:symbol/alpha/quote", asyncHandler(alphaVantageController.getAlphaQuote));
stockRouter.get("/:symbol/alpha/history", asyncHandler(alphaVantageController.getAlphaDailyHistory));
stockRouter.get("/:symbol/alpha/overview", asyncHandler(alphaVantageController.getCompanyOverview));
stockRouter.get("/:symbol/alpha/earnings", asyncHandler(alphaVantageController.getCompanyEarnings));
stockRouter.get("/:symbol/alpha/dividends", asyncHandler(alphaVantageController.getDividends));
stockRouter.get("/:symbol/alpha/news-sentiment", asyncHandler(alphaVantageController.getNewsSentiment));
stockRouter.get("/:symbol/alpha/indicators/:indicator", asyncHandler(alphaVantageController.getTechnicalIndicator));
stockRouter.get("/:symbol/analytics/indicators", asyncHandler(analyticsController.getStockIndicators));
stockRouter.get("/:symbol/analytics/risk", asyncHandler(analyticsController.getStockRisk));
stockRouter.get("/:symbol/analytics/predictions", asyncHandler(analyticsController.getStockPredictions));
stockRouter.get("/:symbol/analytics/recommendations", asyncHandler(analyticsController.getStockRecommendations));
stockRouter.get("/:symbol/quote", asyncHandler(getQuote));
stockRouter.get("/:symbol/history", asyncHandler(getHistory));
