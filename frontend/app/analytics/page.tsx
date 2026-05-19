"use client";

import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Activity,
  Shield,
  PieChart as PieChartIcon,
  Zap,
} from "lucide-react";

// --- Types ---

type StockRisk = {
  symbol: string;
  annualizedVolatility: number;
  annualizedReturn: number;
  sharpeRatio: number;
  observations: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
};

type PortfolioAnalytics = {
  portfolioId: string;
  name: string;
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  metrics: {
    weightedAnnualizedVolatility: number;
    weightedAnnualizedReturn: number;
    weightedSharpeRatio: number;
  };
  sectorDiversification: Array<{ name: string; weight: number }>;
  holdings: Array<{
    symbol: string;
    quantity: number;
    currentPrice: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
    sector: string;
  }>;
};

type TechnicalIndicators = {
  symbol: string;
  latest: {
    close: number;
    sma: number;
    ema: number;
    rsi: number;
    macd: { MACD: number; signal: number; histogram: number } | null;
    bb: { upper: number; middle: number; lower: number } | null;
  };
  series: {
    dates: string[];
    close: number[];
    sma: number[];
    ema: number[];
    rsi: number[];
    macd: Array<{ MACD: number; signal: number; histogram: number }>;
    bb: Array<{ upper: number; middle: number; lower: number }>;
  };
};

type Prediction = {
  symbol: string;
  trend: "Bullish" | "Bearish" | "Neutral";
  confidence: number;
  predictedChange: number;
  targetPrice: number;
  timeframe: string;
};

type Recommendation = {
  symbol: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  confidence: number;
  reasons: string[];
};

type Portfolio = {
  id: string;
  name: string;
};

// --- Main Component ---

export default function AnalyticsPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [portfolioData, setPortfolioData] = useState<PortfolioAnalytics | null>(null);

  const [stockSymbol, setStockSymbol] = useState("RELIANCE.NS");
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [stockRisk, setStockRisk] = useState<StockRisk | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Initial Load
  useEffect(() => {
    apiRequest<Portfolio[]>("/portfolios")
      .then((data) => {
        setPortfolios(data);
        if (data.length > 0) setSelectedPortfolioId(data[0].id);
      })
      .catch((err) => setMessage(err.message));
  }, []);

  // Portfolio Data Load
  useEffect(() => {
    if (!selectedPortfolioId) return;
    setLoading(true);
    apiRequest<PortfolioAnalytics>(`/portfolios/${selectedPortfolioId}/analytics`)
      .then(setPortfolioData)
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [selectedPortfolioId]);

  // Stock Data Load
  const loadStockAnalytics = async () => {
    const symbol = stockSymbol.trim().toUpperCase();
    if (!symbol) return;

    setLoading(true);
    setMessage("");
    
    // Reset individual states to avoid showing stale data from previous successful loads
    setIndicators(null);
    setStockRisk(null);
    setPrediction(null);
    setRecommendation(null);

    try {
      // Use individual try-catches or settle all to avoid one failure blocking everything
      const results = await Promise.allSettled([
        apiRequest<TechnicalIndicators>(`/stocks/${symbol}/analytics/indicators`),
        apiRequest<StockRisk>(`/stocks/${symbol}/analytics/risk`),
        apiRequest<Prediction>(`/stocks/${symbol}/analytics/predictions`),
        apiRequest<Recommendation>(`/stocks/${symbol}/analytics/recommendations`),
      ]);

      if (results[0].status === "fulfilled") setIndicators(results[0].value);
      else console.error("Indicators failed:", results[0].reason);

      if (results[1].status === "fulfilled") setStockRisk(results[1].value);
      else console.error("Risk failed:", results[1].reason);

      if (results[2].status === "fulfilled") setPrediction(results[2].value);
      else console.error("Prediction failed:", results[2].reason);

      if (results[3].status === "fulfilled") setRecommendation(results[3].value);
      else {
        console.error("Recommendation failed:", results[3].reason);
        // If it's a 404, we can set a specific message or just leave it null
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Stock analytics failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockAnalytics();
  }, []);

  // Chart Data Preparation
  const indicatorChartData = useMemo(() => {
    if (!indicators) return [];
    return indicators.series.dates.map((date, i) => ({
      date: date.split("-").slice(1).join("/"),
      close: indicators.series.close[i],
      sma: indicators.series.sma[i],
      ema: indicators.series.ema[i],
      upper: indicators.series.bb[i]?.upper,
      lower: indicators.series.bb[i]?.lower,
    }));
  }, [indicators]);

  const rsiChartData = useMemo(() => {
    if (!indicators) return [];
    return indicators.series.dates.slice(-30).map((date, i) => ({
      date: date.split("-").slice(1).join("/"),
      rsi: indicators.series.rsi.slice(-30)[i],
    }));
  }, [indicators]);

  const COLORS = ["#4aa87a", "#101412", "#52625a", "#8a9a92", "#c5e6d4"];

  return (
    <AuthGate>
      <AppShell title="Market Intelligence" subtitle="Comprehensive portfolio and stock analytics dashboard.">
        <div className="analytics-dashboard">
          {message && <p className="form-error mb-4">{message}</p>}

          {/* 1. PORTFOLIO OVERVIEW SECTION */}
          <section className="dashboard-row grid-3">
            <MetricCard
              label="Portfolio Value"
              value={portfolioData ? `₹${portfolioData.totalValue.toLocaleString()}` : "—"}
              icon={<Activity className="text-[#4aa87a]" />}
            />
            <MetricCard
              label="Total Profit/Loss"
              value={portfolioData ? `₹${portfolioData.totalProfitLoss.toLocaleString()}` : "—"}
              subValue={portfolioData ? `${portfolioData.totalProfitLossPercentage.toFixed(2)}%` : ""}
              trend={(portfolioData?.totalProfitLoss ?? 0) >= 0 ? "up" : "down"}
            />
            <div className="workspace-panel compact">
              <label className="text-xs font-bold uppercase text-[#52625a] mb-2 block">Select Portfolio</label>
              <select
                value={selectedPortfolioId}
                onChange={(e) => setSelectedPortfolioId(e.target.value)}
                className="w-full p-2 rounded border border-[#e8ece9]"
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="dashboard-grid">
            <div className="main-col space-y-6">
              {/* 2. STOCK PERFORMANCE ANALYSIS */}
              <section className="workspace-panel">
                <div className="panel-header flex justify-between items-center mb-4">
                  <h2>Stock Analysis</h2>
                  <div className="flex gap-2">
                    <input
                      value={stockSymbol}
                      onChange={(e) => setStockSymbol(e.target.value)}
                      placeholder="Ticker (e.g. AAPL)"
                      className="p-2 border rounded"
                    />
                    <button onClick={loadStockAnalytics} className="glass-button !py-1">Analyze</button>
                  </div>
                </div>

                {indicators ? (
                  <div className="space-y-6">
                    <div style={{ height: "300px", width: "100%", position: "relative" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={indicatorChartData}>
                          <defs>
                            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4aa87a" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#4aa87a" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="date" hide />
                          <YAxis domain={["auto", "auto"]} orientation="right" tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="close" stroke="#4aa87a" fillOpacity={1} fill="url(#colorClose)" />
                          <Line type="monotone" dataKey="sma" stroke="#101412" dot={false} strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="ema" stroke="#52625a" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <article className="stat-box">
                        <span className="label">Latest Close</span>
                        <span className="value">₹{indicators.latest.close.toFixed(2)}</span>
                      </article>
                      <article className="stat-box">
                        <span className="label">RSI (14)</span>
                        <span className="value">{indicators.latest.rsi.toFixed(1)}</span>
                      </article>
                      <article className="stat-box">
                        <span className="label">SMA (20)</span>
                        <span className="value">₹{indicators.latest.sma.toFixed(2)}</span>
                      </article>
                      <article className="stat-box">
                        <span className="label">Risk Score</span>
                        <span className={cn("value font-bold", stockRisk?.riskLevel === "HIGH" ? "text-red-500" : "text-[#4aa87a]")}>
                          {stockRisk?.riskLevel || "—"}
                        </span>
                      </article>
                    </div>
                  </div>
                ) : (
                  !loading && <p className="text-sm text-[#8a9a92] text-center py-20">Enter a symbol and click Analyze to load market intelligence.</p>
                )}
              </section>

              {/* 3. TECHNICAL INDICATORS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="workspace-panel">
                  <h3>Relative Strength Index (RSI)</h3>
                  <div style={{ height: "150px", width: "100%", position: "relative", marginTop: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rsiChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={[0, 100]} ticks={[30, 70]} orientation="right" tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="rsi" stroke="#4aa87a" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-[#8a9a92] mt-2 italic">
                    {indicators?.latest.rsi! > 70 ? "Market is currently overbought." : indicators?.latest.rsi! < 30 ? "Market is currently oversold." : "RSI is in neutral territory."}
                  </p>
                </section>

                {/* 5. TREND & PREDICTION ANALYSIS */}
                <section className="workspace-panel">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-4 w-4 text-[#4aa87a]" />
                    <h3>AI Trend Prediction</h3>
                  </div>
                  {prediction ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Expected Trend</span>
                        <span className={cn("font-bold", prediction.trend === "Bullish" ? "text-[#4aa87a]" : "text-red-500")}>
                          {prediction.trend}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Confidence</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-[#e8ece9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#4aa87a]" style={{ width: `${prediction.confidence}%` }} />
                          </div>
                          <span className="text-xs font-bold">{prediction.confidence}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Target (7d)</span>
                        <span className="font-bold">₹{prediction.targetPrice}</span>
                      </div>
                    </div>
                  ) : <p className="text-sm text-[#8a9a92]">Select a stock to view predictions.</p>}
                </section>
              </div>

              {/* 6. BUY / HOLD / SELL INSIGHTS */}
              {recommendation ? (
                <section className={cn("workspace-panel border-l-4", 
                  recommendation.recommendation === "BUY" ? "border-l-[#4aa87a]" : 
                  recommendation.recommendation === "SELL" ? "border-l-red-500" : "border-l-[#52625a]")}>
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-[#4aa87a]" />
                    <h2 className="!mb-0">Recommendation: <span className={cn("uppercase", 
                      recommendation.recommendation === "BUY" ? "text-[#4aa87a]" : 
                      recommendation.recommendation === "SELL" ? "text-red-500" : "text-[#52625a]"
                    )}>{recommendation.recommendation}</span></h2>
                  </div>
                  <ul className="space-y-2">
                    {recommendation.reasons.map((reason, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#4aa87a] mt-1.5 shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                !loading && (
                  <section className="workspace-panel border-l-4 border-l-[#52625a]">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="h-4 w-4 text-[#8a9a92]" />
                      <h2 className="!mb-0 text-[#8a9a92]">Recommendation: N/A</h2>
                    </div>
                    <p className="text-sm text-[#8a9a92]">
                      Insufficient data points (indicators like MACD need at least 26 days of history) or market closed.
                    </p>
                  </section>
                )
              )}
            </div>

            <aside className="side-col space-y-6">
              {/* 4. RISK ANALYSIS SECTION */}
              <section className="workspace-panel">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-[#4aa87a]" />
                  <h2>Portfolio Risk</h2>
                </div>
                {portfolioData ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Volatility</span>
                      <span className="font-bold">{(portfolioData.metrics.weightedAnnualizedVolatility * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sharpe Ratio</span>
                      <span className="font-bold">{portfolioData.metrics.weightedSharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-[10px] font-bold uppercase text-[#8a9a92] mb-1">Risk Meter</div>
                      <div className="h-2 w-full bg-gradient-to-r from-[#4aa87a] via-yellow-400 to-red-500 rounded-full relative">
                        <div 
                          className="absolute top-[-4px] h-4 w-1 bg-black border border-white" 
                          style={{ left: `${Math.min(portfolioData.metrics.weightedAnnualizedVolatility * 200, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : <p className="text-sm text-[#8a9a92]">No portfolio data.</p>}
              </section>

              {/* 7. SECTOR DIVERSIFICATION */}
              <section className="workspace-panel">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="h-4 w-4 text-[#4aa87a]" />
                  <h2>Diversification</h2>
                </div>
                <div style={{ height: "200px", width: "100%", position: "relative" }}>
                  {portfolioData && portfolioData.sectorDiversification.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={portfolioData.sectorDiversification}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="weight"
                        >
                          {portfolioData.sectorDiversification.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-[#8a9a92] text-center pt-10">Add holdings to see diversification.</p>}
                </div>
                <div className="space-y-1 mt-4">
                  {portfolioData?.sectorDiversification.map((sector, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>{sector.name}</span>
                      </div>
                      <span className="font-bold">{(sector.weight * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 9. ALERTS & SIGNALS SECTION */}
              <section className="workspace-panel">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h2>Signals</h2>
                </div>
                <div className="space-y-3">
                  {indicators && indicators.latest.rsi > 70 && (
                    <AlertItem type="warning" message={`${indicators.symbol} is overbought (RSI: ${indicators.latest.rsi.toFixed(1)})`} />
                  )}
                  {indicators && indicators.latest.rsi < 30 && (
                    <AlertItem type="success" message={`${indicators.symbol} is oversold (RSI: ${indicators.latest.rsi.toFixed(1)})`} />
                  )}
                  {stockRisk?.riskLevel === "HIGH" && (
                    <AlertItem type="danger" message={`${stockRisk.symbol} shows high volatility (${(stockRisk.annualizedVolatility * 100).toFixed(0)}%)`} />
                  )}
                  {(!indicators && !stockRisk) && <p className="text-xs text-[#8a9a92]">No active signals.</p>}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </AppShell>
    </AuthGate>
  );
}

// --- Sub-components ---

function MetricCard({ label, value, subValue, icon, trend }: { label: string; value: string; subValue?: string; icon?: React.ReactNode; trend?: "up" | "down" }) {
  return (
    <article className="workspace-panel compact flex items-center gap-4">
      {icon && <div className="p-3 bg-[#e8f5ee] rounded-xl">{icon}</div>}
      <div>
        <p className="text-xs font-bold uppercase text-[#52625a] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <strong className="text-xl text-[#101412]">{value}</strong>
          {subValue && (
            <span className={cn("text-xs font-bold", trend === "up" ? "text-[#4aa87a]" : "text-red-500")}>
              {trend === "up" ? <TrendingUp className="inline h-3 w-3 mr-0.5" /> : <TrendingDown className="inline h-3 w-3 mr-0.5" />}
              {subValue}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function AlertItem({ type, message }: { type: "warning" | "success" | "danger"; message: string }) {
  const styles = {
    warning: "bg-amber-50 border-amber-100 text-amber-800",
    success: "bg-green-50 border-green-100 text-green-800",
    danger: "bg-red-50 border-red-100 text-red-800",
  };

  return (
    <div className={cn("p-2 text-[10px] rounded border font-medium leading-tight", styles[type])}>
      {message}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

