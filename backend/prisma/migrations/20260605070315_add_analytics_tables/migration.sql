-- CreateTable
CREATE TABLE "StockAnalytics" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "technicalData" JSONB NOT NULL,
    "sentimentData" JSONB,
    "fundamentalData" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioMetrics" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "riskMetrics" JSONB NOT NULL,
    "performanceData" JSONB NOT NULL,
    "optimizationData" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionScore" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "features" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorRisk" (
    "id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "volatility" DOUBLE PRECISION NOT NULL,
    "correlation" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectorRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentimentScore" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "magnitude" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentimentScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockAnalytics_symbol_key" ON "StockAnalytics"("symbol");

-- CreateIndex
CREATE INDEX "StockAnalytics_symbol_idx" ON "StockAnalytics"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioMetrics_portfolioId_key" ON "PortfolioMetrics"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioMetrics_portfolioId_idx" ON "PortfolioMetrics"("portfolioId");

-- CreateIndex
CREATE INDEX "PredictionScore_symbol_idx" ON "PredictionScore"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionScore_symbol_timeframe_key" ON "PredictionScore"("symbol", "timeframe");

-- CreateIndex
CREATE UNIQUE INDEX "SectorRisk_sector_key" ON "SectorRisk"("sector");

-- CreateIndex
CREATE INDEX "SentimentScore_symbol_date_idx" ON "SentimentScore"("symbol", "date");

-- AddForeignKey
ALTER TABLE "PortfolioMetrics" ADD CONSTRAINT "PortfolioMetrics_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
