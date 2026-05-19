import { prisma } from "../lib/prisma";
import { getStockQuote } from "./stock.service";

export interface TaxLossOpportunity {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  unrealizedLoss: number;
  unrealizedLossPercent: number;
  potentialTaxSaving: number; // Assuming 15% STCG tax rate for simplification
}

export const getTaxLossOpportunities = async (userId: string) => {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    include: { holdings: true }
  });

  const allHoldings = portfolios.flatMap(p => p.holdings);
  const opportunities: TaxLossOpportunity[] = [];

  await Promise.all(
    allHoldings.map(async (holding) => {
      const quote = await getStockQuote(holding.symbol);
      const avgPrice = Number(holding.averageBuyPrice);
      const quantity = Number(holding.quantity);

      if (quote.price < avgPrice) {
        const lossPerShare = avgPrice - quote.price;
        const totalLoss = lossPerShare * quantity;
        opportunities.push({
          symbol: holding.symbol,
          quantity,
          averageBuyPrice: avgPrice,
          currentPrice: quote.price,
          unrealizedLoss: totalLoss,
          unrealizedLossPercent: (lossPerShare / avgPrice) * 100,
          potentialTaxSaving: totalLoss * 0.15 // Simple 15% tax saving estimate
        });
      }
    })
  );

  return opportunities.sort((a, b) => b.unrealizedLoss - a.unrealizedLoss);
};
