import { prisma } from "../lib/prisma";
import { getStockQuote } from "./stock.service";

const toNumber = (value: { toString: () => string } | number) => Number(value.toString());

export const getPortfoliosByUser = async (userId: string) => {
  return prisma.portfolio.findMany({
    where: { userId },
    include: {
      holdings: true,
      transactions: {
        take: 10,
        orderBy: { date: "desc" }
      }
    }
  });
};

export const createPortfolio = async (userId: string, name: string) => {
  return prisma.portfolio.create({
    data: {
      name,
      userId
    }
  });
};

export const getPortfolioDetails = async (portfolioId: string, userId: string) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId, userId },
    include: {
      holdings: true,
      transactions: {
        orderBy: { date: "desc" }
      }
    }
  });

  if (!portfolio) return null;

  // Enrich holdings with real-time data
  const enrichedHoldings = await Promise.all(
    portfolio.holdings.map(async (holding) => {
      const quantity = toNumber(holding.quantity);
      const averageBuyPrice = toNumber(holding.averageBuyPrice);

      try {
        const quote = await getStockQuote(holding.symbol);
        const currentValue = quote.price * quantity;
        const totalCost = averageBuyPrice * quantity;
        const profitLoss = currentValue - totalCost;
        const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

        return {
          ...holding,
          quantity,
          averageBuyPrice,
          currentPrice: quote.price,
          currentValue,
          profitLoss,
          profitLossPercentage
        };
      } catch (error) {
        return {
          ...holding,
          quantity,
          averageBuyPrice,
          currentPrice: null,
          currentValue: null,
          profitLoss: null,
          profitLossPercentage: null
        };
      }
    })
  );

  const totalValue = enrichedHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalCost = enrichedHoldings.reduce((sum, h) => sum + (h.averageBuyPrice * h.quantity), 0);
  const totalProfitLoss = totalValue - totalCost;

  return {
    ...portfolio,
    holdings: enrichedHoldings,
    summary: {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercentage: totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0
    }
  };
};

export const addTransaction = async (
  portfolioId: string,
  userId: string,
  symbol: string,
  type: "BUY" | "SELL",
  quantity: number,
  price: number,
  date: Date = new Date()
) => {
  return prisma.$transaction(async (tx) => {
    const portfolio = await tx.portfolio.findUnique({
      where: { id: portfolioId, userId }
    });

    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    const transaction = await tx.transaction.create({
      data: {
        portfolioId,
        symbol: symbol.toUpperCase(),
        type,
        quantity,
        price,
        date
      }
    });

    const existingHolding = await tx.holding.findFirst({
      where: { portfolioId, symbol: symbol.toUpperCase() }
    });

    if (type === "BUY") {
      if (existingHolding) {
        const existingQuantity = toNumber(existingHolding.quantity);
        const existingAverageBuyPrice = toNumber(existingHolding.averageBuyPrice);
        const newQuantity = existingQuantity + quantity;
        const newAverageBuyPrice = (existingAverageBuyPrice * existingQuantity + price * quantity) / newQuantity;
        
        await tx.holding.update({
          where: { id: existingHolding.id },
          data: { quantity: newQuantity, averageBuyPrice: newAverageBuyPrice }
        });
      } else {
        await tx.holding.create({
          data: {
            portfolioId,
            symbol: symbol.toUpperCase(),
            quantity,
            averageBuyPrice: price
          }
        });
      }
    } else {
      const existingQuantity = existingHolding ? toNumber(existingHolding.quantity) : 0;
      if (!existingHolding || existingQuantity < quantity) {
        throw new Error("Insufficient holdings to sell");
      }

      const newQuantity = existingQuantity - quantity;
      if (newQuantity === 0) {
        await tx.holding.delete({ where: { id: existingHolding.id } });
      } else {
        await tx.holding.update({
          where: { id: existingHolding.id },
          data: { quantity: newQuantity }
        });
      }
    }

    return transaction;
  });
};
