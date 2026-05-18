"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

const cards = [
  {
    title: "Stocks",
    description: "Fetch live quotes, daily history, technical indicators, and stock risk metrics.",
    href: "/stocks"
  },
  {
    title: "Portfolios",
    description: "Create portfolios, add buy/sell transactions, and review enriched holdings.",
    href: "/portfolios"
  },
  {
    title: "Analytics",
    description: "Compare volatility, Sharpe ratio, SMA, EMA, RSI, and MACD outputs.",
    href: "/analytics"
  },
  {
    title: "Mutual Funds",
    description: "SIP calculator, fund lists, NFOs, and screener for mutual funds.",
    href: "/mutual-funds"
  }
];

export default function DashboardPage() {
  return (
    <AuthGate>
      <AppShell
        title="Investment command center"
        subtitle="Move from market lookup to portfolio action without leaving the workspace."
      >
        <div className="dashboard-grid">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="dashboard-card">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <span>Open</span>
            </Link>
          ))}
        </div>
      </AppShell>
    </AuthGate>
  );
}
