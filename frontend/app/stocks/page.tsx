"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";

type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

type Risk = {
  annualizedVolatility: number;
  annualizedReturn: number;
  sharpeRatio: number;
};

type Indicators = {
  latest: {
    close: number;
    sma: number;
    ema: number;
    rsi: number;
    macd: { MACD?: number; signal?: number; histogram?: number };
  };
};

export default function StocksPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setLoading(true);
    setMessage("");

    try {
      const normalized = symbol.trim().toUpperCase();
      const [nextQuote, nextRisk, nextIndicators] = await Promise.all([
        apiRequest<Quote>(`/stocks/${normalized}/quote`),
        apiRequest<Risk>(`/stocks/${normalized}/analytics/risk`),
        apiRequest<Indicators>(`/stocks/${normalized}/analytics/indicators`)
      ]);

      setQuote(nextQuote);
      setRisk(nextRisk);
      setIndicators(nextIndicators);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Stock lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGate>
      <AppShell title="Stock research" subtitle="Live price data with technical indicators and risk metrics.">
        <div className="tool-row">
          <input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="Ticker symbol" />
          <button onClick={lookup} disabled={loading}>{loading ? "Loading..." : "Analyze Stock"}</button>
        </div>
        {message && <p className="form-error">{message}</p>}
        <div className="metric-grid">
          <Metric label="Price" value={quote ? `$${quote.price.toFixed(2)}` : "-"} />
          <Metric label="Change" value={quote ? `${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%)` : "-"} />
          <Metric label="Volatility" value={risk ? `${(risk.annualizedVolatility * 100).toFixed(2)}%` : "-"} />
          <Metric label="Sharpe Ratio" value={risk ? risk.sharpeRatio.toFixed(2) : "-"} />
          <Metric label="SMA" value={indicators?.latest.sma ? indicators.latest.sma.toFixed(2) : "-"} />
          <Metric label="EMA" value={indicators?.latest.ema ? indicators.latest.ema.toFixed(2) : "-"} />
          <Metric label="RSI" value={indicators?.latest.rsi ? indicators.latest.rsi.toFixed(2) : "-"} />
          <Metric label="MACD" value={indicators?.latest.macd?.MACD ? indicators.latest.macd.MACD.toFixed(2) : "-"} />
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
