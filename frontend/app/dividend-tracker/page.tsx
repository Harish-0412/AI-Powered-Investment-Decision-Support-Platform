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
import { TrendingUp, Calendar, DollarSign, Search, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Dividend = {
  exDividendDate: string;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
  amount: string;
};

type DividendData = {
  symbol: string;
  historical: Dividend[];
};

type StockOverview = {
  Symbol: string;
  Name: string;
  DividendPerShare: string;
  DividendYield: string;
  DividendDate: string;
  ExDividendDate: string;
};

export default function DividendTrackerPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<StockOverview | null>(null);
  const [dividendData, setDividendData] = useState<DividendData | null>(null);
  const [error, setError] = useState("");

  const fetchDividendInfo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const [ov, div] = await Promise.all([
        apiRequest<StockOverview>(`/stocks/${symbol.toUpperCase()}/alpha/overview`),
        apiRequest<DividendData>(`/stocks/${symbol.toUpperCase()}/alpha/dividends`),
      ]);
      setOverview(ov);
      setDividendData(div);
    } catch (err: any) {
      setError(err.message || "Failed to fetch dividend data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDividendInfo();
  }, []);

  const chartData = dividendData?.historical
    ?.slice(0, 10)
    .reverse()
    .map((d) => ({
      date: new Date(d.exDividendDate).toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      amount: parseFloat(d.amount),
    })) || [];

  return (
    <AuthGate>
      <AppShell
        title="Dividend Tracker"
        subtitle="Analyze passive income potential and track upcoming payouts."
      >
        <div className="analytics-dashboard">
          <section className="workspace-panel">
            <form onSubmit={fetchDividendInfo} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9a92]" />
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Enter ticker (e.g., AAPL, MSFT, RELIANCE.NS)"
                  className="w-full pl-10 pr-4 py-2 rounded border border-[#e8ece9]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="glass-button !py-1 !px-6 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </section>

          <AnimatePresence mode="wait">
            {overview && dividendData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="dashboard-row grid-3">
                  <MetricCard
                    label="Dividend Yield"
                    value={`${(parseFloat(overview.DividendYield) * 100).toFixed(2)}%`}
                    icon={<TrendingUp className="text-[#4aa87a]" />}
                  />
                  <MetricCard
                    label="Dividend Per Share"
                    value={`$${overview.DividendPerShare}`}
                    icon={<DollarSign className="text-[#4aa87a]" />}
                  />
                  <MetricCard
                    label="Next Ex-Date"
                    value={overview.ExDividendDate !== "None" ? overview.ExDividendDate : "TBD"}
                    icon={<Calendar className="text-[#4aa87a]" />}
                  />
                </div>

                <div className="dashboard-grid">
                  <div className="main-col">
                    <section className="workspace-panel h-full">
                      <div className="flex justify-between items-center mb-6">
                        <h2>Historical Payouts</h2>
                        <span className="text-xs font-bold text-[#8a9a92]">Last 10 Payments</span>
                      </div>
                      <div style={{ height: "350px", width: "100%", position: "relative" }}>
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
                  </div>

                  <aside className="side-col space-y-6">
                    <section className="workspace-panel">
                      <h2 className="flex items-center gap-2 mb-4">
                        <DollarSign className="h-4 w-4 text-[#4aa87a]" />
                        Income Potential
                      </h2>
                      <div className="space-y-4">
                        <div className="p-4 bg-[#f7f7f2] rounded-xl">
                          <p className="text-xs font-bold text-[#52625a] uppercase mb-1">Annual Income per 100 Shares</p>
                          <strong className="text-2xl text-[#101412]">
                            ${(parseFloat(overview.DividendPerShare) * 100).toFixed(2)}
                          </strong>
                        </div>
                        <p className="text-xs text-[#8a9a92] leading-relaxed">
                          Based on current dividend per share of <strong>${overview.DividendPerShare}</strong>.
                          Historical data shows consistent payouts from <strong>{overview.Name}</strong>.
                        </p>
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
        <p className="text-xs font-bold uppercase text-[#52625a] mb-1">{label}</p>
        <strong className="text-xl text-[#101412]">{value}</strong>
      </div>
    </article>
  );
}

function EventItem({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg border border-[#f0f0f0]">
      <span className="text-sm font-medium text-[#52625a]">{label}</span>
      <span className="text-sm font-bold text-[#101412]">{date}</span>
    </div>
  );
}
