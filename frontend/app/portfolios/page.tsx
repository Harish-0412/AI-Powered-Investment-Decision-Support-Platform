"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { apiRequest } from "@/lib/api";

type Portfolio = {
  id: string;
  name: string;
  holdings?: Array<{ symbol: string; quantity: number; averageBuyPrice: number; currentValue?: number }>;
  summary?: {
    totalValue: number;
    totalCost: number;
    totalProfitLoss: number;
    totalProfitLossPercentage: number;
  };
};

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selected, setSelected] = useState<Portfolio | null>(null);
  const [name, setName] = useState("Growth Portfolio");
  const [symbol, setSymbol] = useState("AAPL");
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("100");
  const [message, setMessage] = useState("");

  const loadPortfolios = async () => {
    const data = await apiRequest<Portfolio[]>("/portfolios");
    setPortfolios(data);
    if (!selected && data[0]) {
      loadDetails(data[0].id);
    }
  };

  const loadDetails = async (id: string) => {
    setSelected(await apiRequest<Portfolio>(`/portfolios/${id}`));
  };

  useEffect(() => {
    loadPortfolios().catch((error) => setMessage(error.message));
  }, []);

  const createPortfolio = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<Portfolio>("/portfolios", {
        method: "POST",
        body: JSON.stringify({ name })
      });
      await loadPortfolios();
      await loadDetails(created.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Portfolio creation failed");
    }
  };

  const addTransaction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;

    try {
      await apiRequest(`/portfolios/${selected.id}/transactions`, {
        method: "POST",
        body: JSON.stringify({
          symbol,
          type,
          quantity: Number(quantity),
          price: Number(price)
        })
      });
      await loadDetails(selected.id);
      await loadPortfolios();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Transaction failed");
    }
  };

  return (
    <AuthGate>
      <AppShell title="Portfolio management" subtitle="Create portfolios, record transactions, and review live value.">
        {message && <p className="form-error">{message}</p>}
        <div className="portfolio-layout">
          <section className="workspace-panel">
            <h2>Create portfolio</h2>
            <form onSubmit={createPortfolio} className="stack-form">
              <input value={name} onChange={(event) => setName(event.target.value)} />
              <button>Create</button>
            </form>
            <div className="portfolio-list">
              {portfolios.map((portfolio) => (
                <button key={portfolio.id} onClick={() => loadDetails(portfolio.id)}>
                  {portfolio.name}
                </button>
              ))}
            </div>
          </section>
          <section className="workspace-panel">
            <h2>{selected?.name || "Select a portfolio"}</h2>
            <div className="metric-grid compact">
              <Metric label="Value" value={selected?.summary ? `$${selected.summary.totalValue.toFixed(2)}` : "-"} />
              <Metric label="P/L" value={selected?.summary ? `$${selected.summary.totalProfitLoss.toFixed(2)}` : "-"} />
            </div>
            <form onSubmit={addTransaction} className="transaction-form">
              <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} placeholder="Symbol" />
              <select value={type} onChange={(event) => setType(event.target.value as "BUY" | "SELL")}>
                <option>BUY</option>
                <option>SELL</option>
              </select>
              <input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="0" step="0.000001" />
              <input value={price} onChange={(event) => setPrice(event.target.value)} type="number" min="0" step="0.01" />
              <button disabled={!selected}>Record Trade</button>
            </form>
            <div className="holdings-list">
              {selected?.holdings?.map((holding) => (
                <article key={holding.symbol}>
                  <strong>{holding.symbol}</strong>
                  <span>{Number(holding.quantity).toFixed(4)} shares</span>
                  <span>${Number(holding.currentValue || 0).toFixed(2)}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </AppShell>
    </AuthGate>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
