import { Router } from "express";
import * as controller from "../controllers/extraServices.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const extraRouter = Router();

extraRouter.use(requireAuth);

extraRouter.get("/dividends", controller.getDividends);
extraRouter.get("/tax-loss", controller.getTaxLossOpportunities);
extraRouter.get("/sentiment/trending", controller.getTrendingMemes);
extraRouter.get("/sentiment/:symbol", controller.getSentiment);
