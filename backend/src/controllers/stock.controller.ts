import type { Request, Response } from "express";
import { getStockQuote, getHistoricalData, searchStocks } from "../services/stock.service";
import { AppError } from "../utils/errors";

const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const getQueryString = (value: unknown) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  return typeof normalized === "string" ? normalized : undefined;
};

export const getQuote = async (req: Request, res: Response) => {
  const symbol = getParam(req.params.symbol);
  if (!symbol) throw new AppError(400, "Stock symbol is required");
  res.json(await getStockQuote(symbol));
};

export const getHistory = async (req: Request, res: Response) => {
  const symbol = getParam(req.params.symbol);
  if (!symbol) throw new AppError(400, "Stock symbol is required");
  res.json(await getHistoricalData(symbol, getQueryString(req.query.range) || "1mo"));
};

export const getStockDetail = async (req: Request, res: Response) => {
  const raw = getParam(req.params.symbol);
  if (!raw) throw new AppError(400, "Stock symbol is required");
  const symbol = raw.toUpperCase();
  const nsSymbol = symbol.includes(".") ? symbol : `${symbol}.NS`;

  // Fetch all history ranges in parallel
  const [q1mo, q3mo, q6mo, q1y, q5y] = await Promise.allSettled([
    getHistoricalData(nsSymbol, "1mo"),
    getHistoricalData(nsSymbol, "3mo"),
    getHistoricalData(nsSymbol, "6mo"),
    getHistoricalData(nsSymbol, "1y"),
    getHistoricalData(nsSymbol, "5y"),
  ]);

  // Fetch enriched quote directly from Yahoo
  const enrichedQuote = await fetchEnrichedQuote(nsSymbol);

  const history1y = q1y.status === "fulfilled" ? (q1y.value as any[]) : [];
  const closes = history1y.map((d: any) => d.close).filter(Boolean);
  const dates = history1y.map((d: any) => d.date);
  const prediction = buildPrediction(closes, dates);

  res.json({
    symbol,
    quote: enrichedQuote,
    history: {
      "1mo": q1mo.status === "fulfilled" ? q1mo.value : [],
      "3mo": q3mo.status === "fulfilled" ? q3mo.value : [],
      "6mo": q6mo.status === "fulfilled" ? q6mo.value : [],
      "1y": history1y,
      "5y": q5y.status === "fulfilled" ? q5y.value : [],
    },
    prediction,
  });
};

async function fetchEnrichedQuote(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const data = await res.json() as any;
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const ltp = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const prev = meta.previousClose ?? ltp;
    return {
      symbol,
      price: ltp,
      change: ltp - prev,
      changePercent: prev !== 0 ? ((ltp - prev) / prev) * 100 : 0,
      open: meta.regularMarketOpen ?? null,
      previousClose: meta.previousClose ?? null,
      volume: meta.regularMarketVolume ?? null,
      dayHigh: meta.regularMarketDayHigh ?? null,
      dayLow: meta.regularMarketDayLow ?? null,
      marketCap: meta.marketCap ?? null,
      weekHigh52: meta.fiftyTwoWeekHigh ?? null,
      weekLow52: meta.fiftyTwoWeekLow ?? null,
    };
  } catch {
    return null;
  }
}

function buildPrediction(closes: number[], dates: string[]) {
  if (closes.length < 10) return [];
  const n = closes.length;
  // Simple linear regression on last 60 trading days
  const window = closes.slice(-60);
  const xMean = (window.length - 1) / 2;
  const yMean = window.reduce((a, b) => a + b, 0) / window.length;
  let num = 0, den = 0;
  window.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  // Project 30 trading days forward
  const lastDate = new Date(dates[dates.length - 1] || new Date());
  const result: { date: string; predicted: number; upper: number; lower: number }[] = [];
  const stdDev = Math.sqrt(window.reduce((a, y, x) => a + (y - (intercept + slope * x)) ** 2, 0) / window.length);
  for (let i = 1; i <= 30; i++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i);
    // Skip weekends
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    const predicted = intercept + slope * (window.length - 1 + i);
    result.push({
      date: d.toISOString().split("T")[0],
      predicted: Math.max(0, predicted),
      upper: Math.max(0, predicted + 1.5 * stdDev),
      lower: Math.max(0, predicted - 1.5 * stdDev),
    });
  }
  return result;
}

export const getStockList = async (req: Request, res: Response) => {
  const query = getQueryString(req.query.q) || "";
  const page = Math.max(1, parseInt(getQueryString(req.query.page) || "1", 10));
  const sector = getQueryString(req.query.sector) || "";
  const marketCap = getQueryString(req.query.marketCap) || "";
  const universe = getQueryString(req.query.universe) || "";
  const alpha = getQueryString(req.query.alpha) || "";
  res.json(await searchStocks({ query, page, sector, marketCap, universe, alpha }));
};
