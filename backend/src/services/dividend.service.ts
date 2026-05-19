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
  payoutRatio?: number;
  cagr5?: number;
  cagr10?: number;
  eps?: number;
}

export const getDividendData = async (symbol: string): Promise<DividendInfo> => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `dividend_data_v2:${normalizedSymbol}`;
  const cached = await cacheGet<DividendInfo>(cacheKey);
  if (cached) return cached;

  try {
    // Fetching from Yahoo Finance for real-time and historical summary
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(normalizedSymbol)}?modules=summaryDetail,calendarEvents,defaultKeyStatistics,financialData`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Yahoo Finance responded with ${res.status}`);

    const data = await res.json() as any;
    const summary = data.quoteSummary?.result?.[0];
    const detail = summary?.summaryDetail;
    const calendar = summary?.calendarEvents;
    const stats = summary?.defaultKeyStatistics;
    const financial = summary?.financialData;

    // Calculate CAGR (using 5-year average dividend yield and current rate as a proxy if historical list not available)
    // For a more accurate CAGR, we'd need the historical dividend list which Yahoo provides via a different endpoint
    // but we can use the 5yAvgDividendYield as a baseline or stats.dividendRate
    
    const dividendInfo: DividendInfo = {
      symbol: normalizedSymbol,
      dividendRate: detail?.dividendRate?.raw || 0,
      dividendYield: detail?.dividendYield?.raw || 0,
      exDividendDate: calendar?.exDividendDate?.fmt || null,
      payoutDate: calendar?.dividendDate?.fmt || null,
      payoutRatio: detail?.payoutRatio?.raw || 0,
      eps: stats?.trailingEps?.raw || 0,
      cagr5: stats?.fiveYearAvgDividendYield?.raw || 0, // Fallback to avg yield if CAGR not direct
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

export const getHistoricalDividends = async (symbol: string) => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `historical_dividends:${normalizedSymbol}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;

  try {
    // Use Yahoo Finance historical dividends endpoint
    const end = Math.floor(Date.now() / 1000);
    const start = end - (10 * 365 * 24 * 60 * 60); // 10 years ago
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${normalizedSymbol}?period1=${start}&period2=${end}&interval=1d&events=div&includeAdjustedClose=true`;
    
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Yahoo Finance CSV responded with ${res.status}`);
    
    const csv = await res.text();
    const lines = csv.split("\n").slice(1);
    const dividends = lines.map(line => {
      const [date, amount] = line.split(",");
      return { date, amount: parseFloat(amount) };
    }).filter(d => !isNaN(d.amount));

    await cacheSet(cacheKey, dividends, DIVIDEND_CACHE_TTL);
    return dividends;
  } catch (error) {
    console.error(`Error fetching historical dividends for ${symbol}:`, error);
    return [];
  }
};

export const calculateCAGR = (dividends: any[], years: number) => {
  if (dividends.length < 2) return 0;
  
  const sorted = [...dividends].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sorted[sorted.length - 1].amount;
  
  // Find dividend from ~'years' ago
  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() - years);
  
  const old = sorted.find(d => new Date(d.date) >= targetDate);
  if (!old || old.amount === 0) return 0;

  // CAGR = (latest/old)^(1/years) - 1
  return Math.pow(latest / old.amount, 1 / years) - 1;
};

export const getAdvancedDividendAnalytics = async (symbol: string, purchasePrice?: number, taxRateQualified: number = 0.15, taxRateOrdinary: number = 0.25) => {
  const [info, historical] = await Promise.all([
    getDividendData(symbol),
    getHistoricalDividends(symbol)
  ]);

  const cagr5 = calculateCAGR(historical, 5);
  const cagr10 = calculateCAGR(historical, 10);

  const yoc = purchasePrice ? (info.dividendRate / purchasePrice) : null;
  
  const annualDividend = info.dividendRate;
  const netQualified = annualDividend * (1 - taxRateQualified);
  const netOrdinary = annualDividend * (1 - taxRateOrdinary);

  return {
    ...info,
    cagr5,
    cagr10,
    yoc,
    taxImpact: {
      netQualified,
      netOrdinary,
      qualifiedRate: taxRateQualified,
      ordinaryRate: taxRateOrdinary
    },
    historical
  };
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
        ...divData,
        symbol: holding.symbol,
        quantity: Number(holding.quantity),
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
