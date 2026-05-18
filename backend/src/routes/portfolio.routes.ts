import { Router } from "express";
import * as portfolioController from "../controllers/portfolio.controller";
import * as analyticsController from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const portfolioRouter = Router();

portfolioRouter.use(requireAuth);

portfolioRouter.get("/", portfolioController.getPortfolios);
portfolioRouter.post("/", portfolioController.createPortfolio);
portfolioRouter.get("/:id", portfolioController.getPortfolioDetails);
portfolioRouter.get("/:id/analytics", analyticsController.getPortfolioAnalytics);
portfolioRouter.post("/:id/transactions", portfolioController.addTransaction);
