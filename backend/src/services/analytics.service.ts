import { ema, macd, rsi, sma } from "technicalindicators";
import { prisma } from "../lib/prisma";
import { getHistoricalData, getStockQuote } from "./stock.service";

type HistoryPoint = {
  date: string;
  close: number | null;
};

const TRADING_DAYS_PER_YEAR = 252;
const DEFAULT_RISK_FREE_RATE = 0.02;

const toNumber = (value: { toString: () => string } | number) => Number(value.toString());

const getClosePrices = async (symbol: string, range = "1y") => {
  const history = await getHistoricalData(symbol, range) as HistoryPoint[];
  return history
    .filter((point) => typeof point.close === "number" && Number.isFinite(point.close))
    .map((point) => ({
      date: point.date,
      close: point.close as number
    }));
};

const dailyReturns = (prices: number[]) => {
  const returns: number[] = [];

  for (let index = 1; index < prices.length; index += 1) {
    const previous = prices[index - 1];
    const current = prices[index];
    if (previous > 0) {
      returns.push((current - previous) / previous);
    }
  }

  return returns;
};

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const standardDeviation = (values: number[]) => {
  if (values.length < 2) return 0;

  const mean = average(values);
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

export const getStockTechnicalIndicators = async (
  symbol: string,
  range = "1y",
  options: {
    smaPeriod?: number;
    emaPeriod?: number;
    rsiPeriod?: number;
    macdFastPeriod?: number;
    macdSlowPeriod?: number;
    macdSignalPeriod?: number;
  } = {}
) => {
  const points = await getClosePrices(symbol, range);
  const closePrices = points.map((point) => point.close);

  const smaPeriod = options.smaPeriod || 20;
  const emaPeriod = options.emaPeriod || 20;
  const rsiPeriod = options.rsiPeriod || 14;
  const macdFastPeriod = options.macdFastPeriod || 12;
  const macdSlowPeriod = options.macdSlowPeriod || 26;
  const macdSignalPeriod = options.macdSignalPeriod || 9;

  const smaValues = sma({ period: smaPeriod, values: closePrices });
  const emaValues = ema({ period: emaPeriod, values: closePrices });
  const rsiValues = rsi({ period: rsiPeriod, values: closePrices });
  const macdValues = macd({
    values: closePrices,
    fastPeriod: macdFastPeriod,
    slowPeriod: macdSlowPeriod,
    signalPeriod: macdSignalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  return {
    symbol: symbol.toUpperCase(),
    range,
    periods: {
      sma: smaPeriod,
      ema: emaPeriod,
      rsi: rsiPeriod,
      macd: {
        fast: macdFastPeriod,
        slow: macdSlowPeriod,
        signal: macdSignalPeriod
      }
    },
    latest: {
      close: closePrices.at(-1) ?? null,
      sma: smaValues.at(-1) ?? null,
      ema: emaValues.at(-1) ?? null,
      rsi: rsiValues.at(-1) ?? null,
      macd: macdValues.at(-1) ?? null
    },
    series: {
      sma: smaValues,
      ema: emaValues,
      rsi: rsiValues,
      macd: macdValues
    }
  };
};

export const getStockRiskMetrics = async (
  symbol: string,
  range = "1y",
  riskFreeRate = DEFAULT_RISK_FREE_RATE
) => {
  const points = await getClosePrices(symbol, range);
  const closePrices = points.map((point) => point.close);
  const returns = dailyReturns(closePrices);

  if (returns.length < 2) {
    return {
      symbol: symbol.toUpperCase(),
      range,
      volatility: 0,
      annualizedVolatility: 0,
      averageDailyReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      observations: returns.length
    };
  }

  const averageDailyReturn = average(returns);
  const volatility = standardDeviation(returns);
  const annualizedVolatility = volatility * Math.sqrt(TRADING_DAYS_PER_YEAR);
  const annualizedReturn = averageDailyReturn * TRADING_DAYS_PER_YEAR;
  const sharpeRatio = annualizedVolatility > 0
    ? (annualizedReturn - riskFreeRate) / annualizedVolatility
    : 0;

  return {
    symbol: symbol.toUpperCase(),
    range,
    volatility,
    annualizedVolatility,
    averageDailyReturn,
    annualizedReturn,
    sharpeRatio,
    riskFreeRate,
    observations: returns.length
  };
};

export const getPortfolioAnalytics = async (
  portfolioId: string,
  userId: string,
  range = "1y",
  riskFreeRate = DEFAULT_RISK_FREE_RATE
) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId, userId },
    include: { holdings: true }
  });

  if (!portfolio) return null;

  const enrichedHoldings = await Promise.all(
    portfolio.holdings.map(async (holding) => {
      const quantity = toNumber(holding.quantity);
      const averageBuyPrice = toNumber(holding.averageBuyPrice);
      const quote = await getStockQuote(holding.symbol);
      const risk = await getStockRiskMetrics(holding.symbol, range, riskFreeRate);
      const currentValue = quote.price * quantity;

      return {
        symbol: holding.symbol,
        quantity,
        averageBuyPrice,
        currentPrice: quote.price,
        currentValue,
        annualizedVolatility: risk.annualizedVolatility,
        sharpeRatio: risk.sharpeRatio,
        annualizedReturn: risk.annualizedReturn
      };
    })
  );

  const totalValue = enrichedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);

  const holdings = enrichedHoldings.map((holding) => ({
    ...holding,
    weight: totalValue > 0 ? holding.currentValue / totalValue : 0
  }));

  const weightedAnnualizedVolatility = holdings.reduce(
    (sum, holding) => sum + holding.weight * holding.annualizedVolatility,
    0
  );
  const weightedAnnualizedReturn = holdings.reduce(
    (sum, holding) => sum + holding.weight * holding.annualizedReturn,
    0
  );
  const weightedSharpeRatio = weightedAnnualizedVolatility > 0
    ? (weightedAnnualizedReturn - riskFreeRate) / weightedAnnualizedVolatility
    : 0;

  return {
    portfolioId,
    name: portfolio.name,
    range,
    totalValue,
    riskFreeRate,
    metrics: {
      weightedAnnualizedVolatility,
      weightedAnnualizedReturn,
      weightedSharpeRatio
    },
    holdings
  };
};
