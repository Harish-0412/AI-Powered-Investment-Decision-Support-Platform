import { cacheGet, cacheSet } from "../lib/redis";

const STOCK_CACHE_TTL = 300; // 5 minutes
const HISTORY_CACHE_TTL = 3600; // 1 hour

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: Date;
}

export const getStockQuote = async (symbol: string): Promise<StockQuote> => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `stock_quote:${normalizedSymbol}`;
  const cachedData = await cacheGet<StockQuote>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(normalizedSymbol)}`);
    if (!response.ok) {
      throw new Error(`Yahoo Finance responded with ${response.status}`);
    }

    const data = await response.json() as any;
    const result = data.chart?.result?.[0];
    if (!result?.meta?.regularMarketPrice || !result.meta.previousClose) {
      throw new Error("Yahoo Finance response did not include quote metadata");
    }

    const meta = result.meta;
    const quote: StockQuote = {
      symbol: normalizedSymbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      updatedAt: new Date()
    };

    await cacheSet(cacheKey, quote, STOCK_CACHE_TTL);
    return quote;
  } catch (error) {
    console.error(`Error fetching stock data for ${normalizedSymbol}:`, error);
    throw new Error("Failed to fetch stock data");
  }
};

export const getHistoricalData = async (symbol: string, range: string = "1mo") => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `stock_history:${normalizedSymbol}:${range}`;
  const cachedData = await cacheGet(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const params = new URLSearchParams({ range, interval: "1d" });
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(normalizedSymbol)}?${params}`);
    if (!response.ok) {
      throw new Error(`Yahoo Finance responded with ${response.status}`);
    }

    const data = await response.json() as any;
    const result = data.chart?.result?.[0];
    if (!result?.timestamp || !result.indicators?.quote?.[0]) {
      throw new Error("Yahoo Finance response did not include historical data");
    }

    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    const history = timestamps.map((time: number, index: number) => ({
      date: new Date(time * 1000).toISOString().split('T')[0],
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
      volume: quotes.volume[index]
    }));

    await cacheSet(cacheKey, history, HISTORY_CACHE_TTL);
    return history;
  } catch (error) {
    console.error(`Error fetching historical data for ${normalizedSymbol}:`, error);
    throw new Error("Failed to fetch historical stock data");
  }
};
