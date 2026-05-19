"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { MessageCircle, TrendingUp, TrendingDown, Search, Loader2, Zap, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SentimentData = {
  ticker_sentiment: {
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }[];
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  feed: {
    title: string;
    url: string;
    time_published: string;
    summary: string;
    overall_sentiment_score: number;
    overall_sentiment_label: string;
  }[];
};

export default function SentimentHubPage() {
  const [symbol, setSymbol] = useState("TSLA");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SentimentData | null>(null);
  const [error, setError] = useState("");

  const fetchSentiment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<SentimentData>(`/stocks/${symbol.toUpperCase()}/alpha/news-sentiment`);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sentiment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, []);

  const sentimentCounts = data?.feed.reduce((acc, item) => {
    acc[item.overall_sentiment_label] = (acc[item.overall_sentiment_label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const pieData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));
  
  const COLORS: Record<string, string> = {
    "Very Bullish": "#16a34a",
    "Bullish": "#4aa87a",
    "Neutral": "#8a9a92",
    "Bearish": "#ef4444",
    "Very Bearish": "#b91c1c",
  };

  return (
    <AuthGate>
      <AppShell
        title="Social Sentiment Hub"
        subtitle="Monitor market buzz and community sentiment for high-momentum tickers."
      >
        <div className="analytics-dashboard">
          <section className="workspace-panel">
            <form onSubmit={fetchSentiment} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9a92]" />
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Enter ticker (e.g., TSLA, NVDA, GME)"
                  className="w-full pl-10 pr-4 py-2 rounded border border-[#e8ece9]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="glass-button !py-1 !px-6 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze Buzz"}
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </section>

          <AnimatePresence mode="wait">
            {data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="dashboard-row grid-3">
                  <MetricCard
                    label="Buzz Volume"
                    value={`${data.feed.length} Articles`}
                    subValue="Last 24h"
                    icon={<MessageCircle className="text-[#4aa87a]" />}
                  />
                  <MetricCard
                    label="Sentiment Score"
                    value={data.overall_sentiment_score.toFixed(2)}
                    subValue={data.overall_sentiment_label}
                    trend={data.overall_sentiment_score > 0 ? "up" : "down"}
                    icon={<Zap className="text-[#4aa87a]" />}
                  />
                  <MetricCard
                    label="Top Signal"
                    value={data.feed[0]?.overall_sentiment_label || "N/A"}
                    subValue="Latest Insight"
                    icon={<Newspaper className="text-[#4aa87a]" />}
                  />
                </div>

                <div className="dashboard-grid">
                  <div className="main-col">
                    <section className="workspace-panel h-full">
                      <div className="flex justify-between items-center mb-6">
                        <h2>Sentiment Distribution</h2>
                        <span className="text-xs font-bold text-[#8a9a92]">Signal Analysis</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div style={{ height: "300px", width: "100%", position: "relative" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                animationDuration={1500}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#8a9a92"} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-[#101412]">{data.overall_sentiment_label.split(' ')[0]}</span>
                            <span className="text-xs font-bold text-[#8a9a92] uppercase">Market Bias</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {pieData.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[item.name] || "#8a9a92" }} />
                                <span className="text-sm font-medium text-[#52625a]">{item.name}</span>
                              </div>
                              <span className="text-sm font-bold text-[#101412]">{item.value} mentions</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="workspace-panel mt-6">
                      <h2 className="mb-6">Sentiment Feed</h2>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {data.feed.map((item, i) => (
                          <motion.a
                            key={i}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="block p-4 rounded-xl border border-[#f0f0f0] hover:border-[#4aa87a] transition-all group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-md font-bold text-[#101412] group-hover:text-[#4aa87a] transition-colors line-clamp-1">
                                {item.title}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                                item.overall_sentiment_label.includes("Bullish") ? "bg-green-100 text-green-700" :
                                item.overall_sentiment_label.includes("Bearish") ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                              }`}>
                                {item.overall_sentiment_label}
                              </span>
                            </div>
                            <p className="text-sm text-[#52625a] line-clamp-2 mb-3">
                              {item.summary}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-[#8a9a92]">
                                {new Date(item.time_published.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/, "$1-$2-$3T$4:$5:$6")).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-[#4aa87a] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                READ ARTICLE <Zap className="h-3 w-3" />
                              </span>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    </section>
                  </div>

                  <aside className="side-col space-y-6">
                    <section className="workspace-panel">
                      <h2 className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-[#4aa87a]" />
                        Meme Strength
                      </h2>
                      <div className="p-4 bg-[#f7f7f2] rounded-xl text-center">
                        <p className="text-xs font-bold text-[#8a9a92] uppercase mb-2">Relative Momentum</p>
                        <div className="text-4xl font-black text-[#101412]">
                          {(data.overall_sentiment_score * 100).toFixed(0)}%
                        </div>
                        <p className="text-[10px] font-bold text-[#4aa87a] mt-2 uppercase tracking-widest">
                          {data.overall_sentiment_label}
                        </p>
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

function MetricCard({ label, value, subValue, icon, trend }: { label: string; value: string; subValue?: string; icon: React.ReactNode; trend?: "up" | "down" }) {
  return (
    <article className="workspace-panel compact flex items-center gap-4">
      <div className="p-3 bg-[#e8f5ee] rounded-xl">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase text-[#52625a] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <strong className="text-xl text-[#101412]">{value}</strong>
          {subValue && (
            <span className={`text-[10px] font-bold ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-[#8a9a92]"}`}>
              {subValue}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
