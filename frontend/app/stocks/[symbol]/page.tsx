"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type HistoryPoint = { date: string; open: number; high: number; low: number; close: number; volume: number };
type PredictionPoint = { date: string; predicted: number; upper: number; lower: number };

type StockDetail = {
  symbol: string;
  quote: {
    symbol: string; price: number; change: number; changePercent: number;
    open?: number; previousClose?: number; volume?: number;
    dayHigh?: number; dayLow?: number; marketCap?: number;
    weekHigh52?: number; weekLow52?: number;
  } | null;
  history: Record<string, HistoryPoint[]>;
  prediction: PredictionPoint[];
};

type AlphaOverview = Record<string, string>;
type AlphaEarnings = { quarterlyEarnings?: { fiscalDateEnding: string; reportedEPS: string; estimatedEPS: string }[] };
type NewsItem = { title: string; url: string; time_published: string; source: string; summary: string; overall_sentiment_label: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtINR = (n: number | string | undefined | null) => {
  const num = Number(n);
  if (!num || isNaN(num)) return "—";
  return "₹" + new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

const fmtNum = (n: number | string | undefined | null, decimals = 2) => {
  const num = Number(n);
  if (isNaN(num) || !n) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(num);
};

const fmtCap = (n: number | string | undefined | null) => {
  const num = Number(n);
  if (!num || isNaN(num)) return "—";
  const cr = num / 1e7;
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(cr)} Cr`;
};

const fmtVol = (n: number | undefined | null) => {
  if (!n) return "—";
  return new Intl.NumberFormat("en-IN").format(n);
};

const parseDate = (s: string) =>
  new Date(s.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/, "$1-$2-$3T$4:$5:$6"));

// ─── SVG Price Chart ──────────────────────────────────────────────────────────

type ChartPoint = { date: string; close: number };
type PredPoint = { date: string; predicted: number; upper: number; lower: number };

function PriceChart({ history, prediction, range }: { history: ChartPoint[]; prediction: PredPoint[]; range: string }) {
  const W = 900, H = 320, PAD = { top: 20, right: 20, bottom: 40, left: 64 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const allPrices = [
    ...history.map(d => d.close),
    ...prediction.map(d => d.upper),
    ...prediction.map(d => d.lower),
  ].filter(Boolean);

  if (allPrices.length === 0) return <div className="chart-empty">No data available</div>;

  const minP = Math.min(...allPrices) * 0.995;
  const maxP = Math.max(...allPrices) * 1.005;
  const allDates = [...history.map(d => d.date), ...prediction.map(d => d.date)];
  const totalPoints = allDates.length;

  const xScale = (i: number) => PAD.left + (i / (totalPoints - 1)) * cW;
  const yScale = (v: number) => PAD.top + cH - ((v - minP) / (maxP - minP)) * cH;

  // History line
  const histPts = history.map((d, i) => `${xScale(i)},${yScale(d.close)}`).join(" ");

  // Prediction line starts where history ends
  const predOffset = history.length;
  const predLinePts = prediction.map((d, i) => `${xScale(predOffset + i)},${yScale(d.predicted)}`).join(" ");

  // Confidence band polygon
  const upperPts = prediction.map((d, i) => `${xScale(predOffset + i)},${yScale(d.upper)}`).join(" ");
  const lowerPts = [...prediction].reverse().map((d, i) => `${xScale(predOffset + prediction.length - 1 - i)},${yScale(d.lower)}`).join(" ");
  const bandPts = upperPts + " " + lowerPts;

  // Y-axis ticks
  const yTicks = 5;
  const yTickVals = Array.from({ length: yTicks }, (_, i) => minP + ((maxP - minP) * i) / (yTicks - 1));

  // X-axis labels — show ~6 evenly spaced dates
  const xLabelCount = 6;
  const xLabelIdxs = Array.from({ length: xLabelCount }, (_, i) => Math.round((i / (xLabelCount - 1)) * (totalPoints - 1)));

  const isPositive = history.length > 1 && history[history.length - 1].close >= history[0].close;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="price-chart-svg" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTickVals.map((v, i) => (
        <line key={i} x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)}
          stroke="rgba(17,24,22,0.07)" strokeWidth="1" />
      ))}

      {/* Prediction confidence band */}
      {prediction.length > 0 && (
        <polygon points={bandPts} fill="rgba(99,102,241,0.10)" />
      )}

      {/* History area fill */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.18" />
          <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0" />
        </linearGradient>
      </defs>
      {history.length > 1 && (
        <polygon
          points={`${xScale(0)},${PAD.top + cH} ${histPts} ${xScale(history.length - 1)},${PAD.top + cH}`}
          fill="url(#areaGrad)"
        />
      )}

      {/* History line */}
      <polyline points={histPts} fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Prediction line */}
      {prediction.length > 0 && (
        <>
          <line x1={xScale(predOffset - 1)} y1={yScale(history[history.length - 1]?.close ?? 0)}
            x2={xScale(predOffset)} y2={yScale(prediction[0].predicted)}
            stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3" />
          <polyline points={predLinePts} fill="none"
            stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3"
            strokeLinejoin="round" strokeLinecap="round" />
        </>
      )}

      {/* Y-axis labels */}
      {yTickVals.map((v, i) => (
        <text key={i} x={PAD.left - 6} y={yScale(v) + 4}
          textAnchor="end" fontSize="11" fill="#52625a">
          ₹{new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v)}
        </text>
      ))}

      {/* X-axis labels */}
      {xLabelIdxs.map((idx, i) => {
        const date = allDates[idx];
        if (!date) return null;
        return (
          <text key={i} x={xScale(idx)} y={H - 8}
            textAnchor="middle" fontSize="11" fill="#52625a">
            {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </text>
        );
      })}

      {/* Prediction label */}
      {prediction.length > 0 && (
        <text x={xScale(predOffset + Math.floor(prediction.length / 2))} y={PAD.top + 14}
          textAnchor="middle" fontSize="11" fill="#6366f1" fontWeight="700">
          ▸ Forecast
        </text>
      )}
    </svg>
  );
}

// ─── Volume Bar Chart ─────────────────────────────────────────────────────────

function VolumeChart({ history }: { history: HistoryPoint[] }) {
  const W = 900, H = 80, PAD = { top: 8, right: 20, bottom: 20, left: 64 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  if (!history.length) return null;

  const maxVol = Math.max(...history.map(d => d.volume || 0));
  const barW = Math.max(1, cW / history.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="volume-chart-svg" preserveAspectRatio="xMidYMid meet">
      {history.map((d, i) => {
        const x = PAD.left + (i / history.length) * cW;
        const h = maxVol > 0 ? ((d.volume || 0) / maxVol) * cH : 0;
        const isUp = d.close >= d.open;
        return (
          <rect key={i} x={x} y={PAD.top + cH - h} width={barW} height={h}
            fill={isUp ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"} />
        );
      })}
      <text x={PAD.left - 6} y={PAD.top + 10} textAnchor="end" fontSize="10" fill="#52625a">Vol</text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const RANGES = ["1mo", "3mo", "6mo", "1y", "5y"] as const;
type Range = typeof RANGES[number];

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params?.symbol as string ?? "").toUpperCase();

  const [detail, setDetail] = useState<StockDetail | null>(null);
  const [overview, setOverview] = useState<AlphaOverview | null>(null);
  const [earnings, setEarnings] = useState<AlphaEarnings | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [range, setRange] = useState<Range>("1y");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError("");
    try {
      const [detailData, overviewData, earningsData, newsData] = await Promise.allSettled([
        apiRequest<StockDetail>(`/stocks/${symbol}/detail`),
        apiRequest<AlphaOverview>(`/stocks/${symbol}/alpha/overview`),
        apiRequest<AlphaEarnings>(`/stocks/${symbol}/alpha/earnings`),
        apiRequest<{ feed: NewsItem[] }>(`/stocks/${symbol}/alpha/news-sentiment`),
      ]);

      if (detailData.status === "fulfilled") setDetail(detailData.value);
      else setError("Failed to load stock data");
      if (overviewData.status === "fulfilled") setOverview(overviewData.value as AlphaOverview);
      if (earningsData.status === "fulfilled") setEarnings(earningsData.value as AlphaEarnings);
      if (newsData.status === "fulfilled") setNews((newsData.value as { feed: NewsItem[] }).feed?.slice(0, 6) ?? []);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => { load(); }, [load]);

  const q = detail?.quote;
  const historyData: HistoryPoint[] = detail?.history?.[range] ?? [];
  const chartData = historyData.filter(d => d.close).map(d => ({ date: d.date, close: d.close }));
  const prediction = range === "1y" ? (detail?.prediction ?? []) : [];

  const isPositive = (q?.changePercent ?? 0) >= 0;

  const fundamentals = overview ? [
    { label: "P/E Ratio (TTM)", value: fmtNum(overview.PERatio) },
    { label: "P/B Ratio", value: fmtNum(overview.PriceToBookRatio) },
    { label: "EPS (TTM)", value: fmtNum(overview.EPS) },
    { label: "ROE", value: fmtNum(overview.ReturnOnEquityTTM) },
    { label: "ROCE (TTM)", value: fmtNum(overview.ReturnOnAssetsTTM) },
    { label: "Debt to Equity", value: fmtNum(overview.DebtToEquityRatio) },
    { label: "Dividend Yield", value: fmtNum(overview.DividendYield) },
    { label: "Book Value", value: fmtNum(overview.BookValue) },
    { label: "Industry P/E", value: fmtNum(overview.ForwardPE) },
    { label: "Face Value", value: fmtNum(overview.FaceValue ?? "10") },
  ] : [];

  return (
    <AuthGate>
      <AppShell title={symbol} subtitle={overview?.Name ?? `${symbol} — Live stock data, charts & analysis`}>

        {/* Breadcrumb */}
        <nav className="stocks-breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/stocks">All Stocks</Link>
          <span>›</span>
          <span>{symbol}</span>
        </nav>

        {loading && (
          <div className="stocks-loading">
            <div className="loading-spinner" />
            <span>Loading {symbol} data…</span>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        {!loading && detail && (
          <div className="detail-layout">

            {/* ── Header ── */}
            <div className="detail-header">
              <div className="detail-title-block">
                <h2 className="detail-company-name">{overview?.Name ?? symbol}</h2>
                <span className="detail-exchange-badge">{overview?.Exchange ?? "NSE"} · {overview?.Sector ?? ""}</span>
              </div>
              <div className="detail-price-block">
                <span className="detail-ltp">{fmtINR(q?.price)}</span>
                <span className={`detail-change ${isPositive ? "change-up" : "change-down"}`}>
                  {isPositive ? "▲" : "▼"} {fmtINR(Math.abs(q?.change ?? 0))} ({isPositive ? "+" : ""}{(q?.changePercent ?? 0).toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* ── Performance Stats ── */}
            <div className="detail-stats-bar">
              <div className="stat-item">
                <span className="stat-label">Previous Close</span>
                <span className="stat-val">{fmtINR(q?.previousClose)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Open</span>
                <span className="stat-val">{fmtINR(q?.open)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Day's Range</span>
                <span className="stat-val">{fmtINR(q?.dayLow)} – {fmtINR(q?.dayHigh)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">52W Range</span>
                <span className="stat-val">{fmtINR(q?.weekLow52)} – {fmtINR(q?.weekHigh52)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Volume</span>
                <span className="stat-val">{fmtVol(q?.volume)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Market Cap</span>
                <span className="stat-val">{fmtCap(q?.marketCap)}</span>
              </div>
            </div>

            {/* ── Chart ── */}
            <div className="detail-chart-card">
              <div className="chart-header">
                <span className="chart-title">Live {overview?.Name ?? symbol} Share Price Chart</span>
                <div className="range-tabs">
                  {RANGES.map(r => (
                    <button key={r} className={`range-tab ${range === r ? "range-tab-active" : ""}`}
                      onClick={() => setRange(r)}>
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <PriceChart history={chartData} prediction={prediction} range={range} />
              <VolumeChart history={historyData} />
              {range === "1y" && prediction.length > 0 && (
                <div className="prediction-legend">
                  <span className="legend-dot" style={{ background: "#6366f1" }} />
                  <span>30-day forecast (linear regression · 1.5σ confidence band)</span>
                </div>
              )}
            </div>

            {/* ── 52W Range Bar ── */}
            {q?.weekLow52 && q?.weekHigh52 && q?.price && (
              <div className="range-bar-card">
                <span className="range-bar-label">52-Week Low: {fmtINR(q.weekLow52)}</span>
                <div className="range-bar-track">
                  <div className="range-bar-fill" style={{
                    width: `${Math.min(100, Math.max(0, ((q.price - q.weekLow52) / (q.weekHigh52 - q.weekLow52)) * 100))}%`
                  }} />
                  <div className="range-bar-thumb" style={{
                    left: `${Math.min(100, Math.max(0, ((q.price - q.weekLow52) / (q.weekHigh52 - q.weekLow52)) * 100))}%`
                  }} />
                </div>
                <span className="range-bar-label">52-Week High: {fmtINR(q.weekHigh52)}</span>
              </div>
            )}

            <div className="detail-two-col">

              {/* ── Fundamentals ── */}
              {fundamentals.length > 0 && (
                <div className="detail-card">
                  <h3 className="detail-card-title">{overview?.Name ?? symbol} Fundamentals</h3>
                  <table className="fundamentals-table">
                    <tbody>
                      {fundamentals.map(f => (
                        <tr key={f.label}>
                          <td className="fund-label">{f.label}</td>
                          <td className="fund-val">{f.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Company Overview ── */}
              {overview?.Description && (
                <div className="detail-card">
                  <h3 className="detail-card-title">About {overview.Name}</h3>
                  <p className="overview-desc">{overview.Description}</p>
                  <div className="overview-meta-grid">
                    {overview.Industry && <div><span>Industry</span><strong>{overview.Industry}</strong></div>}
                    {overview.Country && <div><span>Country</span><strong>{overview.Country}</strong></div>}
                    {overview.Currency && <div><span>Currency</span><strong>{overview.Currency}</strong></div>}
                    {overview["52WeekHigh"] && <div><span>52W High</span><strong>{fmtINR(overview["52WeekHigh"])}</strong></div>}
                    {overview["52WeekLow"] && <div><span>52W Low</span><strong>{fmtINR(overview["52WeekLow"])}</strong></div>}
                    {overview.AnalystTargetPrice && <div><span>Analyst Target</span><strong>{fmtINR(overview.AnalystTargetPrice)}</strong></div>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Quarterly Earnings ── */}
            {earnings?.quarterlyEarnings && earnings.quarterlyEarnings.length > 0 && (
              <div className="detail-card">
                <h3 className="detail-card-title">{overview?.Name ?? symbol} Financials — Quarterly EPS</h3>
                <div className="financials-table-wrap">
                  <table className="financials-table">
                    <thead>
                      <tr>
                        <th>Quarter</th>
                        <th className="num-col">Reported EPS (₹)</th>
                        <th className="num-col">Estimated EPS (₹)</th>
                        <th className="num-col">Surprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.quarterlyEarnings.slice(0, 8).map((q, i) => {
                        const rep = parseFloat(q.reportedEPS);
                        const est = parseFloat(q.estimatedEPS);
                        const surprise = !isNaN(rep) && !isNaN(est) && est !== 0 ? ((rep - est) / Math.abs(est)) * 100 : null;
                        return (
                          <tr key={i}>
                            <td>{q.fiscalDateEnding}</td>
                            <td className="num-col">{isNaN(rep) ? "—" : fmtNum(rep)}</td>
                            <td className="num-col">{isNaN(est) ? "—" : fmtNum(est)}</td>
                            <td className={`num-col ${surprise !== null ? (surprise >= 0 ? "change-up" : "change-down") : ""}`}>
                              {surprise !== null ? `${surprise >= 0 ? "+" : ""}${surprise.toFixed(1)}%` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── EPS Chart ── */}
            {earnings?.quarterlyEarnings && earnings.quarterlyEarnings.length > 0 && (
              <div className="detail-card">
                <h3 className="detail-card-title">EPS Trend</h3>
                <EpsChart data={earnings.quarterlyEarnings.slice(0, 8).reverse()} />
              </div>
            )}

            {/* ── News ── */}
            {news.length > 0 && (
              <div className="detail-card">
                <h3 className="detail-card-title">{overview?.Name ?? symbol} — Related News</h3>
                <div className="news-grid">
                  {news.map((item, i) => (
                    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="news-card">
                      <div className="news-meta">
                        <span className="news-source">{item.source}</span>
                        <span className={`news-sentiment sentiment-${item.overall_sentiment_label?.toLowerCase().replace(" ", "-")}`}>
                          {item.overall_sentiment_label}
                        </span>
                      </div>
                      <p className="news-title">{item.title}</p>
                      <p className="news-summary">{item.summary?.slice(0, 140)}…</p>
                      <span className="news-date">
                        {item.time_published ? parseDate(item.time_published).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </AppShell>
    </AuthGate>
  );
}

// ─── EPS Bar Chart ────────────────────────────────────────────────────────────

function EpsChart({ data }: { data: { fiscalDateEnding: string; reportedEPS: string; estimatedEPS: string }[] }) {
  const W = 700, H = 180, PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const vals = data.map(d => parseFloat(d.reportedEPS)).filter(v => !isNaN(v));
  if (!vals.length) return null;

  const minV = Math.min(0, ...vals);
  const maxV = Math.max(...vals) * 1.1;
  const range = maxV - minV || 1;
  const barW = cW / data.length - 4;
  const zero = PAD.top + cH - ((0 - minV) / range) * cH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="eps-chart-svg" preserveAspectRatio="xMidYMid meet">
      <line x1={PAD.left} x2={W - PAD.right} y1={zero} y2={zero} stroke="rgba(17,24,22,0.15)" strokeWidth="1" />
      {data.map((d, i) => {
        const v = parseFloat(d.reportedEPS);
        if (isNaN(v)) return null;
        const x = PAD.left + (i / data.length) * cW + 2;
        const y = PAD.top + cH - ((Math.max(v, 0) - minV) / range) * cH;
        const h = Math.abs(((v - 0) / range) * cH);
        return (
          <g key={i}>
            <rect x={x} y={v >= 0 ? y : zero} width={barW} height={h}
              fill={v >= 0 ? "#22c55e" : "#ef4444"} opacity="0.8" />
            <text x={x + barW / 2} y={v >= 0 ? y - 4 : zero + h + 12}
              textAnchor="middle" fontSize="10" fill="#101412" fontWeight="700">
              {v.toFixed(1)}
            </text>
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#52625a">
              {d.fiscalDateEnding.slice(0, 7)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
