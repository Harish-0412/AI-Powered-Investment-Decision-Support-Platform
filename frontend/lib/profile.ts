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

export type OnboardingStatus = {
  onboardingCompleted: boolean;
  onboardingStep: number;
  slug: string;
};

export type GithubStats = {
  user: {
    login: string;
    name: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    html_url: string;
    avatar_url: string;
  };
  repos: Array<{
    name: string;
    description: string | null;
    url: string;
    stars: number;
    language: string | null;
    updatedAt: string;
  }>;
};

export const SKILL_DOMAIN_LABELS: Record<keyof SkillDomains, string> = {
  frontend: "Frontend",
  backend: "Backend",
  databases: "Databases",
  aiMl: "AI / ML",
  devops: "DevOps / Tools",
};

export const parseTags = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const joinTags = (items?: string[]) => (items && items.length > 0 ? items.join(", ") : "");
