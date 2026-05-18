"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";

type StockRisk = {
  symbol: string;
  annualizedVolatility: number;
  annualizedReturn: number;
  sharpeRatio: number;
  observations: number;
};

type PortfolioAnalytics = {
  name: string;
  totalValue: number;
  metrics: {
    weightedAnnualizedVolatility: number;
    weightedAnnualizedReturn: number;
    weightedSharpeRatio: number;
  };
};

export default function AnalyticsPage() {
  const [symbol, setSymbol] = useState("MSFT");
  const [portfolioId, setPortfolioId] = useState("");
  const [stockRisk, setStockRisk] = useState<StockRisk | null>(null);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [message, setMessage] = useState("");

  const analyzeStock = async () => {
    try {
      setStockRisk(await apiRequest<StockRisk>(`/stocks/${symbol.trim().toUpperCase()}/analytics/risk`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Stock analytics failed");
    }
  };

  const analyzePortfolio = async () => {
    try {
      setPortfolioAnalytics(await apiRequest<PortfolioAnalytics>(`/portfolios/${portfolioId}/analytics`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Portfolio analytics failed");
    }
  };

  return (
    <AuthGate>
      <AppShell title="Financial analytics" subtitle="Dedicated risk metrics for stocks and portfolios.">
        {message && <p className="form-error">{message}</p>}
        <div className="portfolio-layout">
          <section className="workspace-panel">
            <h2>Stock risk metrics</h2>
            <div className="tool-row stacked">
              <input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="Ticker" />
              <button onClick={analyzeStock}>Calculate Risk</button>
            </div>
            <div className="metric-grid compact">
              <Metric label="Volatility" value={stockRisk ? `${(stockRisk.annualizedVolatility * 100).toFixed(2)}%` : "-"} />
              <Metric label="Annual Return" value={stockRisk ? `${(stockRisk.annualizedReturn * 100).toFixed(2)}%` : "-"} />
              <Metric label="Sharpe" value={stockRisk ? stockRisk.sharpeRatio.toFixed(2) : "-"} />
            </div>
          </section>
          <section className="workspace-panel">
            <h2>Portfolio risk metrics</h2>
            <div className="tool-row stacked">
              <input value={portfolioId} onChange={(event) => setPortfolioId(event.target.value)} placeholder="Portfolio id" />
              <button onClick={analyzePortfolio}>Analyze Portfolio</button>
            </div>
            <div className="metric-grid compact">
              <Metric label="Value" value={portfolioAnalytics ? `$${portfolioAnalytics.totalValue.toFixed(2)}` : "-"} />
              <Metric label="Volatility" value={portfolioAnalytics ? `${(portfolioAnalytics.metrics.weightedAnnualizedVolatility * 100).toFixed(2)}%` : "-"} />
              <Metric label="Sharpe" value={portfolioAnalytics ? portfolioAnalytics.metrics.weightedSharpeRatio.toFixed(2) : "-"} />
            </div>
          </section>
        </div>
      </AppShell>
    </AuthGate>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
