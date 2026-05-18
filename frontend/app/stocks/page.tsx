"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type StockItem = {
  symbol: string;
  name: string;
  exchange: string;
  ltp: number;
  change: number;
  changePercent: number;
  marketCap: number | null;
  weekHigh52: number | null;
  weekLow52: number | null;
  sparkline: number[];
};

type StockListResult = {
  stocks: StockItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type NewsItem = {
  title: string;
  url: string;
  time_published: string;
  source: string;
  summary: string;
  overall_sentiment_label: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const UNIVERSES = ["Nifty 50", "Nifty 100", "Nifty Bank", "Midcap 100", "NSE", "BSE"];

const SECTORS = [
  "Aerospace & Defence", "Automobiles", "Banking", "Cement",
  "Chemicals", "Consumer Durables", "Financial Services", "FMCG",
  "Healthcare", "Infrastructure", "Information Technology", "Metals & Mining",
  "Oil & Gas", "Pharmaceuticals", "Power", "Real Estate",
  "Retail", "Telecom", "Textiles",
];

const MARKET_CAPS = [
  { label: "All", value: "" },
  { label: "Large Cap (₹20,000cr+)", value: "large" },
  { label: "Mid Cap (₹5,000–20,000cr)", value: "mid" },
  { label: "Small Cap (<₹5,000cr)", value: "small" },
];

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return <span className="spark-empty" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="sparkline">
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const fmtCap = (n: number | null) => {
  if (!n) return "—";
  const cr = n / 1e7;
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(cr)} cr`;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StocksPage() {
  const [result, setResult] = useState<StockListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [universe, setUniverse] = useState("");
  const [sector, setSector] = useState("");
  const [marketCap, setMarketCap] = useState("");
  const [alpha, setAlpha] = useState("");
  const [page, setPage] = useState(1);

  // News
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStocks = useCallback(
    async (overrides: Partial<{ page: number; alpha: string; universe: string; sector: string; marketCap: string; search: string }> = {}) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          q: overrides.search ?? search,
          page: String(overrides.page ?? page),
          universe: overrides.universe ?? universe,
          sector: overrides.sector ?? sector,
          marketCap: overrides.marketCap ?? marketCap,
          alpha: overrides.alpha ?? alpha,
        });
        const data = await apiRequest<StockListResult>(`/stocks?${params}`);
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load stocks");
      } finally {
        setLoading(false);
      }
    },
    [search, page, universe, sector, marketCap, alpha]
  );

  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const data = await apiRequest<{ feed: NewsItem[] }>("/stocks/RELIANCE.NS/alpha/news-sentiment");
      setNews((data.feed ?? []).slice(0, 6));
    } catch {
      // news is non-critical
    } finally {
      setNewsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStocks({ page: 1 });
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setPage(1);
      fetchStocks({ search, page: 1 });
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const applyFilter = (patch: { universe?: string; sector?: string; marketCap?: string; alpha?: string }) => {
    const next = {
      universe: patch.universe ?? universe,
      sector: patch.sector ?? sector,
      marketCap: patch.marketCap ?? marketCap,
      alpha: patch.alpha ?? alpha,
      page: 1,
    };
    if (patch.universe !== undefined) setUniverse(patch.universe);
    if (patch.sector !== undefined) setSector(patch.sector);
    if (patch.marketCap !== undefined) setMarketCap(patch.marketCap);
    if (patch.alpha !== undefined) setAlpha(patch.alpha);
    setPage(1);
    fetchStocks(next);
  };

  const goPage = (p: number) => {
    setPage(p);
    fetchStocks({ page: p });
  };

  const clearAll = () => {
    setUniverse(""); setSector(""); setMarketCap(""); setAlpha(""); setSearch(""); setPage(1);
    fetchStocks({ universe: "", sector: "", marketCap: "", alpha: "", search: "", page: 1 });
  };

  const hasFilters = universe || sector || marketCap || alpha || search;

  return (
    <AuthGate>
      <AppShell title="All Stocks" subtitle="Live NSE/BSE market data — prices, market cap, 52-week range and trends.">

        {/* Breadcrumb */}
        <nav className="stocks-breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <span>All Stocks</span>
        </nav>

        <div className="stocks-layout">

          {/* ── Sidebar Filters ── */}
          <aside className="stocks-sidebar">

            {/* Universe */}
            <div className="filter-group">
              <p className="filter-label">Stock Universe</p>
              <div className="filter-chips">
                {UNIVERSES.map(u => (
                  <button
                    key={u}
                    className={`chip ${universe === u ? "chip-active" : ""}`}
                    onClick={() => applyFilter({ universe: universe === u ? "" : u, sector: "" })}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector */}
            <div className="filter-group">
              <p className="filter-label">Sector</p>
              <div className="filter-chips">
                {SECTORS.map(s => (
                  <button
                    key={s}
                    className={`chip ${sector === s ? "chip-active" : ""}`}
                    onClick={() => applyFilter({ sector: sector === s ? "" : s, universe: "" })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Market Cap */}
            <div className="filter-group">
              <p className="filter-label">Market Cap</p>
              <div className="filter-chips">
                {MARKET_CAPS.map(m => (
                  <button
                    key={m.value}
                    className={`chip ${marketCap === m.value ? "chip-active" : ""}`}
                    onClick={() => applyFilter({ marketCap: m.value })}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button className="clear-filters-btn" onClick={clearAll}>
                ✕ Clear all filters
              </button>
            )}
          </aside>

          {/* ── Main Content ── */}
          <div className="stocks-main">

            {/* Search + Alpha bar */}
            <div className="stocks-toolbar">
              <input
                className="stocks-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by symbol or name…"
              />
              <div className="alpha-bar">
                <button
                  className={`alpha-btn ${alpha === "" ? "alpha-active" : ""}`}
                  onClick={() => applyFilter({ alpha: "" })}
                >
                  All
                </button>
                {ALPHABET.map(l => (
                  <button
                    key={l}
                    className={`alpha-btn ${alpha === l ? "alpha-active" : ""}`}
                    onClick={() => applyFilter({ alpha: alpha === l ? "" : l })}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filter tags */}
            {hasFilters && (
              <div className="active-filters">
                {universe && <span className="filter-tag">{universe} <button onClick={() => applyFilter({ universe: "" })}>×</button></span>}
                {sector && <span className="filter-tag">{sector} <button onClick={() => applyFilter({ sector: "" })}>×</button></span>}
                {marketCap && <span className="filter-tag">{MARKET_CAPS.find(m => m.value === marketCap)?.label} <button onClick={() => applyFilter({ marketCap: "" })}>×</button></span>}
                {alpha && <span className="filter-tag">A–Z: {alpha} <button onClick={() => applyFilter({ alpha: "" })}>×</button></span>}
              </div>
            )}

            {/* 52-week ticker strip */}
            {result && result.stocks.length > 0 && (
              <div className="ticker-strip">
                {result.stocks.slice(0, 8).map(s => (
                  <div key={s.symbol} className="ticker-pill">
                    <span className="ticker-sym">{s.symbol}</span>
                    <span className={s.changePercent >= 0 ? "tick-up" : "tick-down"}>
                      ₹{fmtINR(s.ltp)}
                    </span>
                    {s.weekHigh52 && (
                      <span className="tick-meta">52W H: ₹{fmtINR(s.weekHigh52)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && <p className="form-error">{error}</p>}

            {/* Stock Grid */}
            {loading ? (
              <div className="stocks-loading">
                <div className="loading-spinner" />
                <span>Fetching live market data…</span>
              </div>
            ) : (
              <>
                {result && (
                  <p className="result-count">
                    Showing {result.stocks.length} of {result.total} stocks
                    {result.totalPages > 1 && ` — Page ${result.page} of ${result.totalPages}`}
                  </p>
                )}

                <div className="stocks-table-wrap">
                  <table className="stocks-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Exchange</th>
                        <th>Trend</th>
                        <th className="num-col">LTP (₹)</th>
                        <th className="num-col">Change</th>
                        <th className="num-col">Market Cap</th>
                        <th className="num-col">52W High</th>
                        <th className="num-col">52W Low</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {result?.stocks.map(stock => (
                        <tr key={stock.symbol}>
                          <td>
                            <div className="stock-name-cell">
                              <strong>{stock.symbol}</strong>
                              <span>{stock.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="exchange-badge">{stock.exchange}</span>
                          </td>
                          <td>
                            <Sparkline data={stock.sparkline} positive={stock.changePercent >= 0} />
                          </td>
                          <td className="num-col ltp-val">₹{fmtINR(stock.ltp)}</td>
                          <td className={`num-col ${stock.changePercent >= 0 ? "change-up" : "change-down"}`}>
                            {stock.change >= 0 ? "+" : ""}{fmtINR(stock.change)}
                            <br />
                            <small>({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)</small>
                          </td>
                          <td className="num-col">{fmtCap(stock.marketCap)}</td>
                          <td className="num-col">{stock.weekHigh52 ? `₹${fmtINR(stock.weekHigh52)}` : "—"}</td>
                          <td className="num-col">{stock.weekLow52 ? `₹${fmtINR(stock.weekLow52)}` : "—"}</td>
                          <td>
                            <Link href={`/stocks/${stock.symbol}`} className="more-info-link">
                              More Info →
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {result?.stocks.length === 0 && (
                        <tr>
                          <td colSpan={9} className="empty-row">No stocks match your filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {result && result.totalPages > 1 && (
                  <div className="pagination">
                    <button disabled={page <= 1} onClick={() => goPage(1)}>«</button>
                    <button disabled={page <= 1} onClick={() => goPage(page - 1)}>‹</button>
                    {Array.from({ length: Math.min(7, result.totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 3, result.totalPages - 6));
                      const p = start + i;
                      return (
                        <button
                          key={p}
                          className={p === page ? "page-active" : ""}
                          onClick={() => goPage(p)}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button disabled={page >= result.totalPages} onClick={() => goPage(page + 1)}>›</button>
                    <button disabled={page >= result.totalPages} onClick={() => goPage(result.totalPages)}>»</button>
                    <span className="page-info">Page {page} / {result.totalPages}</span>
                  </div>
                )}
              </>
            )}

            {/* Related News */}
            <section className="stocks-news">
              <h2 className="news-heading">Market News</h2>
              {newsLoading ? (
                <p className="news-loading">Loading news…</p>
              ) : news.length > 0 ? (
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
                      <p className="news-summary">{item.summary?.slice(0, 120)}…</p>
                      <span className="news-date">
                        {item.time_published
                          ? new Date(
                              item.time_published.replace(
                                /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/,
                                "$1-$2-$3T$4:$5:$6"
                              )
                            ).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : ""}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="news-empty">Configure an Alpha Vantage API key to see market news.</p>
              )}
            </section>

          </div>
        </div>
      </AppShell>
    </AuthGate>
  );
}
