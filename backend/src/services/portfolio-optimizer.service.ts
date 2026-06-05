import { getPortfolioAnalytics } from "./analytics.service";

export type OptimizationResult = {
  currentAllocation: { symbol: string; weight: number }[];
  suggestedAllocation: { symbol: string; weight: number }[];
  actions: { symbol: string; action: "BUY" | "SELL" | "HOLD"; reason: string }[];
};

export const optimizePortfolio = async (portfolioId: string, userId: string): Promise<OptimizationResult> => {
  const analytics = await getPortfolioAnalytics(portfolioId, userId, "1y");
  if (!analytics) throw new Error("Portfolio not found");

  const { holdings } = analytics;
  
  // Strategy: Inverse Volatility Weighting
  // Higher volatility = Lower weight
  const invVols = holdings.map(h => 1 / (h.annualizedVolatility || 0.2));
  const totalInvVol = invVols.reduce((sum, v) => sum + v, 0);
  
  const suggestedAllocation = holdings.map((h, i) => ({
    symbol: h.symbol,
    weight: invVols[i] / totalInvVol
  }));

  const actions = holdings.map((h, i) => {
    const currentWeight = h.weight;
    const targetWeight = suggestedAllocation[i].weight;
    const diff = targetWeight - currentWeight;
    
    let action: "BUY" | "SELL" | "HOLD" = "HOLD";
    let reason = "Weight is optimal";

    if (diff > 0.05) {
      action = "BUY";
      reason = `Underweight: Increase exposure to match risk-optimized target of ${(targetWeight * 100).toFixed(1)}%`;
    } else if (diff < -0.05) {
      action = "SELL";
      reason = `Overweight: Reduce concentration to match risk-optimized target of ${(targetWeight * 100).toFixed(1)}%`;
    }

    return { symbol: h.symbol, action, reason };
  });

  return {
    currentAllocation: holdings.map(h => ({ symbol: h.symbol, weight: h.weight })),
    suggestedAllocation,
    actions
  };
};
