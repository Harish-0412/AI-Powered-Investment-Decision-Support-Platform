import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { authRouter } from "./routes/auth.routes";
import { stockRouter } from "./routes/stock.routes";
import { portfolioRouter } from "./routes/portfolio.routes";
import { profileRouter } from "./routes/profile.routes";
import { newsRouter } from "./routes/news.routes";
import { extraRouter } from "./routes/extraServices.routes";
import { healthRouter } from "./routes/health.routes";
import { adminRouter } from "./routes/admin.routes";

export const app = express();

const normalizeOrigin = (origin: string) => origin.replace(/\/$/, "");
const allowedOrigins = new Set([
  normalizeOrigin(env.FRONTEND_URL),
  "https://nvest-psi.vercel.app",
  "http://localhost:3000"
]);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/stocks", stockRouter);
app.use("/api/v1/portfolios", portfolioRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/extra", extraRouter);
app.use(notFoundHandler);
app.use(errorHandler);
