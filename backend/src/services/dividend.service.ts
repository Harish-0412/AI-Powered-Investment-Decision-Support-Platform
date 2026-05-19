import { cacheGet, cacheSet } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { getStockQuote } from "./stock.service";

const DIVIDEND_CACHE_TTL = 86400; // 24 hours

export interface DividendInfo {
  symbol: string;
  dividendRate: number;
  dividendYield: number;
  exDividendDate: string | null;
  payoutDate: string | null;
}

export const getDividendData = async (symbol: string): Promise<DividendInfo> => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `dividend_data:${normalizedSymbol}`;
  const cached = await cacheGet<DividendInfo>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(normalizedSymbol)}?modules=summaryDetail,calendarEvents`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Yahoo Finance responded with ${res.status}`);

    const data = await res.json() as any;
    const summary = data.quoteSummary?.result?.[0];
    const detail = summary?.summaryDetail;
    const calendar = summary?.calendarEvents;

    const dividendInfo: DividendInfo = {
      symbol: normalizedSymbol,
      dividendRate: detail?.dividendRate?.raw || 0,
      dividendYield: detail?.dividendYield?.raw || 0,
      exDividendDate: calendar?.exDividendDate?.fmt || null,
      payoutDate: calendar?.dividendDate?.fmt || null,
    };

    await cacheSet(cacheKey, dividendInfo, DIVIDEND_CACHE_TTL);
    return dividendInfo;
  } catch (error) {
    console.error(`Error fetching dividend data for ${symbol}:`, error);
    return {
      symbol: normalizedSymbol,
      dividendRate: 0,
      dividendYield: 0,
      exDividendDate: null,
      payoutDate: null,
    };
  }
};

export const getPortfolioDividends = async (userId: string) => {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    include: { holdings: true }
  });

  const allHoldings = portfolios.flatMap(p => p.holdings);
  const dividendDetails = await Promise.all(
    allHoldings.map(async (holding) => {
      const divData = await getDividendData(holding.symbol);
      const annualIncome = divData.dividendRate * Number(holding.quantity);
      return {
        symbol: holding.symbol,
        quantity: Number(holding.quantity),
        ...divData,
        annualIncome
      };
    })
  );

  const totalAnnualIncome = dividendDetails.reduce((sum, d) => sum + d.annualIncome, 0);
  const upcomingDividends = dividendDetails
    .filter(d => d.exDividendDate && new Date(d.exDividendDate) >= new Date())
    .sort((a, b) => new Date(a.exDividendDate!).getTime() - new Date(b.exDividendDate!).getTime());

  return {
    totalAnnualIncome,
    upcomingDividends,
    allHoldings: dividendDetails
  };
};
