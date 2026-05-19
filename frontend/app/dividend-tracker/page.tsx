"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Search,
  Loader2,
  ArrowRight,
  Calculator,
  Percent,
  History,
  ShieldAlert,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DividendAnalytics = {
  symbol: string;
  dividendRate: number;
  dividendYield: number;
  exDividendDate: string | null;
  payoutDate: string | null;
  payoutRatio: number;
  eps: number;
  cagr5: number;
  cagr10: number;
  yoc: number | null;
  taxImpact: {
    netQualified: number;
    netOrdinary: number;
    qualifiedRate: number;
    ordinaryRate: number;
  };
  historical: Array<{ date: string; amount: number }>;
};

type StockOverview = {
  Symbol: string;
  Name: string;
  DividendPerShare: string;
  DividendYield: string;
  DividendDate: string;
  ExDividendDate: string;
  Description: string;
};

export default function DividendTrackerPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<StockOverview | null>(null);
  const [analytics, setAnalytics] = useState<DividendAnalytics | null>(null);
  const [error, setError] = useState("");

  const fetchDividendInfo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const query = purchasePrice ? `?purchasePrice=${purchasePrice}` : "";
      const [ov, an] = await Promise.all([
        apiRequest<StockOverview>(`/stocks/${symbol.toUpperCase()}/alpha/overview`),
        apiRequest<DividendAnalytics>(`/extra/dividends/${symbol.toUpperCase()}/analytics${query}`),
      ]);
      setOverview(ov);
      setAnalytics(an);
    } catch (err: any) {
      setError(err.message || "Failed to fetch dividend data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDividendInfo();
  }, []);

  const chartData = analytics?.historical
    ?.slice(0, 15)
    .reverse()
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      amount: d.amount,
    })) || [];

  return (
    <AuthGate>
      <AppShell
        title="Dividend Intelligence"
        subtitle="Advanced forecasting, payout sustainability, and tax impact analysis."
      >
        <div className="analytics-dashboard">
          <section className="workspace-panel">
            <form onSubmit={fetchDividendInfo} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative col-span-1 md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9a92]" />
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Ticker (e.g., AAPL)"
                  className="w-full pl-10 pr-4 py-2 rounded border border-[#e8ece9]"
                />
              </div>
              <div className="relative col-span-1 md:col-span-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9a92]" />
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="Avg. Purchase Price (for YOC)"
                  className="w-full pl-10 pr-4 py-2 rounded border border-[#e8ece9]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="glass-button !py-1 !px-6 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze Yield"}
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </section>

          <AnimatePresence mode="wait">
            {overview && analytics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* 1. TOP METRICS */}
                <div className="dashboard-row grid-4">
                  <MetricCard
                    label="Current Yield"
                    value={`${(analytics.dividendYield * 100).toFixed(2)}%`}
                    icon={<TrendingUp className="text-[#4aa87a]" />}
                  />
                  <MetricCard
                    label="Annual Payout"
                    value={`$${analytics.dividendRate.toFixed(2)}`}
                    icon={<DollarSign className="text-[#4aa87a]" />}
                  />
                  <MetricCard
                    label="Payout Ratio"
                    value={`${(analytics.payoutRatio * 100).toFixed(1)}%`}
                    icon={<Percent className={`${analytics.payoutRatio > 1 ? "text-red-500" : "text-[#4aa87a]"}`} />}
                  />
                  <MetricCard
                    label="Yield on Cost"
                    value={analytics.yoc ? `${(analytics.yoc * 100).toFixed(2)}%` : "N/A"}
                    icon={<Calculator className="text-[#4aa87a]" />}
                  />
                </div>

                <div className="dashboard-grid">
                  <div className="main-col space-y-6">
                    {/* 2. HISTORICAL CHART */}
                    <section className="workspace-panel">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-[#4aa87a]" />
                          <h2>Dividend Growth History</h2>
                        </div>
                        <span className="text-xs font-bold text-[#8a9a92]">Historical Payouts</span>
                      </div>
                      <div style={{ height: "300px", width: "100%", position: "relative" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fill: "#52625a" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 10, fill: "#52625a" }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                              cursor={{ fill: "#f7f7f2" }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                              }}
                            />
                            <Bar
                              dataKey="amount"
                              fill="#4aa87a"
                              radius={[4, 4, 0, 0]}
                              animationDuration={1500}
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={index === chartData.length - 1 ? "#101412" : "#4aa87a"}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    {/* 3. GROWTH & FORECASTING */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section className="workspace-panel">
                        <h2 className="flex items-center gap-2 mb-4">
                          <TrendingUp className="h-4 w-4 text-[#4aa87a]" />
                          Growth Rates (CAGR)
                        </h2>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-[#f7f7f2] rounded-xl">
                            <span className="text-sm font-medium">5-Year CAGR</span>
                            <span className="font-bold text-lg">{(analytics.cagr5 * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-[#f7f7f2] rounded-xl">
                            <span className="text-sm font-medium">10-Year CAGR</span>
                            <span className="font-bold text-lg">{(analytics.cagr10 * 100).toFixed(2)}%</span>
                          </div>
                          <p className="text-[10px] text-[#8a9a92] italic">
                            CAGR (Compound Annual Growth Rate) indicates how much the dividend grew annually over the period.
                          </p>
                        </div>
                      </section>

                      <section className="workspace-panel">
                        <h2 className="flex items-center gap-2 mb-4">
                          <ShieldAlert className="h-4 w-4 text-[#4aa87a]" />
                          Sustainability Monitor
                        </h2>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl border border-[#f0f0f0]">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Payout Ratio</span>
                              <span className={`font-bold ${(analytics.payoutRatio > 0.8) ? "text-red-500" : "text-[#4aa87a]"}`}>
                                {(analytics.payoutRatio * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${analytics.payoutRatio > 1 ? "bg-red-500" : analytics.payoutRatio > 0.8 ? "bg-amber-400" : "bg-[#4aa87a]"}`}
                                style={{ width: `${Math.min(analytics.payoutRatio * 100, 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] mt-2 text-[#8a9a92]">
                              {analytics.payoutRatio > 1 
                                ? "Risk: Paying more in dividends than earning. Unsustainable." 
                                : analytics.payoutRatio > 0.7 
                                ? "Warning: High payout ratio may limit future growth." 
                                : "Healthy: Dividend is well-covered by earnings."}
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>

                  <aside className="side-col space-y-6">
                    {/* 4. TAX IMPACT ESTIMATOR */}
                    <section className="workspace-panel">
                      <h2 className="flex items-center gap-2 mb-4">
                        <ShieldAlert className="h-4 w-4 text-[#4aa87a]" />
                        Tax Impact Estimator
                      </h2>
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-[#f0f0f0] rounded-xl">
                          <p className="text-[10px] font-bold text-[#8a9a92] uppercase mb-1">Qualified Dividend (Net)</p>
                          <div className="flex justify-between items-end">
                            <strong className="text-xl text-[#101412]">${analytics.taxImpact.netQualified.toFixed(2)}</strong>
                            <span className="text-[10px] text-[#4aa87a]">@{analytics.taxImpact.qualifiedRate * 100}% tax</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white border border-[#f0f0f0] rounded-xl">
                          <p className="text-[10px] font-bold text-[#8a9a92] uppercase mb-1">Ordinary Dividend (Net)</p>
                          <div className="flex justify-between items-end">
                            <strong className="text-xl text-[#101412]">${analytics.taxImpact.netOrdinary.toFixed(2)}</strong>
                            <span className="text-[10px] text-amber-500">@{analytics.taxImpact.ordinaryRate * 100}% tax</span>
                          </div>
                        </div>
                        <div className="flex gap-2 p-2 bg-[#f7f7f2] rounded-lg">
                          <Info className="h-3 w-3 text-[#52625a] shrink-0 mt-0.5" />
                          <p className="text-[9px] text-[#52625a]">
                            Qualified dividends are typically held for &gt;60 days and taxed at capital gains rates. Ordinary dividends are taxed as regular income.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* 5. INCOME PROJECTION */}
                    <section className="workspace-panel">
                      <h2 className="flex items-center gap-2 mb-4">
                        <Calculator className="h-4 w-4 text-[#4aa87a]" />
                        Income Projection
                      </h2>
                      <div className="space-y-4">
                        <div className="p-4 bg-[#101412] text-white rounded-xl">
                          <p className="text-[10px] font-bold opacity-70 uppercase mb-1">Annual Income per 1,000 Shares</p>
                          <strong className="text-2xl">${(analytics.dividendRate * 1000).toLocaleString()}</strong>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#8a9a92]">Monthly Avg.</span>
                            <span className="font-bold">${((analytics.dividendRate * 1000) / 12).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#8a9a92]">Daily Avg.</span>
                            <span className="font-bold">${((analytics.dividendRate * 1000) / 365).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="workspace-panel">
                      <h2 className="flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-[#4aa87a]" />
                        Upcoming Events
                      </h2>
                      <div className="space-y-3">
                        <EventItem
                          label="Payment Date"
                          date={overview.DividendDate !== "None" ? overview.DividendDate : "TBD"}
                        />
                        <EventItem
                          label="Ex-Dividend Date"
                          date={overview.ExDividendDate !== "None" ? overview.ExDividendDate : "TBD"}
                        />
                      </div>
                    </section>
                  </aside>
                </div>

                {/* 6. COMPANY INFO */}
                <section className="workspace-panel">
                  <h2 className="mb-2">About {overview.Name}</h2>
                  <p className="text-sm text-[#52625a] leading-relaxed line-clamp-3">
                    {overview.Description}
                  </p>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppShell>
    </AuthGate>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <article className="workspace-panel compact flex items-center gap-4">
      <div className="p-3 bg-[#e8f5ee] rounded-xl">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase text-[#52625a] mb-0.5">{label}</p>
        <strong className="text-lg text-[#101412] leading-none">{value}</strong>
      </div>
    </article>
  );}


function EventItem({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg border border-[#f0f0f0]">
      <span className="text-sm font-medium text-[#52625a]">{label}</span>
      <span className="text-sm font-bold text-[#101412]">{date}</span>
    </div>
  );
}
