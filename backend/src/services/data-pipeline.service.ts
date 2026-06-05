import { prisma } from "../lib/prisma";
import { getStockTechnicalIndicators } from "./analytics.service";
import { getAIPrediction } from "./ml.service";

/**
 * DataPipelineService handles background ingestion and caching of analytics data.
 */
export const runDailyIngestion = async () => {
  console.log("Starting daily analytics ingestion...");
  
  // 1. Get all active symbols from holdings
  const holdings = await prisma.holding.findMany({
    select: { symbol: true },
    distinct: ['symbol']
  });

  const symbols = holdings.map(h => h.symbol);

  for (const symbol of symbols) {
    try {
      // 2. Pre-calculate technicals
      const indicators = await getStockTechnicalIndicators(symbol, "1y");
      
      // 3. Pre-calculate ML scores
      const prediction = await getAIPrediction(symbol);

      // 4. Persist to StockAnalytics table
      await prisma.stockAnalytics.upsert({
        where: { symbol },
        update: {
          technicalData: indicators as any,
          lastUpdated: new Date()
        },
        create: {
          symbol,
          technicalData: indicators as any
        }
      });

      console.log(`Ingested data for ${symbol}`);
    } catch (err) {
      console.error(`Failed to ingest data for ${symbol}:`, err);
    }
  }

  console.log("Daily ingestion complete.");
};
