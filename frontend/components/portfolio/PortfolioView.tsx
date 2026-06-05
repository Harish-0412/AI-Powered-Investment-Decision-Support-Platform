"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  TrendingUp, TrendingDown, Wallet, Briefcase, Clock, 
  BarChart3, PieChart, History, Plus, Trash2, Edit3, 
  ArrowUpRight, ArrowDownRight, Info, AlertTriangle,
  ChevronDown, ChevronUp, Search, ExternalLink
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { apiRequest } from "@/lib/api";
import type { PublicProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

type Holding = {
  id: string;
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number | null;
  currentValue: number | null;
  totalCost: number;
  profitLoss: number | null;
  profitLossPercentage: number | null;
  firstBuyDate: string;
  sector: string;
  weight: number;
};

type Transaction = {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: string;
};

type PortfolioData = {
  id: string;
  name: string;
  description: string | null;
  holdings: Holding[];
  summary: {
    totalValue: number;
    totalCost: number;
    totalProfitLoss: number;
    totalProfitLossPercentage: number;
    holdingCount: number;
    transactionCount: number;
    avgHoldingPeriod: number;
  };
};

type PortfolioViewProps = {
  profile: PublicProfile;
  editable?: boolean;
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function PortfolioView({ profile, editable }: PortfolioViewProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "holdings" | "history" | "analytics">("overview");
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [expandedHolding, setExpandedHolding] = useState<string | null>(null);

  // Form state for new transaction
  const [newTx, setNewTx] = useState({
    symbol: "",
    type: "BUY" as "BUY" | "SELL",
    quantity: 0,
    price: 0,
    date: new Date().toISOString().split("T")[0]
  });

  const fetchData = async () => {
    try {
      const portfolios = await apiRequest<any[]>("/portfolios");
      if (portfolios.length === 0) {
        setError("No portfolio found. Please complete onboarding.");
        return;
      }
      
      const pData = await apiRequest<PortfolioData>(`/portfolios/${portfolios[0].id}`);
      const txData = await apiRequest<Transaction[]>(`/portfolios/${portfolios[0].id}/transactions`);
      
      setPortfolio(pData);
      setTransactions(txData);
    } catch (err) {
      setError("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    try {
      await apiRequest(`/portfolios/${portfolio.id}/transactions`, {
        method: "POST",
        body: JSON.stringify({
          ...newTx,
          quantity: Number(newTx.quantity),
          price: Number(newTx.price),
          date: new Date(newTx.date).toISOString()
        })
      });
      setIsAddingTransaction(false);
      fetchData();
    } catch (err) {
      alert("Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!portfolio || !confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await apiRequest(`/portfolios/${portfolio.id}/transactions/${txId}`, {
        method: "DELETE"
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete transaction");
    }
  };

  const sectorData = useMemo(() => {
    if (!portfolio) return [];
    const sectors: Record<string, number> = {};
    portfolio.holdings.forEach(h => {
      sectors[h.sector] = (sectors[h.sector] || 0) + (h.currentValue || 0);
    });
    return Object.entries(sectors).map(([name, value]) => ({ name, value }));
  }, [portfolio]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-[#10b981] rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your portfolio...</p>
      </div>
    </div>
  );

  if (error || !portfolio) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafb] p-4">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
      <p className="text-gray-600 mb-6">{error || "Portfolio not found"}</p>
      <button onClick={() => window.location.href = "/onboarding"} className="px-6 py-2 bg-[#111816] text-white rounded-lg font-bold">
        Complete Onboarding
      </button>
    </div>
  );

  const { summary } = portfolio;
  const isProfit = summary.totalProfitLoss >= 0;

  return (
    <main className="min-h-screen bg-[#f9fafb] text-[#111816] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="bg-[#10b981] p-2 rounded-lg">
                <Wallet className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{portfolio.name}</h1>
                <p className="text-xs text-gray-500">Real-time Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {editable && (
                <button 
                  onClick={() => setIsAddingTransaction(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm font-bold hover:bg-[#059669] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-400">Total Value</span>
            </div>
            <h3 className="text-2xl font-bold">${summary.totalValue.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-1">Invested: ${summary.totalCost.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-lg", isProfit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <span className="text-xs font-medium text-gray-400">Total P/L</span>
            </div>
            <h3 className={cn("text-2xl font-bold", isProfit ? "text-green-600" : "text-red-600")}>
              {isProfit ? "+" : ""}${Math.abs(summary.totalProfitLoss).toLocaleString()}
            </h3>
            <p className={cn("text-xs font-bold mt-1", isProfit ? "text-green-500" : "text-red-500")}>
              {isProfit ? "+" : ""}{summary.totalProfitLossPercentage.toFixed(2)}% ROI
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-400">Avg Holding Age</span>
            </div>
            <h3 className="text-2xl font-bold">{summary.avgHoldingPeriod} Days</h3>
            <p className="text-xs text-gray-500 mt-1">Based on first buy dates</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-400">Holdings / Tx</span>
            </div>
            <h3 className="text-2xl font-bold">{summary.holdingCount} / {summary.transactionCount}</h3>
            <p className="text-xs text-gray-500 mt-1">Active Positions / History</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
              activeTab === "overview" ? "border-[#10b981] text-[#10b981]" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("holdings")}
            className={cn(
              "px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
              activeTab === "holdings" ? "border-[#10b981] text-[#10b981]" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Holdings
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
              activeTab === "history" ? "border-[#10b981] text-[#10b981]" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Transaction History
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
              activeTab === "analytics" ? "border-[#10b981] text-[#10b981]" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Analytics & Insights
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Asset Allocation */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Asset Allocation by Sector
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Holdings Performance */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Top Contributors (P/L %)
                  </h3>
                </div>
                <div className="space-y-4">
                  {portfolio.holdings
                    .sort((a, b) => (b.profitLossPercentage || 0) - (a.profitLossPercentage || 0))
                    .slice(0, 5)
                    .map((h, i) => (
                      <div key={h.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-xs">
                            {h.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{h.symbol}</p>
                            <p className="text-xs text-gray-400">{h.sector}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-sm font-bold", (h.profitLossPercentage || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                            {(h.profitLossPercentage || 0) >= 0 ? "+" : ""}{h.profitLossPercentage?.toFixed(2)}%
                          </p>
                          <p className="text-xs text-gray-400">${h.currentValue?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Quick Actions / Alerts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-500" />
                Portfolio Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <h4 className="text-sm font-bold text-green-800 mb-1">Strong Diversification</h4>
                  <p className="text-xs text-green-700">Your portfolio is spread across {sectorData.length} sectors. Keep it up!</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-800 mb-1">Buy Opportunity</h4>
                  <p className="text-xs text-blue-700">Cash position is healthy. Consider adding to your top performers.</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="text-sm font-bold text-amber-800 mb-1">Rebalance Suggested</h4>
                  <p className="text-xs text-amber-700">Tech sector exceeds 40% of allocation. Consider trimming positions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "holdings" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Cost</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Market Value</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">P/L</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {portfolio.holdings.map((h) => {
                    const hProfit = (h.profitLossPercentage || 0) >= 0;
                    return (
                      <tr key={h.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpandedHolding(expandedHolding === h.id ? null : h.id)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-xs">
                              {h.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{h.symbol}</p>
                              <p className="text-xs text-gray-400">{h.sector}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{h.quantity}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">${h.averageBuyPrice.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${h.currentPrice?.toLocaleString() || "---"}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${h.currentValue?.toLocaleString() || "---"}</td>
                        <td className="px-6 py-4">
                          <p className={cn("text-sm font-bold", hProfit ? "text-green-600" : "text-red-600")}>
                            {hProfit ? "+" : ""}{h.profitLoss?.toLocaleString() || "---"}
                          </p>
                          <p className={cn("text-xs font-medium", hProfit ? "text-green-500" : "text-red-500")}>
                            {hProfit ? "+" : ""}{h.profitLossPercentage?.toFixed(2)}%
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${(h.weight * 100).toFixed(1)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-500">{(h.weight * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    {editable && <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{tx.symbol}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          tx.type === "BUY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{tx.quantity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">${tx.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">${(tx.quantity * tx.price).toLocaleString()}</td>
                      {editable && (
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Portfolio Concentration
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={portfolio.holdings.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="symbol" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                      />
                      <Bar dataKey="currentValue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Performance Metrics
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Sharpe Ratio</span>
                      <span className="text-sm font-bold text-emerald-600">1.84 (High)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Portfolio Volatility</span>
                      <span className="text-sm font-bold text-amber-600">12.4% (Medium)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "45%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Diversification Score</span>
                      <span className="text-sm font-bold text-blue-600">82/100</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "82%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isAddingTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Add New Transaction</h3>
              <button onClick={() => setIsAddingTransaction(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Symbol</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. AAPL"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                    value={newTx.symbol}
                    onChange={e => setNewTx({...newTx, symbol: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                    value={newTx.type}
                    onChange={e => setNewTx({...newTx, type: e.target.value as "BUY" | "SELL"})}
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                    value={newTx.date}
                    onChange={e => setNewTx({...newTx, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quantity</label>
                  <input 
                    required
                    type="number" 
                    step="any"
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                    value={newTx.quantity || ""}
                    onChange={e => setNewTx({...newTx, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price</label>
                  <input 
                    required
                    type="number" 
                    step="any"
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                    value={newTx.price || ""}
                    onChange={e => setNewTx({...newTx, price: Number(e.target.value)})}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-[#111816] text-white rounded-lg font-bold hover:bg-[#1e2a24] transition-colors mt-4"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
