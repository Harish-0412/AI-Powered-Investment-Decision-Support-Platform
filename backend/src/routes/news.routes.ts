import { Router } from "express";
import * as newsController from "../controllers/news.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const newsRouter = Router();

newsRouter.use(requireAuth);

newsRouter.get("/top", newsController.getTopNews);
newsRouter.get("/search", newsController.getStockNews);
