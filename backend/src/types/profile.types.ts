export type MarketSectors = {
  equity?: string[];
  fixedIncome?: string[];
  commodities?: string[];
  crypto?: string[];
  realEstate?: string[];
};

export type PastInvestment = {
  id: string;
  name: string;
  assetClass: string;
  entryPrice: string;
  exitPrice?: string;
  duration: string;
  keyTakeaway: string;
};

export type InvestmentMethod = {
  id: string;
  title: string;
  platform: string;
  period: string;
  description: string;
  type: "sip" | "lumpsum" | "trading" | "index" | "other";
};

export type OnboardingPayload = {
  step: number;
  fullName?: string;
  investmentGoal?: string;
  investmentPhilosophy?: string;
  appUsageInterest?: string;
  investmentExperienceYears?: number;
  currentFocus?: string;
  stocksWatching?: string[];
  sectors?: MarketSectors;
  pastInvestments?: PastInvestment[];
  investmentMethods?: InvestmentMethod[];
  contactEmail?: string;
  linkedin?: string;
  complete?: boolean;
};

export type PublicProfile = {
  slug: string;
  fullName: string | null;
  investmentGoal: string | null;
  investmentPhilosophy: string | null;
  appUsageInterest: string | null;
  investmentExperienceYears: number | null;
  currentFocus: string | null;
  stocksWatching: string[] | null;
  sectors: MarketSectors | null;
  pastInvestments: PastInvestment[] | null;
  investmentMethods: InvestmentMethod[] | null;
  contactEmail: string | null;
  linkedin: string | null;
  onboardingCompleted: boolean;
};
