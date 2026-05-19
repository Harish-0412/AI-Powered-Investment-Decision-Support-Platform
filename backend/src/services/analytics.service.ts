import { bollingerbands, ema, macd, rsi, sma } from "technicalindicators";
import { prisma } from "../lib/prisma";
import { getHistoricalData, getStockQuote, SECTOR_MAP } from "./stock.service";

type HistoryPoint = {
  date: string;
  close: number | null;
  volume?: number | null;
};

const TRADING_DAYS_PER_YEAR = 252;
const DEFAULT_RISK_FREE_RATE = 0.02;

const toNumber = (value: { toString: () => string } | number) => Number(value.toString());

const hasMacdValues = (
  value: { MACD?: number; signal?: number } | null
): value is { MACD: number; signal: number } => (
  typeof value?.MACD === "number" && typeof value.signal === "number"
);

const getClosePrices = async (symbol: string, range = "1y") => {
  const history = await getHistoricalData(symbol, range) as HistoryPoint[];
  return history
    .filter((point) => typeof point.close === "number" && Number.isFinite(point.close))
    .map((point) => ({
      date: point.date,
      close: point.close as number,
      volume: point.volume ?? 0
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
    bbPeriod?: number;
    bbStdDev?: number;
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
  const bbPeriod = options.bbPeriod || 20;
  const bbStdDev = options.bbStdDev || 2;

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
  const bbValues = bollingerbands({
    period: bbPeriod,
    stdDev: bbStdDev,
    values: closePrices
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
      },
      bb: {
        period: bbPeriod,
        stdDev: bbStdDev
      }
    },
    latest: {
      close: closePrices.at(-1) ?? null,
      volume: points.at(-1)?.volume ?? null,
      sma: smaValues.at(-1) ?? null,
      ema: emaValues.at(-1) ?? null,
      rsi: rsiValues.at(-1) ?? null,
      macd: macdValues.at(-1) ?? null,
      bb: bbValues.at(-1) ?? null
    },
    series: {
      dates: points.map(p => p.date),
      close: closePrices,
      sma: smaValues,
      ema: emaValues,
      rsi: rsiValues,
      macd: macdValues,
      bb: bbValues
    }
  };
};

export const getStockPredictions = async (symbol: string) => {
  const indicators = await getStockTechnicalIndicators(symbol, "6mo");
  const { latest, series } = indicators;
  
  if (!latest.close || !latest.rsi || !hasMacdValues(latest.macd) || !latest.ema) {
    return null;
  }

  // Simple heuristic-based prediction for "AI" feel
  let bullishScore = 0;
  let totalFactors = 0;

  // RSI factor
  if (latest.rsi < 30) bullishScore += 1; // Oversold - Bullish
  else if (latest.rsi > 70) bullishScore += 0; // Overbought - Bearish
  else bullishScore += 0.5;
  totalFactors += 1;

  // MACD factor
  if (latest.macd.MACD > latest.macd.signal) bullishScore += 1; // Bullish crossover
  else bullishScore += 0;
  totalFactors += 1;

  // EMA factor
  if (latest.close > latest.ema) bullishScore += 1; // Price above EMA - Bullish
  else bullishScore += 0;
  totalFactors += 1;

  const confidence = bullishScore / totalFactors;
  const trend = confidence > 0.6 ? "Bullish" : confidence < 0.4 ? "Bearish" : "Neutral";
  
  // Simulated price prediction
  const predictedChange = (confidence - 0.5) * 10; // -5% to +5% range
  const targetPrice = latest.close * (1 + predictedChange / 100);

  return {
    symbol: symbol.toUpperCase(),
    trend,
    confidence: Math.round(confidence * 100),
    predictedChange: Number(predictedChange.toFixed(2)),
    targetPrice: Number(targetPrice.toFixed(2)),
    timeframe: "7 days"
  };
};

export const getStockRecommendations = async (symbol: string) => {
  const prediction = await getStockPredictions(symbol);
  const indicators = await getStockTechnicalIndicators(symbol, "3mo");
  const { latest } = indicators;

  if (!prediction || !latest.rsi || !hasMacdValues(latest.macd) || !latest.close || !latest.ema) {
    return null;
  }

  const reasons: string[] = [];
  let recommendation: "BUY" | "HOLD" | "SELL" = "HOLD";

  if (prediction.confidence > 70) {
    recommendation = "BUY";
  } else if (prediction.confidence < 30) {
    recommendation = "SELL";
  }

  if (latest.rsi < 30) reasons.push("RSI is in oversold territory (< 30), suggesting a potential rebound.");
  if (latest.rsi > 70) reasons.push("RSI is in overbought territory (> 70), suggesting a potential pullback.");
  if (latest.macd.MACD > latest.macd.signal) reasons.push("MACD bullish crossover detected (MACD line crossed above signal line).");
  if (latest.macd.MACD < latest.macd.signal) reasons.push("MACD bearish crossover detected (MACD line crossed below signal line).");
  if (latest.close > latest.ema) reasons.push("Price is trending above the 20-day EMA, indicating short-term strength.");
  if (latest.close < latest.ema) reasons.push("Price is trending below the 20-day EMA, indicating short-term weakness.");

  return {
    symbol: symbol.toUpperCase(),
    recommendation,
    confidence: prediction.confidence,
    reasons: reasons.length > 0 ? reasons : ["Market is currently showing neutral momentum with no strong technical signals."]
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
    observations: returns.length,
    riskLevel: annualizedVolatility > 0.4 ? "HIGH" : annualizedVolatility > 0.2 ? "MEDIUM" : "LOW"
  };
};

const getSectorForSymbol = (symbol: string): string => {
  const upperSymbol = symbol.toUpperCase();
  // Try to find exact match or match with .NS/.BO suffix
  for (const [sector, symbols] of Object.entries(SECTOR_MAP)) {
    if (symbols.some((s) => s.toUpperCase() === upperSymbol || s.toUpperCase().startsWith(upperSymbol + "."))) {
      return sector;
    }
  }
  return "Other";
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
      const totalCost = averageBuyPrice * quantity;
      const profitLoss = currentValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      return {
        symbol: holding.symbol,
        quantity,
        averageBuyPrice,
        currentPrice: quote.price,
        currentValue,
        totalCost,
        profitLoss,
        profitLossPercent,
        annualizedVolatility: risk.annualizedVolatility,
        sharpeRatio: risk.sharpeRatio,
        annualizedReturn: risk.annualizedReturn,
        sector: getSectorForSymbol(holding.symbol)
      };
    })
  );

  const totalValue = enrichedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalCost = enrichedHoldings.reduce((sum, holding) => sum + holding.totalCost, 0);
  const totalProfitLoss = totalValue - totalCost;
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  const holdings = enrichedHoldings.map((holding) => ({
    ...holding,
    weight: totalValue > 0 ? holding.currentValue / totalValue : 0
  }));

  // Sector Diversification
  const sectorWeights: Record<string, number> = {};
  holdings.forEach(h => {
    sectorWeights[h.sector] = (sectorWeights[h.sector] || 0) + h.weight;
  });

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
    totalCost,
    totalProfitLoss,
    totalProfitLossPercentage,
    riskFreeRate,
    metrics: {
      weightedAnnualizedVolatility,
      weightedAnnualizedReturn,
      weightedSharpeRatio
    },
    sectorDiversification: Object.entries(sectorWeights).map(([name, weight]) => ({ name, weight })),
    holdings: holdings.sort((a, b) => b.profitLossPercent - a.profitLossPercent)
  };
};
