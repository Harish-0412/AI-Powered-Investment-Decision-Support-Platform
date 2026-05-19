import type { PastInvestment, MarketSectors } from "../types/profile.types";

export const DEFAULT_APP_PROJECT: PastInvestment = {
  id: "sample-investment",
  name: "Nifty 50 Index Fund",
  assetClass: "Equity / Index Fund",
  entryPrice: "18500",
  exitPrice: "21000",
  duration: "18 months",
  keyTakeaway: "Consistent returns with lower volatility compared to individual stocks.",
};

export const DEFAULT_SECTORS: MarketSectors = {
  equity: ["Blue-chip Stocks", "IT Sector", "Banking"],
  fixedIncome: ["Corporate Bonds", "Government Securities"],
  commodities: ["Gold"],
  crypto: ["Bitcoin"],
  realEstate: ["REITs"],
};
