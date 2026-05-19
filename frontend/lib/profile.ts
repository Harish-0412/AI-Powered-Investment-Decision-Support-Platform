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

export type PublicProfile = {
  slug: string;
  fullName: string | null;
  investmentGoal: string | null; // was role
  investmentPhilosophy: string | null; // was tagline
  appUsageInterest: string | null; // was bio
  investmentExperienceYears: number | null; // was yearsLearning
  currentFocus: string | null; // was currentlyBuilding
  stocksWatching: string[] | null; // was technologies
  sectors: MarketSectors | null; // was skills
  pastInvestments: PastInvestment[] | null; // was projects
  investmentMethods: InvestmentMethod[] | null; // was experience
  contactEmail: string | null;
  linkedin: string | null;
  onboardingCompleted: boolean;
};

export type OnboardingStatus = {
  onboardingCompleted: boolean;
  onboardingStep: number;
  slug: string;
};

export const SECTOR_LABELS: Record<keyof MarketSectors, string> = {
  equity: "Equity / Stocks",
  fixedIncome: "Fixed Income / Bonds",
  commodities: "Commodities",
  crypto: "Crypto / Digital Assets",
  realEstate: "Real Estate",
};

export const parseTags = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const joinTags = (items?: string[]) => (items && items.length > 0 ? items.join(", ") : "");
