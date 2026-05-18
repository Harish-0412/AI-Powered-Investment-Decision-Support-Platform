import { Redis } from "@upstash/redis";
import { env } from "../config/env";

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null;
  return redis.get<T>(key);
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds: number) => {
  if (!redis) return;
  await redis.set(key, value, { ex: ttlSeconds });
};
