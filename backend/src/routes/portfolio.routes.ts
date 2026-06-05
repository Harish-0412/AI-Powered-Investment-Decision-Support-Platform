import { Router } from "express";
import * as portfolioController from "../controllers/portfolio.controller";
import * as analyticsController from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const portfolioRouter = Router();

portfolioRouter.use(requireAuth);

portfolioRouter.get("/", portfolioController.getPortfolios);
portfolioRouter.post("/", portfolioController.createPortfolio);
portfolioRouter.get("/:id", portfolioController.getPortfolioDetails);
portfolioRouter.put("/:id", portfolioController.updatePortfolio);
portfolioRouter.delete("/:id", portfolioController.deletePortfolio);

portfolioRouter.get("/:id/analytics", analyticsController.getPortfolioAnalytics);
portfolioRouter.get("/:id/optimize", analyticsController.optimizePortfolio);

portfolioRouter.get("/:id/transactions", portfolioController.getTransactions);
portfolioRouter.post("/:id/transactions", portfolioController.addTransaction);
portfolioRouter.post("/:id/transactions/batch", portfolioController.batchAddTransactions);
portfolioRouter.delete("/:id/transactions/:transactionId", portfolioController.deleteTransaction);
