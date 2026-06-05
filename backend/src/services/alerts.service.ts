import { getPortfolioAnalytics } from "./analytics.service";
import { getStockTechnicalIndicators } from "./analytics.service";

export type Alert = {
  id: string;
  type: "RISK" | "OPPORTUNITY" | "SIGNAL";
  severity: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  message: string;
  timestamp: Date;
};

export const getPortfolioAlerts = async (portfolioId: string, userId: string): Promise<Alert[]> => {
  const analytics = await getPortfolioAnalytics(portfolioId, userId);
  if (!analytics) return [];

  const alerts: Alert[] = [];
  const { riskMetrics, summary } = analytics;

  // 1. Volatility Alerts
  if (riskMetrics.volatility > 0.3) {
    alerts.push({
      id: crypto.randomUUID(),
      type: "RISK",
      severity: "HIGH",
      title: "High Portfolio Volatility",
      message: `Your portfolio volatility is ${(riskMetrics.volatility * 100).toFixed(1)}%, significantly higher than the market average.`,
      timestamp: new Date()
    });
  }

  // 2. Drawdown Alerts
  if (riskMetrics.maxDrawdown > 0.2) {
    alerts.push({
      id: crypto.randomUUID(),
      type: "RISK",
      severity: "MEDIUM",
      title: "Significant Drawdown Detected",
      message: `Portfolio has experienced a max drawdown of ${(riskMetrics.maxDrawdown * 100).toFixed(1)}%. Review your stop-loss levels.`,
      timestamp: new Date()
    });
  }

  // 3. Diversification Alerts
  if (riskMetrics.diversificationScore < 50) {
    alerts.push({
      id: crypto.randomUUID(),
      type: "RISK",
      severity: "MEDIUM",
      title: "Concentration Risk",
      message: "Your holdings are heavily concentrated in a few sectors. Consider diversifying to reduce idiosyncratic risk.",
      timestamp: new Date()
    });
  }

  return alerts;
};
