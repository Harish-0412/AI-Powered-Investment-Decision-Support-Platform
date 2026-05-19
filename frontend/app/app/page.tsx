"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";
import { Newspaper, TrendingUp, ExternalLink, Clock, DollarSign, Zap, Bell, ArrowRight, Filter } from "lucide-react";
import { NewsModal } from "@/components/NewsModal";

type NewsArticle = {
  source: { name: string };
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
};

export default function DashboardPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    apiRequest<NewsArticle[]>("/news/top")
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoadingNews(false));
  }, []);

  return (
    <AuthGate>
      <AppShell
        title="Market Intelligence"
        subtitle="Real-time financial highlights and stock market intelligence."
      >
        <div className="space-y-8">
          {/* Top News Highlights Section */}
          <section className="news-section">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e8f5ee] rounded-lg">
                  <Newspaper className="h-6 w-6 text-[#4aa87a]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#101412]">Financial Highlights</h2>
                  <p className="text-sm text-[#52625a]">Curated market moving news from global sources</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="glass-button !py-1.5 !px-4 text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Latest
                </button>
              </div>
            </div>

            {loadingNews ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="workspace-panel animate-pulse h-[400px] rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((article, index) => (
                  <button 
                    key={index} 
                    onClick={() => setSelectedArticle(article)}
                    className="workspace-panel hover:border-[#4aa87a] transition-all flex flex-col group text-left p-0 overflow-hidden rounded-2xl border-2 border-transparent hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {article.urlToImage ? (
                        <img 
                          src={article.urlToImage} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full bg-[#f7f7f2] flex items-center justify-center">
                          <Newspaper className="h-12 w-12 text-[#e8ece9]" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-[#101412] shadow-sm">
                          {article.source.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#8a9a92] uppercase mb-3">
                        <Clock className="h-3 w-3" />
                        {new Date(article.publishedAt).toLocaleDateString(undefined, {
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#101412] leading-tight mb-3 group-hover:text-[#4aa87a] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-[#52625a] line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {article.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
                        <span className="text-xs font-bold text-[#4aa87a] flex items-center gap-1">
                          View Analysis <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <ExternalLink className="h-4 w-4 text-[#e8ece9] group-hover:text-[#4aa87a] transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <NewsModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      </AppShell>
    </AuthGate>
  );
}
