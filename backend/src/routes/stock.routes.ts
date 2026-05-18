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
stockRouter.get("/:symbol/alpha/quote", alphaVantageController.getAlphaQuote);
stockRouter.get("/:symbol/alpha/history", alphaVantageController.getAlphaDailyHistory);
stockRouter.get("/:symbol/alpha/overview", alphaVantageController.getCompanyOverview);
stockRouter.get("/:symbol/alpha/earnings", alphaVantageController.getCompanyEarnings);
stockRouter.get("/:symbol/alpha/news-sentiment", alphaVantageController.getNewsSentiment);
stockRouter.get("/:symbol/alpha/indicators/:indicator", alphaVantageController.getTechnicalIndicator);
stockRouter.get("/:symbol/analytics/indicators", analyticsController.getStockIndicators);
stockRouter.get("/:symbol/analytics/risk", analyticsController.getStockRisk);
stockRouter.get("/:symbol/quote", asyncHandler(getQuote));
stockRouter.get("/:symbol/history", asyncHandler(getHistory));
