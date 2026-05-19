"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";
import { Newspaper, TrendingUp, ExternalLink, Clock, DollarSign, Zap, Bell } from "lucide-react";

type NewsArticle = {
  source: { name: string };
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
};

const cards = [
  {
    title: "Stocks",
    description: "Fetch live quotes, daily history, technical indicators, and stock risk metrics.",
    href: "/stocks",
    icon: <TrendingUp className="h-5 w-5 text-[#4aa87a]" />
  },
  {
    title: "Portfolios",
    description: "Create portfolios, add buy/sell transactions, and review enriched holdings.",
    href: "/portfolios",
    icon: <TrendingUp className="h-5 w-5 text-[#4aa87a]" />
  },
  {
    title: "Analytics",
    description: "Compare volatility, Sharpe ratio, SMA, EMA, RSI, and MACD outputs.",
    href: "/analytics",
    icon: <TrendingUp className="h-5 w-5 text-[#4aa87a]" />
  },
  {
    title: "Dividend Tracker",
    description: "Analyze passive income potential and track upcoming payouts.",
    href: "/dividend-tracker",
    icon: <DollarSign className="h-5 w-5 text-[#4aa87a]" />
  },
  {
    title: "Sentiment Hub",
    description: "Monitor market buzz and community sentiment for momentum tickers.",
    href: "/sentiment-hub",
    icon: <Zap className="h-5 w-5 text-[#4aa87a]" />
  },
  {
    title: "Market Signals",
    description: "Real-time technical alerts and global market health indicators.",
    href: "/signals",
    icon: <Bell className="h-5 w-5 text-[#4aa87a]" />
  },
  {
    title: "Mutual Funds",
    description: "SIP calculator, fund lists, NFOs, and screener for mutual funds.",
    href: "/mutual-funds",
    icon: <TrendingUp className="h-5 w-5 text-[#4aa87a]" />
  }
];

export default function DashboardPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    apiRequest<NewsArticle[]>("/news/top")
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoadingNews(false));
  }, []);

  return (
    <AuthGate>
      <AppShell
        title="Investment command center"
        subtitle="Move from market lookup to portfolio action without leaving the workspace."
      >
        <div className="space-y-10">
          <div className="dashboard-grid">
            {cards.map((card) => (
              <Link key={card.href} href={card.href} className="dashboard-card">
                <div className="flex justify-between items-start mb-4">
                  <h2>{card.title}</h2>
                  {card.icon}
                </div>
                <p>{card.description}</p>
                <span>Open</span>
              </Link>
            ))}
          </div>

          <section className="news-section">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="h-6 w-6 text-[#4aa87a]" />
              <h2 className="text-2xl font-bold text-[#101412]">Market Intelligence & News</h2>
            </div>

            {loadingNews ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="workspace-panel animate-pulse h-64" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.slice(0, 6).map((article, index) => (
                  <a 
                    key={index} 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="workspace-panel hover:border-[#4aa87a] transition-colors flex flex-col group"
                  >
                    {article.urlToImage && (
                      <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                        <img 
                          src={article.urlToImage} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#52625a] mb-2">
                        <span>{article.source.name}</span>
                        <span className="h-1 w-1 rounded-full bg-[#8a9a92]" />
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#101412] leading-snug mb-2 group-hover:text-[#4aa87a] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[#52625a] line-clamp-3 mb-4">
                        {article.description}
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-bold text-[#4aa87a] gap-1">
                      Read detailed highlights <ExternalLink className="h-3 w-3" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </AuthGate>
  );
}
