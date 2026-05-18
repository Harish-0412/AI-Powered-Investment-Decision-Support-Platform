export type SkillDomains = {
  frontend?: string[];
  backend?: string[];
  databases?: string[];
  aiMl?: string[];
  devops?: string[];
};

export type PortfolioProject = {
  id: string;
  slug: string;
  name: string;
  problem: string;
  architecture: string;
  techStack: string[];
  features: string[];
  engineeringHighlights: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured?: boolean;
};

export type PortfolioExperience = {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  type: "hackathon" | "opensource" | "freelance" | "project" | "work" | "research";
};

export type OnboardingPayload = {
  step: number;
  fullName?: string;
  role?: string;
  tagline?: string;
  bio?: string;
  yearsLearning?: number;
  currentlyBuilding?: string;
  technologies?: string[];
  skills?: SkillDomains;
  projects?: PortfolioProject[];
  experience?: PortfolioExperience[];
  githubUsername?: string;
  contactEmail?: string;
  linkedin?: string;
  twitter?: string;
  calendly?: string;
  discord?: string;
  resumeUrl?: string;
  complete?: boolean;
};

export type PublicProfile = {
  slug: string;
  fullName: string | null;
  role: string | null;
  tagline: string | null;
  bio: string | null;
  yearsLearning: number | null;
  currentlyBuilding: string | null;
  technologies: string[] | null;
  skills: SkillDomains | null;
  projects: PortfolioProject[] | null;
  experience: PortfolioExperience[] | null;
  githubUsername: string | null;
  contactEmail: string | null;
  linkedin: string | null;
  twitter: string | null;
  calendly: string | null;
  discord: string | null;
  resumeUrl: string | null;
  onboardingCompleted: boolean;
};
