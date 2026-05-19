"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  ShieldAlert,
  Bell,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Signal = {
  symbol: string;
  type: "BULLISH" | "BEARISH" | "NEUTRAL";
  indicator: string;
  message: string;
  strength: number; // 0-100
};

type MarketHealth = {
  overall: "BULLISH" | "BEARISH" | "NEUTRAL";
  score: number;
  advancing: number;
  declining: number;
};

export default function MarketSignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [health, setHealth] = useState<MarketHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      // In a real app, this would scan multiple stocks. 
      // For this implementation, we'll fetch indicators for top stocks and generate signals.
      const symbols = ["AAPL", "TSLA", "MSFT", "NVDA", "RELIANCE.NS"];
      const results = await Promise.all(
        symbols.map(s => apiRequest<any>(`/stocks/${s}/analytics/indicators`))
      );

      const generatedSignals: Signal[] = [];
      results.forEach((data, i) => {
        if (!data?.latest) return;
        const { rsi, close, ema } = data.latest;
        
        if (rsi > 70) {
          generatedSignals.push({
            symbol: symbols[i],
            type: "BEARISH",
            indicator: "RSI",
            message: `${symbols[i]} is overbought (RSI: ${rsi.toFixed(1)}). Potential pullback incoming.`,
            strength: Math.min((rsi - 70) * 3 + 50, 100)
          });
        } else if (rsi < 30) {
          generatedSignals.push({
            symbol: symbols[i],
            type: "BULLISH",
            indicator: "RSI",
            message: `${symbols[i]} is oversold (RSI: ${rsi.toFixed(1)}). Rebound opportunity.`,
            strength: Math.min((30 - rsi) * 3 + 50, 100)
          });
        }

        if (close > ema * 1.05) {
          generatedSignals.push({
            symbol: symbols[i],
            type: "BULLISH",
            indicator: "EMA",
            message: `${symbols[i]} is trading 5% above 20-day EMA. Strong momentum.`,
            strength: 75
          });
        }
      });

      setSignals(generatedSignals.sort((a, b) => b.strength - a.strength));
      
      const bullCount = generatedSignals.filter(s => s.type === "BULLISH").length;
      const bearCount = generatedSignals.filter(s => s.type === "BEARISH").length;
      
      setHealth({
        overall: bullCount > bearCount ? "BULLISH" : bearCount > bullCount ? "BEARISH" : "NEUTRAL",
        score: Math.round((bullCount / (bullCount + bearCount || 1)) * 100),
        advancing: bullCount,
        declining: bearCount
      });
    } catch (err) {
      console.error("Failed to fetch signals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  return (
    <AuthGate>
      <AppShell
        title="Market Signals"
        subtitle="Real-time technical alerts and global market health indicators."
      >
        <div className="analytics-dashboard">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Activity className="h-10 w-10 text-[#4aa87a] animate-pulse mb-4" />
                <p className="text-[#52625a] font-bold">Scanning markets for signals...</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Market Health Section */}
                {health && (
                  <section className="workspace-panel">
                    <div className="flex items-center gap-3 mb-6">
                      <Zap className="h-6 w-6 text-[#4aa87a]" />
                      <h2 className="text-2xl font-black text-[#101412]">Market Pulse</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="flex flex-col items-center justify-center p-6 bg-[#f7f7f2] rounded-3xl text-center">
                        <p className="text-xs font-bold text-[#8a9a92] uppercase mb-2">Overall Bias</p>
                        <div className={`text-4xl font-black mb-1 ${
                          health.overall === "BULLISH" ? "text-green-600" : 
                          health.overall === "BEARISH" ? "text-red-600" : "text-[#101412]"
                        }`}>
                          {health.overall}
                        </div>
                        <p className="text-[10px] font-bold text-[#52625a] uppercase tracking-widest">
                          Sentiment Index
                        </p>
                      </div>

                      <div className="md:col-span-2 space-y-6 flex flex-col justify-center">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase text-[#52625a]">
                            <span>Bullish Momentum</span>
                            <span>{health.score}%</span>
                          </div>
                          <div className="h-3 w-full bg-[#e8ece9] rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${health.score}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-[#4aa87a] to-green-400"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1 p-4 border border-[#f0f0f0] rounded-2xl">
                            <p className="text-[10px] font-bold text-[#8a9a92] uppercase">Advancing Signals</p>
                            <p className="text-xl font-black text-green-600">{health.advancing}</p>
                          </div>
                          <div className="flex-1 p-4 border border-[#f0f0f0] rounded-2xl">
                            <p className="text-[10px] font-bold text-[#8a9a92] uppercase">Declining Signals</p>
                            <p className="text-xl font-black text-red-600">{health.declining}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Signals List */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-[#4aa87a]" />
                      <h2 className="text-xl font-bold text-[#101412]">Active Signals</h2>
                    </div>
                    <button 
                      onClick={fetchSignals}
                      className="text-xs font-bold text-[#4aa87a] hover:underline"
                    >
                      REFRESH SCAN
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {signals.length > 0 ? (
                      signals.map((signal, i) => (
                        <motion.div
                          key={`${signal.symbol}-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`workspace-panel !p-6 border-l-4 flex gap-4 items-start ${
                            signal.type === "BULLISH" ? "border-l-green-500" : 
                            signal.type === "BEARISH" ? "border-l-red-500" : "border-l-[#52625a]"
                          }`}
                        >
                          <div className={`p-3 rounded-2xl ${
                            signal.type === "BULLISH" ? "bg-green-50 text-green-600" : 
                            signal.type === "BEARISH" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"
                          }`}>
                            {signal.type === "BULLISH" ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-lg font-black text-[#101412]">{signal.symbol}</h3>
                              <span className="text-[10px] font-bold text-[#8a9a92] uppercase tracking-tighter bg-[#f7f7f2] px-2 py-0.5 rounded">
                                {signal.indicator} Signal
                              </span>
                            </div>
                            <p className="text-sm text-[#52625a] leading-tight mb-3">
                              {signal.message}
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-[#e8ece9] rounded-full overflow-hidden">
                                <div className={`h-full ${
                                  signal.type === "BULLISH" ? "bg-green-500" : "bg-red-500"
                                }`} style={{ width: `${signal.strength}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-[#52625a]">STRENGTH: {signal.strength}%</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-2 workspace-panel text-center py-10">
                        <CheckCircle className="h-10 w-10 text-[#4aa87a] mx-auto mb-3" />
                        <p className="text-[#52625a] font-medium">No high-confidence signals detected currently.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Risk Alerts */}
                <section className="workspace-panel border-red-100 bg-red-50/30">
                  <div className="flex items-center gap-2 mb-4 text-red-700">
                    <ShieldAlert className="h-5 w-5" />
                    <h2 className="font-bold">Critical Risk Alerts</h2>
                  </div>
                  <div className="space-y-3">
                    {signals.filter(s => s.type === "BEARISH" && s.strength > 80).map((alert, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-red-100">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-xs font-medium text-red-800">
                          <strong>{alert.symbol}</strong> high-risk reversal detected by {alert.indicator}.
                        </p>
                      </div>
                    ))}
                    {signals.filter(s => s.type === "BEARISH" && s.strength > 80).length === 0 && (
                      <p className="text-xs text-[#8a9a92] italic">No critical risk alerts for monitored assets.</p>
                    )}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppShell>
    </AuthGate>
  );
}
