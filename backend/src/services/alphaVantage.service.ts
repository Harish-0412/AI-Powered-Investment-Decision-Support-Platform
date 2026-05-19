import { env } from "../config/env";
import { cacheGet, cacheSet } from "../lib/redis";

const BASE_URL = "https://www.alphavantage.co/query";
const REQUESTS_PER_MINUTE = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const CIRCUIT_OPEN_MS = 60_000;

const CACHE_TTL = {
  quote: 300,
  history: 3600,
  fundamentals: 86400,
  earnings: 86400,
  news: 10800,
  technicalIndicator: 3600,
  dividends: 86400
};

const requestTimestamps: number[] = [];
let circuitOpenUntil = 0;

type AlphaVantageParams = Record<string, string | number | undefined>;

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase();

const assertApiKey = () => {
  if (!env.ALPHA_VANTAGE_API_KEY || env.ALPHA_VANTAGE_API_KEY === "YOUR_ALPHA_VANTAGE_API_KEY") {
    throw new Error("Alpha Vantage API key is not configured");
  }
};

const enforceRateLimit = () => {
  const now = Date.now();
  if (now < circuitOpenUntil) {
    throw new Error("Alpha Vantage circuit breaker is open after a recent rate-limit response");
  }

  while (requestTimestamps.length && now - requestTimestamps[0] >= RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= REQUESTS_PER_MINUTE) {
    throw new Error("Alpha Vantage local rate limit exceeded");
  }

  requestTimestamps.push(now);
};

const buildCacheKey = (functionName: string, params: AlphaVantageParams) => {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${String(value).toUpperCase()}`);

  return `alpha_vantage:${functionName}:${entries.join(":")}`;
};

const requestAlphaVantage = async (
  functionName: string,
  params: AlphaVantageParams,
  ttlSeconds: number
) => {
  assertApiKey();

  const cacheKey = buildCacheKey(functionName, params);
  const cachedData = await cacheGet(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  enforceRateLimit();

  const searchParams = new URLSearchParams({
    function: functionName,
    apikey: env.ALPHA_VANTAGE_API_KEY as string
  });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(`${BASE_URL}?${searchParams}`);
  if (!response.ok) {
    throw new Error(`Alpha Vantage responded with ${response.status}`);
  }

  const data = await response.json() as Record<string, unknown>;
  if (data.Note || data.Information) {
    circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
    throw new Error(String(data.Note || data.Information));
  }

  if (data["Error Message"]) {
    throw new Error(String(data["Error Message"]));
  }

  await cacheSet(cacheKey, data, ttlSeconds);
  return data;
};

export const getAlphaVantageQuote = (symbol: string) => {
  return requestAlphaVantage("GLOBAL_QUOTE", { symbol: normalizeSymbol(symbol) }, CACHE_TTL.quote);
};

export const getAlphaVantageDailyHistory = (symbol: string, outputsize: "compact" | "full" = "compact") => {
  return requestAlphaVantage(
    "TIME_SERIES_DAILY",
    { symbol: normalizeSymbol(symbol), outputsize },
    CACHE_TTL.history
  );
};

export const getCompanyOverview = (symbol: string) => {
  return requestAlphaVantage("OVERVIEW", { symbol: normalizeSymbol(symbol) }, CACHE_TTL.fundamentals);
};

export const getCompanyEarnings = (symbol: string) => {
  return requestAlphaVantage("EARNINGS", { symbol: normalizeSymbol(symbol) }, CACHE_TTL.earnings);
};

export const getDividends = (symbol: string) => {
  return requestAlphaVantage("DIVIDENDS", { symbol: normalizeSymbol(symbol) }, CACHE_TTL.dividends);
};

export const getNewsSentiment = (symbol: string, limit = 50) => {
  return requestAlphaVantage(
    "NEWS_SENTIMENT",
    { tickers: normalizeSymbol(symbol), limit },
    CACHE_TTL.news
  );
};

export const getTechnicalIndicator = (
  symbol: string,
  indicator: "SMA" | "EMA" | "RSI" | "MACD",
  options: {
    interval?: string;
    timePeriod?: number;
    seriesType?: string;
  }
) => {
  const params: AlphaVantageParams = {
    symbol: normalizeSymbol(symbol),
    interval: options.interval || "daily",
    series_type: options.seriesType || "close"
  };

  if (indicator !== "MACD") {
    params.time_period = options.timePeriod || 14;
  }

  return requestAlphaVantage(indicator, params, CACHE_TTL.technicalIndicator);
};
