import { getStockTechnicalIndicators } from "./analytics.service";
import { getStockQuote } from "./stock.service";

export type PredictionResult = {
  symbol: string;
  score: number; // -1 to 1
  confidence: number;
  trend: "Bullish" | "Bearish" | "Neutral";
  factors: {
    technical: number;
    momentum: number;
    volatility: number;
  };
  targetPrice: number;
};

export const getAIPrediction = async (symbol: string): Promise<PredictionResult> => {
  const indicators = await getStockTechnicalIndicators(symbol, "6mo");
  const quote = await getStockQuote(symbol);
  
  const { latest, momentum, regimes } = indicators;
  
  // 1. Technical Factor (Trend & RSI)
  let techScore = 0;
  if (latest.close && latest.ema && latest.close > latest.ema) techScore += 0.5;
  if (latest.rsi) {
    if (latest.rsi < 30) techScore += 0.5; // Oversold - Bullish
    else if (latest.rsi > 70) techScore -= 0.5; // Overbought - Bearish
  }
  
  // 2. Momentum Factor
  let momScore = 0;
  if (momentum["20d"] > 0) momScore += 0.3;
  if (momentum["60d"] > momentum["120d"]) momScore += 0.4;
  if (momentum["5d"] > 2) momScore += 0.3;
  
  // 3. Volatility Factor (Regime)
  let volScore = 0;
  if (regimes.volatility === "Low Volatility") volScore += 0.2;
  else if (regimes.volatility === "High Volatility") volScore -= 0.2;
  
  const totalScore = (techScore * 0.4 + momScore * 0.4 + volScore * 0.2);
  const normalizedScore = Math.max(-1, Math.min(1, totalScore));
  
  const confidence = 65 + Math.abs(normalizedScore) * 20; // 65% to 85% range
  
  const trend = normalizedScore > 0.2 ? "Bullish" : normalizedScore < -0.2 ? "Bearish" : "Neutral";
  
  // Simulated target price based on prediction
  const expectedReturn = normalizedScore * 0.1; // -10% to +10%
  const targetPrice = quote.price * (1 + expectedReturn);

  return {
    symbol: symbol.toUpperCase(),
    score: normalizedScore,
    confidence: Math.round(confidence),
    trend,
    factors: {
      technical: techScore,
      momentum: momScore,
      volatility: volScore
    },
    targetPrice: Number(targetPrice.toFixed(2))
  };
};
