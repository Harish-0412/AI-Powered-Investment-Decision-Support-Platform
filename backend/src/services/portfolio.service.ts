import { prisma } from "../lib/prisma";
import { getStockQuote, SECTOR_MAP } from "./stock.service";

const toNumber = (value: { toString: () => string } | number) => Number(value.toString());

const getSectorForSymbol = (symbol: string): string => {
  const upperSymbol = symbol.toUpperCase();
  for (const [sector, symbols] of Object.entries(SECTOR_MAP)) {
    if (symbols.some(s => s.toUpperCase() === upperSymbol || s.toUpperCase().startsWith(upperSymbol + "."))) {
      return sector;
    }
  }
  return "Other";
};

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

        // Calculate holding age (first buy date for this symbol)
        const firstTransaction = await prisma.transaction.findFirst({
          where: { portfolioId, symbol: holding.symbol, type: "BUY" },
          orderBy: { date: "asc" }
        });

        return {
          ...holding,
          quantity,
          averageBuyPrice,
          currentPrice: quote.price,
          currentValue,
          totalCost,
          profitLoss,
          profitLossPercentage,
          firstBuyDate: firstTransaction?.date || holding.createdAt,
          sector: getSectorForSymbol(holding.symbol)
        };
      } catch (error) {
        return {
          ...holding,
          quantity,
          averageBuyPrice,
          currentPrice: null,
          currentValue: null,
          totalCost: averageBuyPrice * quantity,
          profitLoss: null,
          profitLossPercentage: null,
          firstBuyDate: holding.createdAt,
          sector: getSectorForSymbol(holding.symbol)
        };
      }
    })
  );

  const totalValue = enrichedHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalCost = enrichedHoldings.reduce((sum, h) => sum + (h.averageBuyPrice * h.quantity), 0);
  const totalProfitLoss = totalValue - totalCost;

  // Calculate Average Holding Period in days
  const now = new Date();
  const holdingPeriods = enrichedHoldings.map(h => {
    const diffTime = Math.abs(now.getTime() - new Date(h.firstBuyDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });
  const avgHoldingPeriod = holdingPeriods.length > 0 
    ? Math.round(holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length) 
    : 0;

  return {
    ...portfolio,
    holdings: enrichedHoldings.map(h => ({
      ...h,
      weight: totalValue > 0 ? (h.currentValue || 0) / totalValue : 0
    })),
    summary: {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercentage: totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0,
      holdingCount: enrichedHoldings.length,
      transactionCount: portfolio.transactions.length,
      avgHoldingPeriod
    }
  };
};

export const updatePortfolio = async (portfolioId: string, userId: string, data: { name?: string; description?: string }) => {
  return prisma.portfolio.update({
    where: { id: portfolioId, userId },
    data
  });
};

export const deletePortfolio = async (portfolioId: string, userId: string) => {
  return prisma.portfolio.delete({
    where: { id: portfolioId, userId }
  });
};

export const getTransactions = async (portfolioId: string, userId: string) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId, userId }
  });
  if (!portfolio) throw new Error("Portfolio not found");

  return prisma.transaction.findMany({
    where: { portfolioId },
    orderBy: { date: "desc" }
  });
};

export const deleteTransaction = async (transactionId: string, portfolioId: string, userId: string) => {
  return prisma.$transaction(async (tx) => {
    const portfolio = await tx.portfolio.findUnique({
      where: { id: portfolioId, userId }
    });
    if (!portfolio) throw new Error("Portfolio not found");

    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId, portfolioId }
    });
    if (!transaction) throw new Error("Transaction not found");

    // We need to revert the holding changes
    const holding = await tx.holding.findFirst({
      where: { portfolioId, symbol: transaction.symbol }
    });

    if (transaction.type === "BUY") {
      if (!holding) throw new Error("Inconsistent state: Holding not found for BUY transaction");
      const currentQty = toNumber(holding.quantity);
      const newQty = currentQty - toNumber(transaction.quantity);
      
      if (newQty < 0) throw new Error("Cannot delete transaction: would result in negative holdings");
      
      if (newQty === 0) {
        await tx.holding.delete({ where: { id: holding.id } });
      } else {
        // Recalculate average price is hard without re-scanning all transactions
        // For simplicity, we'll keep it or re-calculate properly
        const otherBuyTransactions = await tx.transaction.findMany({
          where: { portfolioId, symbol: transaction.symbol, type: "BUY", NOT: { id: transactionId } }
        });
        
        const totalCost = otherBuyTransactions.reduce((sum, t) => sum + toNumber(t.price) * toNumber(t.quantity), 0);
        const totalQty = otherBuyTransactions.reduce((sum, t) => sum + toNumber(t.quantity), 0);
        const newAvgPrice = totalQty > 0 ? totalCost / totalQty : 0;

        await tx.holding.update({
          where: { id: holding.id },
          data: { quantity: newQty, averageBuyPrice: newAvgPrice }
        });
      }
    } else {
      // SELL transaction deletion
      if (holding) {
        const newQty = toNumber(holding.quantity) + toNumber(transaction.quantity);
        await tx.holding.update({
          where: { id: holding.id },
          data: { quantity: newQty }
        });
      } else {
        await tx.holding.create({
          data: {
            portfolioId,
            symbol: transaction.symbol,
            quantity: transaction.quantity,
            averageBuyPrice: transaction.price // This is not quite right but we'll fix it on next BUY
          }
        });
      }
    }

    return tx.transaction.delete({ where: { id: transactionId } });
  });
};

export const batchAddTransactions = async (portfolioId: string, userId: string, transactions: any[]) => {
  const results = [];
  for (const t of transactions) {
    results.push(await addTransaction(portfolioId, userId, t.symbol, t.type, t.quantity, t.price, t.date ? new Date(t.date) : new Date()));
  }
  return results;
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
