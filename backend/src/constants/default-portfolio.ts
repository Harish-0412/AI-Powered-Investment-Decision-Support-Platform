import type { PortfolioProject, SkillDomains } from "../types/profile.types";

export const DEFAULT_APP_PROJECT: PortfolioProject = {
  id: "investment-intelligence",
  slug: "investment-intelligence",
  name: "Investment Intelligence Platform",
  problem:
    "Retail investors need a single workspace for live market data, portfolio tracking, and risk analytics without juggling spreadsheets and disconnected tools.",
  architecture:
    "Next.js App Router frontend, Express REST API, PostgreSQL with Prisma ORM, optional Upstash Redis caching, JWT access + rotating refresh tokens, Yahoo Finance + Alpha Vantage data pipeline.",
  techStack: [
    "Next.js",
    "React",
    "TypeScript",
    "Express",
    "PostgreSQL",
    "Prisma",
    "Redis",
    "JWT",
    "Tailwind CSS",
  ],
  features: [
    "Real-time stock quotes with intelligent caching",
    "Multi-portfolio holdings with atomic buy/sell transactions",
    "Live P/L enrichment from market prices",
    "Portfolio and stock risk analytics (volatility, Sharpe)",
    "Alpha Vantage fundamentals, earnings, and sentiment",
    "Mutual fund research modules",
  ],
  engineeringHighlights: [
    "JWT authentication with httpOnly refresh rotation",
    "Protected API routes and client-side auth gate",
    "Weighted average cost basis on transactions",
    "Rate-limit aware external API integration",
    "Redis-backed response caching",
    "Type-safe Zod validation on all inputs",
  ],
  githubUrl: "https://github.com",
  liveUrl: "/app",
  featured: true,
};

export const DEFAULT_SKILLS: SkillDomains = {
  frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  backend: ["Node.js", "Express", "REST APIs", "JWT Auth"],
  databases: ["PostgreSQL", "Prisma", "Redis"],
  aiMl: ["Python", "Recommendation Systems", "Data Pipelines"],
  devops: ["Git", "Docker", "Vercel", "Linux"],
};
