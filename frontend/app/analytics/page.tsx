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
  ComposedChart,
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
  Target,
  BarChart3,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  LayoutDashboard,
} from "lucide-react";

// --- Types ---

type PortfolioAnalytics = {
  portfolioId: string;
  name: string;
  summary: {
    totalValue: number;
    totalCost: number;
    totalProfitLoss: number;
    totalProfitLossPercentage: number;
  };
  riskMetrics: {
    volatility: number;
    sharpeRatio: number;
    var95: number;
    cvar95: number;
    maxDrawdown: number;
    diversificationScore: number;
  };
  sectorDiversification: Array<{ name: string; weight: number }>;
  stressAnalysis: Array<{ name: string; drop: number; impact: number }>;
  holdings: Array<{
    symbol: string;
    quantity: number;
    currentPrice: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
    sector: string;
    weight: number;
  }>;
};

type TechnicalIndicators = {
  symbol: string;
  latest: {
    close: number;
    sma: number;
    ema: number;
    rsi: number;
    adx: { adx: number; pdi: number; mdi: number } | null;
    vwap: number | null;
    atr: number;
  };
  momentum: {
    "5d": number;
    "20d": number;
    "60d": number;
    "120d": number;
  };
  regimes: {
    trend: string;
    volatility: string;
  };
  series: {
    dates: string[];
    close: number[];
    sma: number[];
    ema: number[];
    rsi: number[];
    adx: Array<{ adx: number; pdi: number; mdi: number }>;
    vwap: number[];
  };
};

type AIPrediction = {
  symbol: string;
  score: number;
  confidence: number;
  trend: "Bullish" | "Bearish" | "Neutral";
  factors: {
    technical: number;
    momentum: number;
    volatility: number;
  };
  targetPrice: number;
};

type OptimizationResult = {
  currentAllocation: { symbol: string; weight: number }[];
  suggestedAllocation: { symbol: string; weight: number }[];
  actions: { symbol: string; action: "BUY" | "SELL" | "HOLD"; reason: string }[];
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
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);

  const [stockSymbol, setStockSymbol] = useState("RELIANCE.NS");
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);

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
    
    Promise.all([
      apiRequest<PortfolioAnalytics>(`/portfolios/${selectedPortfolioId}/analytics`),
      apiRequest<OptimizationResult>(`/portfolios/${selectedPortfolioId}/optimize`)
    ])
      .then(([analytics, opt]) => {
        setPortfolioData(analytics);
        setOptimization(opt);
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [selectedPortfolioId]);

  // Stock Data Load
  const loadStockAnalytics = async () => {
    const symbol = stockSymbol.trim().toUpperCase();
    if (!symbol) return;

    setLoading(true);
    try {
      const [ind, pred] = await Promise.all([
        apiRequest<TechnicalIndicators>(`/stocks/${symbol}/analytics/indicators`),
        apiRequest<AIPrediction>(`/stocks/${symbol}/analytics/predictions`),
      ]);
      setIndicators(ind);
      setPrediction(pred);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Stock analytics failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockAnalytics();
  }, []);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const techChartData = useMemo(() => {
    if (!indicators) return [];
    return indicators.series.dates.map((date, i) => ({
      date: date.split("-").slice(1).join("/"),
      close: indicators.series.close[i],
      vwap: indicators.series.vwap[i],
      ema: indicators.series.ema[i],
    }));
  }, [indicators]);

  return (
    <AuthGate>
      <AppShell title="Analytics Engine" subtitle="Real-time monitoring, risk assessment, and AI-driven insights.">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 bg-[#f9fafb] min-h-screen">
          
          {/* Top Bar: Selector & Global Status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 text-[#10b981]" />
                <select
                  value={selectedPortfolioId}
                  onChange={(e) => setSelectedPortfolioId(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 focus:outline-none"
                >
                  {portfolios.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-400 uppercase">Risk Status</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                  (portfolioData?.riskMetrics.volatility || 0) < 0.2 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                )}>
                  {(portfolioData?.riskMetrics.volatility || 0) < 0.2 ? "Stable" : "Elevated Volatility"}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value)}
                  placeholder="Analyze Symbol (e.g. AAPL)"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                />
              </div>
              <button 
                onClick={loadStockAnalytics}
                className="px-6 py-2 bg-[#111816] text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Analyze
              </button>
            </div>
          </div>

          {/* Key Performance Indicators (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard 
              label="Portfolio Value" 
              value={`$${portfolioData?.summary.totalValue.toLocaleString() || "0"}`}
              subValue={`${portfolioData?.summary.totalProfitLossPercentage.toFixed(2)}% ROI`}
              trend={(portfolioData?.summary.totalProfitLoss || 0) >= 0 ? "up" : "down"}
              icon={<Activity className="text-blue-500" />}
            />
            <KpiCard 
              label="95% VaR (Daily)" 
              value={`$${(portfolioData?.riskMetrics.var95 || 0 * (portfolioData?.summary.totalValue || 0)).toLocaleString()}`}
              subValue="Max Expected Daily Loss"
              icon={<Shield className="text-red-500" />}
            />
            <KpiCard 
              label="Sharpe Ratio" 
              value={portfolioData?.riskMetrics.sharpeRatio.toFixed(2) || "0.00"}
              subValue="Risk-Adjusted Return"
              icon={<TrendingUp className="text-green-500" />}
            />
            <KpiCard 
              label="Diversification" 
              value={`${portfolioData?.riskMetrics.diversificationScore.toFixed(0) || "0"}/100`}
              subValue="Concentration Risk"
              icon={<PieChartIcon className="text-purple-500" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Technical Analytics Section */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Advanced Technicals: {indicators?.symbol}</h3>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        Trend: <span className="text-gray-900">{indicators?.regimes.trend}</span>
                      </span>
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        Volatility: <span className="text-gray-900">{indicators?.regimes.volatility}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${indicators?.latest.close.toFixed(2)}</p>
                    <p className="text-xs font-bold text-green-500">VWAP: ${indicators?.latest.vwap?.toFixed(2)}</p>
                  </div>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={techChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" hide />
                      <YAxis domain={["auto", "auto"]} orientation="right" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Area type="monotone" dataKey="close" stroke="#10b981" fillOpacity={0.1} fill="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="vwap" stroke="#3b82f6" dot={false} strokeWidth={1.5} strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="ema" stroke="#f59e0b" dot={false} strokeWidth={1} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <article className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Momentum 5d</p>
                    <p className={cn("text-sm font-bold", (indicators?.momentum["5d"] || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                      {indicators?.momentum["5d"].toFixed(2)}%
                    </p>
                  </article>
                  <article className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Momentum 60d</p>
                    <p className={cn("text-sm font-bold", (indicators?.momentum["60d"] || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                      {indicators?.momentum["60d"].toFixed(2)}%
                    </p>
                  </article>
                  <article className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">ADX Trend Strength</p>
                    <p className="text-sm font-bold text-gray-900">{indicators?.latest.adx?.adx.toFixed(1)}</p>
                  </article>
                  <article className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">RSI Momentum</p>
                    <p className="text-sm font-bold text-gray-900">{indicators?.latest.rsi.toFixed(1)}</p>
                  </article>
                </div>
              </div>

              {/* Stress Analysis & Scenarios */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Scenario Stress Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {portfolioData?.stressAnalysis.map((scenario, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900 mb-1">{scenario.name}</p>
                      <p className="text-xs text-gray-500 mb-4">Market Shock: {(scenario.drop * 100).toFixed(0)}%</p>
                      <div className="flex justify-between items-end">
                        <span className="text-lg font-bold text-red-600">-${Math.abs(scenario.impact).toLocaleString()}</span>
                        <ArrowDownRight className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="mt-3 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${Math.abs(scenario.drop) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Prediction Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#10b981]" />
                  AI Prediction Score & Factor Breakdown
                </h3>
                {prediction ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-[#10b981]/20 mb-4">
                        <span className="text-3xl font-black text-[#10b981]">{prediction.confidence}%</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">{prediction.trend} Outlook</h4>
                      <p className="text-sm text-gray-500">7-Day Price Target: <span className="font-bold text-gray-900">${prediction.targetPrice}</span></p>
                    </div>
                    <div className="space-y-4">
                      <FactorBar label="Technical Strength" score={prediction.factors.technical} />
                      <FactorBar label="Momentum Score" score={prediction.factors.momentum} />
                      <FactorBar label="Volatility Profile" score={prediction.factors.volatility} />
                    </div>
                  </div>
                ) : <p className="text-sm text-gray-500 text-center py-10">Select a stock to generate AI insights.</p>}
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              
              {/* Asset Allocation */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Asset Allocation</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData?.sectorDiversification}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="weight"
                      >
                        {portfolioData?.sectorDiversification.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-6">
                  {portfolioData?.sectorDiversification.map((sector, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                        <span className="text-xs font-medium text-gray-600">{sector.name}</span>
                      </div>
                      <span className="text-xs font-bold">{(sector.weight * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Suggestions */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-blue-500" />
                  Optimization Logic
                </h3>
                <p className="text-xs text-gray-500 mb-6">Risk-based rebalancing suggestions for your current positions.</p>
                <div className="space-y-4">
                  {optimization?.actions.slice(0, 4).map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-50 bg-gray-50/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">{item.symbol}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          item.action === "BUY" ? "bg-green-100 text-green-700" : 
                          item.action === "SELL" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                        )}>
                          {item.action}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Warnings */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Warnings</h3>
                <div className="space-y-3">
                  {portfolioData && portfolioData.riskMetrics.maxDrawdown > 0.15 && (
                    <div className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-[11px] text-red-800 font-medium">High Drawdown Risk: Portfolio has historically lost up to {(portfolioData.riskMetrics.maxDrawdown * 100).toFixed(1)}%.</p>
                    </div>
                  )}
                  {portfolioData && portfolioData.riskMetrics.diversificationScore < 60 && (
                    <div className="flex gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <Info className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-[11px] text-amber-800 font-medium">Concentration Warning: Your portfolio is heavily skewed. Consider diversifying across more sectors.</p>
                    </div>
                  )}
                  <div className="flex gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Activity className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-[11px] text-blue-800 font-medium">Volatility Monitoring Active: Tracking real-time shifts in market regimes.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </AppShell>
    </AuthGate>
  );
}

// --- Sub-components ---

function KpiCard({ label, value, subValue, icon, trend }: { label: string; value: string; subValue?: string; icon?: React.ReactNode; trend?: "up" | "down" }) {
  return (
    <article className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <h4 className="text-2xl font-black text-gray-900 mb-1">{value}</h4>
      <div className="flex items-center gap-1.5">
        {trend && (
          trend === "up" ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />
        )}
        <span className={cn("text-xs font-bold", trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-400")}>
          {subValue}
        </span>
      </div>
    </article>
  );
}

function FactorBar({ label, score }: { label: string; score: number }) {
  // score is expected to be roughly 0 to 1
  const percentage = Math.max(0, Math.min(100, score * 100));
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
        <span className="text-xs font-black text-gray-900">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#10b981] transition-all duration-1000" 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
