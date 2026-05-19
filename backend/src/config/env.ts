import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  ALPHA_VANTAGE_API_KEY: z.string().optional(),
  NEWS_API_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().email().default("admin@investiq.com"),
  ADMIN_PASSWORD: z.string().min(6).default("Admin@1234"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  LOCAL_DATABASE_URL: z.string().optional()
});

export const env = envSchema.parse(process.env);
