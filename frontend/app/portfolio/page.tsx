import Link from "next/link";
import { Briefcase, TrendingUp, BarChart3, ShieldCheck } from "lucide-react";

export default function PortfolioIndexPage() {
  return (
    <main className="min-h-screen bg-[#f9fafb] text-[#111816]">
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/10 text-[#10b981] mb-6">
            Portfolio Management
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Professional Grade Portfolio Analytics
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Track your investments with real-time data, deep-dive technical analytics, and AI-driven risk assessment. 
            Build a comprehensive profile and optimize your wealth creation journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="w-full sm:w-auto px-8 py-4 bg-[#111816] text-white rounded-xl font-bold hover:bg-[#1e2a24] transition-all">
              Get Started for Free
            </Link>
            <Link href="/" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-[#111816] rounded-xl font-bold hover:bg-gray-50 transition-all">
              View Sample Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Tracking</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Automatic calculation of market value, total cost, and unrealized profit/loss across your entire holdings.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Performance Metrics</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Visualize your ROI, annualized returns, and sector allocation with professional interactive charts.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Risk Assessment</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Analyze portfolio volatility, Sharpe ratio, and diversification scores to ensure your strategy stays on track.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
